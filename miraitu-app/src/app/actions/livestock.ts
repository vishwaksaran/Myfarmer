'use server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

/**
 * The five livestock pages, reading the ads farmers actually posted.
 *
 * Livestock is not a table of its own. The sell form on /home/livestock writes
 * a `marketplace_listings` row with `category: 'animals'` and a subcategory
 * from listingTypes.SUBCATEGORIES.animals — the same rows the Buy & Sell board
 * shows under Animals. Each page here is one slice of that, chosen by
 * subcategory, so an ad posted once appears in both places and nowhere is a
 * seller asked to post twice.
 *
 * `listing_mode` is left to its default of 'sale' by the sell form (migration
 * 030), which is why these are filtered as sales.
 *
 * Constants and shapes stay unexported: a "use server" module may only export
 * async functions, and an exported object fails at runtime with "A 'use
 * server' file can only export async functions, found object." Types are
 * erased at build time, so those are fine.
 */

export type LivestockType = 'cattle' | 'goats' | 'poultry' | 'fish' | 'others';

/**
 * Which `subcategory` values belong to each page.
 *
 * Cattle covers three: the page is "cows, bulls & buffaloes", and the sell
 * form's own 'cattle' id is lossy in exactly the same way.
 */
const SUBCATEGORIES_BY_TYPE: Record<LivestockType, string[]> = {
    cattle: ['Cow', 'Buffalo', 'Bullock'],
    goats: ['Goat & Sheep'],
    poultry: ['Poultry'],
    fish: ['Fish & Aqua'],
    others: ['Other Livestock', 'Guard Dog'],
};

export interface LivestockAd {
    id: string;
    /**
     * Which of the five pages this ad belongs to. Carried on the ad because
     * the Buy tab on /home/livestock mixes all five, and its category chips
     * and each card's breed/age/yield line both key off it.
     */
    type: LivestockType;
    title: string;
    description: string;
    /** 'Cow', 'Poultry', … — shown as a chip so a buffalo does not read as a cow. */
    subcategory: string;
    /** Null when the seller named no figure. */
    price: number | null;
    priceUnit: string;
    location: string;
    district: string;
    state: string;
    images: string[];
    phone: string;
    createdAt: string;
    /**
     * The category's own answers — breed, age, milkYield, quantity and so on,
     * keyed as the sell form's CATEGORY_FIELDS defines them. Coerced to strings
     * and blanks dropped, so a card can render whatever it finds.
     */
    specs: Record<string, string>;
}

const COLUMNS =
    'id, title, description, subcategory, price, price_unit, unit, location, district, state, images, contact_phone, specs, created_at';

interface Row {
    id: string;
    title: string;
    description: string | null;
    subcategory: string | null;
    price: number | null;
    price_unit: string | null;
    unit: string | null;
    location: string | null;
    district: string | null;
    state: string | null;
    images: string[] | null;
    contact_phone: string | null;
    specs: Record<string, unknown> | null;
    created_at: string;
}

/**
 * Does this row belong on the page for `type`?
 *
 * `subcategory` is the answer whenever the seller's form set one. Ads posted
 * before it existed carry none, and for those the sell form's own category id
 * survives in `specs` — as `livestock_type` today, as `original_category` in
 * rows an earlier build wrote. An ad with neither would otherwise be invisible
 * on all five pages, so it lands under Others rather than nowhere.
 */
function belongsTo(row: Row, type: LivestockType): boolean {
    const subcategory = (row.subcategory ?? '').trim();
    if (subcategory) return SUBCATEGORIES_BY_TYPE[type].includes(subcategory);

    const specs = row.specs ?? {};
    const fromSpecs = String(specs.livestock_type ?? specs.original_category ?? '').trim();
    return fromSpecs ? fromSpecs === type : type === 'others';
}

/**
 * The one page a row belongs to. `belongsTo` answers this per page; this walks
 * the five in order and returns the first that claims the row. `others` is the
 * catch-all in `belongsTo`, so the walk always terminates.
 */
const LIVESTOCK_TYPES: LivestockType[] = ['cattle', 'goats', 'poultry', 'fish', 'others'];

function typeOf(row: Row): LivestockType {
    return LIVESTOCK_TYPES.find(t => belongsTo(row, t)) ?? 'others';
}

/** Everything the seller answered, as printable strings. */
function toSpecs(raw: Record<string, unknown> | null): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw ?? {})) {
        if (value === null || value === undefined) continue;
        const text = String(value).trim();
        if (text) out[key] = text;
    }
    return out;
}

/**
 * The ads for one page, or — with 'all' — every livestock ad there is, which
 * is what the Buy tab on /home/livestock shows.
 */
export async function fetchLivestockListings(
    type: LivestockType | 'all'
): Promise<{ data: LivestockAd[]; error?: string }> {
    // An unknown slug is a stale link, not an error worth showing a farmer.
    if (type !== 'all' && !SUBCATEGORIES_BY_TYPE[type]) return { data: [] };

    try {
        const { data, error } = await createSupabaseAdminClient()
            .from('marketplace_listings')
            .select(COLUMNS)
            .eq('listing_mode', 'sale')
            .eq('status', 'active')
            .eq('category', 'animals')
            .order('created_at', { ascending: false })
            // Every animal ad, split into pages below rather than in SQL:
            // `belongsTo` has to fall back on `specs` for rows that carry no
            // subcategory, which is not something a PostgREST filter can do in
            // one query. The whole set is small and stays that way.
            .limit(200);

        if (error) {
            console.error('[fetchLivestockListings] error:', error);
            return { data: [], error: error.message };
        }

        const all = (data ?? []) as unknown as Row[];
        const rows = type === 'all' ? all : all.filter(row => belongsTo(row, type));
        return {
            data: rows.map(row => ({
                id: row.id,
                type: type === 'all' ? typeOf(row) : type,
                title: row.title,
                description: row.description || '',
                subcategory: row.subcategory || '',
                price: row.price ?? null,
                priceUnit: row.price_unit || row.unit || '',
                location: row.location || '',
                district: row.district || '',
                state: row.state || '',
                images: (row.images ?? []).filter(Boolean),
                phone: row.contact_phone || '',
                createdAt: row.created_at,
                specs: toSpecs(row.specs),
            })),
        };
    } catch (err) {
        console.error('[fetchLivestockListings] unexpected:', err);
        return { data: [], error: 'Failed to load listings' };
    }
}
