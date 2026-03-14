'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Delete a user from Supabase Auth.
 * This requires the service_role key (admin client) — only callable from server actions.
 */
export async function deleteAuthUser(userId: string): Promise<{ error: string | null }> {
    if (!userId || userId === 'guest-123') {
        return { error: 'Invalid user ID' };
    }

    try {
        const adminClient = createSupabaseAdminClient();

        // Delete any remaining profile data (belt & suspenders — client may have already done this)
        await adminClient.from('profiles').delete().eq('id', userId);

        // Delete any bookings by this user
        await adminClient.from('service_bookings').delete().eq('user_id', userId);

        // Delete the auth user
        const { error } = await adminClient.auth.admin.deleteUser(userId);
        if (error) {
            console.error('Error deleting auth user:', error);
            return { error: error.message };
        }

        return { error: null };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete account';
        console.error('deleteAuthUser error:', message);
        return { error: message };
    }
}
