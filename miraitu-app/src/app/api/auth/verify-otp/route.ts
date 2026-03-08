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
            console.error('[Verify OTP] Missing env vars:', {
                hasMSG91: !!MSG91_AUTH_KEY,
                hasSecret: !!PHONE_AUTH_SECRET,
                hasServiceRole: !!SUPABASE_SERVICE_ROLE_KEY,
            });
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const mobile = phone.replace(/[+\s-]/g, '');

        if (!/^91\d{10}$/.test(mobile)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        // 1. Verify OTP with MSG91
        console.log(`[Verify OTP] Verifying OTP for ${mobile}`);
        const verifyResponse = await fetch(
            `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`,
            { method: 'GET', headers: { 'authkey': MSG91_AUTH_KEY } }
        );
        const verifyData = await verifyResponse.json();
        console.log('[Verify OTP] MSG91 response:', JSON.stringify(verifyData));

        if (verifyData.type !== 'success') {
            return NextResponse.json(
                { error: verifyData.message || 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // 2. Create admin client per-request
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const phoneWithCode = `+${mobile}`;
        const syntheticEmail = `phone${mobile}@phone.miraitu.app`;
        const password = generatePhonePassword(phoneWithCode);

        console.log(`[Verify OTP] Looking up user: ${syntheticEmail}`);

        // 3. Check if user already exists FIRST (avoids create-fail-search pattern)
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000,
        });

        if (listError) {
            console.error('[Verify OTP] listUsers failed:', listError.message);
            return NextResponse.json({ error: 'Failed to access user accounts.' }, { status: 500 });
        }

        const existingUser = listData?.users?.find(
            u =>
                u.phone === phoneWithCode ||
                u.phone === mobile ||
                u.email === syntheticEmail ||
                (u.email && u.email.includes(mobile))
        );

        if (existingUser) {
            // User exists — update their password and sign in
            console.log('[Verify OTP] Existing user found:', existingUser.id, '| email:', existingUser.email, '| phone:', existingUser.phone);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                {
                    password,
                    email: syntheticEmail, // ensure email is our synthetic one
                    email_confirm: true,
                    phone: phoneWithCode,
                    phone_confirm: true,
                }
            );
            if (updateError) {
                console.error('[Verify OTP] updateUserById failed:', updateError.message);
                return NextResponse.json({ error: 'Failed to update user account.' }, { status: 500 });
            }
        } else {
            // New user — create them
            console.log('[Verify OTP] Creating new user for:', syntheticEmail);
            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
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
                console.error('[Verify OTP] createUser failed:', createError.message);

                // Phone registered to a different user — find and claim it
                if (createError.message?.toLowerCase().includes('phone')) {
                    console.log('[Verify OTP] Phone conflict — searching all users for phone:', phoneWithCode);
                    const conflictUser = listData?.users?.find(
                        u => u.phone === phoneWithCode || u.phone === mobile
                    );
                    if (conflictUser) {
                        console.log('[Verify OTP] Found conflict user:', conflictUser.id, '| Updating...');
                        await supabaseAdmin.auth.admin.updateUserById(conflictUser.id, {
                            email: syntheticEmail,
                            email_confirm: true,
                            phone: phoneWithCode,
                            phone_confirm: true,
                            password,
                        });
                    } else {
                        console.error('[Verify OTP] Cannot resolve phone conflict — user not in listUsers');
                        return NextResponse.json(
                            { error: 'This phone number is linked to another account. Please contact support.' },
                            { status: 409 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        { error: `Failed to create account: ${createError.message}` },
                        { status: 500 }
                    );
                }
            }
            console.log('[Verify OTP] New user created:', createData.user?.id);
        }

        // 4. Sign in to generate session tokens
        const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
            email: syntheticEmail,
            password,
        });

        if (signInError || !signInData.session) {
            console.error('[Verify OTP] signInWithPassword failed:', signInError?.message);
            return NextResponse.json(
                { error: 'Failed to create session. Please try again.' },
                { status: 500 }
            );
        }

        console.log('[Verify OTP] ✅ Session created for:', phoneWithCode);

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
