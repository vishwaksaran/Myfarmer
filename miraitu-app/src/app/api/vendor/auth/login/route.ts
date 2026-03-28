import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    verifyPassword,
    signVendorJWT,
} from '@/lib/vendor-crypto';
import { logActivity, extractRequestMeta } from '@/lib/activity-logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, shopSlug } = body;

        if (!username || !password || !shopSlug) {
            return NextResponse.json(
                { error: 'Username, password, and shop slug are required.' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();
        const { ip, userAgent } = extractRequestMeta(request.headers);

        // 1. Resolve shop by slug
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('id, slug, name, logo_url, status')
            .eq('slug', shopSlug)
            .single();

        if (shopError || !shop) {
            return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
        }

        if (shop.status !== 'active') {
            return NextResponse.json({ error: 'This shop is currently inactive.' }, { status: 403 });
        }

        // 2. Find vendor by username + shop_id
        const { data: vendor, error: vendorError } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username, password_hash, display_name, email, status, is_temp_password, session_version, login_count')
            .eq('username', username)
            .eq('shop_id', shop.id)
            .single();

        if (vendorError || !vendor) {
            await logActivity({
                shopId: shop.id,
                action: 'vendor_login_failed',
                details: { username, reason: 'user_not_found' },
                ip,
                userAgent,
            });
            return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
        }

        // 3. Check account status
        if (vendor.status !== 'active') {
            await logActivity({
                vendorId: vendor.id,
                shopId: shop.id,
                action: 'vendor_login_failed',
                details: { username, reason: 'account_deactivated' },
                ip,
                userAgent,
            });
            return NextResponse.json(
                { error: 'Your account has been deactivated. Contact the administrator.' },
                { status: 403 }
            );
        }

        // 4. Verify password
        const isValid = await verifyPassword(password, vendor.password_hash);
        if (!isValid) {
            await logActivity({
                vendorId: vendor.id,
                shopId: shop.id,
                action: 'vendor_login_failed',
                details: { username, reason: 'wrong_password' },
                ip,
                userAgent,
            });
            return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
        }

        // 5. Increment session_version (invalidates all previous sessions)
        const newSessionVersion = (vendor.session_version || 1) + 1;

        const { error: updateError } = await supabase
            .from('vendor_credentials')
            .update({
                session_version: newSessionVersion,
                last_login: new Date().toISOString(),
                login_count: (vendor.login_count || 0) + 1,
            })
            .eq('id', vendor.id);

        if (updateError) {
            console.error('[vendor/auth/login] Failed to update session:', updateError);
            return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
        }

        // 6. Sign JWT
        const token = await signVendorJWT({
            vendorId: vendor.id,
            shopSlug: shop.slug,
            sessionVersion: newSessionVersion,
        });

        // 7. Log successful login
        await logActivity({
            vendorId: vendor.id,
            shopId: shop.id,
            action: 'vendor_login',
            details: { username },
            ip,
            userAgent,
        });

        // 8. Set httpOnly cookie and return response
        const response = NextResponse.json({
            success: true,
            vendor: {
                id: vendor.id,
                displayName: vendor.display_name,
                email: vendor.email,
                isTempPassword: vendor.is_temp_password,
            },
            shop: {
                id: shop.id,
                slug: shop.slug,
                name: shop.name,
                logoUrl: shop.logo_url,
            },
        });

        response.cookies.set('vendor_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (err) {
        console.error('[vendor/auth/login] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
