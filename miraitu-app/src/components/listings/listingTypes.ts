/**
 * Shapes and constants for the Rent / Buy & Sell boards.
 *
 * These live here rather than in `app/actions/listings.ts` because that file is
 * `'use server'`, and a "use server" module may only export async functions —
 * exporting a plain array or object from it fails at runtime with
 * `A "use server" file can only export async functions, found object.`
 *
 * Types alone would be fine there (they are erased at build time), but keeping
 * them next to the constants they describe means one import for consumers.
 */

export type ListingMode = 'sale' | 'rent';

export const LISTING_CATEGORIES = ['machinery', 'vehicles', 'animals', 'land', 'crops', 'labour', 'other'] as const;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

/** Price units offered per board. Sales are a lump sum; rentals are per period. */
export const SALE_PRICE_UNITS = ['Total', 'Per acre', 'Per quintal', 'Per unit'] as const;
export const RENT_PRICE_UNITS = ['One day', 'Per hour', 'Per acre', 'per KM', 'Per month', 'Per season'] as const;

export interface Listing {
    id: string;
    mode: ListingMode;
    category: ListingCategory;
    title: string;
    description: string;
    brand: string;
    model: string;
    /** Null when the seller only marked it negotiable. */
    price: number | null;
    priceUnit: string;
    negotiable: boolean;
    location: string;
    district: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    images: string[];
    status: string;
    contactPhone: string;
    createdAt: string;
    /** Posted by the signed-in user. */
    isOwn: boolean;
    /** Km from the coordinates passed to `fetchListings`, when both are known. */
    distanceKm?: number | null;
}

export interface ListingInput {
    mode: ListingMode;
    category: ListingCategory;
    title: string;
    description?: string;
    brand?: string;
    model?: string;
    price?: number | null;
    priceUnit?: string;
    negotiable?: boolean;
    location: string;
    district?: string;
    state?: string;
    latitude?: number | null;
    longitude?: number | null;
    images?: string[];
    contactPhone?: string;
}

export interface FetchListingsOptions {
    mode: ListingMode;
    /** Omit or 'all' for every category. */
    category?: ListingCategory | 'all';
    /** Matches title, brand, model, description and location. */
    query?: string;
    limit?: number;
    offset?: number;
    /** The viewer's position, so cards can show "6.0 km away". */
    near?: { lat: number; lng: number };
    /** Only the caller's own ads, any status — powers "My Ads". */
    mineOnly?: boolean;
}
