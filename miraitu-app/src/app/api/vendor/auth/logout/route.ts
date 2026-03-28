import { NextRequest, NextResponse } from 'next/server';
import { verifyVendorJWT } from '@/lib/vendor-crypto';
import { logActivity, extractRequestMeta } from '@/lib/activity-logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('vendor_session')?.value;
        const { ip, userAgent } = extractRequestMeta(request.headers);

        if (token) {
            const payload = await verifyVendorJWT(token);
            if (payload) {
                await logActivity({
                    vendorId: payload.vendorId,
                    action: 'vendor_logout',
                    ip,
                    userAgent,
                });
            }
        }

        const response = NextResponse.json({ success: true });

        response.cookies.set('vendor_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0, // expire immediately
        });

        return response;
    } catch (err) {
        console.error('[vendor/auth/logout] Unexpected error:', err);
        // Even on error, clear the cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('vendor_session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });
        return response;
    }
}
