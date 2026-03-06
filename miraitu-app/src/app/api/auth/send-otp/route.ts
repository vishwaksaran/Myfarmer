import { NextResponse } from 'next/server';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID!;

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone || typeof phone !== 'string') {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Format: remove + and spaces, ensure 91XXXXXXXXXX format
        const mobile = phone.replace(/[+\s-]/g, '');

        if (!/^91\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Please enter a valid 10-digit Indian phone number' },
                { status: 400 }
            );
        }

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

        if (data.type === 'success' || response.ok) {
            return NextResponse.json({ success: true });
        }

        console.error('[Send OTP] MSG91 error:', data);
        return NextResponse.json(
            { error: data.message || 'Failed to send OTP. Please try again.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Send OTP] Error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
