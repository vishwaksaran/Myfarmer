'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
    hashPassword,
    encryptPassword,
    decryptPassword,
    generateTempPassword,
} from '@/lib/vendor-crypto';
import { logActivity } from '@/lib/activity-logger';

interface CreateVendorInput {
    shopId: string;
    username: string;
    displayName: string;
    email?: string;
}

interface FetchVendorsInput {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export async function createVendor({ shopId, username, displayName, email }: CreateVendorInput) {
    try {
        const supabase = createSupabaseAdminClient();

        // Validate shop exists
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('id, slug, name')
            .eq('id', shopId)
            .single();

        if (shopError || !shop) {
            return { error: 'Shop not found.', data: null };
        }

        // Check username uniqueness
        const { data: existing } = await supabase
            .from('vendor_credentials')
            .select('id')
            .eq('username', username)
            .single();

        if (existing) {
            return { error: 'Username is already taken.', data: null };
        }

        // Generate temp password
        const tempPassword = generateTempPassword();

        // Hash and encrypt simultaneously
        const [passwordHash, passwordEncrypted] = await Promise.all([
            hashPassword(tempPassword),
            encryptPassword(tempPassword),
        ]);

        // Insert
        const { data: vendor, error: insertError } = await supabase
            .from('vendor_credentials')
            .insert({
                shop_id: shopId,
                username,
                password_hash: passwordHash,
                password_encrypted: passwordEncrypted,
                display_name: displayName,
                email: email || null,
                status: 'active',
                is_temp_password: true,
            })
            .select('id, username, display_name, email, status, is_temp_password, created_at')
            .single();

        if (insertError) {
            console.error('[vendor-members] Create failed:', insertError);
            return { error: 'Failed to create vendor.', data: null };
        }

        // Log
        await logActivity({
            vendorId: vendor.id,
            shopId,
            action: 'credential_created',
            details: { username, displayName, createdBy: 'admin' },
        });

        return {
            error: null,
            data: {
                ...vendor,
                tempPassword, // Return to admin so they can share it
                shopSlug: shop.slug,
                shopName: shop.name,
                loginUrl: `/vendor/${shop.slug}/login`,
            },
        };
    } catch (err) {
        console.error('[vendor-members] Create error:', err);
        return { error: 'Unexpected error creating vendor.', data: null };
    }
}

export async function updateVendor(vendorId: string, data: { displayName?: string; email?: string }) {
    try {
        const supabase = createSupabaseAdminClient();

        const updatePayload: Record<string, unknown> = {};
        if (data.displayName !== undefined) updatePayload.display_name = data.displayName;
        if (data.email !== undefined) updatePayload.email = data.email;

        const { error } = await supabase
            .from('vendor_credentials')
            .update(updatePayload)
            .eq('id', vendorId);

        if (error) {
            return { error: 'Failed to update vendor.' };
        }

        return { error: null };
    } catch (err) {
        console.error('[vendor-members] Update error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function resetPassword(vendorId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        // Get vendor info for logging
        const { data: vendor } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username, session_version')
            .eq('id', vendorId)
            .single();

        if (!vendor) return { error: 'Vendor not found.', data: null };

        const newPassword = generateTempPassword();

        const [passwordHash, passwordEncrypted] = await Promise.all([
            hashPassword(newPassword),
            encryptPassword(newPassword),
        ]);

        // Update password + increment session_version (kicks out active sessions)
        const { error } = await supabase
            .from('vendor_credentials')
            .update({
                password_hash: passwordHash,
                password_encrypted: passwordEncrypted,
                is_temp_password: true,
                session_version: (vendor.session_version || 1) + 1,
            })
            .eq('id', vendorId);

        if (error) return { error: 'Failed to reset password.', data: null };

        await logActivity({
            vendorId,
            shopId: vendor.shop_id,
            action: 'password_reset',
            details: { reset_by: 'admin', username: vendor.username },
        });

        return { error: null, data: { newPassword } };
    } catch (err) {
        console.error('[vendor-members] Reset error:', err);
        return { error: 'Unexpected error.', data: null };
    }
}

export async function deactivateVendor(vendorId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: vendor } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username, session_version')
            .eq('id', vendorId)
            .single();

        if (!vendor) return { error: 'Vendor not found.' };

        // Deactivate + increment session_version → immediate kick-out
        const { error } = await supabase
            .from('vendor_credentials')
            .update({
                status: 'deactivated',
                session_version: (vendor.session_version || 1) + 1,
            })
            .eq('id', vendorId);

        if (error) return { error: 'Failed to deactivate vendor.' };

        await logActivity({
            vendorId,
            shopId: vendor.shop_id,
            action: 'credential_deactivated',
            details: { deactivated_by: 'admin', username: vendor.username },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-members] Deactivate error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function reactivateVendor(vendorId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { error } = await supabase
            .from('vendor_credentials')
            .update({ status: 'active' })
            .eq('id', vendorId);

        if (error) return { error: 'Failed to reactivate vendor.' };

        await logActivity({
            vendorId,
            action: 'credential_reactivated',
            details: { reactivated_by: 'admin' },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-members] Reactivate error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function deleteVendor(vendorId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: vendor } = await supabase
            .from('vendor_credentials')
            .select('id, shop_id, username')
            .eq('id', vendorId)
            .single();

        if (!vendor) return { error: 'Vendor not found.' };

        const { error } = await supabase
            .from('vendor_credentials')
            .delete()
            .eq('id', vendorId);

        if (error) return { error: 'Failed to delete vendor.' };

        await logActivity({
            shopId: vendor.shop_id,
            action: 'credential_deleted',
            details: { deleted_by: 'admin', username: vendor.username },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-members] Delete error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function decryptVendorPassword(vendorId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: vendor, error } = await supabase
            .from('vendor_credentials')
            .select('password_encrypted')
            .eq('id', vendorId)
            .single();

        if (error || !vendor) return { error: 'Vendor not found.', password: null };

        const password = await decryptPassword(vendor.password_encrypted);
        return { error: null, password };
    } catch (err) {
        console.error('[vendor-members] Decrypt error:', err);
        return { error: 'Failed to decrypt password.', password: null };
    }
}

export async function fetchVendors({ page = 1, pageSize = 20, search = '', status = '' }: FetchVendorsInput) {
    try {
        const supabase = createSupabaseAdminClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('vendor_credentials')
            .select(`
                id, username, display_name, email, status, is_temp_password,
                session_version, last_login, login_count, created_at, updated_at,
                shops!inner(id, slug, name, logo_url)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('[vendor-members] Fetch error:', error);
            return { error: 'Failed to fetch vendors.', data: [], total: 0 };
        }

        return { error: null, data: data || [], total: count || 0 };
    } catch (err) {
        console.error('[vendor-members] Fetch error:', err);
        return { error: 'Unexpected error.', data: [], total: 0 };
    }
}

export async function fetchShopsForDropdown() {
    try {
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from('shops')
            .select('id, slug, name, logo_url, status')
            .eq('status', 'active')
            .order('name');

        if (error) return { error: 'Failed to fetch shops.', data: [] };
        return { error: null, data: data || [] };
    } catch (err) {
        console.error('[vendor-members] Fetch shops error:', err);
        return { error: 'Unexpected error.', data: [] };
    }
}
