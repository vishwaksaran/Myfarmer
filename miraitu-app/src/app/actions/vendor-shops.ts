'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { logActivity } from '@/lib/activity-logger';

interface ShopInput {
    name: string;
    slug: string;
    description?: string | null;
    logo_url?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    status?: string;
}

export async function fetchShops() {
    try {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return { error: 'Failed to fetch shops.', data: [] };
        return { error: null, data: data || [] };
    } catch (err) {
        console.error('[vendor-shops] Fetch error:', err);
        return { error: 'Unexpected error.', data: [] };
    }
}

export async function createShop(input: ShopInput) {
    try {
        const supabase = createSupabaseAdminClient();

        // Check slug uniqueness
        const { data: existing } = await supabase
            .from('shops')
            .select('id')
            .eq('slug', input.slug)
            .single();

        if (existing) return { error: 'A shop with this slug already exists.' };

        const { data, error } = await supabase.from('shops').insert({
            name: input.name,
            slug: input.slug,
            description: input.description || null,
            logo_url: input.logo_url || null,
            contact_phone: input.contact_phone || null,
            contact_email: input.contact_email || null,
            status: input.status || 'active',
        }).select('id').single();

        if (error) return { error: 'Failed to create shop.' };

        await logActivity({
            shopId: data.id,
            action: 'shop_created',
            details: { name: input.name, slug: input.slug },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-shops] Create error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function updateShop(shopId: string, input: Partial<ShopInput>) {
    try {
        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from('shops').update(input).eq('id', shopId);
        if (error) return { error: 'Failed to update shop.' };

        await logActivity({
            shopId,
            action: 'shop_updated',
            details: { updated_fields: Object.keys(input) },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-shops] Update error:', err);
        return { error: 'Unexpected error.' };
    }
}

export async function deleteShop(shopId: string) {
    try {
        const supabase = createSupabaseAdminClient();

        const { data: shop } = await supabase.from('shops').select('name, slug').eq('id', shopId).single();

        const { error } = await supabase.from('shops').delete().eq('id', shopId);
        if (error) return { error: 'Failed to delete shop. It may have associated data.' };

        await logActivity({
            action: 'shop_deleted',
            details: { name: shop?.name, slug: shop?.slug },
        });

        return { error: null };
    } catch (err) {
        console.error('[vendor-shops] Delete error:', err);
        return { error: 'Unexpected error.' };
    }
}
