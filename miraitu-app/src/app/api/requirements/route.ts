/* ─────────────────────────────────────────────────────────────
   POST /api/requirements
   ──────────────────────────────────────────────────────────
   Takes a buyer's "Post Your Requirement" submission: the form
   fields and up to three reference photos, in one multipart
   request.

   Deliberately open to anyone. A buyer telling us what they
   want is the most valuable thing on the page, and putting a
   login in front of it would lose most of them — the same
   mistake the seller application was making, where anyone not
   signed in had their submission silently dropped.

   Photos are uploaded here with the service role rather than
   from the browser, because a signed-out buyer has no Supabase
   session and so cannot write to storage.
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { extractRequestMeta } from '@/lib/activity-logger';
import {
    REQUIREMENT_CATEGORIES,
    MAX_REQUIREMENT_IMAGES,
} from '@/lib/requirement-options';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const BUCKET = 'listing-images';

export async function POST(request: NextRequest) {
    try {
        const form = await request.formData();
        const str = (k: string) => String(form.get(k) ?? '').trim();

        const fullName = str('fullName');
        const phone = str('phone').replace(/\D/g, '').slice(-10);
        const category = str('category');
        const condition = str('condition') || 'any';

        if (!fullName) {
            return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
        }
        if (phone.length !== 10) {
            return NextResponse.json({ error: 'Enter a valid 10-digit mobile number.' }, { status: 400 });
        }
        if (!(REQUIREMENT_CATEGORIES as readonly string[]).includes(category)) {
            return NextResponse.json({ error: 'Pick what you are looking for.' }, { status: 400 });
        }
        if (!['new', 'used', 'any'].includes(condition)) {
            return NextResponse.json({ error: 'Choose new, used, or either.' }, { status: 400 });
        }

        const admin = createSupabaseAdminClient();

        // Attach the account when there is one, so admin can see it is a
        // known user, but never require it.
        let userId: string | null = null;
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id ?? null;
        } catch { /* a signed-out buyer is the normal case */ }

        const files = form.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
        if (files.length > MAX_REQUIREMENT_IMAGES) {
            return NextResponse.json(
                { error: `Up to ${MAX_REQUIREMENT_IMAGES} photos.` },
                { status: 400 },
            );
        }

        const images: string[] = [];
        for (const file of files) {
            if (!ALLOWED.includes(file.type)) {
                return NextResponse.json({ error: 'Photos must be JPG, PNG, WebP or GIF.' }, { status: 400 });
            }
            if (file.size > MAX_BYTES) {
                return NextResponse.json({ error: 'Each photo must be under 5 MB.' }, { status: 400 });
            }

            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
            const path = `requirements/${phone}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

            const { error } = await admin.storage
                .from(BUCKET)
                .upload(path, Buffer.from(await file.arrayBuffer()), {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                // A photo failing must not lose the requirement itself — the
                // phone number is the part that matters.
                console.error('[requirements] image upload failed', error);
                continue;
            }

            const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
            if (data?.publicUrl) images.push(data.publicUrl);
        }

        const { ip, userAgent } = extractRequestMeta(request.headers);

        const { data: row, error: insertError } = await admin
            .from('buyer_requirements')
            .insert({
                user_id: userId,
                category,
                product_model: str('productModel') || null,
                condition,
                quantity: str('quantity') || null,
                budget: str('budget') || null,
                location: str('location') || null,
                needed_by: str('neededBy') || null,
                notes: str('notes') || null,
                images,
                full_name: fullName,
                phone,
                status: 'new',
                ip_address: ip,
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('[requirements] insert failed', insertError);
            return NextResponse.json(
                { error: 'We could not record your requirement. Please try again.' },
                { status: 500 },
            );
        }

        // Shows up in Admin → Activity Log alongside every other event.
        try {
            await admin.from('vendor_activity_log').insert({
                vendor_id: null,
                shop_id: null,
                action: 'buyer_requirement_submitted',
                details: {
                    requirement_id: row?.id,
                    category,
                    product_model: str('productModel') || null,
                    budget: str('budget') || null,
                    location: str('location') || null,
                    full_name: fullName,
                    phone,
                    photos: images.length,
                    signed_in: !!userId,
                },
                ip_address: ip,
                user_agent: userAgent,
            });
        } catch { /* the requirement is saved; the log line is a nicety */ }

        return NextResponse.json({ success: true, id: row?.id, photos: images.length });
    } catch (err) {
        console.error('[requirements]', err);
        return NextResponse.json(
            { error: 'We could not record your requirement. Please try again.' },
            { status: 500 },
        );
    }
}
