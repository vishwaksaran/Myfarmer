'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { requestBrowserCoords } from '@/lib/weather-location';
import { reverseGeocodeDetailed } from '@/lib/geolocation';

// ─── Types ───────────────────────────────────────────────────────────
export interface AppLocation {
    address: string;      // Human readable "City, State"
    district?: string;
    state?: string;
    lat: number;
    lng: number;
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

interface LocationContextValue {
    location: AppLocation | null;
    loading: boolean;
    permission: PermissionState;
    /** True once the app has finished its first resolution attempt. */
    ready: boolean;
    /** Trigger the browser geolocation flow + reverse geocode, then persist. */
    requestLocation: () => Promise<AppLocation | null>;
    /** Set a location typed by the user (no coordinates). */
    setManualLocation: (address: string) => void;
    /** Forget the stored location. */
    clearLocation: () => void;
}

// ─── localStorage keys ───────────────────────────────────────────────
const K_ADDRESS = 'miraitu.location.address';
const K_LAT = 'miraitu.location.lat';
const K_LNG = 'miraitu.location.lng';
const K_DISTRICT = 'miraitu.location.district';
const K_STATE = 'miraitu.location.state';

const LocationContext = createContext<LocationContextValue | null>(null);

// ─── Reverse geocode (Nominatim) ─────────────────────────────────────
// Uses zoom=18 via the shared helper. The old zoom=10 request only ever
// resolved to city level, so an exact GPS fix still displayed as "Bangalore"
// instead of the actual locality.
async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; district?: string; state?: string }> {
    try {
        const geo = await reverseGeocodeDetailed(lat, lng);
        return {
            address: geo.address,
            district: geo.locality || geo.district,
            state: geo.state,
        };
    } catch {
        return { address: 'Location detected' };
    }
}

function readStored(): AppLocation | null {
    if (typeof window === 'undefined') return null;
    const address = (localStorage.getItem(K_ADDRESS) || '').trim();
    const lat = Number(localStorage.getItem(K_LAT));
    const lng = Number(localStorage.getItem(K_LNG));
    if (!address) return null;
    return {
        address,
        district: localStorage.getItem(K_DISTRICT) || undefined,
        state: localStorage.getItem(K_STATE) || undefined,
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
    };
}

/**
 * Coarse city-level position from the caller's IP — the last resort when GPS is
 * denied or unavailable, so the app still has *some* location instead of none.
 *
 * Free and keyless. Accuracy is city-level at best and can be badly wrong on
 * mobile carrier networks, so it is only ever used as a fallback and never
 * overwrites a GPS fix.
 */
async function ipFallbackLocation(): Promise<AppLocation | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipwho.is/', { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.success || !data.city) return null;

        return {
            address: [data.city, data.region].filter(Boolean).join(', '),
            district: data.city,
            state: data.region,
            lat: Number(data.latitude) || 0,
            lng: Number(data.longitude) || 0,
        };
    } catch {
        return null;
    }
}

function persist(loc: AppLocation) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(K_ADDRESS, loc.address);
    localStorage.setItem(K_LAT, String(loc.lat));
    localStorage.setItem(K_LNG, String(loc.lng));
    if (loc.district) localStorage.setItem(K_DISTRICT, loc.district); else localStorage.removeItem(K_DISTRICT);
    if (loc.state) localStorage.setItem(K_STATE, loc.state); else localStorage.removeItem(K_STATE);
}

// ─── Provider ────────────────────────────────────────────────────────
export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [location, setLocation] = useState<AppLocation | null>(null);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<PermissionState>('unknown');
    const [ready, setReady] = useState(false);
    const initialised = useRef(false);

    const requestLocation = useCallback(async (): Promise<AppLocation | null> => {
        setLoading(true);
        try {
            const coords = await requestBrowserCoords();
            const geo = await reverseGeocode(coords.lat, coords.lon);
            const loc: AppLocation = { ...geo, lat: coords.lat, lng: coords.lon };
            setLocation(loc);
            persist(loc);
            setPermission('granted');
            return loc;
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg === 'PERMISSION_DENIED') setPermission('denied');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const setManualLocation = useCallback((address: string) => {
        const clean = address.trim();
        if (!clean) return;
        const loc: AppLocation = { address: clean, lat: 0, lng: 0 };
        setLocation(loc);
        persist(loc);
    }, []);

    const clearLocation = useCallback(() => {
        setLocation(null);
        if (typeof window !== 'undefined') {
            [K_ADDRESS, K_LAT, K_LNG, K_DISTRICT, K_STATE].forEach(k => localStorage.removeItem(k));
        }
    }, []);

    // On first mount, resolve the location without ever asking in-app. Order is
    // most-accurate-first:
    //   1. a previously stored fix (instant, already precise)
    //   2. GPS when the browser permission is granted, or still undecided — the
    //      browser shows its own native prompt; we no longer show one of ours
    //   3. coarse IP lookup, only if GPS is denied or fails, so the app is never
    //      left with no location at all
    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;

        const stored = readStored();
        if (stored) {
            setLocation(stored);
            setReady(true);
            return;
        }

        const resolve = async () => {
            let state: PermissionState = 'prompt';
            try {
                const status = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
                if (status?.state) state = status.state as PermissionState;
                setPermission(state);
            } catch {
                /* Permissions API unsupported — just try geolocation below. */
            }

            if (state !== 'denied') {
                const fix = await requestLocation();
                if (fix) {
                    setReady(true);
                    return;
                }
            }

            // GPS denied, unavailable, or timed out — fall back to IP.
            const coarse = await ipFallbackLocation();
            if (coarse) {
                setLocation(coarse);
                persist(coarse);
            }
            setReady(true);
        };
        resolve();
    }, [requestLocation]);

    return (
        <LocationContext.Provider
            value={{ location, loading, permission, ready, requestLocation, setManualLocation, clearLocation }}
        >
            {children}
        </LocationContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useAppLocation(): LocationContextValue {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error('useAppLocation must be used within a LocationProvider');
    return ctx;
}

/**
 * Auto-fills a form's location field from the detected app location, once,
 * as soon as it is available — but only while the field is still empty, so it
 * never overwrites something the user typed.
 *
 *   usePrefillLocation(formData.location, (addr) => setFormData(p => ({ ...p, location: addr })));
 */
export function usePrefillLocation(current: string, apply: (address: string) => void): void {
    const { location } = useAppLocation();
    const applied = useRef(false);
    const applyRef = useRef(apply);
    applyRef.current = apply;

    useEffect(() => {
        if (applied.current) return;
        if (location?.address && !current.trim()) {
            applied.current = true;
            applyRef.current(location.address);
        }
    }, [location, current]);
}
