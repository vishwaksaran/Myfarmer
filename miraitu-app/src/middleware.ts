import { proxy } from '@/lib/proxy-handler';
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

    // ── Seller workspace protection ──────────────────────────
    // The seller dashboards are a work tool behind admin-issued credentials,
    // not a public page, so a request with no seller cookie is bounced to the
    // seller sign-in before the page renders.
    //
    // Only the token's shape and expiry are checked here, and deliberately so:
    // this runs on the Edge runtime, where Node's crypto is unavailable — the
    // vendor branch above avoids importing it for the same reason. The real
    // check is server side, where /api/seller/auth/session and every action in
    // seller-dashboard.ts verify the signature, re-read the credential, and
    // confirm the application is still approved. A forged cookie gets past this
    // line and no further.
    if (pathname.startsWith('/home/become-seller/dashboard')) {
        const token = request.cookies.get('seller_session')?.value;
        const bounce = () => {
            const loginUrl = new URL('/seller-login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        };

        if (!token) return bounce();
        const parts = token.split('.');
        if (parts.length !== 3) return bounce();

        try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            if (!payload.sellerId) return bounce();
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return bounce();
        } catch {
            return bounce();
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
