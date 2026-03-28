import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    verifyVendorJWT,
    hashPassword,
    encryptPassword,
    verifyPassword,
    signVendorJWT,
} from '@/lib/vendor-crypto';
import { logActivity, extractRequestMeta } from '@/lib/activity-logger';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('vendor_session')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        const payload = await verifyVendorJWT(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newUsername, newPassword } = body;

        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
        }

        if (!newUsername && !newPassword) {
            return NextResponse.json({ error: 'Provide a new username or password to update.' }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const { ip, userAgent } = extractRequestMeta(request.headers);

        // 1. Fetch current vendor credentials
        const { data: vendor, error: fetchError } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username, password_hash, session_version, status')
            .eq('id', payload.vendorId)
            .single();

        if (fetchError || !vendor) {
            return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
        }

        if (vendor.status !== 'active') {
            return NextResponse.json({ error: 'Account is deactivated.' }, { status: 403 });
        }

        if (vendor.session_version !== payload.sessionVersion) {
            return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
        }

        // 2. Verify current password
        const isValid = await verifyPassword(currentPassword, vendor.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
        }

        // 3. Build update payload
        const updateData: Record<string, unknown> = {};
        const newSessionVersion = vendor.session_version + 1;
        updateData.session_version = newSessionVersion;

        // Handle username change
        if (newUsername && newUsername !== vendor.username) {
            // Check uniqueness
            const { data: existing } = await supabase
                .from('vendor_credentials')
                .select('id')
                .eq('username', newUsername)
                .neq('id', vendor.id)
                .single();

            if (existing) {
                return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
            }

            updateData.username = newUsername;

            await logActivity({
                vendorId: vendor.id,
                shopId: vendor.shop_id,
                action: 'username_changed',
                details: { old: vendor.username, new: newUsername, changed_by: 'vendor' },
                ip,
                userAgent,
            });
        }

        // Handle password change
        if (newPassword) {
            if (newPassword.length < 8) {
                return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
            }

            const [hash, encrypted] = await Promise.all([
                hashPassword(newPassword),
                encryptPassword(newPassword),
            ]);

            updateData.password_hash = hash;
            updateData.password_encrypted = encrypted;
            updateData.is_temp_password = false;

            await logActivity({
                vendorId: vendor.id,
                shopId: vendor.shop_id,
                action: 'password_changed',
                details: { changed_by: 'vendor' },
                ip,
                userAgent,
            });
        }

        // 4. Update in DB
        const { error: updateError } = await supabase
            .from('vendor_credentials')
            .update(updateData)
            .eq('id', vendor.id);

        if (updateError) {
            console.error('[vendor/auth/change-credentials] Update failed:', updateError);
            return NextResponse.json({ error: 'Failed to update credentials.' }, { status: 500 });
        }

        // 5. Issue new JWT with incremented session_version
        const { data: shop } = await supabase
            .from('shops')
            .select('slug')
            .eq('id', vendor.shop_id)
            .single();

        const newToken = await signVendorJWT({
            vendorId: vendor.id,
            shopSlug: shop?.slug || payload.shopSlug,
            sessionVersion: newSessionVersion,
        });

        const response = NextResponse.json({ success: true });

        response.cookies.set('vendor_session', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (err) {
        console.error('[vendor/auth/change-credentials] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
