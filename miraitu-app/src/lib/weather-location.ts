export interface WeatherCoords {
    lat: number;
    lon: number;
}

export type WeatherLocationConsent = 'granted' | 'manual';

export const WEATHER_LOCATION_KEY = 'miraitu.weather.location';
export const WEATHER_LAT_KEY = 'miraitu.weather.lat';
export const WEATHER_LON_KEY = 'miraitu.weather.lon';
export const WEATHER_GEO_DENIED_KEY = 'miraitu.weather.geo-denied';
export const WEATHER_LOCATION_CONSENT_KEY = 'miraitu.weather.location-consent-v2';
const GEO_DENIED_TTL_MS = 10 * 60 * 1000;
const WATER_KEYWORDS = [
    'ocean', 'sea', 'bay', 'gulf', 'channel', 'strait', 'offshore', 'arabian', 'atlantic', 'pacific', 'indian ocean',
];

const isValidNumber = (value: unknown): value is number => {
    return typeof value === 'number' && Number.isFinite(value);
};

const isValidLat = (lat: number): boolean => lat >= -90 && lat <= 90;
const isValidLon = (lon: number): boolean => lon >= -180 && lon <= 180;

const toRoundedCoord = (n: number): number => Number(n.toFixed(6));

export const getSavedWeatherCoords = (): WeatherCoords | null => {
    if (typeof window === 'undefined') return null;

    const lat = Number(window.localStorage.getItem(WEATHER_LAT_KEY));
    const lon = Number(window.localStorage.getItem(WEATHER_LON_KEY));

    if (!isValidNumber(lat) || !isValidNumber(lon) || !isValidLat(lat) || !isValidLon(lon)) {
        return null;
    }

    return { lat, lon };
};

export const saveWeatherCoords = (coords: WeatherCoords): void => {
    if (typeof window === 'undefined') return;
    if (!isValidLat(coords.lat) || !isValidLon(coords.lon)) return;

    window.localStorage.setItem(WEATHER_LAT_KEY, String(toRoundedCoord(coords.lat)));
    window.localStorage.setItem(WEATHER_LON_KEY, String(toRoundedCoord(coords.lon)));
};

export const clearSavedWeatherCoords = (): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(WEATHER_LAT_KEY);
    window.localStorage.removeItem(WEATHER_LON_KEY);
};

export const getSavedWeatherLocation = (): string => {
    if (typeof window === 'undefined') return '';
    return (window.localStorage.getItem(WEATHER_LOCATION_KEY) || '').trim();
};

export const saveWeatherLocation = (location: string): void => {
    if (typeof window === 'undefined') return;
    const normalized = location.trim();
    if (!normalized) return;
    window.localStorage.setItem(WEATHER_LOCATION_KEY, normalized);
};

export const clearSavedWeatherLocation = (): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(WEATHER_LOCATION_KEY);
};

export const getWeatherLocationConsent = (): WeatherLocationConsent | null => {
    if (typeof window === 'undefined') return null;
    const raw = (window.localStorage.getItem(WEATHER_LOCATION_CONSENT_KEY) || '').trim();
    if (raw === 'granted' || raw === 'manual') return raw;
    return null;
};

export const setWeatherLocationConsent = (value: WeatherLocationConsent): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(WEATHER_LOCATION_CONSENT_KEY, value);
};

export const clearWeatherLocationConsent = (): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(WEATHER_LOCATION_CONSENT_KEY);
};

export const isLikelyWaterLocation = (label: string): boolean => {
    const value = label.trim().toLowerCase();
    if (!value) return false;
    return WATER_KEYWORDS.some(word => value.includes(word));
};

export const isSecureGeolocationContext = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
};

export const markGeoPermissionDenied = (denied: boolean): void => {
    if (typeof window === 'undefined') return;
    if (denied) {
        window.localStorage.setItem(WEATHER_GEO_DENIED_KEY, String(Date.now()));
    } else {
        window.localStorage.removeItem(WEATHER_GEO_DENIED_KEY);
    }
};

export const isGeoPermissionDenied = (): boolean => {
    if (typeof window === 'undefined') return false;

    const raw = window.localStorage.getItem(WEATHER_GEO_DENIED_KEY);
    if (!raw) return false;

    const deniedAt = Number(raw);
    if (!Number.isFinite(deniedAt)) {
        // Legacy value (e.g. "1") should not block auto-detection permanently.
        window.localStorage.removeItem(WEATHER_GEO_DENIED_KEY);
        return false;
    }

    if ((Date.now() - deniedAt) > GEO_DENIED_TTL_MS) {
        window.localStorage.removeItem(WEATHER_GEO_DENIED_KEY);
        return false;
    }

    return true;
};

export const parseDistrictStateInput = (rawValue: string): { district: string; state: string } | null => {
    const value = rawValue.trim();
    if (!value) return null;

    const commaPartsRaw = value
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);

    const countryTokens = new Set(['india', 'bharat']);
    const commaParts = commaPartsRaw.filter(part => !countryTokens.has(part.toLowerCase()));

    if (commaParts.length >= 2) {
        const state = commaParts[commaParts.length - 1];
        const district = commaParts[commaParts.length - 2];
        return {
            district,
            state,
        };
    }

    const hyphenParts = value
        .split(' - ')
        .map(part => part.trim())
        .filter(Boolean);

    if (hyphenParts.length >= 2) {
        return {
            district: hyphenParts[0],
            state: hyphenParts[1],
        };
    }

    return null;
};

export const buildWeatherApiQuery = (params: {
    location?: string;
    district?: string;
    state?: string;
    coords?: WeatherCoords | null;
}): string => {
    const search = new URLSearchParams();

    if (params.coords && isValidLat(params.coords.lat) && isValidLon(params.coords.lon)) {
        search.set('lat', String(toRoundedCoord(params.coords.lat)));
        search.set('lon', String(toRoundedCoord(params.coords.lon)));
        return search.toString();
    }

    const district = (params.district || '').trim();
    const state = (params.state || '').trim();
    if (district && state) {
        search.set('district', district);
        search.set('state', state);
        return search.toString();
    }

    const location = (params.location || '').trim() || 'Hyderabad';
    search.set('location', location);
    return search.toString();
};

export const requestBrowserCoords = async (): Promise<WeatherCoords> => {
    if (typeof window === 'undefined' || !window.navigator.geolocation) {
        throw new Error('UNAVAILABLE');
    }

    // Don't block on insecure context — let the browser decide.
    // Many browsers allow geolocation on LAN IPs. If blocked, the error
    // callback will fire with PERMISSION_DENIED or POSITION_UNAVAILABLE.

    return new Promise<WeatherCoords>((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: toRoundedCoord(position.coords.latitude),
                    lon: toRoundedCoord(position.coords.longitude),
                });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error('PERMISSION_DENIED'));
                    return;
                }
                if (error.code === error.TIMEOUT) {
                    reject(new Error('TIMEOUT'));
                    return;
                }
                reject(new Error('UNAVAILABLE'));
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 5 * 60 * 1000,
            }
        );
    });
};
