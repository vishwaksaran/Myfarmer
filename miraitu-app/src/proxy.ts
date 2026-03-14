import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy: Supabase session refresh + Admin route protection.
 *
 * - Refreshes Supabase auth session on every request (keeps cookies alive)
 * - Blocks non-admin users from accessing /admin/* routes
 * - Redirects unauthenticated users on /admin/* to /admin-login
 */
export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // If Supabase env vars are not set (e.g. missing .env.local), skip session
    // refresh and just pass the request through to avoid a startup crash.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn(
            '[proxy] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
            'Skipping Supabase session refresh. Create a .env.local file with the correct values.'
        );
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Do not remove this line. It refreshes the session
    // and ensures cookies are updated if the token was refreshed.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // ── Admin route protection ───────────────────────────────────────
    // Protect all /admin/* routes — only users with role='admin' can access
    if (pathname.startsWith('/admin')) {
        // Not logged in → redirect to admin login
        if (!user) {
            const loginUrl = new URL('/admin-login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user has admin role in profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            // Not an admin → redirect to home
            const homeUrl = new URL('/home', request.url);
            homeUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(homeUrl);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, sw.js, manifest.json, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$).*)',
    ],
};
