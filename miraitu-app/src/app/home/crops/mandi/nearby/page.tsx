'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice, getCropEmoji } from '@/lib/mandi-api';

/* ── Indian states list (for suggestions) ─────────────────────────── */
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Chandigarh', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];

/* ── Types ────────────────────────────────────────────────────────── */
interface MandiGroup {
    market: string;
    district: string;
    commodities: { commodity: string; modalPrice: number; variety: string }[];
    totalCommodities: number;
}

interface LocationSuggestion {
    label: string;
    state: string;
    district: string;
    type: 'state' | 'place';
}

export default function NearbyMandisPage() {
    const [searchInput, setSearchInput] = useState('');
    const [selectedState, setSelectedState] = useState('Maharashtra');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'commodities' | 'name'>('commodities');
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const autoDetectedRef = useRef(false);

    // Auto-detect location on first load
    useEffect(() => {
        if (autoDetectedRef.current) return;
        autoDetectedRef.current = true;

        if (!navigator.geolocation) return;
        setGeoLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const state = data.address?.state || 'Maharashtra';
                        const district = data.address?.state_district || data.address?.county || '';
                        const city = data.address?.city || data.address?.town || data.address?.village || '';
                        setSelectedState(state);
                        setSelectedDistrict(district);
                        setSearchInput([city, district, state].filter(Boolean).join(', '));
                    }
                } catch { /* fallback to default Maharashtra */ }
                setGeoLoading(false);
            },
            () => setGeoLoading(false),
            { enableHighAccuracy: false, timeout: 8000 }
        );
    }, []);

    // Fetch market data for the selected state
    const { data: liveData, loading, error, source, refetch } = useMandiPrices({
        state: selectedState,
        limit: 500,
        enabled: !!selectedState,
    });

    // Group data by market → create mandi cards
    const mandis: MandiGroup[] = useMemo(() => {
        const map = new Map<string, MandiGroup>();

        for (const r of liveData) {
            // Filter by district if selected
            if (selectedDistrict && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) continue;

            const key = `${r.market}__${r.district}`;
            if (!map.has(key)) {
                map.set(key, {
                    market: r.market,
                    district: r.district,
                    commodities: [],
                    totalCommodities: 0,
                });
            }
            const group = map.get(key)!;
            group.totalCommodities++;
            if (group.commodities.length < 6) {
                group.commodities.push({
                    commodity: r.commodity,
                    modalPrice: r.modalPrice,
                    variety: r.variety,
                });
            }
        }

        let arr = Array.from(map.values());

        // Sort
        if (sortBy === 'commodities') {
            arr.sort((a, b) => b.totalCommodities - a.totalCommodities);
        } else {
            arr.sort((a, b) => a.market.localeCompare(b.market));
        }

        return arr;
    }, [liveData, selectedDistrict, sortBy]);

    // Available districts for the current state (from live data)
    const availableDistricts = useMemo(() => {
        const set = new Set<string>();
        for (const r of liveData) set.add(r.district);
        return Array.from(set).sort();
    }, [liveData]);

    /* ── Search suggestions (debounced) ───────────────────────────── */
    useEffect(() => {
        const query = searchInput.trim().toLowerCase();
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        // 1. Match Indian states
        const stateMatches: LocationSuggestion[] = INDIAN_STATES
            .filter(s => s.toLowerCase().includes(query))
            .slice(0, 5)
            .map(s => ({ label: s, state: s, district: '', type: 'state' }));

        // 2. Match districts from current data
        const districtMatches: LocationSuggestion[] = availableDistricts
            .filter(d => d.toLowerCase().includes(query))
            .slice(0, 5)
            .map(d => ({ label: `${d}, ${selectedState}`, state: selectedState, district: d, type: 'place' }));

        // 3. Debounced Nominatim geocoding for broader places
        const timer = setTimeout(async () => {
            let nominatimResults: LocationSuggestion[] = [];
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                    `q=${encodeURIComponent(query + ', India')}&format=json&limit=5&addressdetails=1&countrycodes=in`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                if (res.ok) {
                    const places = await res.json();
                    nominatimResults = places
                        .filter((p: { address?: { state?: string } }) => p.address?.state)
                        .map((p: { display_name: string; address: { state?: string; county?: string; state_district?: string } }) => ({
                            label: p.display_name.split(',').slice(0, 3).join(',').trim(),
                            state: p.address.state || '',
                            district: p.address.state_district || p.address.county || '',
                            type: 'place' as const,
                        }));
                }
            } catch { /* Nominatim might be rate-limited */ }

            // Combine and deduplicate
            const combined = [...stateMatches, ...districtMatches, ...nominatimResults];
            const seen = new Set<string>();
            const deduped = combined.filter(s => {
                const key = `${s.state}__${s.district}`.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            setSuggestions(deduped.slice(0, 8));
        }, 350);

        // Immediately show state + district matches
        setSuggestions([...stateMatches, ...districtMatches].slice(0, 8));

        return () => clearTimeout(timer);
    }, [searchInput, availableDistricts, selectedState]);

    /* ── Handle suggestion click ──────────────────────────────────── */
    const handleSelectSuggestion = useCallback((s: LocationSuggestion) => {
        setSearchInput(s.label);
        setSelectedState(s.state);
        setSelectedDistrict(s.district);
        setShowSuggestions(false);
    }, []);

    /* ── Use Current Location ─────────────────────────────────────── */
    const handleUseCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) return;
        setGeoLoading(true);

        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false, timeout: 10000,
                })
            );

            const { latitude, longitude } = pos.coords;

            // Reverse geocode via Nominatim
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );

            if (res.ok) {
                const data = await res.json();
                const state = data.address?.state || 'Maharashtra';
                const district = data.address?.state_district || data.address?.county || '';
                const city = data.address?.city || data.address?.town || data.address?.village || '';

                setSelectedState(state);
                setSelectedDistrict(district);
                setSearchInput([city, district, state].filter(Boolean).join(', '));
            }
        } catch (err) {
            console.warn('Geolocation error:', err);
            // Fallback
            setSelectedState('Maharashtra');
            setSearchInput('Maharashtra');
        } finally {
            setGeoLoading(false);
        }
    }, []);

    /* ── Close suggestions on outside click ───────────────────────── */
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
                && inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="px-4 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-6">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Nearby Mandis</h1>
                    <p className="text-gray-500 text-sm">Live APMC market data from data.gov.in</p>
                </div>

                {/* ── Location Search ──────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                    <div className="relative flex-1 min-w-0">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">location_on</span>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search state, district, city..."
                            value={searchInput}
                            onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => searchInput.length >= 2 && setShowSuggestions(true)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div ref={suggestionsRef} className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={`${s.state}-${s.district}-${i}`}
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-50 dark:border-gray-750 last:border-0 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-gray-400">
                                            {s.type === 'state' ? 'map' : 'location_on'}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.label}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.type === 'state' ? 'State' : 'Place'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleUseCurrentLocation}
                        disabled={geoLoading}
                        className="px-5 py-3 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 whitespace-nowrap"
                    >
                        {geoLoading ? (
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-lg">my_location</span>
                        )}
                        {geoLoading ? 'Detecting...' : 'Current Location'}
                    </button>
                </div>

                {/* ── Active Filters ──────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">State:</span>
                        <span className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-xs">
                            {selectedState || 'All India'}
                        </span>
                    </div>

                    {/* District filter */}
                    {availableDistricts.length > 0 && (
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-green-500"
                        >
                            <option value="">All Districts ({availableDistricts.length})</option>
                            {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'commodities' | 'name')}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium outline-none focus:border-green-500"
                    >
                        <option value="commodities">Most Active</option>
                        <option value="name">A → Z</option>
                    </select>

                    {source && (
                        <span className="ml-auto text-[10px] text-gray-400 font-mono">
                            src: {source}
                        </span>
                    )}
                </div>

                {/* ── Results count ───────────────────────────────── */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {loading ? 'Loading mandis...' : (
                        <>
                            Showing <span className="font-bold text-gray-900 dark:text-white">{mandis.length}</span> mandis
                            {selectedDistrict ? ` in ${selectedDistrict}` : ''} · {selectedState}
                            {' '}({liveData.length} commodity records)
                        </>
                    )}
                </p>

                {/* ── Loading State ───────────────────────────────── */}
                {loading && (
                    <div className="grid md:grid-cols-2 gap-5 mb-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 animate-pulse">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3 mb-3" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2 mb-4" />
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3].map(j => <div key={j} className="h-7 bg-gray-100 dark:bg-gray-700 rounded-full w-24" />)}
                                </div>
                                <div className="h-9 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Error State ─────────────────────────────────── */}
                {!loading && error && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center mb-8 border border-red-100 dark:border-red-800">
                        <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
                        <p className="text-red-600 dark:text-red-400 font-medium mb-3">
                            {error === 'NO_API_KEY' ? 'API key not configured' : 'Failed to load mandi data'}
                        </p>
                        <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Empty State ─────────────────────────────────── */}
                {!loading && !error && mandis.length === 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12 text-center mb-8 border border-gray-100 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">storefront</span>
                        <p className="text-gray-500 font-medium mb-2">No mandis found</p>
                        <p className="text-gray-400 text-sm">
                            {selectedDistrict
                                ? `Try removing the district filter or search for a different location`
                                : `Try searching for a different state`}
                        </p>
                    </div>
                )}

                {/* ── Mandi Cards ─────────────────────────────────── */}
                {!loading && mandis.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-5 mb-8">
                        {mandis.map((mandi) => (
                            <div
                                key={`${mandi.market}-${mandi.district}`}
                                className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-200 dark:hover:border-green-700 transition-all group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl text-green-600 dark:text-green-400">storefront</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                {mandi.market}
                                            </h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {mandi.district}, {selectedState}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                        {mandi.totalCommodities} items
                                    </span>
                                </div>

                                {/* Live Commodity Prices */}
                                <div className="mb-4">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">Today&apos;s Prices</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {mandi.commodities.map((c, i) => (
                                            <span
                                                key={`${c.commodity}-${i}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs font-medium"
                                            >
                                                <span>{getCropEmoji(c.commodity)}</span>
                                                <span className="text-gray-700 dark:text-gray-300">{c.commodity}</span>
                                                <span className="text-green-600 dark:text-green-400 font-bold">{formatPrice(c.modalPrice)}</span>
                                            </span>
                                        ))}
                                        {mandi.totalCommodities > 6 && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500">
                                                +{mandi.totalCommodities - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/home/crops/mandi/prices?state=${encodeURIComponent(selectedState)}&market=${encodeURIComponent(mandi.market)}`}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--miraitu-primary-green)] text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">monitoring</span>
                                        View All Prices
                                    </Link>
                                    <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(mandi.market + ' APMC ' + mandi.district)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg">directions</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Info Footer ─────────────────────────────────── */}
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-5 mb-8">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">info</span>
                        <div>
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">About Mandi Data</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                                Live market prices are sourced from <strong>data.gov.in</strong> (Government of India Open Data Platform).
                                Prices update daily as APMC markets report their transactions. Prices shown are modal (most traded) prices per quintal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
