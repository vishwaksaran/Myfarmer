import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { headers } from 'next/headers';

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

/**
 * Detect device type from user-agent string
 */
function detectDeviceType(userAgent: string): { type: 'mobile' | 'desktop' | 'tablet'; detail: string } {
    const ua = userAgent.toLowerCase();

    // Tablet detection (before mobile, since some tablets match mobile patterns)
    if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
        return { type: 'tablet', detail: extractDeviceDetail(ua) };
    }

    // Mobile detection
    if (/mobile|iphone|ipod|android.*mobile|blackberry|windows phone|opera mini|opera mobi/.test(ua)) {
        return { type: 'mobile', detail: extractDeviceDetail(ua) };
    }

    return { type: 'desktop', detail: extractDeviceDetail(ua) };
}

function extractDeviceDetail(ua: string): string {
    // Try to extract a short device identifier
    if (ua.includes('iphone')) return 'iPhone';
    if (ua.includes('ipad')) return 'iPad';
    if (ua.includes('android')) {
        const match = ua.match(/android\s[\d.]+;\s*([^)]+)/);
        return match ? match[1].split(' Build')[0].trim() : 'Android';
    }
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    return 'Unknown';
}

/**
 * Exhaustive user search across ALL pages.
 * Supabase admin listUsers returns at most 1000/page — we page through all.
 */
async function findUserByPhone(
    admin: SupabaseClient,
    phoneWithCode: string,
    mobile: string,
    syntheticEmail: string
) {
    let page = 1;
    while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
            console.error('[findUserByPhone] listUsers error:', error.message);
            return null;
        }
        if (!data?.users?.length) break;

        const found = data.users.find(u =>
            u.phone === phoneWithCode ||        // +918553498691
            u.phone === mobile ||               // 918553498691
            u.phone === mobile.slice(2) ||      // 8553498691 (local)
            u.email === syntheticEmail ||
            (u.email && u.email.includes(mobile))
        );

        if (found) {
            console.log(`[findUserByPhone] Found on page ${page}:`, found.id, '| phone:', found.phone, '| email:', found.email);
            return found;
        }

        if (data.users.length < 1000) break; // Last page reached
        page++;
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        // Validate required env vars
        if (!MSG91_AUTH_KEY || !PHONE_AUTH_SECRET || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Verify OTP] Missing env vars');
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const mobile = phone.replace(/[+\s-]/g, ''); // e.g. "918553498691"

        if (!/^91\d{10}$/.test(mobile)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        // ── Step 1: Verify OTP with MSG91 ────────────────────────────────────
        console.log(`[Verify OTP] Verifying for ${mobile}`);
        const verifyResponse = await fetch(
            `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`,
            { method: 'GET', headers: { authkey: MSG91_AUTH_KEY } }
        );
        const verifyData = await verifyResponse.json();
        console.log('[Verify OTP] MSG91:', JSON.stringify(verifyData));

        if (verifyData.type !== 'success') {
            return NextResponse.json(
                { error: verifyData.message || 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // ── Step 2: Set up identifiers ────────────────────────────────────────
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const phoneWithCode = `+${mobile}`;                           // +918553498691
        const syntheticEmail = `phone${mobile}@phone.miraitu.app`;    // phone918553498691@phone.miraitu.app
        const password = generatePhonePassword(phoneWithCode);

        // ── Step 3: Find existing user (paginated across ALL users) ──────────
        console.log(`[Verify OTP] Searching for existing user: ${syntheticEmail} / ${phoneWithCode}`);
        const existingUser = await findUserByPhone(supabaseAdmin, phoneWithCode, mobile, syntheticEmail);

        if (existingUser) {
            // User found — normalise their record and update password
            console.log('[Verify OTP] Updating existing user:', existingUser.id);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                {
                    email: syntheticEmail,
                    email_confirm: true,
                    phone: phoneWithCode,
                    phone_confirm: true,
                    password,
                }
            );
            if (updateError) {
                console.error('[Verify OTP] updateUserById failed:', updateError.message);
                return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
            }
        } else {
            // No existing user — create fresh
            console.log('[Verify OTP] Creating new user:', syntheticEmail);
            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: syntheticEmail,
                email_confirm: true,
                phone: phoneWithCode,
                phone_confirm: true,
                password,
                user_metadata: { phone: phoneWithCode, is_phone_user: true },
            });

            if (createError) {
                console.error('[Verify OTP] createUser failed:', createError.message);

                // Phone conflict — the phone belongs to an orphan user (no matching email).
                // This can happen if native Supabase phone auth was used before.
                // Strategy: delete the orphan and recreate cleanly.
                if (createError.message?.toLowerCase().includes('phone')) {
                    console.log('[Verify OTP] Phone conflict detected — attempting cleanup');

                    // Broader search: list ALL users and log phone formats for debugging
                    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
                    const orphan = allUsers?.users?.find(u => {
                        const uPhone = (u.phone ?? '').replace(/[+\s-]/g, '');
                        const targetPhone = mobile; // "918553498691"
                        return uPhone === targetPhone ||
                            uPhone === targetPhone.slice(2) || // "8553498691"
                            uPhone.endsWith(targetPhone.slice(2)); // ends with local number
                    });

                    if (orphan) {
                        console.log('[Verify OTP] Orphan user found:', orphan.id, '| Deleting...');
                        await supabaseAdmin.auth.admin.deleteUser(orphan.id);

                        // Recreate after deletion
                        const { error: retryError } = await supabaseAdmin.auth.admin.createUser({
                            email: syntheticEmail,
                            email_confirm: true,
                            phone: phoneWithCode,
                            phone_confirm: true,
                            password,
                            user_metadata: { phone: phoneWithCode, is_phone_user: true },
                        });
                        if (retryError) {
                            console.error('[Verify OTP] Retry createUser failed:', retryError.message);
                            return NextResponse.json(
                                { error: 'Failed to set up account. Please try again.' },
                                { status: 500 }
                            );
                        }
                        console.log('[Verify OTP] User recreated successfully after cleanup');
                    } else {
                        console.error('[Verify OTP] Orphan not found — cannot resolve phone conflict');
                        return NextResponse.json(
                            { error: 'Phone number conflict. Please contact support.' },
                            { status: 409 }
                        );
                    }
                } else {
                    return NextResponse.json(
                        { error: `Account setup failed: ${createError.message}` },
                        { status: 500 }
                    );
                }
            } else {
                console.log('[Verify OTP] New user created:', createData?.user?.id);
            }
        }

        // ── Step 4: Sign in to generate session tokens ────────────────────────
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
                { error: 'Login failed. Please try again.' },
                { status: 500 }
            );
        }

        console.log('[Verify OTP] ✅ Session created for:', phoneWithCode);

        // Check if user has completed onboarding + save device type
        const userId = signInData.session.user.id;
        let onboardingCompleted = false;
        try {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', userId)
                .single();
            onboardingCompleted = profile?.onboarding_completed === true;
        } catch {
            // Profile may not exist yet for new users
        }

        // ── Step 5: Detect and save device type ──────────────────────────────
        try {
            const headersList = await headers();
            const userAgent = headersList.get('user-agent') || '';
            const { type: deviceType, detail: deviceDetail } = detectDeviceType(userAgent);
            console.log(`[Verify OTP] Device: ${deviceType} (${deviceDetail})`);

            await supabaseAdmin
                .from('profiles')
                .update({
                    device_type: deviceType,
                    last_login_device: deviceDetail,
                })
                .eq('id', userId);
        } catch (deviceErr) {
            console.warn('[Verify OTP] Could not save device type:', deviceErr);
        }

        return NextResponse.json({
            success: true,
            session: {
                access_token: signInData.session.access_token,
                refresh_token: signInData.session.refresh_token,
            },
            user_id: userId,
            onboarding_completed: onboardingCompleted,
        });

    } catch (error) {
        console.error('[Verify OTP] Unexpected error:', error);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
