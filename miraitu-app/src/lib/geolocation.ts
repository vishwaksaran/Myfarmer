// Shared high-accuracy geolocation.
//
// `getCurrentPosition` returns the FIRST fix the device can produce, which is
// almost always the coarse network (wi-fi / cell / IP) estimate — often several
// hundred metres to a few kilometres out. `enableHighAccuracy: true` only asks
// the device to start the GPS radio; it does not make it wait for a GPS fix.
//
// `watchPosition` instead streams fixes as they improve. We keep the best one
// and stop as soon as it is accurate enough (or we run out of time), which is
// what actually produces a precise position.

export interface PreciseCoords {
    lat: number;
    lon: number;
    /** Radius of 68% confidence, in metres. Lower is better. */
    accuracy: number;
}

export type GeolocationFailure = 'PERMISSION_DENIED' | 'TIMEOUT' | 'UNAVAILABLE';

export interface PreciseOptions {
    /** Stop as soon as a fix is at least this accurate, in metres. Default 50. */
    desiredAccuracy?: number;
    /** Give up and return the best fix seen so far, in ms. Default 12000. */
    timeout?: number;
}

/**
 * Resolves with the most accurate position the device can produce within the
 * time budget. Rejects with a `GeolocationFailure` message if permission is
 * denied, geolocation is unsupported, or no fix arrives at all.
 */
export function getPreciseCoords(options: PreciseOptions = {}): Promise<PreciseCoords> {
    const desiredAccuracy = options.desiredAccuracy ?? 50;
    const timeout = options.timeout ?? 12000;

    return new Promise<PreciseCoords>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.navigator?.geolocation) {
            reject(new Error('UNAVAILABLE' satisfies GeolocationFailure));
            return;
        }

        let best: PreciseCoords | null = null;
        let watchId: number | null = null;
        let timer: ReturnType<typeof setTimeout> | null = null;
        let settled = false;

        const cleanup = () => {
            if (watchId !== null) window.navigator.geolocation.clearWatch(watchId);
            if (timer !== null) clearTimeout(timer);
            watchId = null;
            timer = null;
        };

        const succeed = (coords: PreciseCoords) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(coords);
        };

        const fail = (reason: GeolocationFailure) => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(reason));
        };

        timer = setTimeout(() => {
            // Out of time — a coarse fix still beats nothing.
            if (best) succeed(best);
            else fail('TIMEOUT');
        }, timeout);

        watchId = window.navigator.geolocation.watchPosition(
            (position) => {
                const candidate: PreciseCoords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    // Some browsers report null accuracy; treat as "unknown, poor".
                    accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : Number.MAX_SAFE_INTEGER,
                };

                if (!best || candidate.accuracy < best.accuracy) best = candidate;
                if (candidate.accuracy <= desiredAccuracy) succeed(candidate);
            },
            (error) => {
                // A permission failure is terminal. Anything else may still be
                // followed by a good fix, so only give up if nothing arrived.
                if (error.code === error.PERMISSION_DENIED) {
                    fail('PERMISSION_DENIED');
                    return;
                }
                if (best) succeed(best);
                else if (error.code === error.TIMEOUT) fail('TIMEOUT');
                else fail('UNAVAILABLE');
            },
            {
                enableHighAccuracy: true,
                // Never accept a cached fix — that is how a stale position from
                // a previous location gets served back.
                maximumAge: 0,
                timeout,
            }
        );
    });
}

/**
 * Reverse-geocode to a human label. `zoom=18` keeps the neighbourhood/village
 * in the result — Nominatim's `zoom=10` collapses everything to the city, which
 * is why a precise fix could still read as just "Bangalore".
 */
export async function reverseGeocodeDetailed(lat: number, lon: number): Promise<{
    address: string;
    locality?: string;
    district?: string;
    state?: string;
    pincode?: string;
}> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('REVERSE_GEOCODE_FAILED');
    const data = await res.json();
    const a = data.address ?? {};

    // Most specific place name first, so the label is the actual locality
    // rather than the city it sits inside.
    const locality: string | undefined =
        a.village || a.hamlet || a.suburb || a.neighbourhood || a.town ||
        a.city_district || a.municipality || a.city || undefined;
    const district: string | undefined = a.county || a.state_district || a.district || undefined;
    const state: string | undefined = a.state || undefined;

    // Skip a district that just repeats the locality (common in city areas).
    const parts = [locality, district, state].filter(
        (part, i, all): part is string => Boolean(part) && all.indexOf(part) === i
    );

    return {
        address: parts.join(', ') || data.display_name?.split(',').slice(0, 2).join(',').trim() || 'Location detected',
        locality,
        district,
        state,
        pincode: a.postcode || undefined,
    };
}
