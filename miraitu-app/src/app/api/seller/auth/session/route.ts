/* ─────────────────────────────────────────────────────────────
   GET /api/seller/auth/session
   ──────────────────────────────────────────────────────────
   Who is signed in, and are they still allowed to be.

   The middleware only checks the cookie's signature, because it
   runs on the Edge runtime with no database. This is where the
   session is really validated: the credential must still be
   active, its session_version must still match the token, and
   the application behind it must still be approved. Any of
   those failing ends the session on the next page load.
   ───────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifySellerJWT, SELLER_COOKIE } from '@/lib/seller-auth';

export const runtime = 'nodejs';

export interface SellerSession {
    sellerId: string;
    sellerType: string;
    displayName: string;
    username: string;
    /** 'pending' | 'approved' | 'rejected' — gates what the dashboard allows. */
    applicationStatus: string;
    businessName: string | null;
    location: string | null;
    phone: string | null;
    mustChangePassword: boolean;
}

function signedOut(reason: string) {
    const res = NextResponse.json({ session: null, reason }, { status: 200 });
    res.cookies.delete(SELLER_COOKIE);
    return res;
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get(SELLER_COOKIE)?.value;
    if (!token) return NextResponse.json({ session: null, reason: 'no_cookie' }, { status: 200 });

    const payload = await verifySellerJWT(token);
    if (!payload) return signedOut('bad_token');

    try {
        const supabase = createSupabaseAdminClient();

        const { data: cred } = await supabase
            .from('seller_credentials')
            .select('id, seller_id, username, display_name, status, session_version, is_temp_password')
            .eq('id', payload.credentialId)
            .maybeSingle();

        if (!cred || cred.status !== 'active') return signedOut('login_inactive');

        // Admin reset the password or turned the login off after this token
        // was minted, so it is no longer good.
        if (((cred.session_version as number) ?? 1) !== payload.sessionVersion) {
            return signedOut('session_revoked');
        }

        const { data: seller } = await supabase
            .from('sellers')
            .select('id, seller_type, full_name, business_name, location, phone, status')
            .eq('id', cred.seller_id as string)
            .maybeSingle();

        if (!seller) return signedOut('application_missing');
        if (seller.status === 'rejected') return signedOut('application_rejected');

        const session: SellerSession = {
            sellerId: seller.id as string,
            sellerType: (seller.seller_type as string) || 'farmer-seller',
            displayName: (cred.display_name as string) || (seller.full_name as string) || 'Seller',
            username: cred.username as string,
            applicationStatus: (seller.status as string) || 'pending',
            businessName: (seller.business_name as string | null) ?? null,
            location: (seller.location as string | null) ?? null,
            phone: (seller.phone as string | null) ?? null,
            mustChangePassword: !!cred.is_temp_password,
        };

        return NextResponse.json({ session }, { status: 200 });
    } catch (err) {
        console.error('[seller/auth/session]', err);
        return NextResponse.json({ session: null, reason: 'error' }, { status: 200 });
    }
}
