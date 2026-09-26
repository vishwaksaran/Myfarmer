import { NextRequest, NextResponse } from 'next/server';
import { SELLER_COOKIE, verifySellerJWT } from '@/lib/seller-auth';
import { logActivity, extractRequestMeta } from '@/lib/activity-logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const token = request.cookies.get(SELLER_COOKIE)?.value;

    if (token) {
        const payload = await verifySellerJWT(token);
        if (payload) {
            const { ip, userAgent } = extractRequestMeta(request.headers);
            await logActivity({
                action: 'seller_logout',
                details: { seller_id: payload.sellerId },
                ip, userAgent,
            });
        }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SELLER_COOKIE);
    return response;
}
