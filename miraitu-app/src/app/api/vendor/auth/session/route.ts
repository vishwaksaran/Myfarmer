import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { verifyVendorJWT } from '@/lib/vendor-crypto';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('vendor_session')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // 1. Verify JWT signature + expiry
        const payload = await verifyVendorJWT(token);
        if (!payload) {
            return NextResponse.json({ authenticated: false, reason: 'invalid_token' }, { status: 401 });
        }

        // 2. Full DB validation: check session_version + status
        const supabase = createSupabaseAdminClient();
        const { data: vendor, error } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username, display_name, email, status, is_temp_password, session_version')
            .eq('id', payload.vendorId)
            .single();

        if (error || !vendor) {
            return NextResponse.json({ authenticated: false, reason: 'vendor_not_found' }, { status: 401 });
        }

        // Session version mismatch → another device logged in, or admin reset
        if (vendor.session_version !== payload.sessionVersion) {
            return NextResponse.json(
                { authenticated: false, reason: 'session_invalidated' },
                { status: 401 }
            );
        }

        // Account deactivated by admin
        if (vendor.status !== 'active') {
            return NextResponse.json(
                { authenticated: false, reason: 'account_deactivated' },
                { status: 403 }
            );
        }

        // 3. Get shop info
        const { data: shop } = await supabase
            .from('shops')
            .select('id, slug, name, logo_url')
            .eq('id', vendor.shop_id)
            .single();

        return NextResponse.json({
            authenticated: true,
            vendor: {
                id: vendor.id,
                username: vendor.username,
                displayName: vendor.display_name,
                email: vendor.email,
                isTempPassword: vendor.is_temp_password,
            },
            shop: shop
                ? {
                    id: shop.id,
                    slug: shop.slug,
                    name: shop.name,
                    logoUrl: shop.logo_url,
                }
                : null,
        });
    } catch (err) {
        console.error('[vendor/auth/session] Unexpected error:', err);
        return NextResponse.json({ authenticated: false, reason: 'server_error' }, { status: 500 });
    }
}
