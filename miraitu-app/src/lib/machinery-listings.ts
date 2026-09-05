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
        // Sales only. A tractor posted on the Rent board carries the same
        // category and subcategory, and without this it turned up under "Buy
        // Used Tractors" with its hourly rate read as a sale price.
        .filter(row => isSale(row) && row.subcategory === subcategory)
        .map((row, i) => toCard(row, i, categoryLabel));
}

/** Rows written before migration 030, and by the forms here, carry no mode. */
function isSale(row: ListingRecord): boolean {
    return (row.listing_mode ?? 'sale') === 'sale';
}

/** One machinery rental, as the peer-rental strip renders it. */
export interface MachineryRental {
    id: string;
    title: string;
    brand: string;
    /** 'Tractor', 'Harvester', … Empty when the seller picked no sub-type. */
    subcategory: string;
    price: number | null;
    /** 'Per hour', 'One day', 'per KM' — how the owner quoted it. */
    priceUnit: string;
    negotiable: boolean;
    location: string;
    images: string[];
    phone: string;
    createdAt: string;
}

/**
 * Machinery offered for rent by other farmers, from the Rent board.
 *
 * The buy pages have shown real ads for a while — this is the same idea for
 * the rent side, which until now only listed Miraitu's own catalogue. An ad
 * posted once on the Rent board belongs wherever a farmer looks for that
 * machine.
 *
 * `pageCategory` narrows to one sub-type ('tractors' → 'Tractor'); omit it for
 * every machinery rental, which is what the hub shows. Ads whose seller chose
 * no sub-type have no category page to sit on, so the hub is where they
 * surface.
 */
export async function fetchMachineryRentals(pageCategory?: string): Promise<MachineryRental[]> {
    const subcategory = pageCategory ? MACHINERY_SUBCATEGORY[pageCategory] : undefined;
    if (pageCategory && !subcategory) return [];

    const rows = await getActiveListings(undefined, 'machinery');
    return rows
        .filter(row => row.listing_mode === 'rent')
        .filter(row => !subcategory || row.subcategory === subcategory)
        .map(row => ({
            id: row.id ?? '',
            title: row.title,
            brand: row.brand || '',
            subcategory: row.subcategory || '',
            price: row.price ?? null,
            priceUnit: row.price_unit || row.unit || '',
            negotiable: !!row.negotiable,
            location: [row.location, row.district, row.state]
                .map(p => (p ?? '').trim())
                .filter((p, i, all) => p && all.findIndex(q => q.toLowerCase() === p.toLowerCase()) === i)
                .join(', '),
            images: (row.images ?? []).filter(Boolean),
            phone: row.contact_phone || '',
            createdAt: row.created_at ?? '',
        }));
}
