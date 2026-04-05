import { NextRequest, NextResponse } from 'next/server';
import type { WeatherLocationSuggestion } from '@/lib/weather-types';

interface OpenMeteoGeocodeResult {
    name: string;
    admin1?: string;
    admin2?: string;
    country?: string;
    latitude: number;
    longitude: number;
}

interface OpenMeteoGeocodeResponse {
    results?: OpenMeteoGeocodeResult[];
}

interface NominatimAddress {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
}

interface NominatimSearchResult {
    lat?: string;
    lon?: string;
    display_name?: string;
    address?: NominatimAddress;
}

const nominatimHeaders = {
    Accept: 'application/json',
    'User-Agent': 'miraitu-weather/1.0',
};

const buildLabel = (parts: Array<string | undefined>): string => {
    const cleaned = parts
        .map(part => String(part || '').trim())
        .filter(Boolean);

    return Array.from(new Set(cleaned)).join(', ');
};

const dedupeSuggestions = (list: WeatherLocationSuggestion[]): WeatherLocationSuggestion[] => {
    const seen = new Set<string>();
    const result: WeatherLocationSuggestion[] = [];

    for (const item of list) {
        const key = `${item.label.toLowerCase()}__${item.latitude ?? 'na'}__${item.longitude ?? 'na'}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(item);
    }

    return result;
};

const searchOpenMeteo = async (query: string): Promise<WeatherLocationSuggestion[]> => {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', query);
    url.searchParams.set('count', '10');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');
    url.searchParams.set('countryCode', 'IN');

    const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as OpenMeteoGeocodeResponse;
    if (!payload.results || payload.results.length === 0) return [];

    return payload.results.map(item => {
        const district = String(item.admin2 || '').trim();
        const state = String(item.admin1 || '').trim();
        const country = String(item.country || 'India').trim();

        return {
            label: buildLabel([item.name, district, state, country]),
            district,
            state,
            country,
            latitude: Number.isFinite(item.latitude) ? item.latitude : null,
            longitude: Number.isFinite(item.longitude) ? item.longitude : null,
        };
    });
};

const searchNominatim = async (query: string): Promise<WeatherLocationSuggestion[]> => {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');
    url.searchParams.set('countrycodes', 'in');
    url.searchParams.set('q', query);

    const response = await fetch(url.toString(), {
        headers: nominatimHeaders,
        cache: 'no-store',
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as NominatimSearchResult[];
    if (!Array.isArray(payload) || payload.length === 0) return [];

    return payload.map(item => {
        const address = item.address || {};
        const district = String(address.state_district || address.county || '').trim();
        const state = String(address.state || '').trim();
        const locality = String(address.city || address.town || address.village || address.hamlet || '').trim();
        const country = String(address.country || 'India').trim();

        const latitude = Number(item.lat);
        const longitude = Number(item.lon);

        return {
            label: buildLabel([locality || item.display_name, district, state, country]),
            district,
            state,
            country,
            latitude: Number.isFinite(latitude) ? latitude : null,
            longitude: Number.isFinite(longitude) ? longitude : null,
        };
    });
};

export async function GET(request: NextRequest) {
    try {
        const query = String(request.nextUrl.searchParams.get('q') || '').trim();
        if (query.length < 2) {
            return NextResponse.json({ suggestions: [] as WeatherLocationSuggestion[] }, { status: 200 });
        }

        const openMeteoResults = await searchOpenMeteo(query);
        const nominatimResults = openMeteoResults.length >= 8
            ? []
            : await searchNominatim(`${query}, India`);

        const suggestions = dedupeSuggestions([...openMeteoResults, ...nominatimResults]).slice(0, 10);

        return NextResponse.json({ suggestions }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('[weather-locations] failed:', error);
        return NextResponse.json({ suggestions: [] as WeatherLocationSuggestion[] }, { status: 200 });
    }
}
