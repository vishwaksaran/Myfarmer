'use client';

import supabase from '@/lib/supabase';

/**
 * Uploads community photos and videos straight from the browser to Supabase
 * Storage.
 *
 * Why not an API route, like the land-lease uploader does? Two ceilings that a
 * video always hits:
 *   • Server Actions cap request bodies at 1 MB, so the old "read the file into
 *     a base64 data URL and pass it to createPost" path could never publish a
 *     real video — the insert just failed.
 *   • Route handlers are not capped by Next, but serverless platforms cap the
 *     request body (~4.5 MB on Vercel), which a 50 MB clip also fails.
 * Uploading direct to storage sidesteps both: the file never passes through the
 * app server.
 */

export const MEDIA_BUCKET = 'community-media';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;  // 50 MB

/** A file that made it into storage: the public URL to render, and the path to undo it. */
export interface UploadedMedia {
    url: string;
    path: string;
}

export interface UploadResult {
    media?: UploadedMedia;
    error?: string;
}

const extensionOf = (file: File) => {
    const fromName = file.name.split('.').pop()?.toLowerCase();
    if (fromName && /^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
    // Fall back to the MIME subtype (camera captures often arrive unnamed).
    return file.type.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'bin';
};

/** Rejects the file up front with the message the composer should show. */
export function validateMedia(file: File, kind: 'image' | 'video'): string | null {
    if (kind === 'image') {
        if (!file.type.startsWith('image/')) return 'Only image files are allowed';
        if (file.size > MAX_IMAGE_BYTES) return 'Image must be under 5MB';
        return null;
    }
    if (!file.type.startsWith('video/')) return 'Only video files are allowed';
    if (file.size > MAX_VIDEO_BYTES) {
        return `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 50MB.`;
    }
    return null;
}

/** Uploads one file and returns its public URL, or a message explaining why not. */
export async function uploadCommunityMedia(file: File, kind: 'image' | 'video'): Promise<UploadResult> {
    const invalid = validateMedia(file, kind);
    if (invalid) return { error: invalid };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Please sign in to upload' };

    // The storage policy requires the first path segment to be the uploader's id.
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${extensionOf(file)}`;

    const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });

    if (error) {
        console.error('[uploadCommunityMedia] upload failed:', error);
        return { error: error.message || 'Upload failed. Please try again.' };
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) return { error: 'Upload failed. Please try again.' };

    return { media: { url: data.publicUrl, path } };
}

/**
 * Removes files that were uploaded for a post that then failed to publish.
 * Best-effort compensating cleanup — the post is the source of truth, so a
 * blob with no row pointing at it is garbage either way.
 */
export async function discardCommunityMedia(paths: string[]): Promise<void> {
    const targets = paths.filter(Boolean);
    if (targets.length === 0) return;
    try {
        await supabase.storage.from(MEDIA_BUCKET).remove(targets);
    } catch (err) {
        console.error('[discardCommunityMedia] cleanup failed:', err);
    }
}
