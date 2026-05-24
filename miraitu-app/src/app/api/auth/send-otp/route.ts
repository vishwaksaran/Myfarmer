import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID!;

// ── Rate Limiting: max 2 OTP requests per IP per 15-minute window ────
const OTP_RATE_LIMIT = 2;
const OTP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const rateLimitMap = new Map<string, { count: number; firstRequestAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
        if (now - val.firstRequestAt > OTP_WINDOW_MS) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

function getClientIP(headersList: Headers): string {
    // Vercel/Cloudflare typically set these
    return headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('cf-connecting-ip') ||
        'unknown';
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterMs?: number } {
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.firstRequestAt > OTP_WINDOW_MS) {
        rateLimitMap.set(key, { count: 1, firstRequestAt: now });
        return { allowed: true, remaining: OTP_RATE_LIMIT - 1 };
    }

    if (entry.count >= OTP_RATE_LIMIT) {
        const retryAfterMs = OTP_WINDOW_MS - (now - entry.firstRequestAt);
        return { allowed: false, remaining: 0, retryAfterMs };
    }

    entry.count++;
    return { allowed: true, remaining: OTP_RATE_LIMIT - entry.count };
}

export async function POST(request: Request) {
    try {
        const { phone, deviceId } = await request.json();

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Validate env vars are set
        if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
            console.error('[Send OTP] Missing env vars: MSG91_AUTH_KEY or MSG91_TEMPLATE_ID');
            return NextResponse.json({ error: 'OTP service not configured. Please contact support.' }, { status: 500 });
        }

        // Format: remove + and spaces, ensure 91XXXXXXXXXX format
        const mobile = phone.replace(/[+\s-]/g, '');

        if (!/^91[6-9]\d{9}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit Indian phone number' },
                { status: 400 }
            );
        }

        // ── Rate limit check (by IP + deviceId composite key) ────────────
        const headersList = await headers();
        const clientIP = getClientIP(headersList);
        const rateLimitKey = deviceId ? `${clientIP}:${deviceId}` : clientIP;
        const { allowed, remaining, retryAfterMs } = checkRateLimit(rateLimitKey);

        if (!allowed) {
            const retryMinutes = Math.ceil((retryAfterMs || 0) / 60000);
            console.warn(`[Send OTP] Rate limited: ${rateLimitKey} (retry in ${retryMinutes}m)`);
            return NextResponse.json(
                { error: `Too many OTP requests. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`, rateLimited: true },
                { status: 429 }
            );
        }

        console.log(`[Send OTP] Sending to ${mobile} (IP: ${clientIP}, remaining: ${remaining}) with template ${MSG91_TEMPLATE_ID}`);

        const response = await fetch('https://control.msg91.com/api/v5/otp', {
            method: 'POST',
            headers: {
                'authkey': MSG91_AUTH_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                template_id: MSG91_TEMPLATE_ID,
                mobile,
                otp_length: 6,
                otp_expiry: 5,
            }),
        });

        const data = await response.json();
        console.log('[Send OTP] MSG91 response:', JSON.stringify(data));

        // MSG91 returns { type: 'success' } on success - check this strictly
        if (data.type === 'success') {
            return NextResponse.json({ success: true });
        }

        // Any other response is a failure
        console.error('[Send OTP] MSG91 error:', data);
        return NextResponse.json(
            { error: data.message || data.error || 'Failed to send OTP. Please try again.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Send OTP] Error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
