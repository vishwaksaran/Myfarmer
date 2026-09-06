/**
 * Great-circle distance between two coordinates, in kilometres.
 *
 * Lives here rather than in an action file because both `listings.ts` and
 * `livestock.ts` need it and both are `'use server'` modules, which may only
 * export async functions — a shared helper cannot live in either one.
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * The viewer's position, as the boards pass it to a fetch.
 *
 * A location the user typed by hand carries no coordinates (LocationContext
 * stores it as 0/0), so callers must treat 0 as "unknown" rather than as a
 * point in the Gulf of Guinea — `nearFrom` below is the one place that check
 * belongs.
 */
export interface NearPoint {
    lat: number;
    lng: number;
}

/** A usable `near` from an app location, or undefined when there are no real coords. */
export function nearFrom(location: { lat?: number | null; lng?: number | null } | null | undefined): NearPoint | undefined {
    if (!location) return undefined;
    const { lat, lng } = location;
    if (typeof lat !== 'number' || typeof lng !== 'number') return undefined;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    if (lat === 0 && lng === 0) return undefined;
    return { lat, lng };
}
