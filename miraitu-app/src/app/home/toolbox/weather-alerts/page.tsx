'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { WeatherAlertData, WeatherLocationSuggestion, WeatherPayload } from '@/lib/weather-types';
import {
    buildWeatherApiQuery,
    clearWeatherLocationConsent,
    getWeatherLocationConsent,
    setWeatherLocationConsent,
    clearSavedWeatherLocation,
    clearSavedWeatherCoords,
    getSavedWeatherLocation,
    isGeoPermissionDenied,
    isLikelyWaterLocation,
    markGeoPermissionDenied,
    parseDistrictStateInput,
    requestBrowserCoords,
    saveWeatherCoords,
    saveWeatherLocation,
    type WeatherLocationConsent,
    type WeatherCoords,
} from '@/lib/weather-location';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

type SeverityFilter = 'all' | WeatherAlertData['severity'];

interface WeatherQuery {
    location?: string;
    district?: string;
    state?: string;
    coords?: WeatherCoords | null;
}

interface LocationSuggestionItem extends WeatherLocationSuggestion {
    kind: 'state' | 'place';
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];

const dedupeSuggestions = (items: LocationSuggestionItem[]): LocationSuggestionItem[] => {
    const seen = new Set<string>();
    const unique: LocationSuggestionItem[] = [];

    for (const item of items) {
        const key = `${item.label.toLowerCase()}__${item.latitude ?? 'na'}__${item.longitude ?? 'na'}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(item);
    }

    return unique;
};

const alertMeta: Record<string, { icon: string; color: string; bg: string }> = {
    rain: { icon: 'rainy', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    heat: { icon: 'wb_sunny', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    frost: { icon: 'ac_unit', color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
    storm: { icon: 'thunderstorm', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    flood: { icon: 'flood', color: 'text-blue-700', bg: 'bg-blue-700/10' },
    wind: { icon: 'air', color: 'text-teal-600', bg: 'bg-teal-500/10' },
};

const severityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

export default function WeatherAlertsPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('all');
    const [locationInput, setLocationInput] = useState('');
    const [locationConsent, setLocationConsent] = useState<WeatherLocationConsent | null>(null);
    const [loadingLocation, setLoadingLocation] = useState('Hyderabad');
    const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [locatingCurrent, setLocatingCurrent] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestionItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [lastQuery, setLastQuery] = useState<WeatherQuery | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionBoxRef = useRef<HTMLDivElement>(null);

    const getFallbackQuery = useCallback((): WeatherQuery => {
        const savedLocation = getSavedWeatherLocation();
        if (savedLocation) {
            if (isLikelyWaterLocation(savedLocation) || savedLocation.trim().toLowerCase() === 'india') {
                clearSavedWeatherLocation();
                clearSavedWeatherCoords();
                return { location: 'Hyderabad' };
            }

            const parsed = parseDistrictStateInput(savedLocation);
            if (parsed) return { district: parsed.district, state: parsed.state };
            return { location: savedLocation };
        }

        return { location: 'Hyderabad' };
    }, []);

    const loadWeather = useCallback(async (query: WeatherQuery): Promise<boolean> => {
        const displayLabel = query.coords
            ? 'Current location'
            : (query.district && query.state)
                ? `${query.district}, ${query.state}`
                : (query.location || 'Hyderabad');

        setLoading(true);
        setError(null);
        setLoadingLocation(displayLabel);
        setLastQuery(query);

        try {
            const queryString = buildWeatherApiQuery(query);
            const res = await fetch(`/api/weather/forecast?${queryString}`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                const msg = res.status === 404 ? 'Location not found. Try village, district, or city name.' : 'Unable to fetch weather data right now.';
                throw new Error(msg);
            }

            const data = (await res.json()) as WeatherPayload;

            const resolvedLabel = String(data.location.name || '').trim();
            const lowerResolved = resolvedLabel.toLowerCase();
            if (query.coords && (isLikelyWaterLocation(resolvedLabel) || lowerResolved === 'india' || lowerResolved === 'bharat')) {
                clearSavedWeatherCoords();
                clearSavedWeatherLocation();
                throw new Error('Current location could not be detected accurately. Please type district and state.');
            }

            setWeatherData(data);

            if (query.coords) {
                saveWeatherCoords(query.coords);
            } else {
                clearSavedWeatherCoords();
            }

            if (data.location.name) {
                setLocationInput(data.location.name);
                saveWeatherLocation(data.location.name);
            }

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to fetch weather data right now.';
            setError(message);
            setWeatherData(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUseCurrentLocation = useCallback(async () => {
        setLocatingCurrent(true);
        setError(null);
        setShowSuggestions(false);

        try {
            const coords = await requestBrowserCoords();
            markGeoPermissionDenied(false);
            saveWeatherCoords(coords);
            const success = await loadWeather({ coords });
            if (success) {
                setLocationConsent('granted');
                setWeatherLocationConsent('granted');
                return;
            }

            clearWeatherLocationConsent();
            setLocationConsent(null);
        } catch (err) {
            const code = err instanceof Error ? err.message : 'UNAVAILABLE';
            if (code === 'PERMISSION_DENIED') {
                markGeoPermissionDenied(true);
                setError('Location permission denied. Enable location permission in browser settings or type district, state.');
            } else if (code === 'TIMEOUT') {
                setError('Unable to get current location in time. Please try again or enter district, state.');
            } else {
                setError('Current location is unavailable on this device. Enter district, state manually.');
            }

            clearWeatherLocationConsent();
            setLocationConsent(null);
        } finally {
            setLocatingCurrent(false);
        }
    }, [loadWeather]);

    useEffect(() => {
        const initializeWeather = async () => {
            const savedLocation = getSavedWeatherLocation();
            if (savedLocation) setLocationInput(savedLocation);

            const consent = getWeatherLocationConsent();
            setLocationConsent(consent);

            if (!consent) {
                setLoading(false);
                setWeatherData(null);
                setError(null);
                return;
            }

            if (consent === 'granted') {
                if (!isGeoPermissionDenied()) {
                    try {
                        const coords = await requestBrowserCoords();
                        markGeoPermissionDenied(false);
                        saveWeatherCoords(coords);
                        const success = await loadWeather({ coords });
                        if (success) return;
                    } catch (err) {
                        if (err instanceof Error && err.message === 'PERMISSION_DENIED') {
                            markGeoPermissionDenied(true);
                        }
                    }
                }

                clearWeatherLocationConsent();
                setLocationConsent(null);
                setLoading(false);
                return;
            }

            clearSavedWeatherCoords();
            await loadWeather(getFallbackQuery());
        };

        void initializeWeather();
    }, [getFallbackQuery, loadWeather]);

    const handleSetLocation = () => {
        const requested = locationInput.trim();
        if (!requested) return;

        setShowSuggestions(false);
        setLocationConsent('manual');
        setWeatherLocationConsent('manual');

        saveWeatherLocation(requested);
        clearSavedWeatherCoords();

        const parsed = parseDistrictStateInput(requested);
        if (parsed) {
            void loadWeather({ district: parsed.district, state: parsed.state });
            return;
        }

        void loadWeather({ location: requested });
    };

    const handleEnableManualWeather = useCallback(() => {
        setLocationConsent('manual');
        setWeatherLocationConsent('manual');
        clearSavedWeatherCoords();
        setError(null);
        void loadWeather(getFallbackQuery());
    }, [getFallbackQuery, loadWeather]);

    const handleSelectSuggestion = (suggestion: LocationSuggestionItem) => {
        setShowSuggestions(false);
        setLocationInput(suggestion.label);
        setLocationConsent('manual');
        setWeatherLocationConsent('manual');
        saveWeatherLocation(suggestion.label);

        if (typeof suggestion.latitude === 'number' && typeof suggestion.longitude === 'number') {
            const coords: WeatherCoords = { lat: suggestion.latitude, lon: suggestion.longitude };
            saveWeatherCoords(coords);
            void loadWeather({ coords });
            return;
        }

        clearSavedWeatherCoords();

        if (suggestion.district && suggestion.state) {
            void loadWeather({ district: suggestion.district, state: suggestion.state });
            return;
        }

        if (suggestion.state) {
            void loadWeather({ location: suggestion.state });
            return;
        }

        void loadWeather({ location: suggestion.label });
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                inputRef.current && !inputRef.current.contains(target)
                && suggestionBoxRef.current && !suggestionBoxRef.current.contains(target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        const rawQuery = locationInput.trim();
        const query = rawQuery.toLowerCase();

        if (query.length < 2) {
            setLocationSuggestions([]);
            setSuggestionsLoading(false);
            return;
        }

        const stateMatches: LocationSuggestionItem[] = INDIAN_STATES
            .filter(state => state.toLowerCase().includes(query))
            .slice(0, 5)
            .map(state => ({
                label: state,
                district: '',
                state,
                country: 'India',
                latitude: null,
                longitude: null,
                kind: 'state',
            }));

        setLocationSuggestions(stateMatches);

        const timer = setTimeout(async () => {
            setSuggestionsLoading(true);
            try {
                const response = await fetch(`/api/weather/locations?q=${encodeURIComponent(rawQuery)}`, {
                    cache: 'no-store',
                });

                if (!response.ok) {
                    setLocationSuggestions(stateMatches);
                    return;
                }

                const payload = (await response.json()) as { suggestions?: WeatherLocationSuggestion[] };
                const placeMatches: LocationSuggestionItem[] = (payload.suggestions || []).map(item => ({
                    ...item,
                    kind: 'place',
                }));

                setLocationSuggestions(dedupeSuggestions([...stateMatches, ...placeMatches]).slice(0, 10));
            } catch {
                setLocationSuggestions(stateMatches);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 280);

        return () => clearTimeout(timer);
    }, [locationInput]);

    const allAlerts = weatherData?.alerts ?? [];

    const filteredAlerts = useMemo(() => {
        if (selectedSeverity === 'all') return allAlerts;
        return allAlerts.filter(a => a.severity === selectedSeverity);
    }, [allAlerts, selectedSeverity]);

    const criticalCount = allAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;

    const severityOrder: SeverityFilter[] = ['all', 'critical', 'high', 'medium', 'low'];
    const fiveDayForecast = weatherData?.daily.slice(0, 5) ?? [];
    const updatedAt = weatherData ? new Date(weatherData.updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : null;

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
                        <span className="text-primary font-bold">{tp('Weather Alerts')}</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined text-2xl">thunderstorm</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">{tp('Weather Alerts')}</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">{tp('Stay informed about weather changes that may affect your farming activities.')}</p>
                        {weatherData && (
                            <div className="mt-4 inline-flex items-center gap-4 rounded-2xl bg-white/80 dark:bg-gray-900/50 px-4 py-3 border border-blue-100 dark:border-blue-900/40">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">{weatherData.current.icon}</span>
                                    <span className="font-black text-gray-900 dark:text-white">{weatherData.current.temperature}°C</span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">{tp(weatherData.current.condition)}</span>
                                <span className="text-xs text-gray-500">{tp('Humidity {n}%').replace('{n}', String(weatherData.current.humidity))}</span>
                                {updatedAt && <span className="text-xs text-gray-400">{tp('Updated {time}').replace('{time}', updatedAt)}</span>}
                            </div>
                        )}
                    </div>

                    {!locationConsent ? (
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 border border-blue-100 dark:border-blue-900/40">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{tp('Enable Live Weather')}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                                {tp('Before showing live weather reports and alerts, choose how you want location to be used.')}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => void handleUseCurrentLocation()}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-base">my_location</span>
                                    {tp('Use Current Location')}
                                </button>
                                <button
                                    onClick={handleEnableManualWeather}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {tp('Select District/State Manually')}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                {tp('Note: Current location works on HTTPS or localhost. On LAN HTTP URLs, choose manual location.')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary Banner */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="material-symbols-outlined text-blue-500 text-xl">location_on</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {tp(weatherData?.location.name || loadingLocation || 'Your Region')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {criticalCount > 0
                                            ? tp('⚠️ {n} high/critical alert(s) active').replace('{n}', String(criticalCount))
                                            : tp('✅ No high-risk alerts right now')}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-start md:justify-end w-full md:w-auto">
                                    <button
                                        onClick={() => void handleUseCurrentLocation()}
                                        className="px-4 py-2.5 rounded-xl bg-blue-100 text-blue-700 text-sm font-bold hover:bg-blue-200 transition-colors flex items-center gap-1.5 w-full sm:w-auto"
                                    >
                                        <span className="material-symbols-outlined text-base">my_location</span>
                                        {locatingCurrent ? tp('Locating...') : tp('Use Current')}
                                    </button>
                                    <div className="relative w-full sm:flex-1 md:flex-none md:w-80">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder={tp('District, State (e.g., Mysuru, Karnataka)')}
                                            value={locationInput}
                                            onChange={e => {
                                                setLocationInput(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => {
                                                if (locationInput.trim().length >= 2) setShowSuggestions(true);
                                            }}
                                            onKeyDown={e => e.key === 'Enter' && handleSetLocation()}
                                            className="skeuo-inset rounded-xl px-4 py-2.5 text-sm w-full"
                                        />

                                        {showSuggestions && (locationSuggestions.length > 0 || suggestionsLoading) && (
                                            <div
                                                ref={suggestionBoxRef}
                                                className="absolute z-30 mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl max-h-72 overflow-y-auto"
                                            >
                                                {locationSuggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={`${suggestion.label}-${idx}`}
                                                        onClick={() => handleSelectSuggestion(suggestion)}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-800"
                                                    >
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{tp(suggestion.label)}</p>
                                                        <p className="text-[11px] text-gray-500">
                                                            {suggestion.kind === 'state'
                                                                ? tp('State')
                                                                : (suggestion.district && suggestion.state)
                                                                    ? `${tp(suggestion.district)}, ${tp(suggestion.state)}`
                                                                    : tp(suggestion.state) || tp('Place')}
                                                        </p>
                                                    </button>
                                                ))}
                                                {suggestionsLoading && (
                                                    <p className="px-4 py-2 text-xs text-gray-500">{tp('Searching locations...')}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleSetLocation} className="vibrant-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm w-full sm:w-auto">
                                        {loading ? tp('Loading...') : tp('Set')}
                                    </button>
                                </div>
                            </div>

                            {/* 5-Day Forecast Bar */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 mb-6">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">{tp('5-Day Outlook')}</h3>
                                {loading ? (
                                    <div className="py-8 text-center text-sm text-gray-500">{tp('Fetching live forecast...')}</div>
                                ) : fiveDayForecast.length > 0 ? (
                                    <div className="grid grid-cols-5 gap-2 md:gap-4">
                                        {fiveDayForecast.map(d => (
                                            <div key={d.date} className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <span className="text-xs font-bold text-gray-600">{tp(d.dayLabel)}</span>
                                                <span className="material-symbols-outlined text-xl md:text-2xl text-blue-500">{d.icon}</span>
                                                <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white">{d.tempMax}°/{d.tempMin}°</span>
                                                <span className="text-[10px] md:text-xs text-blue-500 font-bold">🌧 {d.rainChance}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-gray-500">{tp('Forecast unavailable for this location.')}</div>
                                )}
                            </div>

                            {/* Severity Filter */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                                {severityOrder.map(s => {
                                    const count = s === 'all' ? allAlerts.length : allAlerts.filter(a => a.severity === s).length;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSeverity(s)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${selectedSeverity === s
                                                ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {s === 'all' ? tp('All Alerts ({n})').replace('{n}', String(count)) : `${tp(s)} (${count})`}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Alerts List */}
                            <div className="space-y-4">
                                {error && (
                                    <div className="skeuo-card rounded-2xl p-6 border border-red-200 dark:border-red-900/40 bg-red-50/70 dark:bg-red-900/10">
                                        <p className="font-bold text-red-700 dark:text-red-300">{tp(error)}</p>
                                        <button
                                            onClick={() => {
                                                const retryQuery = lastQuery || getFallbackQuery();
                                                void loadWeather(retryQuery);
                                            }}
                                            className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                                        >
                                            {tp('Retry')}
                                        </button>
                                    </div>
                                )}

                                {!error && !loading && filteredAlerts.map(alert => {
                                    const meta = alertMeta[alert.type];
                                    return (
                                        <div key={alert.id} className="skeuo-card rounded-2xl p-5 md:p-6">
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                <div className={`h-12 w-12 shrink-0 rounded-xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
                                                    <span className="material-symbols-outlined text-2xl">{meta.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{tp(alert.title)}</h4>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${severityColors[alert.severity]}`}>
                                                            {tp(alert.severity)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium ml-auto">{alert.date}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tp(alert.description)}</p>
                                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30">
                                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 flex items-start gap-2">
                                                            <span className="material-symbols-outlined text-sm mt-0.5">agriculture</span>
                                                            <span><strong>{tp('Farming Advice:')}</strong> {tp(alert.advice)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {!error && !loading && filteredAlerts.length === 0 && (
                                    <div className="skeuo-card rounded-2xl p-10 text-center">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">check_circle</span>
                                        <p className="font-bold text-gray-500">{tp('No alerts for the selected severity level.')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Tip Card */}
                            <div className="mt-8 skeuo-card rounded-2xl p-5 md:p-6 border-l-4 border-primary">
                                <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">tips_and_updates</span>
                                    {tp('Pro Tip')}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {tp('Use "Use Current" for GPS-based weather, or type district and state together (example: Mysuru, Karnataka) for accurate regional forecast and alerts.')}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
