import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

// App Router route handlers have no enforced body size limit unlike Server Actions (1 MB cap).
// This endpoint accepts a multipart/form-data POST with a single `file` field and
// uploads it to the `listing-images` Supabase Storage bucket via the admin client
// (bypasses RLS so both authenticated and guest users can upload).

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || !file.size) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate MIME type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (5 MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
        const path = `land-lease/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: storageError } = await supabase.storage
            .from('listing-images')
            .upload(path, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (storageError) {
            console.error('[api/upload/lease-photo] Storage error:', storageError);
            return NextResponse.json({ error: storageError.message }, { status: 500 });
        }

        const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
        return NextResponse.json({ url: data?.publicUrl ?? null });
    } catch (err) {
        console.error('[api/upload/lease-photo] Unexpected error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
