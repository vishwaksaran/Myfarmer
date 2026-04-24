'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Upload a single lease photo to Supabase Storage using the admin client
 * (bypasses RLS so both authenticated and guest users can upload).
 * Returns the public URL or null on failure.
 */
export async function uploadLeasePhoto(formData: FormData): Promise<string | null> {
    try {
        const file = formData.get('file') as File;
        if (!file || !file.size) return null;

        const supabase = createSupabaseAdminClient();
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `land-lease/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;

        const { error } = await supabase.storage
            .from('listing-images')
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) {
            console.error('[uploadLeasePhoto] Storage error:', error);
            return null;
        }

        const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
        return data?.publicUrl ?? null;
    } catch (err) {
        console.error('[uploadLeasePhoto] Unexpected error:', err);
        return null;
    }
}
