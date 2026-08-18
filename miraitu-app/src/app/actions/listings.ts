'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * The Rent and Buy & Sell boards.
 *
 * Both read the same `marketplace_listings` table, split by `listing_mode` — a
 * rental and a sale differ only in that flag and in how the price reads
 * ("₹3,500 One day" vs "₹45,000 negotiable"), so one table keeps search,
 * categories and moderation in a single place.
 *
 * The DB column is `listing_mode`, not `mode`: PostgreSQL has a built-in
 * ordered-set aggregate named mode(), so a bare `mode` in a select list is
 * read as that function and the query fails. The app-side field stays `mode`.
 *
 * Shapes and constants live in `components/listings/listingTypes` because a
 * "use server" module may only export async functions — exporting the category
 * array from here failed at runtime with "A 'use server' file can only export
 * async functions, found object."
 */

import {
    LISTING_CATEGORIES,
    type FetchListingsOptions,
    type Listing,
    type ListingCategory,
    type ListingInput,
    type ListingMode,
} from '@/components/listings/listingTypes';

interface ListingRow {
    id: string;
    user_id: string;
    listing_mode: string | null;
    category: string | null;
    listing_type: string | null;
    title: string;
    brand: string | null;
    model: string | null;
    description: string | null;
    price: number | null;
    price_unit: string | null;
    negotiable: boolean | null;
    unit: string | null;
    location: string;
    district: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    images: string[] | null;
    status: string | null;
    contact_phone: string | null;
    created_at: string;
}

const COLUMNS =
    'id, user_id, listing_mode, category, listing_type, title, brand, model, description, price, price_unit, negotiable, unit, location, district, state, latitude, longitude, images, status, contact_phone, created_at';

/** Great-circle distance in km — what the "6.0 km away" line is built from. */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function toListing(row: ListingRow, userId: string | null, near?: { lat: number; lng: number }): Listing {
    const distanceKm =
        near && row.latitude !== null && row.longitude !== null
            ? haversineKm(near.lat, near.lng, row.latitude, row.longitude)
            : null;

    return {
        id: row.id,
        mode: (row.listing_mode === 'rent' ? 'rent' : 'sale') as ListingMode,
        // `category` is the taxonomy; `listing_type` is the pre-030 column kept
        // for legacy readers, used here only as a fallback for old rows.
        category: ((row.category || row.listing_type || 'other') as ListingCategory),
        title: row.title,
        description: row.description || '',
        brand: row.brand || '',
        model: row.model || '',
        price: row.price ?? null,
        priceUnit: row.price_unit || row.unit || '',
        negotiable: !!row.negotiable,
        location: row.location || '',
        district: row.district || '',
        state: row.state || '',
        latitude: row.latitude,
        longitude: row.longitude,
        images: (row.images ?? []).filter(Boolean),
        status: row.status || 'active',
        contactPhone: row.contact_phone || '',
        createdAt: row.created_at,
        isOwn: !!userId && userId === row.user_id,
        distanceKm,
    };
}

export async function fetchListings(
    options: FetchListingsOptions
): Promise<{ data: Listing[]; hasMore: boolean; error?: string }> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (options.mineOnly && !user) return { data: [], hasMore: false, error: 'Please sign in' };

        const admin = createSupabaseAdminClient();
        // One row past the page tells us whether another page exists.
        let query = admin
            .from('marketplace_listings')
            .select(COLUMNS)
            .eq('listing_mode', options.mode)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit);

        if (options.mineOnly && user) {
            query = query.eq('user_id', user.id);
        } else {
            query = query.eq('status', 'active');
        }

        if (options.category && options.category !== 'all') {
            query = query.eq('category', options.category);
        }

        const term = options.query?.trim();
        if (term) {
            const safe = term.replace(/[%,()]/g, ' ').trim();
            if (safe) {
                query = query.or(
                    `title.ilike.%${safe}%,brand.ilike.%${safe}%,model.ilike.%${safe}%,description.ilike.%${safe}%,location.ilike.%${safe}%`
                );
            }
        }

        const { data, error } = await query;
        if (error) {
            console.error('[fetchListings] error:', error);
            return { data: [], hasMore: false, error: error.message };
        }

        const rows = (data ?? []) as unknown as ListingRow[];
        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;

        const listings = page.map(row => toListing(row, user?.id ?? null, options.near));

        // Nearest first when we know where the viewer is; otherwise newest
        // first, which the query already ordered by.
        if (options.near) {
            listings.sort((a, b) => {
                // Listings with no coordinates sink to the bottom rather than
                // claiming to be nearby.
                const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
                const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
                return da - db;
            });
        }

        return { data: listings, hasMore };
    } catch (err) {
        console.error('[fetchListings] unexpected:', err);
        return { data: [], hasMore: false, error: 'Failed to load listings' };
    }
}

/**
 * Live tallies for the mobile home tiles. Counts only, no rows — `head: true`
 * so this stays cheap enough to run on every home render.
 */
export async function fetchListingCounts(): Promise<{
    rent: number;
    sale: number;
    labour: number;
    mine: number;
}> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        const admin = createSupabaseAdminClient();

        const active = () => admin
            .from('marketplace_listings')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active');

        const [rent, sale, labour, mine] = await Promise.all([
            active().eq('listing_mode', 'rent'),
            active().eq('listing_mode', 'sale'),
            active().eq('category', 'labour'),
            user
                ? admin.from('marketplace_listings')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                : Promise.resolve({ count: 0 }),
        ]);

        return {
            rent: rent.count ?? 0,
            sale: sale.count ?? 0,
            labour: labour.count ?? 0,
            mine: mine.count ?? 0,
        };
    } catch (err) {
        console.error('[fetchListingCounts] unexpected:', err);
        return { rent: 0, sale: 0, labour: 0, mine: 0 };
    }
}

/** A single listing, for the detail view. Active rows are public; your own are always visible. */
export async function fetchListing(id: string): Promise<{ data: Listing | null; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .select(COLUMNS)
            .eq('id', id)
            .maybeSingle();

        if (error) return { data: null, error: error.message };
        if (!data) return { data: null, error: 'That listing is no longer available' };

        const row = data as unknown as ListingRow;
        if (row.status !== 'active' && row.user_id !== user?.id) {
            return { data: null, error: 'That listing is no longer available' };
        }

        return { data: toListing(row, user?.id ?? null) };
    } catch {
        return { data: null, error: 'Failed to load this listing' };
    }
}

/** Shared validation, so create and update cannot drift apart. */
function validate(input: ListingInput): string | null {
    if (!input.title?.trim()) return 'Give your listing a title';
    if (input.title.trim().length < 3) return 'That title is too short';
    if (!input.location?.trim()) return 'Add where it is';
    if (!LISTING_CATEGORIES.includes(input.category)) return 'Pick a category';
    if (input.mode !== 'sale' && input.mode !== 'rent') return 'Unknown listing type';

    const hasPrice = input.price !== null && input.price !== undefined && Number.isFinite(input.price);
    if (!hasPrice && !input.negotiable) return 'Add a price, or mark it negotiable';
    if (hasPrice && (input.price as number) < 0) return 'Price cannot be negative';

    const images = (input.images ?? []).filter(Boolean);
    if (images.some(i => !/^https?:\/\//i.test(i))) {
        return 'Photos are still uploading. Please wait a moment and try again.';
    }
    return null;
}

/**
 * Publishes an ad. Everything the form collected lands in one INSERT, so a
 * listing can never appear without its photos or its price.
 */
export async function createListing(
    input: ListingInput
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in to post an ad' };

        const invalid = validate(input);
        if (invalid) return { success: false, error: invalid };

        const category = input.category;
        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .insert({
                user_id: user.id,
                listing_mode: input.mode,
                category,
                // Kept in step for anything still reading the pre-030 column.
                listing_type: category === 'animals' ? 'livestock' : category === 'crops' ? 'crops' : 'machinery',
                title: input.title.trim(),
                description: input.description?.trim() || null,
                brand: input.brand?.trim() || null,
                model: input.model?.trim() || null,
                price: input.price ?? null,
                price_unit: input.priceUnit?.trim() || null,
                negotiable: !!input.negotiable,
                location: input.location.trim(),
                district: input.district?.trim() || null,
                state: input.state?.trim() || null,
                latitude: input.latitude ?? null,
                longitude: input.longitude ?? null,
                images: (input.images ?? []).filter(Boolean),
                contact_phone: input.contactPhone?.trim() || null,
                status: 'active',
            })
            .select('id')
            .single();

        if (error) {
            console.error('[createListing] error:', error);
            return { success: false, error: error.message };
        }
        return { success: true, id: data?.id };
    } catch (err) {
        console.error('[createListing] unexpected:', err);
        return { success: false, error: 'Could not publish your listing' };
    }
}

/** Edits an ad. Ownership is enforced server-side, not by hiding the button. */
export async function updateListing(
    id: string,
    input: ListingInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const invalid = validate(input);
        if (invalid) return { success: false, error: invalid };

        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .update({
                listing_mode: input.mode,
                category: input.category,
                title: input.title.trim(),
                description: input.description?.trim() || null,
                brand: input.brand?.trim() || null,
                model: input.model?.trim() || null,
                price: input.price ?? null,
                price_unit: input.priceUnit?.trim() || null,
                negotiable: !!input.negotiable,
                location: input.location.trim(),
                district: input.district?.trim() || null,
                state: input.state?.trim() || null,
                latitude: input.latitude ?? null,
                longitude: input.longitude ?? null,
                images: (input.images ?? []).filter(Boolean),
                contact_phone: input.contactPhone?.trim() || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id');

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: 'That listing is not yours to edit' };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not update your listing' };
    }
}

/** Marks an ad sold/rented or reactivates it. */
export async function setListingStatus(
    id: string,
    status: 'active' | 'sold' | 'expired'
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id');

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: 'That listing is not yours' };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not update your listing' };
    }
}

export async function deleteListing(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Please sign in' };

        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id');

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) return { success: false, error: 'That listing is not yours to delete' };
        return { success: true };
    } catch {
        return { success: false, error: 'Could not delete your listing' };
    }
}
