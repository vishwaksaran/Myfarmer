'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

type UnitSystem = 'acre' | 'hectare' | 'bigha' | 'guntha' | 'cent' | 'sqft' | 'sqm' | 'kanal' | 'marla';

const unitLabels: Record<UnitSystem, string> = {
    acre: 'Acres',
    hectare: 'Hectares',
    bigha: 'Bigha (Pucca)',
    guntha: 'Gunthas',
    cent: 'Cents',
    sqft: 'Square Feet',
    sqm: 'Square Meters',
    kanal: 'Kanals',
    marla: 'Marlas',
};

// All conversion factors relative to 1 square meter
const toSqM: Record<UnitSystem, number> = {
    sqm: 1,
    sqft: 0.092903,
    acre: 4046.86,
    hectare: 10000,
    bigha: 2529.28,
    guntha: 101.17,
    cent: 40.4686,
    kanal: 505.857,
    marla: 25.2929,
};

// Supported states/regions in India for satellite mapping
const SUPPORTED_STATES = [
    'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra',
    'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab',
    'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh',
    'Kerala', 'Assam', 'Jharkhand',
];

export default function LandAreaPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [mode, setMode] = useState<'converter' | 'manual'>('converter');

    // Converter state
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState<UnitSystem>('acre');

    // Manual measurement state
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [measureUnit, setMeasureUnit] = useState<'feet' | 'meters'>('feet');
    const [displayUnit, setDisplayUnit] = useState<UnitSystem>('acre');

    // Location/Map state
    const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'>('idle');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationName, setLocationName] = useState('');
    const [mapDisplayUnit, setMapDisplayUnit] = useState<UnitSystem>('acre');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const polygonRef = useRef<any>(null);
    const [mapPoints, setMapPoints] = useState<{ lat: number; lng: number }[]>([]);
    const [mapAreaSqM, setMapAreaSqM] = useState(0);

    // Location search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Pin customization state
    type PinStyle = 'circle' | 'square' | 'diamond';
    const PIN_COLORS = [
        { name: 'Red', value: '#ef4444' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Yellow', value: '#eab308' },
    ];
    const PIN_SIZES = [
        { name: 'S', value: 5 },
        { name: 'M', value: 7 },
        { name: 'L', value: 10 },
    ];
    const [pinColor, setPinColor] = useState('#ef4444');
    const [pinSize, setPinSize] = useState(7);
    const [pinStyle, setPinStyle] = useState<PinStyle>('circle');
    const [showPinSettings, setShowPinSettings] = useState(false);

    // Converter logic
    const inputNum = parseFloat(inputValue) || 0;
    const sqMeters = inputNum * toSqM[fromUnit];
    const conversions = Object.entries(toSqM).map(([unit, factor]) => ({
        unit: unit as UnitSystem,
        label: unitLabels[unit as UnitSystem],
        value: sqMeters / factor,
    })).filter(c => c.unit !== fromUnit);

    // Manual calculation
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const areaSqM = measureUnit === 'feet' ? L * W * 0.092903 : L * W;
    const manualResult = areaSqM / toSqM[displayUnit];

    const fmt = (n: number) => {
        if (n === 0) return '0';
        if (n < 0.01) return n.toExponential(2);
        if (n >= 1000) return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return n.toFixed(4).replace(/\.?0+$/, '');
    };

    // Calculate area from lat/lng points using Haversine-based geodesic area
    const calculateGeoArea = useCallback((pts: { lat: number; lng: number }[]) => {
        if (pts.length < 3) return 0;
        // Geodesic area calculation using the shoelace formula on a sphere
        const toRad = (d: number) => (d * Math.PI) / 180;
        const R = 6371000; // Earth's radius in meters
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            const k = (i + 2) % pts.length;
            area += toRad(pts[k].lng - pts[i].lng) * Math.sin(toRad(pts[j].lat));
        }
        return Math.abs(area * R * R);
    }, []);

    // Request location
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('unavailable');
            return;
        }
        setLocationStatus('requesting');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setLocationStatus('granted');
                // Reverse geocode to get location name
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
                    const data = await res.json();
                    const state = data.address?.state || '';
                    const district = data.address?.county || data.address?.state_district || '';
                    const village = data.address?.village || data.address?.town || data.address?.city || '';
                    setLocationName([village, district, state].filter(Boolean).join(', '));
                } catch {
                    setLocationName(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationStatus('denied');
                } else {
                    setLocationStatus('error');
                }
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    // Navigate to a location by typing (without GPS)
    const navigateToLocation = useCallback(async (lat: number, lng: number, name: string) => {
        setUserLocation({ lat, lng });
        setLocationName(name);
        setLocationStatus('granted');
        // If map already exists, just fly to the location
        if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 18);
        }
    }, []);

    // Search for a location by query
    const searchLocation = useCallback(async (query: string) => {
        if (!query.trim() || query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6`);
            const data = await res.json();
            setSearchResults(data);
            setShowSearchResults(true);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search
    const handleSearchInput = (val: string) => {
        setSearchQuery(val);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => searchLocation(val), 400);
    };

    // Close search dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to create a marker based on pin style (always uses draggable L.marker with divIcon)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createStyledMarker = useCallback((L: any, lat: number, lng: number, color: string, size: number, style: PinStyle) => {
        const dim = size * 3;
        let borderRadius = '50%';
        let rotation = '';
        if (style === 'square') { borderRadius = '3px'; }
        if (style === 'diamond') { borderRadius = '2px'; rotation = 'transform: rotate(45deg);'; }

        const icon = L.divIcon({
            className: '',
            html: `<div style="width:${dim}px;height:${dim}px;background:${color};border:2px solid #fff;border-radius:${borderRadius};${rotation}box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:grab;transition:box-shadow 0.15s;"></div>`,
            iconSize: [dim, dim],
            iconAnchor: [dim / 2, dim / 2],
        });
        return L.marker([lat, lng], { icon, draggable: true });
    }, []);

    // Attach drag & remove handlers to a marker at a given index
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attachMarkerEvents = useCallback((marker: any, index: number) => {
        // Drag to reposition
        marker.on('dragend', () => {
            const newLatLng = marker.getLatLng();
            setMapPoints(prev => {
                const updated = [...prev];
                // Find the correct index (it may shift if markers were removed)
                const idx = markersRef.current.indexOf(marker);
                if (idx >= 0 && idx < updated.length) {
                    updated[idx] = { lat: newLatLng.lat, lng: newLatLng.lng };
                }
                return updated;
            });
        });

        // Right-click (desktop) or long-press popup to remove
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        marker.on('contextmenu', (e: any) => {
            e?.originalEvent?.preventDefault?.();
            const idx = markersRef.current.indexOf(marker);
            if (idx >= 0) {
                marker.remove();
                markersRef.current.splice(idx, 1);
                setMapPoints(prev => prev.filter((_, i) => i !== idx));
            }
        });

        // Double-click to remove (mobile-friendly alternative)
        marker.on('dblclick', () => {
            const idx = markersRef.current.indexOf(marker);
            if (idx >= 0) {
                marker.remove();
                markersRef.current.splice(idx, 1);
                setMapPoints(prev => prev.filter((_, i) => i !== idx));
            }
        });

        // Tooltip
        marker.bindTooltip(`Point ${index + 1}<br><small>Drag to move · Right-click to remove</small>`, {
            direction: 'top',
            offset: [0, -10],
            className: 'leaflet-tooltip-pin',
        });
    }, []);

    // Recolor all existing markers when pin settings change
    useEffect(() => {
        if (!mapRef.current || markersRef.current.length === 0) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        if (!L) return;

        const currentPoints = [...mapPoints];
        // Remove old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Re-create markers with new style + events
        currentPoints.forEach((pt, i) => {
            const marker = createStyledMarker(L, pt.lat, pt.lng, pinColor, pinSize, pinStyle);
            marker.addTo(mapRef.current);
            attachMarkerEvents(marker, i);
            markersRef.current.push(marker);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinColor, pinSize, pinStyle, createStyledMarker, attachMarkerEvents]);

    // Initialize Leaflet map when location is granted
    useEffect(() => {
        if (locationStatus !== 'granted' || !userLocation || !mapContainerRef.current) return;
        if (mapRef.current) return; // Already initialized

        // Dynamically load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Dynamically load Leaflet JS
        const loadLeaflet = () => {
            return new Promise<void>((resolve) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any).L) { resolve(); return; }
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        };

        loadLeaflet().then(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const L = (window as any).L;
            if (!L || !mapContainerRef.current) return;

            const map = L.map(mapContainerRef.current, {
                center: [userLocation.lat, userLocation.lng],
                zoom: 18,
                zoomControl: true,
            });

            // Satellite tile layer (Esri World Imagery - free)
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 20,
            }).addTo(map);

            // Add labels overlay
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 20,
            }).addTo(map);

            // User location marker
            L.circleMarker([userLocation.lat, userLocation.lng], {
                radius: 8,
                fillColor: '#3b82f6',
                color: '#fff',
                weight: 3,
                fillOpacity: 1,
            }).addTo(map);

            // Click to place markers
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                
                const marker = createStyledMarker(L, lat, lng, pinColor, pinSize, pinStyle);
                marker.addTo(map);
                const idx = markersRef.current.length;
                attachMarkerEvents(marker, idx);
                markersRef.current.push(marker);

                setMapPoints(prev => {
                    const newPts = [...prev, { lat, lng }];
                    return newPts;
                });
            });

            mapRef.current = map;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationStatus, userLocation]);

    // Update polygon when points change
    useEffect(() => {
        if (!mapRef.current || mapPoints.length < 2) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        if (!L) return;

        // Remove old polygon
        if (polygonRef.current) {
            polygonRef.current.remove();
        }

        if (mapPoints.length >= 3) {
            const latlngs = mapPoints.map(p => [p.lat, p.lng] as [number, number]);
            const polygon = L.polygon(latlngs, {
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.25,
                weight: 3,
            });
            polygon.addTo(mapRef.current);
            polygonRef.current = polygon;

            const area = calculateGeoArea(mapPoints);
            setMapAreaSqM(area);
        }
    }, [mapPoints, calculateGeoArea]);

    const clearMapPoints = () => {
        // Remove markers
        markersRef.current.forEach(m => {
            m.remove();
        });
        markersRef.current = [];
        // Remove polygon
        if (polygonRef.current) {
            polygonRef.current.remove();
            polygonRef.current = null;
        }
        setMapPoints([]);
        setMapAreaSqM(0);
    };

    const undoLastPoint = () => {
        if (markersRef.current.length === 0) return;
        const last = markersRef.current.pop();
        if (last) last.remove();
        setMapPoints(prev => prev.slice(0, -1));
    };

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">{tp('Home')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">{tp('Agri Calculators')}</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">{tp('Land Area Tool')}</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined text-2xl">map</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">{tp('Land Area Tool')}</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">{tp('Map-based perimeter and area measurement. Supports Acres, Bigha, and Hectares.')}</p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                        {(['converter', 'manual'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {m === 'converter' ? tp('Unit Converter') : tp('Measure Area')}
                            </button>
                        ))}
                    </div>

                    {mode === 'converter' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">{tp('Convert Area')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp('Value')}</label>
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 text-2xl font-black text-primary focus:ring-0 border-none"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{tp('Unit')}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.keys(unitLabels) as UnitSystem[]).map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => setFromUnit(u)}
                                                    className={`py-2 md:py-2.5 px-2 rounded-lg text-xs md:text-sm font-bold transition-all ${fromUnit === u ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    {tp(unitLabels[u])}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">{tp('Results')}</h3>
                                <div className="space-y-3">
                                    {conversions.map(c => (
                                        <div key={c.unit} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{tp(c.label)}</span>
                                            <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">{fmt(c.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Manual Measurement */}
                            <div className="space-y-6">
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                    <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">{tp('Rectangular Plot')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2 mb-4">
                                            {(['feet', 'meters'] as const).map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => setMeasureUnit(u)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${measureUnit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                                                >
                                                    {u === 'feet' ? tp('Feet') : tp('Meters')}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{tp('Length')} ({tp(measureUnit)})</label>
                                                <input
                                                    type="number"
                                                    value={length}
                                                    onChange={e => setLength(e.target.value)}
                                                    className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{tp('Width')} ({tp(measureUnit)})</label>
                                                <input
                                                    type="number"
                                                    value={width}
                                                    onChange={e => setWidth(e.target.value)}
                                                    className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{tp('Display Result In')}</label>
                                            <select
                                                value={displayUnit}
                                                onChange={e => setDisplayUnit(e.target.value as UnitSystem)}
                                                className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none"
                                            >
                                                {(Object.keys(unitLabels) as UnitSystem[]).map(u => (
                                                    <option key={u} value={u}>{tp(unitLabels[u])}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {L > 0 && W > 0 && (
                                        <div className="mt-6 p-4 md:p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-bold text-blue-500 uppercase mb-1">{tp('Calculated Area')}</p>
                                            <p className="text-3xl md:text-4xl font-black text-blue-600">{fmt(manualResult)} <span className="text-lg">{tp(unitLabels[displayUnit])}</span></p>
                                            <p className="text-xs text-gray-500 mt-2">{fmt(areaSqM)} {tp('sq. meters')} | {fmt(areaSqM * 10.7639)} {tp('sq. feet')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Satellite Map - Field Measurement */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">satellite_alt</span>
                                        {tp('Satellite Map')}
                                    </h3>
                                    {locationStatus === 'granted' && mapPoints.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={undoLastPoint} className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">undo</span> {tp('Undo')}
                                            </button>
                                            <button onClick={clearMapPoints} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">delete</span> {tp('Clear')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {locationStatus === 'idle' && (
                                    <div className="text-center py-8">
                                        <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-4xl text-blue-600">my_location</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{tp('Open Satellite Map')}</h4>
                                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                            {tp('Use your GPS location or search for any place to view satellite imagery and measure field boundaries.')}
                                        </p>
                                        <button
                                            onClick={requestLocation}
                                            className="vibrant-gradient px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">location_on</span>
                                                {tp('Use My Location')}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-3 my-5">
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                            <span className="text-xs font-bold text-gray-400 uppercase">{tp('or search')}</span>
                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                        </div>

                                        {/* Search location input (available even without GPS) */}
                                        <div className="relative max-w-md mx-auto" ref={searchRef}>
                                            <div className="flex items-center gap-2 skeuo-inset rounded-xl px-4 py-3">
                                                <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                                                <input
                                                    type="text"
                                                    placeholder={tp('Type village, city or area name...')}
                                                    value={searchQuery}
                                                    onChange={e => handleSearchInput(e.target.value)}
                                                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                                    className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                                                />
                                                {isSearching && (
                                                    <div className="h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                                )}
                                            </div>
                                            {showSearchResults && searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                                    {searchResults.map((r, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigateToLocation(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',').slice(0, 3).join(','));
                                                                setSearchQuery(r.display_name.split(',').slice(0, 2).join(','));
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                        >
                                                            <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">location_on</span>
                                                            <span className="line-clamp-2">{r.display_name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {locationStatus === 'requesting' && (
                                    <div className="text-center py-16">
                                        <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
                                        <p className="text-sm font-bold text-gray-600">{tp('Requesting location permission...')}</p>
                                        <p className="text-xs text-gray-400 mt-1">{tp('Please allow access in your browser')}</p>
                                    </div>
                                )}

                                {locationStatus === 'denied' && (
                                    <div className="text-center py-10">
                                        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-4xl text-red-500">location_disabled</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-red-600 mb-2">{tp('Location Access Denied')}</h4>
                                        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                                            {tp('Location permission was denied. Please enable it in your browser settings to use the satellite map feature.')}
                                        </p>
                                        <div className="skeuo-inset rounded-xl p-4 text-left max-w-sm mx-auto">
                                            <p className="text-xs font-bold text-gray-600 mb-2">{tp('How to enable:')}</p>
                                            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                                                <li>{tp("Click the lock/info icon in your browser's address bar")}</li>
                                                <li>{tp('Find "Location" permission')}</li>
                                                <li>{tp('Change to "Allow"')}</li>
                                                <li>{tp('Reload this page')}</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {(locationStatus === 'unavailable' || locationStatus === 'error') && (
                                    <div className="text-center py-10">
                                        <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-4xl text-amber-600">warning</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-amber-600 mb-2">
                                            {locationStatus === 'unavailable' ? tp('Location Not Available') : tp('Location Error')}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                                            {locationStatus === 'unavailable'
                                                ? tp('Your browser does not support geolocation. Please use a modern browser.')
                                                : tp('Could not determine your location. Please check GPS settings and try again.')}
                                        </p>
                                        <button
                                            onClick={requestLocation}
                                            className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-sm hover:bg-amber-500/20 transition-colors"
                                        >
                                            {tp('Try Again')}
                                        </button>
                                    </div>
                                )}

                                {locationStatus === 'granted' && userLocation && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3 text-xs">
                                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                            <span className="text-gray-500 font-medium truncate">
                                                {locationName || `${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`}
                                            </span>
                                        </div>

                                        {/* Search to navigate map */}
                                        <div className="relative mb-3" ref={searchRef}>
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2.5 border border-gray-200 dark:border-gray-700">
                                                <span className="material-symbols-outlined text-gray-400 text-base">search</span>
                                                <input
                                                    type="text"
                                                    placeholder={tp('Search any location to navigate...')}
                                                    value={searchQuery}
                                                    onChange={e => handleSearchInput(e.target.value)}
                                                    onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                                                    className="flex-1 bg-transparent text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                                                />
                                                {isSearching && (
                                                    <div className="h-3.5 w-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            navigator.geolocation.getCurrentPosition((pos) => {
                                                                navigateToLocation(pos.coords.latitude, pos.coords.longitude, locationName);
                                                            });
                                                        }
                                                    }}
                                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                                    title="Go to my location"
                                                >
                                                    <span className="material-symbols-outlined text-base">my_location</span>
                                                </button>
                                            </div>
                                            {showSearchResults && searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                                    {searchResults.map((r, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigateToLocation(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',').slice(0, 3).join(','));
                                                                setSearchQuery(r.display_name.split(',').slice(0, 2).join(','));
                                                                setShowSearchResults(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                        >
                                                            <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5 shrink-0">location_on</span>
                                                            <span className="line-clamp-2">{r.display_name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Pin Customization Toggle */}
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs text-gray-400">
                                                {tp('Tap to place points. Drag to move. Right-click or double-tap to remove.')}
                                            </p>
                                            <button
                                                onClick={() => setShowPinSettings(!showPinSettings)}
                                                className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${showPinSettings ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >
                                                <span className="material-symbols-outlined text-sm">palette</span>
                                                {tp('Pin')}
                                            </button>
                                        </div>

                                        {/* Pin Settings Panel */}
                                        {showPinSettings && (
                                            <div className="mb-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tp('Customize Pin')}</p>

                                                {/* Color */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">{tp('Color')}</label>
                                                    <div className="flex gap-2">
                                                        {PIN_COLORS.map(c => (
                                                            <button
                                                                key={c.value}
                                                                onClick={() => setPinColor(c.value)}
                                                                className={`w-7 h-7 rounded-full border-2 transition-all ${pinColor === c.value ? 'border-gray-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                                style={{ backgroundColor: c.value }}
                                                                title={c.name}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Size */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">{tp('Size')}</label>
                                                    <div className="flex gap-2">
                                                        {PIN_SIZES.map(s => (
                                                            <button
                                                                key={s.value}
                                                                onClick={() => setPinSize(s.value)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pinSize === s.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'}`}
                                                            >
                                                                {s.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Style */}
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 block">{tp('Shape')}</label>
                                                    <div className="flex gap-2">
                                                        {([
                                                            { key: 'circle' as PinStyle, icon: 'circle', label: 'Circle' },
                                                            { key: 'square' as PinStyle, icon: 'square', label: 'Square' },
                                                            { key: 'diamond' as PinStyle, icon: 'diamond', label: 'Diamond' },
                                                        ]).map(s => (
                                                            <button
                                                                key={s.key}
                                                                onClick={() => setPinStyle(s.key)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pinStyle === s.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'}`}
                                                            >
                                                                <span className="material-symbols-outlined text-sm">{s.icon}</span>
                                                                {tp(s.label)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Preview */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold">{tp('Preview:')}</span>
                                                    <div className="flex items-center justify-center w-8 h-8">
                                                        <div
                                                            style={{
                                                                width: `${pinSize * 3}px`,
                                                                height: `${pinSize * 3}px`,
                                                                backgroundColor: pinColor,
                                                                border: '2px solid white',
                                                                borderRadius: pinStyle === 'circle' ? '50%' : pinStyle === 'square' ? '3px' : '2px',
                                                                transform: pinStyle === 'diamond' ? 'rotate(45deg)' : 'none',
                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            ref={mapContainerRef}
                                            className="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                                            style={{ height: '400px' }}
                                        />

                                        {mapPoints.length >= 3 && (
                                            <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-bold text-green-600 uppercase">{tp('Measured Area ({n} points)').replace('{n}', String(mapPoints.length))}</p>
                                                    <select
                                                        value={mapDisplayUnit}
                                                        onChange={e => setMapDisplayUnit(e.target.value as UnitSystem)}
                                                        className="text-xs font-bold bg-transparent text-green-700 border-none focus:ring-0 p-0"
                                                    >
                                                        {(Object.keys(unitLabels) as UnitSystem[]).map(u => (
                                                            <option key={u} value={u}>{tp(unitLabels[u])}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <p className="text-2xl font-black text-green-600">
                                                    {fmt(mapAreaSqM / toSqM[mapDisplayUnit])} {tp(unitLabels[mapDisplayUnit])}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {fmt(mapAreaSqM)} sq.m | {fmt(mapAreaSqM / toSqM.acre)} acres | {fmt(mapAreaSqM / toSqM.hectare)} ha | {fmt(mapAreaSqM / toSqM.bigha)} bigha
                                                </p>
                                            </div>
                                        )}

                                        {mapPoints.length > 0 && mapPoints.length < 3 && (
                                            <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                <p className="text-xs text-amber-600 font-bold">
                                                    <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                                                    {3 - mapPoints.length} {tp('more points needed to calculate area')}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{tp('Available Regions')}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {SUPPORTED_STATES.map(s => (
                                                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tp(s)}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
