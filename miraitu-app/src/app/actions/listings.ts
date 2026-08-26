'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { fetchApprovedLeaseListings, type LeaseListingRecord } from './bookings';

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
    CATEGORIES_BY_MODE,
    LISTING_CATEGORIES,
    SUBCATEGORIES,
    subcategoryOptions,
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
    subcategory: string | null;
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
    specs: Record<string, unknown> | null;
    created_at: string;
}

const COLUMNS =
    'id, user_id, listing_mode, category, subcategory, listing_type, title, brand, model, description, price, price_unit, negotiable, unit, location, district, state, latitude, longitude, images, status, contact_phone, specs, created_at';

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

    const specs = (row.specs ?? {}) as Record<string, unknown>;

    return {
        id: row.id,
        mode: ((row.listing_mode === 'rent' || row.listing_mode === 'labour')
            ? row.listing_mode
            : 'sale') as ListingMode,
        // `category` is the taxonomy; `listing_type` is the pre-030 column kept
        // for legacy readers, used here only as a fallback for old rows.
        category: ((row.category || row.listing_type || 'other') as ListingCategory),
        subcategory: row.subcategory || '',
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
        // Labour & Services extras live in specs (migration 032) rather than
        // columns of their own; they read back empty for every other board.
        workType: typeof specs.work_type === 'string' ? specs.work_type : '',
        workerCount: Number.isFinite(Number(specs.worker_count)) && specs.worker_count !== null && specs.worker_count !== ''
            ? Number(specs.worker_count)
            : null,
        contactName: typeof specs.contact_name === 'string' ? specs.contact_name : '',
        createdAt: row.created_at,
        isOwn: !!userId && userId === row.user_id,
        distanceKm,
    };
}

/**
 * Land offered for rent does not live in `marketplace_listings`.
 *
 * It is posted through /home/land/lease, which writes a `service_bookings` row
 * (module 'land', category 'lease') carrying `extra_data.service_type` of
 * either 'lease' or 'rent', and only becomes public once an admin confirms or
 * publishes it. That made the Rent board's Land tab read "No rentals here yet"
 * while the land board one page over was showing rentals — two boards, two
 * tables, one concept.
 *
 * Rather than migrate those rows or double-write them, the Rent board folds
 * them in at read time. `fetchApprovedLeaseListings` is reused verbatim so both
 * boards agree on exactly which rows count as published.
 */
function landRentToListing(rec: LeaseListingRecord): Listing {
    const ed = rec.extra_data ?? {};

    // Prices are entered free-hand ("60,000", "₹60000", "60000 per acre"), so
    // take the digits and nothing else.
    const digits = (ed.lease_price ?? '').replace(/[^\d.]/g, '');
    const price = digits ? Number(digits) : NaN;

    const place = [ed.village, ed.hobli, ed.taluk, ed.district].filter(Boolean).join(', ');

    // Listing has no acreage field, and area is the first thing a renter looks
    // for, so it leads the description rather than being dropped.
    const description = [ed.area ? `${ed.area} acres` : '', ed.description ?? '']
        .filter(Boolean)
        .join(' · ');

    return {
        // Prefixed so it can never collide with a marketplace_listings UUID.
        id: `land-lease:${rec.id}`,
        mode: 'rent',
        category: 'land',
        // These rows carry no sub-category, so they surface under "All Land".
        subcategory: '',
        title: ed.title || 'Land for rent',
        description,
        brand: '',
        model: '',
        price: Number.isFinite(price) ? price : null,
        // The land form fixes rent at ₹/acre/month; it is not one of
        // RENT_PRICE_UNITS because nothing posts it through that form.
        priceUnit: 'Per acre / month',
        negotiable: false,
        location: place || rec.location || '',
        district: ed.district ?? '',
        state: '',
        // service_bookings stores no coordinates, so these sort last under
        // "nearest first" rather than pretending to be nearby.
        latitude: null,
        longitude: null,
        images: ed.photos ?? [],
        status: 'active',
        contactPhone: rec.phone ?? '',
        createdAt: rec.created_at,
        // Not a Labour & Services listing, so these stay empty.
        workType: '',
        workerCount: null,
        contactName: rec.full_name ?? '',
        // Editing and deleting belong to the land board, not this one.
        isOwn: false,
        distanceKm: null,
    };
}

async function fetchLandRentListings(term?: string): Promise<Listing[]> {
    const { data } = await fetchApprovedLeaseListings();
    let rows = data
        .filter(rec => rec.extra_data?.service_type === 'rent')
        .map(landRentToListing);

    // The marketplace query filters in SQL; these are filtered here so the
    // search box behaves the same across both sources.
    const q = term?.trim().toLowerCase();
    if (q) {
        rows = rows.filter(l =>
            l.title.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q) ||
            l.location.toLowerCase().includes(q)
        );
    }
    return rows;
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

        if (options.subcategory) {
            query = query.eq('subcategory', options.subcategory);
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

        // Land-for-rent rows come from the land board (see landRentToListing).
        // Only on the first page — they are a small admin-curated set, so
        // paging them alongside a second table would risk gaps and repeats.
        // Skipped for "My Ads" (the viewer does not own them) and whenever a
        // land sub-category is selected (they carry none).
        const wantsLand = !options.category || options.category === 'all' || options.category === 'land';
        if (options.mode === 'rent' && wantsLand && !options.mineOnly && !options.subcategory && offset === 0) {
            const landRentals = await fetchLandRentListings(options.query);
            if (landRentals.length) {
                listings.push(...landRentals);
                // Restore newest-first across the merged set; the distance sort
                // below overrides this when the viewer's position is known.
                listings.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
            }
        }

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
            // The whole Labour & Services board, not just its 'labour' half —
            // 'services' is the other category on it. Counting by category
            // would also have swept in legacy labour rows left on Rent.
            active().eq('listing_mode', 'labour'),
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
    if (input.mode !== 'sale' && input.mode !== 'rent' && input.mode !== 'labour') {
        return 'Unknown listing type';
    }

    // Each board offers its own subset — Rent has no animals or labour, Buy &
    // Sell has no labour. Enforced here so the rule holds even if a client
    // posts a category its own chips no longer show.
    if (!CATEGORIES_BY_MODE[input.mode].includes(input.category)) {
        return 'That category is not available on this board';
    }

    // Sub-category is required wherever the category offers one, so every ad
    // lands under the board's second-level filter. "Other" offers none — it is
    // the catch-all itself — so it is exempt.
    const sub = input.subcategory?.trim();
    if (subcategoryOptions(input.category).length > 0 && !sub) {
        return 'Pick a type for this category';
    }
    // Checked against the full list rather than the offered one, so an older ad
    // that still carries "Other" can be saved instead of being rejected.
    if (sub && !SUBCATEGORIES[input.category].includes(sub)) {
        return 'Pick a sub-category from the list';
    }

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
/**
 * The Labour & Services extras, shaped for the `specs` JSONB column.
 *
 * Only the keys that carry a value are written, so a machinery ad's specs stay
 * `{}` rather than filling with three nulls.
 */
function buildSpecs(input: ListingInput): Record<string, unknown> {
    const specs: Record<string, unknown> = {};
    const workType = input.workType?.trim();
    const contactName = input.contactName?.trim();
    if (workType) specs.work_type = workType;
    if (contactName) specs.contact_name = contactName;
    if (input.workerCount !== null && input.workerCount !== undefined && Number.isFinite(input.workerCount)) {
        specs.worker_count = input.workerCount;
    }
    return specs;
}

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
                subcategory: input.subcategory?.trim() || null,
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
                specs: buildSpecs(input),
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
                subcategory: input.subcategory?.trim() || null,
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
                specs: buildSpecs(input),
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
