import { NextRequest, NextResponse } from 'next/server';

/**
 * Indian place search for the onboarding location step.
 *
 * Backed by Open-Meteo's geocoding index — the same provider the weather route
 * already uses — because a bundled list cannot be "every place in India": there
 * are well over half a million villages. The index reaches down to village
 * level, and each hit carries the state and district, which is what lets the
 * form fill those in once a place is picked.
 *
 * Proxied through the server rather than called from the browser so the
 * response can be cached at the edge, and so a provider swap never touches the
 * client.
 */

interface OpenMeteoResult {
    id?: number;
    name?: string;
    admin1?: string;   // state
    admin2?: string;   // district
    admin3?: string;   // sub-district / taluka
    country_code?: string;
    latitude?: number;
    longitude?: number;
    population?: number;
}

export interface PlaceSuggestion {
    id: string;
    /** Village / town / city name. */
    name: string;
    /** District, suffix-stripped. Empty when the provider has none. */
    district: string;
    /** State or union territory. */
    state: string;
}

/**
 * The index transliterates with macrons — "Bīdar", "Srīnagar". Nobody types
 * those, and no other list in the app carries them, so fold them away.
 */
function foldDiacritics(raw: string): string {
    return raw.normalize('NFD').replace(/\p{M}/gu, '');
}

/**
 * The provider is inconsistent about district naming — "Raigad", "Jalna
 * District", "Chennai district", "Bīdar District" all come back for the same
 * field. Strip the suffix so the value matches what a farmer would type and
 * what the rest of the app stores.
 */
function cleanDistrict(raw: string | undefined): string {
    if (!raw) return '';
    return foldDiacritics(raw).replace(/\s+district$/i, '').trim();
}

/**
 * The provider's state names do not always match the INDIAN_STATES list the
 * onboarding dropdown offers. Without this the field would auto-fill a value
 * that its own suggestion list does not contain.
 */
const STATE_ALIASES: Record<string, string> = {
    'national capital territory of delhi': 'Delhi',
    'nct of delhi': 'Delhi',
    'andaman and nicobar': 'Andaman and Nicobar Islands',
    'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'orissa': 'Odisha',
    'pondicherry': 'Puducherry',
    'uttaranchal': 'Uttarakhand',
};

function canonicalState(raw: string | undefined): string {
    if (!raw) return '';
    const cleaned = foldDiacritics(raw).trim();
    return STATE_ALIASES[cleaned.toLowerCase()] || cleaned;
}

/** A place is only useful here if we can name it and say which state it is in. */
function toSuggestion(r: OpenMeteoResult): PlaceSuggestion | null {
    const name = foldDiacritics(r.name || '').trim();
    const state = canonicalState(r.admin1);
    if (!name || !state) return null;
    return {
        id: String(r.id ?? `${name}-${r.latitude}-${r.longitude}`),
        name,
        // admin2 is the district; admin3 (taluka) is a reasonable stand-in when
        // the provider leaves admin2 blank for a small village.
        district: cleanDistrict(r.admin2) || cleanDistrict(r.admin3),
        state,
    };
}

/** Same place, same district, same state — keep the first (best-ranked) one. */
function dedupe(items: PlaceSuggestion[]): PlaceSuggestion[] {
    const seen = new Set<string>();
    return items.filter(item => {
        const key = `${item.name}|${item.district}|${item.state}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function GET(request: NextRequest) {
    const query = (request.nextUrl.searchParams.get('q') || '').trim();

    // Two characters is where results stop being noise. Not an error — the
    // form simply shows its offline shortlist until the farmer types more.
    if (query.length < 2) {
        return NextResponse.json({ results: [] as PlaceSuggestion[] });
    }

    const url =
        'https://geocoding-api.open-meteo.com/v1/search'
        + `?name=${encodeURIComponent(query)}`
        + '&count=10&language=en&format=json&countryCode=IN';

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            // Let Next cache identical lookups; place names do not move.
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            return NextResponse.json({ results: [], error: 'Place lookup unavailable.' }, { status: 502 });
        }

        const payload = (await response.json()) as { results?: OpenMeteoResult[] };
        const results = dedupe(
            (payload.results || [])
                // countryCode is a hint, not a guarantee — enforce it here.
                .filter(r => (r.country_code || '').toUpperCase() === 'IN')
                .map(toSuggestion)
                .filter((r): r is PlaceSuggestion => r !== null),
        );

        return NextResponse.json({ results }, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
        });
    } catch {
        // The form falls back to its bundled shortlist and free typing, so a
        // provider outage degrades the experience rather than blocking signup.
        return NextResponse.json({ results: [], error: 'Place lookup unavailable.' }, { status: 502 });
    }
}
