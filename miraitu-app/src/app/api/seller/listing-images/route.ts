/* ─────────────────────────────────────────────────────────────
   POST /api/seller/listing-images
   ──────────────────────────────────────────────────────────
   Photos for a seller's listing.

   The browser helper (uploadListingImages) puts files straight
   into storage with the anon key, which needs a Supabase session
   to satisfy the bucket's policies. A seller has no such session
   — they sign in with the credentials admin issued — so the
   upload has to happen here, as the service role, after the
   seller cookie has been checked.

   Returns { urls: string[] } in the order the files were sent.
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifySellerJWT, SELLER_COOKIE } from '@/lib/seller-auth';

export const runtime = 'nodejs';

const MAX_FILES = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SELLER_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

    const payload = await verifySellerJWT(token);
    if (!payload) return NextResponse.json({ error: 'Your session has expired.' }, { status: 401 });

    try {
        const admin = createSupabaseAdminClient();

        // Only a seller admin has approved may publish, so only they may
        // upload the photos that go with a listing.
        const { data: seller } = await admin
            .from('sellers')
            .select('id, user_id, status')
            .eq('id', payload.sellerId)
            .maybeSingle();

        if (!seller || seller.status !== 'approved') {
            return NextResponse.json({ error: 'Your account is not approved yet.' }, { status: 403 });
        }

        const form = await request.formData();
        const files = form.getAll('files').filter((f): f is File => f instanceof File);

        if (files.length === 0) return NextResponse.json({ urls: [] });
        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `Up to ${MAX_FILES} photos per listing.` }, { status: 400 });
        }

        const folder = (seller.user_id as string | null) ?? `seller-${seller.id}`;
        const urls: string[] = [];

        for (const file of files) {
            if (!ALLOWED.includes(file.type)) {
                return NextResponse.json({ error: 'Photos must be JPG, PNG, WebP or GIF.' }, { status: 400 });
            }
            if (file.size > MAX_BYTES) {
                return NextResponse.json({ error: 'Each photo must be under 5 MB.' }, { status: 400 });
            }

            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
            const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

            const { error } = await admin.storage
                .from('listing-images')
                .upload(path, Buffer.from(await file.arrayBuffer()), {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                console.error('[seller/listing-images] upload failed', error);
                return NextResponse.json({ error: 'One of the photos could not be uploaded.' }, { status: 500 });
            }

            const { data } = admin.storage.from('listing-images').getPublicUrl(path);
            if (data?.publicUrl) urls.push(data.publicUrl);
        }

        return NextResponse.json({ urls });
    } catch (err) {
        console.error('[seller/listing-images]', err);
        return NextResponse.json({ error: 'Could not upload those photos.' }, { status: 500 });
    }
}
