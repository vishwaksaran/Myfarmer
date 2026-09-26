/* ─────────────────────────────────────────────────────────────
   POST /api/seller/auth/login
   ──────────────────────────────────────────────────────────
   Signs a farmer, dealer or service provider in to their seller
   workspace with the username and password admin issued on
   approval. Separate from the shopper login on purpose: the
   seller dashboard is a work tool, not a storefront account.
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyPassword, signSellerJWT, SELLER_COOKIE } from '@/lib/seller-auth';
import { logActivity, extractRequestMeta } from '@/lib/activity-logger';

export const runtime = 'nodejs';

/** Same text for every failure, so it cannot be used to probe for usernames. */
const GENERIC = 'Invalid username or password.';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const { ip, userAgent } = extractRequestMeta(request.headers);

        const { data: cred } = await supabase
            .from('seller_credentials')
            .select('id, seller_id, username, password_hash, display_name, status, is_temp_password, session_version, login_count')
            .eq('username', String(username).trim().toLowerCase())
            .maybeSingle();

        if (!cred) {
            await logActivity({
                action: 'seller_login_failed',
                details: { username, reason: 'not_found' },
                ip, userAgent,
            });
            return NextResponse.json({ error: GENERIC }, { status: 401 });
        }

        if (cred.status !== 'active') {
            await logActivity({
                action: 'seller_login_failed',
                details: { username, reason: `status_${cred.status}` },
                ip, userAgent,
            });
            return NextResponse.json(
                { error: 'This login has been turned off. Please contact Miraitu.' },
                { status: 403 },
            );
        }

        if (!(await verifyPassword(password, cred.password_hash as string))) {
            await logActivity({
                action: 'seller_login_failed',
                details: { username, reason: 'bad_password' },
                ip, userAgent,
            });
            return NextResponse.json({ error: GENERIC }, { status: 401 });
        }

        // The application behind the login must still be approved. Admin can
        // reject someone after issuing credentials, and that has to bite here.
        const { data: seller } = await supabase
            .from('sellers')
            .select('id, seller_type, full_name, status')
            .eq('id', cred.seller_id as string)
            .maybeSingle();

        if (!seller || seller.status !== 'approved') {
            await logActivity({
                action: 'seller_login_failed',
                details: { username, reason: `application_${seller?.status ?? 'missing'}` },
                ip, userAgent,
            });
            return NextResponse.json(
                { error: 'Your application is not approved yet. Miraitu will be in touch.' },
                { status: 403 },
            );
        }

        const token = await signSellerJWT({
            credentialId: cred.id as string,
            sellerId: seller.id as string,
            sellerType: (seller.seller_type as string) || 'farmer-seller',
            sessionVersion: (cred.session_version as number) ?? 1,
        });

        await supabase
            .from('seller_credentials')
            .update({
                last_login: new Date().toISOString(),
                login_count: ((cred.login_count as number) ?? 0) + 1,
            })
            .eq('id', cred.id);

        await logActivity({
            action: 'seller_login',
            details: { username, seller_id: seller.id, seller_name: seller.full_name },
            ip, userAgent,
        });

        const response = NextResponse.json({
            success: true,
            sellerType: seller.seller_type,
            displayName: cred.display_name,
            mustChangePassword: !!cred.is_temp_password,
        });

        response.cookies.set(SELLER_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    } catch (err) {
        console.error('[seller/auth/login]', err);
        return NextResponse.json({ error: 'Could not sign you in. Please try again.' }, { status: 500 });
    }
}
