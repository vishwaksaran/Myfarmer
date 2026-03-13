import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client — uses service_role key to bypass RLS.
 * Only use this in server-side code (Server Actions, Route Handlers).
 * NEVER import this in client components.
 */
export function createSupabaseAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY is not set. Admin operations require the service role key.'
        );
    }

    return createClient(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
