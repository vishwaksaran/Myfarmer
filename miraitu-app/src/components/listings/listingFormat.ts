/**
 * Formatting shared by the Rent and Buy & Sell boards, so a listing reads the
 * same on a card, in the detail view and in "My Ads".
 */

import { CATEGORIES_BY_MODE, type Listing, type ListingCategory, type ListingMode } from './listingTypes';

export const CATEGORY_META: Record<ListingCategory, { label: string; icon: string; emoji: string }> = {
    machinery: { label: 'Machinery', icon: 'agriculture', emoji: '🚜' },
    vehicles: { label: 'Vehicles', icon: 'local_shipping', emoji: '🚚' },
    animals: { label: 'Animals', icon: 'pets', emoji: '🐄' },
    land: { label: 'Land', icon: 'landscape', emoji: '🌱' },
    crops: { label: 'Crops', icon: 'grass', emoji: '🌾' },
    labour: { label: 'Labour', icon: 'engineering', emoji: '👷' },
    services: { label: 'Services', icon: 'handyman', emoji: '🛠️' },
    other: { label: 'Other', icon: 'category', emoji: '📦' },
};

/**
 * Chip order on a board — "All" first, then that board's categories.
 *
 * Per-mode because Rent offers no animals or labour, and Buy & Sell no labour.
 */
export function boardCategories(mode: ListingMode): (ListingCategory | 'all')[] {
    return ['all', ...CATEGORIES_BY_MODE[mode]];
}

/** Indian digit grouping: 1,75,000 rather than 175,000. */
export function formatRupees(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * The price line: "₹45,000 negotiable", "₹3,500 One day", "₹13 per KM", or
 * plain "negotiable" when the seller named no figure.
 */
export function formatPrice(listing: Pick<Listing, 'price' | 'priceUnit' | 'negotiable'>): {
    amount: string;
    suffix: string;
} {
    const suffixParts: string[] = [];
    if (listing.priceUnit && listing.priceUnit !== 'Total') suffixParts.push(listing.priceUnit);
    if (listing.negotiable) suffixParts.push('negotiable');

    if (listing.price === null || listing.price === undefined) {
        return { amount: '', suffix: suffixParts.join(' · ') || 'Price on request' };
    }
    return { amount: formatRupees(listing.price), suffix: suffixParts.join(' · ') };
}

/** "0 m away", "6.0 km away" — matches how the reference app reads. */
export function formatDistance(km: number | null | undefined): string | null {
    if (km === null || km === undefined || !Number.isFinite(km)) return null;
    // "0 m away" read as a broken distance rather than a very close one. It
    // shows most often on your own ad, whose coordinates are the ones your
    // device reported when you posted it.
    if (km < 0.05) return 'Nearby';
    if (km < 1) return `${Math.round(km * 1000)} m away`;
    return `${km.toFixed(1)} km away`;
}

export function boardTitle(mode: ListingMode): string {
    if (mode === 'labour') return 'Labour & Services';
    return mode === 'rent' ? 'Rent' : 'Buy & Sell';
}

export function postCta(mode: ListingMode): string {
    if (mode === 'labour') return 'Offer Your Service';
    return mode === 'rent' ? 'List for Rent' : 'Post an Ad';
}

export function searchPlaceholder(mode: ListingMode): string {
    if (mode === 'labour') return 'Search workers, borewell, fencing…';
    return mode === 'rent' ? 'Search equipment, labor…' : 'Search vehicles, animals…';
}

/**
 * The unit a category is normally priced in, pre-selected when the farmer
 * picks it — land by the acre, a vehicle by the kilometre, labour by the day.
 * They can still change it; this only sets the starting point.
 */
export function defaultPriceUnit(mode: ListingMode, category: ListingCategory): string {
    // Labour is hired by the day, a service quoted by the hour it takes.
    if (mode === 'labour') return category === 'labour' ? 'One day' : 'Per hour';
    if (mode === 'rent') {
        switch (category) {
            case 'land': return 'Per acre';
            case 'vehicles': return 'per KM';
            case 'labour': return 'One day';
            case 'crops': return 'Per season';
            default: return 'One day';
        }
    }
    switch (category) {
        case 'land': return 'Per acre';
        case 'crops': return 'Per quintal';
        case 'animals': return 'Per unit';
        default: return 'Total';
    }
}

/**
 * Form hints that follow the chosen category, so the example always matches
 * what is being listed — "e.g. Swaraj 735 XT tractor" is no help to someone
 * listing goats.
 *
 * Rent and sale differ where it matters: renting land is priced per acre and
 * described by season, selling it is priced outright.
 */
export function listingPlaceholders(
    mode: ListingMode,
    category: ListingCategory
): { title: string; price: string; details: string } {
    const rent = mode === 'rent';

    switch (category) {
        case 'machinery':
            return {
                title: rent ? 'e.g. Swaraj 735 XT tractor' : 'e.g. Mahindra 575 DI, 2019',
                price: rent ? '3500' : '450000',
                details: rent
                    ? 'Hours available, implements included, whether a driver comes with it…'
                    : 'Year, hours run, condition, implements included, service history…',
            };
        case 'vehicles':
            return {
                title: rent ? 'e.g. Bolero pickup with driver' : 'e.g. Apache 2025',
                price: rent ? '13' : '175000',
                details: rent
                    ? 'Load capacity, driver included, minimum trip, fuel arrangement…'
                    : 'Year, km driven, insurance validity, condition, RC status…',
            };
        case 'animals':
            return {
                title: rent ? 'e.g. Pair of bullocks for ploughing' : 'e.g. Gir cow, 2nd calving',
                price: rent ? '800' : '45000',
                details: rent
                    ? 'Breed, age, what work they are trained for, handler included…'
                    : 'Breed, age, milk yield per day, calving history, vaccination…',
            };
        case 'land':
            return {
                title: rent ? 'e.g. 3 acres irrigated land for lease' : 'e.g. 2 acres with borewell',
                price: rent ? '25000' : '5000000',
                details: rent
                    ? 'Acres, water source, soil type, lease period, crops allowed…'
                    : 'Acres, water source, soil type, road access, papers in order…',
            };
        case 'crops':
            return {
                title: rent ? 'e.g. Standing fodder crop' : 'e.g. Paddy, 40 quintals',
                price: rent ? '5000' : '2200',
                details: rent
                    ? 'Variety, area, when it can be cut…'
                    : 'Variety, quantity, moisture, harvest date, grading…',
            };
        case 'labour':
            return {
                title: 'e.g. 5 harvest workers available',
                price: '600',
                details: 'How many workers, what work they do, hours per day, area covered…',
            };
        case 'services':
            return {
                title: 'e.g. Borewell drilling with rig',
                price: '900',
                details: 'What the service covers, equipment you bring, how long a job takes…',
            };
        default:
            return {
                title: rent ? 'e.g. Sprayer pump on hire' : 'e.g. Drip irrigation pipes',
                price: '5000',
                details: 'Condition, age, anything a buyer should know…',
            };
    }
}
