import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. This client handles cookie-based session management
 * so that sessions established via OAuth (exchangeCodeForSession) are
 * properly persisted and available to the browser.
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method is called from a Server Component
                        // where cookies cannot be set. This can be ignored if you
                        // have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}
