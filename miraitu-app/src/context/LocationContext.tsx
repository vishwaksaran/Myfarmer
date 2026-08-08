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
    /** True until the app has decided whether to show the first-run prompt. */
    ready: boolean;
    /** Whether the first-run location prompt should be shown. */
    needsPrompt: boolean;
    /** Trigger the browser geolocation flow + reverse geocode, then persist. */
    requestLocation: () => Promise<AppLocation | null>;
    /** Set a location typed by the user (no coordinates). */
    setManualLocation: (address: string) => void;
    /** Forget the stored location. */
    clearLocation: () => void;
    /** Dismiss the first-run prompt without choosing (won't nag again this session). */
    dismissPrompt: () => void;
}

// ─── localStorage keys ───────────────────────────────────────────────
const K_ADDRESS = 'miraitu.location.address';
const K_LAT = 'miraitu.location.lat';
const K_LNG = 'miraitu.location.lng';
const K_DISTRICT = 'miraitu.location.district';
const K_STATE = 'miraitu.location.state';
const K_PROMPTED = 'miraitu.location.prompted'; // '1' once user has answered the gate

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
    const [needsPrompt, setNeedsPrompt] = useState(false);
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
            localStorage.setItem(K_PROMPTED, '1');
            setNeedsPrompt(false);
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
        localStorage.setItem(K_PROMPTED, '1');
        setNeedsPrompt(false);
    }, []);

    const clearLocation = useCallback(() => {
        setLocation(null);
        if (typeof window !== 'undefined') {
            [K_ADDRESS, K_LAT, K_LNG, K_DISTRICT, K_STATE].forEach(k => localStorage.removeItem(k));
        }
    }, []);

    const dismissPrompt = useCallback(() => {
        setNeedsPrompt(false);
        if (typeof window !== 'undefined') localStorage.setItem(K_PROMPTED, '1');
    }, []);

    // On first mount: hydrate from storage, decide whether to prompt.
    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;

        const stored = readStored();
        if (stored) {
            setLocation(stored);
            setReady(true);
            return;
        }

        const alreadyPrompted = localStorage.getItem(K_PROMPTED) === '1';
        // Check the Permissions API — if already granted, silently detect.
        const decide = async () => {
            try {
                const status = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
                if (status?.state === 'granted') {
                    await requestLocation();
                    setReady(true);
                    return;
                }
                setPermission(status?.state === 'denied' ? 'denied' : 'prompt');
            } catch {
                /* Permissions API unsupported — fall through to prompt */
            }
            if (!alreadyPrompted) setNeedsPrompt(true);
            setReady(true);
        };
        decide();
    }, [requestLocation]);

    return (
        <LocationContext.Provider
            value={{ location, loading, permission, ready, needsPrompt, requestLocation, setManualLocation, clearLocation, dismissPrompt }}
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
