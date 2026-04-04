import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy: Non-www → www redirect, /home → / redirect,
 * Supabase session refresh + Admin route protection.
 *
 * - 301 redirects miraitu.in → www.miraitu.in (fixes GSC redirect errors)
 * - 301 redirects /home → / (single hop, no chain)
 * - Refreshes Supabase auth session on every request (keeps cookies alive)
 * - Blocks non-admin users from accessing /admin/* routes
 * - Redirects unauthenticated users on /admin/* to /admin-login
 */
export async function proxy(request: NextRequest) {
    const { hostname, pathname } = request.nextUrl;

    // ── Non-www → www permanent redirect ─────────────────────────────
    // Fixes Google Search Console "Redirect error" for miraitu.in (non-www) URLs
    if (hostname === 'miraitu.in') {
        const url = request.nextUrl.clone();
        url.hostname = 'www.miraitu.in';
        url.port = '';
        return NextResponse.redirect(url, 301);
    }

    // ── /home → / permanent redirect ─────────────────────────────────
    // Single 301 hop — avoids redirect chain through next.config.ts
    if (pathname === '/home' || pathname === '/home/') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url, 301);
    }

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

    const requestPathname = request.nextUrl.pathname;

    // Only run Supabase auth on routes that actually need it.
    // We protect both admin routes and shop purchase routes.
    const needsAuth = requestPathname.startsWith('/admin') || requestPathname.startsWith('/home/shop');
    if (!needsAuth) {
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

    // ── Admin route protection ───────────────────────────────────────
    // Protect all /admin/* routes — only users with role='admin' can access
    // Exclude /admin-login so it doesn't redirect in a loop
    if (requestPathname.startsWith('/admin') && requestPathname !== '/admin-login') {
        // Not logged in → redirect to admin login
        if (!user) {
            const loginUrl = new URL('/admin-login', request.url);
            loginUrl.searchParams.set('redirect', requestPathname);
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

    // ── Shop route protection ───────────────────────────────────────
    // No guest shopping: force login for /home/shop and all nested routes.
    if (requestPathname.startsWith('/home/shop')) {
        if (!user) {
            const loginUrl = new URL('/user-login', request.url);
            loginUrl.searchParams.set('redirect', requestPathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return supabaseResponse;
}

