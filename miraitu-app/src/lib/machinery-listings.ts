import { getActiveListings, type ListingRecord } from '@/lib/supabase-db';

/**
 * Machinery page id → the `subcategory` value stored on the listing row.
 *
 * `marketplace_listings.category` is constrained to
 * machinery / vehicles / animals / land / crops / labour / services / other
 * (migration 030), so a machinery ad is always `category = 'machinery'` and the
 * specific kind goes in `subcategory`, using the vocabulary in
 * listingTypes.SUBCATEGORIES.machinery so the Buy & Sell board's filters
 * recognise it.
 *
 * This is the single source of truth for that mapping: the sell form writes it,
 * the category buy pages read it back. They used to keep separate copies, and
 * the read side had drifted — /tractors/buy asked for `category = 'tractors'`,
 * which is not a value that column can hold, so the query matched nothing and
 * every real tractor ad was invisible on the page it was posted from.
 */
export const MACHINERY_SUBCATEGORY: Record<string, string> = {
    tractors: 'Tractor',
    jcb: 'JCB & Excavation',
    'small-machineries': 'Power Tools',
    implements: 'Tiller & Plough',
    harvesters: 'Harvester',
    drones: 'Sprayers & Drones',
};

/** The card shape MachineryListing renders. */
export interface MachineryCard {
    id: number;
    name: string;
    category: string;
    specs: string;
    price: string;
    image: string;
    brand: string;
    hp: string;
    year: string;
    location: string;
    condition: string;
    [key: string]: string | number | boolean | string[] | Record<string, unknown> | undefined;
}

const FALLBACK_IMAGE =
    'https://images.pexels.com/photos/7532304/pexels-photo-7532304.jpeg?auto=compress&cs=tinysrgb&w=800';

/** Tire wear is the closest thing the sell form captures to a condition grade. */
function conditionFrom(tire: unknown): string {
    const pct = Number(tire);
    if (!Number.isFinite(pct)) return 'Good';
    if (pct >= 75) return 'Excellent';
    if (pct >= 40) return 'Good';
    return 'Fair';
}

function toCard(row: ListingRecord, index: number, categoryLabel: string): MachineryCard {
    const specs = (row.specs ?? {}) as Record<string, unknown>;
    const hp = String(specs.hp ?? '');
    const fuel = String(specs.fuelType ?? 'Diesel');
    const year = String(specs.year ?? '');
    const place = [row.location, row.state].filter(Boolean).join(', ');

    return {
        // MachineryListing keys and compares on a numeric id; rows carry UUIDs.
        id: 1000 + index,
        listingId: row.id ?? '',
        name: row.title,
        category: categoryLabel,
        specs: [hp && `${hp} HP`, fuel, row.state].filter(Boolean).join(' • '),
        price: `₹${Number(row.price ?? 0).toLocaleString('en-IN')}`,
        image: row.images?.[0] || FALLBACK_IMAGE,
        brand: row.brand || '',
        hp,
        year,
        location: place,
        condition: conditionFrom(specs.tireCondition),
    };
}

/**
 * Every live ad posted for one machinery category, newest first.
 *
 * Same rows the Buy & Sell board shows under Machinery — this just narrows them
 * to the one subcategory the page is about, so an ad posted from /jcb/sell shows
 * up on /jcb/buy as well as on the board.
 */
export async function fetchMachineryListings(
    pageCategory: string,
    categoryLabel: string
): Promise<MachineryCard[]> {
    const subcategory = MACHINERY_SUBCATEGORY[pageCategory];
    if (!subcategory) return [];

    // getActiveListings filters on listing_type + category; the subcategory
    // narrowing happens here, so one helper covers all six pages.
    const rows = await getActiveListings('machinery', 'machinery');
    return rows
        .filter(row => row.subcategory === subcategory)
        .map((row, i) => toCard(row, i, categoryLabel));
}
