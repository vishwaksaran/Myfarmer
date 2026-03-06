import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;
const PHONE_AUTH_SECRET = process.env.PHONE_AUTH_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generatePhonePassword(phone: string): string {
    return crypto
        .createHmac('sha256', PHONE_AUTH_SECRET)
        .update(phone)
        .digest('hex');
}

export async function POST(request: Request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        // Validate env vars
        if (!MSG91_AUTH_KEY || !PHONE_AUTH_SECRET || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Verify OTP] Missing env vars');
            return NextResponse.json({ error: 'Server configuration error. Please contact support.' }, { status: 500 });
        }

        const mobile = phone.replace(/[+\s-]/g, '');

        if (!/^91\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // 1. Verify OTP with MSG91
        console.log(`[Verify OTP] Verifying OTP for ${mobile}`);
        const verifyResponse = await fetch(
            `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`,
            {
                method: 'GET',
                headers: { 'authkey': MSG91_AUTH_KEY },
            }
        );

        const verifyData = await verifyResponse.json();
        console.log('[Verify OTP] MSG91 verify response:', JSON.stringify(verifyData));

        if (verifyData.type !== 'success') {
            return NextResponse.json(
                { error: verifyData.message || 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // 2. OTP verified — create or find Supabase user
        const phoneWithCode = `+${mobile}`;
        const syntheticEmail = `phone${mobile}@phone.miraitu.app`;
        const password = generatePhonePassword(phoneWithCode);

        // Admin client — created per-request to avoid stale connections
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // Try to create a new user
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: syntheticEmail,
            email_confirm: true,
            phone: phoneWithCode,
            phone_confirm: true,
            password,
            user_metadata: {
                phone: phoneWithCode,
                is_phone_user: true,
            },
        });

        if (createError) {
            console.log('[Verify OTP] User exists, finding and updating:', createError.message);
            // User already exists — find and update password
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            const existingUser = listData?.users?.find(
                u => u.phone === phoneWithCode || u.email === syntheticEmail
            );

            if (!existingUser) {
                console.error('[Verify OTP] Cannot find existing user:', createError.message);
                return NextResponse.json(
                    { error: 'Failed to create user account' },
                    { status: 500 }
                );
            }

            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
        }

        // 3. Sign in to generate session tokens (use anon client)
        const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
            email: syntheticEmail,
            password,
        });

        if (signInError || !signInData.session) {
            console.error('[Verify OTP] Sign-in error:', signInError?.message);
            return NextResponse.json(
                { error: 'Failed to create session. Please try again.' },
                { status: 500 }
            );
        }

        console.log('[Verify OTP] Session created successfully for:', phoneWithCode);

        // 4. Return session tokens to client
        return NextResponse.json({
            success: true,
            session: {
                access_token: signInData.session.access_token,
                refresh_token: signInData.session.refresh_token,
            },
        });
    } catch (error) {
        console.error('[Verify OTP] Unexpected error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
