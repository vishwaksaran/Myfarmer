import { NextResponse } from 'next/server';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;

export async function POST(request: Request) {
    try {
        const { phone, retryType = 'text' } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const mobile = phone.replace(/[+\s-]/g, '');

        if (!/^91[6-9]\d{9}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://control.msg91.com/api/v5/otp/retry?mobile=${mobile}&retrytype=${retryType}`,
            {
                method: 'GET',
                headers: { 'authkey': MSG91_AUTH_KEY },
            }
        );

        const data = await response.json();

        if (data.type === 'success' || response.ok) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: data.message || 'Failed to resend OTP' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Resend OTP] Error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
