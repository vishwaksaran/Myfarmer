import { proxy } from '@/proxy';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware entry point.
 * Combines:
 * 1. Existing proxy logic (non-www redirect, /home redirect, Supabase session, admin protection)
 * 2. Vendor route protection (/vendor/[slug]/* — JWT cookie check)
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Vendor route protection ──────────────────────────────
    // Protect /vendor/[slug]/* EXCEPT /vendor/[slug]/login
    const vendorRouteMatch = pathname.match(/^\/vendor\/([^/]+)(\/.*)?$/);
    if (vendorRouteMatch) {
        const slug = vendorRouteMatch[1];
        const subPath = vendorRouteMatch[2] || '';

        // Allow login page without auth
        if (subPath === '/login' || subPath === '/login/') {
            return NextResponse.next();
        }

        // Check for vendor_session cookie
        const token = request.cookies.get('vendor_session')?.value;
        if (!token) {
            const loginUrl = new URL(`/vendor/${slug}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Lightweight JWT signature verification (no DB call — that happens in layout)
        // We import and use the verifyJwtSignatureOnly function inline to avoid
        // importing heavy Node.js crypto modules in Edge runtime.
        // Instead, we just verify the cookie exists and has a valid JWT structure.
        const parts = token.split('.');
        if (parts.length !== 3) {
            const loginUrl = new URL(`/vendor/${slug}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Decode payload to check expiry and slug match
        try {
            const payloadStr = Buffer.from(parts[1], 'base64url').toString('utf8');
            const payload = JSON.parse(payloadStr);

            // Check expiry
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                const loginUrl = new URL(`/vendor/${slug}/login`, request.url);
                return NextResponse.redirect(loginUrl);
            }

            // Check slug match — vendor should only access their own shop
            if (payload.shopSlug && payload.shopSlug !== slug) {
                const correctUrl = new URL(`/vendor/${payload.shopSlug}/dashboard`, request.url);
                return NextResponse.redirect(correctUrl);
            }
        } catch {
            const loginUrl = new URL(`/vendor/${slug}/login`, request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // ── Existing proxy logic (admin protection, redirects, etc.) ─
    return proxy(request);
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
