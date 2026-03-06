import { NextResponse } from 'next/server';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID!;

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

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

        if (!/^91\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit Indian phone number' },
                { status: 400 }
            );
        }

        console.log(`[Send OTP] Sending to ${mobile} with template ${MSG91_TEMPLATE_ID}`);

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
