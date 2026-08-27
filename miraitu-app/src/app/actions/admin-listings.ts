'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * Admin view over `marketplace_listings`.
 *
 * The board actions in `actions/listings.ts` are written for farmers: they hide
 * anything that is not `status = 'active'`, and they scope "mine" to the signed
 * in user. Admin needs the opposite — every row whatever its status, with the
 * seller attached — so it reads through the service-role client here rather
 * than bending those.
 *
 * Everything a seller submits lands in this one table: the Buy & Sell board,
 * the Rent board, and the machinery and livestock sell forms.
 */

export interface AdminListingRow {
    id: string;
    user_id: string;
    listing_mode: string | null;
    listing_type: string | null;
    category: string | null;
    subcategory: string | null;
    title: string;
    brand: string | null;
    model: string | null;
    description: string | null;
    price: number | null;
    price_unit: string | null;
    location: string | null;
    district: string | null;
    state: string | null;
    contact_phone: string | null;
    images: string[] | null;
    specs: Record<string, unknown> | null;
    status: string | null;
    created_at: string;
    /** Joined in below — the table itself holds only user_id. */
    seller_name?: string | null;
    seller_email?: string | null;
    seller_phone?: string | null;
}

const COLUMNS =
    'id, user_id, listing_mode, listing_type, category, subcategory, title, brand, model, ' +
    'description, price, price_unit, location, district, state, contact_phone, images, specs, ' +
    'status, created_at';

export async function fetchAdminListings(filters?: {
    listing_type?: string;
    category?: string;
    status?: string;
}): Promise<{ data: AdminListingRow[]; error?: string }> {
    try {
        const admin = createSupabaseAdminClient();

        let query = admin
            .from('marketplace_listings')
            .select(COLUMNS)
            .order('created_at', { ascending: false });

        if (filters?.listing_type) query = query.eq('listing_type', filters.listing_type);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) {
            console.error('[fetchAdminListings] error:', error);
            return { data: [], error: error.message };
        }

        const rows = (data ?? []) as unknown as AdminListingRow[];
        if (rows.length === 0) return { data: [] };

        // Attach the seller. profiles is the app's own table; auth.users is the
        // fallback for anyone who signed up before a profile row existed. A
        // failure here must not lose the listings, so both are best-effort.
        const ids = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)));
        const sellers = new Map<string, { name?: string | null; email?: string | null; phone?: string | null }>();

        try {
            const { data: profiles } = await admin
                .from('profiles')
                .select('id, full_name, email, phone')
                .in('id', ids);
            for (const p of profiles ?? []) {
                sellers.set(p.id as string, {
                    name: p.full_name as string | null,
                    email: p.email as string | null,
                    phone: p.phone as string | null,
                });
            }
        } catch (err) {
            console.error('[fetchAdminListings] profile lookup failed:', err);
        }

        return {
            data: rows.map(r => {
                const s = sellers.get(r.user_id);
                return {
                    ...r,
                    seller_name: s?.name ?? null,
                    seller_email: s?.email ?? null,
                    // The listing's own contact number wins — it is what the
                    // seller typed for this specific ad.
                    seller_phone: r.contact_phone || s?.phone || null,
                };
            }),
        };
    } catch (err) {
        console.error('[fetchAdminListings] unexpected:', err);
        return { data: [], error: 'Failed to load listings' };
    }
}

export async function updateAdminListingStatus(
    id: string,
    status: 'active' | 'pending' | 'sold' | 'expired'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not update the listing' };
    }
}

export async function deleteAdminListing(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .delete()
            .eq('id', id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not delete the listing' };
    }
}
