import { NextRequest, NextResponse } from 'next/server';
import type { WeatherAlertData, WeatherDailyData, WeatherPayload } from '@/lib/weather-types';

interface GeocodeResult {
    name: string;
    admin1?: string;
    admin2?: string;
    country?: string;
    latitude: number;
    longitude: number;
}

interface GeocodeResponse {
    results?: GeocodeResult[];
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

interface NominatimReverseResponse {
    display_name?: string;
    address?: NominatimAddress;
}

interface BigDataCloudReverseResponse {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
}

interface ForecastResponse {
    timezone?: string;
    current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        wind_speed_10m?: number;
        precipitation?: number;
        weather_code?: number;
        is_day?: number;
    };
    daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_max?: number[];
        precipitation_sum?: number[];
        wind_speed_10m_max?: number[];
    };
}

const DEFAULT_LOCATION = 'Hyderabad';
const NOMINATIM_HEADERS = {
    Accept: 'application/json',
    'User-Agent': 'miraitu-weather/1.0',
};

const toNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const round = (value: number): number => Math.round(value);

const formatDayLabel = (dateStr: string, index: number): string => {
    if (index === 0) return 'Today';
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-IN', { weekday: 'short' });
};

const formatAlertDate = (dateStr: string): string => {
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const inLatRange = (lat: number): boolean => lat >= -90 && lat <= 90;
const inLonRange = (lon: number): boolean => lon >= -180 && lon <= 180;

const buildLocationLabel = (parts: Array<string | undefined>): string => {
    const cleaned = parts.map(part => String(part || '').trim()).filter(Boolean);
    return Array.from(new Set(cleaned)).join(', ');
};

const buildLocationCandidates = (location: string, district: string, state: string): string[] => {
    const rawCandidates: string[] = [];

    const normalizedLocation = location.trim();
    const normalizedDistrict = district.trim();
    const normalizedState = state.trim();

    if (normalizedDistrict && normalizedState) {
        rawCandidates.push(`${normalizedDistrict}, ${normalizedState}, India`);
        rawCandidates.push(`${normalizedDistrict}, ${normalizedState}`);
        rawCandidates.push(`${normalizedDistrict} district, ${normalizedState}, India`);
        rawCandidates.push(`${normalizedDistrict} ${normalizedState} India`);
    }

    if (normalizedLocation) {
        rawCandidates.push(normalizedLocation);
        if (!/\bindia\b/i.test(normalizedLocation)) {
            rawCandidates.push(`${normalizedLocation}, India`);
        }
    }

    if (!normalizedLocation && normalizedDistrict && !normalizedState) {
        rawCandidates.push(`${normalizedDistrict}, India`);
    }

    if (!normalizedLocation && normalizedState) {
        rawCandidates.push(`${normalizedState}, India`);
    }

    rawCandidates.push(DEFAULT_LOCATION);

    const deduped = new Map<string, string>();
    for (const item of rawCandidates) {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!deduped.has(key)) deduped.set(key, trimmed);
    }

    return Array.from(deduped.values());
};

const weatherMetaByCode = (code: number): { condition: string; icon: string } => {
    if (code === 0) return { condition: 'Clear sky', icon: 'wb_sunny' };
    if ([1, 2].includes(code)) return { condition: 'Partly cloudy', icon: 'partly_cloudy_day' };
    if (code === 3) return { condition: 'Overcast', icon: 'cloud' };
    if ([45, 48].includes(code)) return { condition: 'Fog', icon: 'foggy' };
    if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', icon: 'grain' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'Rain', icon: 'rainy' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snow/Frost', icon: 'ac_unit' };
    if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', icon: 'thunderstorm' };
    return { condition: 'Variable weather', icon: 'partly_cloudy_day' };
};

const makeAlert = (
    id: number,
    type: WeatherAlertData['type'],
    severity: WeatherAlertData['severity'],
    title: string,
    description: string,
    date: string,
    advice: string
): WeatherAlertData => ({ id, type, severity, title, description, date, advice });

const buildAlerts = (daily: WeatherDailyData[]): WeatherAlertData[] => {
    const alerts: WeatherAlertData[] = [];
    let nextId = 1;

    const stormDay = daily.find(d => [95, 96, 99].includes(d.weatherCode));
    if (stormDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'storm',
                'critical',
                'Thunderstorm Alert',
                `Thunderstorm activity is forecast around ${stormDay.dayLabel}.`,
                formatAlertDate(stormDay.date),
                'Avoid spraying and field work during lightning hours. Secure loose equipment and livestock shelters.'
            )
        );
    }

    const floodDay = daily.find(d => d.rainMm >= 80);
    if (floodDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'flood',
                'high',
                'Heavy Rain / Flood Risk',
                `Expected rainfall is around ${round(floodDay.rainMm)} mm in 24 hours.`,
                formatAlertDate(floodDay.date),
                'Open field drainage channels, move machinery to higher ground, and protect harvested produce.'
            )
        );
    }

    const rainDay = daily.find(d => d.rainChance >= 70 || d.rainMm >= 25);
    if (rainDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'rain',
                rainDay.rainChance >= 85 || rainDay.rainMm >= 50 ? 'high' : 'medium',
                'Rainfall Advisory',
                `Rain probability is ${round(rainDay.rainChance)}% with around ${round(rainDay.rainMm)} mm expected.`,
                formatAlertDate(rainDay.date),
                'Delay chemical spray and fertilizer application. Prioritize harvesting mature crops before rainfall.'
            )
        );
    }

    const heatDay = daily.find(d => d.tempMax >= 40);
    if (heatDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'heat',
                heatDay.tempMax >= 44 ? 'critical' : 'high',
                'Heat Stress Warning',
                `Daytime temperature may reach ${round(heatDay.tempMax)}°C.`,
                formatAlertDate(heatDay.date),
                'Increase irrigation frequency, use mulching, and avoid transplanting in peak afternoon hours.'
            )
        );
    }

    const frostDay = daily.find(d => d.tempMin <= 4);
    if (frostDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'frost',
                frostDay.tempMin <= 1 ? 'high' : 'medium',
                'Low Temperature Advisory',
                `Night temperature could drop to ${round(frostDay.tempMin)}°C.`,
                formatAlertDate(frostDay.date),
                'Protect sensitive crops with covers and consider light irrigation during evening to reduce frost damage.'
            )
        );
    }

    const windDay = daily.find(d => d.windMax >= 35);
    if (windDay) {
        alerts.push(
            makeAlert(
                nextId++,
                'wind',
                windDay.windMax >= 50 ? 'high' : 'medium',
                'Strong Wind Advisory',
                `Wind speed may reach ${round(windDay.windMax)} km/h.`,
                formatAlertDate(windDay.date),
                'Postpone spraying and support tall crops like banana/sugarcane to reduce lodging risk.'
            )
        );
    }

    return alerts;
};

const geocodeOpenMeteo = async (locationName: string): Promise<GeocodeResult | null> => {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=5&language=en&format=json`;
    const geoRes = await fetch(geoUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
    });

    if (!geoRes.ok) return null;

    const geoJson = (await geoRes.json()) as GeocodeResponse;
    if (!geoJson.results || geoJson.results.length === 0) return null;

    const preferred = geoJson.results.find(result => String(result.country || '').toLowerCase() === 'india') || geoJson.results[0];
    if (!preferred) return null;

    return {
        name: preferred.name,
        admin1: preferred.admin1,
        admin2: preferred.admin2,
        country: preferred.country,
        latitude: preferred.latitude,
        longitude: preferred.longitude,
    };
};

const geocodeNominatim = async (locationName: string): Promise<GeocodeResult | null> => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=in&q=${encodeURIComponent(locationName)}`;
    const response = await fetch(url, {
        headers: NOMINATIM_HEADERS,
        cache: 'no-store',
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as NominatimSearchResult[];
    if (!Array.isArray(payload) || payload.length === 0) return null;

    const first = payload[0];
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    const address = first.address || {};
    const locality = address.city || address.town || address.village || address.hamlet || address.state_district || address.county;

    return {
        name: locality || (first.display_name || locationName).split(',')[0].trim(),
        admin2: address.state_district || address.county,
        admin1: address.state,
        country: address.country || 'India',
        latitude,
        longitude,
    };
};

const geocodeLocation = async (candidates: string[]): Promise<GeocodeResult | null> => {
    for (const candidate of candidates) {
        const fromOpenMeteo = await geocodeOpenMeteo(candidate);
        if (fromOpenMeteo) return fromOpenMeteo;

        const fromNominatim = await geocodeNominatim(candidate);
        if (fromNominatim) return fromNominatim;
    }

    return null;
};

const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&addressdetails=1&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(nominatimUrl, {
            headers: NOMINATIM_HEADERS,
            cache: 'no-store',
        });

        if (response.ok) {
            const payload = (await response.json()) as NominatimReverseResponse;
            const address = payload.address || {};
            const locality = address.city || address.town || address.village || address.hamlet || address.state_district || address.county;

            const label = buildLocationLabel([
                locality,
                address.state,
                address.country,
            ]);

            if (label) return label;

            const fallback = String(payload.display_name || '')
                .split(',')
                .map(part => part.trim())
                .filter(Boolean)
                .slice(0, 3)
                .join(', ');

            if (fallback) return fallback;
        }
    } catch {
        // Continue with fallback provider.
    }

    try {
        const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const response = await fetch(bdcUrl, {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });
        if (!response.ok) return null;

        const payload = (await response.json()) as BigDataCloudReverseResponse;
        const locality = payload.city || payload.locality;
        const label = buildLocationLabel([
            locality,
            payload.principalSubdivision,
            payload.countryName,
        ]);

        return label || null;
    } catch {
        return null;
    }
};

export async function GET(request: NextRequest) {
    try {
        const locationParam = String(request.nextUrl.searchParams.get('location') || '').trim();
        const districtParam = String(request.nextUrl.searchParams.get('district') || '').trim();
        const stateParam = String(request.nextUrl.searchParams.get('state') || '').trim();
        const latParam = request.nextUrl.searchParams.get('lat');
        const lonParam = request.nextUrl.searchParams.get('lon');

        if ((latParam && !lonParam) || (!latParam && lonParam)) {
            return NextResponse.json({ error: 'Both lat and lon are required.' }, { status: 400 });
        }

        let latitude = Number.NaN;
        let longitude = Number.NaN;
        let locationLabel = locationParam;

        if (latParam && lonParam) {
            latitude = Number(latParam);
            longitude = Number(lonParam);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !inLatRange(latitude) || !inLonRange(longitude)) {
                return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 });
            }

            const reverseLabel = await reverseGeocode(latitude, longitude);
            locationLabel = reverseLabel || buildLocationLabel([
                districtParam,
                stateParam,
                locationParam,
            ]) || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            const candidates = buildLocationCandidates(locationParam, districtParam, stateParam);
            const geo = await geocodeLocation(candidates);

            if (!geo) {
                return NextResponse.json({ error: 'Location not found.' }, { status: 404 });
            }

            latitude = geo.latitude;
            longitude = geo.longitude;
            locationLabel = buildLocationLabel([
                geo.name,
                geo.admin2,
                geo.admin1,
                geo.country,
            ]);
        }

        const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
        forecastUrl.searchParams.set('latitude', latitude.toString());
        forecastUrl.searchParams.set('longitude', longitude.toString());
        forecastUrl.searchParams.set('timezone', 'auto');
        forecastUrl.searchParams.set(
            'current',
            'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day'
        );
        forecastUrl.searchParams.set(
            'daily',
            'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max'
        );
        forecastUrl.searchParams.set('forecast_days', '7');

        const forecastRes = await fetch(forecastUrl.toString(), {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
        });

        if (!forecastRes.ok) {
            return NextResponse.json({ error: 'Weather provider unavailable.' }, { status: 502 });
        }

        const forecastJson = (await forecastRes.json()) as ForecastResponse;
        const dailyData = forecastJson.daily;

        const times = dailyData?.time || [];
        const codes = dailyData?.weather_code || [];
        const tMax = dailyData?.temperature_2m_max || [];
        const tMin = dailyData?.temperature_2m_min || [];
        const rainProb = dailyData?.precipitation_probability_max || [];
        const rainSum = dailyData?.precipitation_sum || [];
        const windMax = dailyData?.wind_speed_10m_max || [];

        const daily: WeatherDailyData[] = [];
        for (let i = 0; i < times.length; i += 1) {
            const code = toNumber(codes[i]);
            const meta = weatherMetaByCode(code);
            daily.push({
                date: times[i],
                dayLabel: formatDayLabel(times[i], i),
                weatherCode: code,
                condition: meta.condition,
                icon: meta.icon,
                tempMax: round(toNumber(tMax[i])),
                tempMin: round(toNumber(tMin[i])),
                rainChance: round(toNumber(rainProb[i])),
                rainMm: round(toNumber(rainSum[i])),
                windMax: round(toNumber(windMax[i])),
            });
        }

        const currentCode = toNumber(forecastJson.current?.weather_code);
        const currentMeta = weatherMetaByCode(currentCode);

        const payload: WeatherPayload = {
            location: {
                name: locationLabel || DEFAULT_LOCATION,
                latitude,
                longitude,
                timezone: forecastJson.timezone || 'auto',
            },
            updatedAt: new Date().toISOString(),
            current: {
                temperature: round(toNumber(forecastJson.current?.temperature_2m)),
                humidity: round(toNumber(forecastJson.current?.relative_humidity_2m)),
                windSpeed: round(toNumber(forecastJson.current?.wind_speed_10m)),
                precipitation: round(toNumber(forecastJson.current?.precipitation)),
                weatherCode: currentCode,
                condition: currentMeta.condition,
                icon: currentMeta.icon,
                isDay: toNumber(forecastJson.current?.is_day, 1) === 1,
            },
            daily,
            alerts: buildAlerts(daily),
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('[weather-forecast] failed:', error);
        return NextResponse.json({ error: 'Unable to fetch weather data.' }, { status: 500 });
    }
}
