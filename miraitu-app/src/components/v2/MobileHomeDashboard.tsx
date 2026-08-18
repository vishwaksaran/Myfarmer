'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAppLocation } from '@/context/LocationContext';
import { buildWeatherApiQuery } from '@/lib/weather-location';
import type { WeatherPayload } from '@/lib/weather-types';
import { fetchListingCounts } from '@/app/actions/listings';

/**
 * The mobile home screen: a greeting, live weather, and the six things a
 * farmer opens the app to do.
 *
 * Replaces the "Innovation in Agriculture" hero on phones — that panel is a
 * full-viewport marketing splash, so on a small screen everything useful
 * started below the fold. Desktop keeps the hero.
 */

function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

/**
 * The API returns a full address — "Coimbatore, Coimbatore district, Tamil
 * Nadu, India" — which is far too long for the card. The first segment is the
 * place name people actually recognise.
 */
function shortPlace(name: string): string {
    const first = (name || '').split(',')[0]?.trim();
    const place = first || name || '';
    // Typed locations arrive however the user wrote them ("coimbatore"), so
    // title-case for display. Words already mixed-case (McLeodganj) are left be.
    return place.replace(/\b[a-z]/g, c => c.toUpperCase());
}

interface TileProps {
    href: string;
    label: string;
    caption: string;
    /** Material Symbols ligature name. */
    icon: string;
    count?: number;
    /** Background + border classes for this tile. */
    className: string;
    /** Text colour for the label and icon. */
    accent: string;
    /** Taller, icon-above-label — used for the two marketplaces. */
    tall?: boolean;
    /** Full-width, icon-beside-label with a chevron. */
    wide?: boolean;
}

/**
 * One quick-action tile. Three shapes share this component so spacing, the
 * count badge and the press animation stay identical across them.
 */
function Tile({ href, label, caption, icon, count, className, accent, tall, wide }: TileProps) {
    // A "0" pill reads as broken rather than informative, so the badge only
    // appears once there is something to count.
    const badge = typeof count === 'number' && count > 0 ? count : null;

    return (
        <Link
            href={href}
            className={`group relative overflow-hidden rounded-2xl p-4 active:scale-[0.98] transition-transform ${className} ${
                wide ? 'flex items-center gap-3.5' : `flex flex-col justify-between ${tall ? 'min-h-[132px]' : 'min-h-[108px]'}`
            }`}
        >
            {/* Decorative corner wash — gives each tile depth without an image */}
            <span aria-hidden className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/40 dark:bg-white/5" />

            {badge !== null && (
                <span className="absolute top-2.5 right-2.5 z-10 min-w-[22px] px-1.5 py-0.5 rounded-full bg-white/90 dark:bg-black/40 text-[11px] font-extrabold text-center text-gray-700 dark:text-gray-200 shadow-sm">
                    {badge}
                </span>
            )}

            <span className={`relative grid place-items-center rounded-xl bg-white/70 dark:bg-black/20 shrink-0 ${wide ? 'w-11 h-11' : 'w-12 h-12'}`}>
                <span className={`material-symbols-outlined ${wide ? 'text-[24px]' : 'text-[27px]'} ${accent}`}>
                    {icon}
                </span>
            </span>

            <span className={`relative min-w-0 ${wide ? 'flex-1' : ''}`}>
                <span className={`block text-[15px] font-extrabold leading-tight ${accent}`}>{label}</span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    {caption}
                </span>
            </span>

            {wide && (
                <span className={`relative material-symbols-outlined shrink-0 ${accent} opacity-60`}>chevron_right</span>
            )}
        </Link>
    );
}

export default function MobileHomeDashboard() {
    const { user } = useAuth();
    const { location, requestLocation, loading: locationLoading, error: locationError } = useAppLocation();
    const [weather, setWeather] = useState<WeatherPayload | null>(null);
    const [weatherError, setWeatherError] = useState(false);
    const [counts, setCounts] = useState({ rent: 0, sale: 0, labour: 0, mine: 0 });

    const locationLabel = location?.address || '';
    const coordsKey = location?.lat && location?.lng ? `${location.lat},${location.lng}` : '';

    // Weather for wherever the app thinks the user is; falls back to the
    // typed address, and finally to a sensible default so the card is never
    // blank.
    const loadWeather = useCallback(async () => {
        try {
            const query = buildWeatherApiQuery(
                location?.lat && location?.lng
                    ? { coords: { lat: location.lat, lon: location.lng } }
                    : { location: locationLabel || 'Bengaluru' }
            );
            const res = await fetch(`/api/weather/forecast?${query}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('weather unavailable');
            setWeather((await res.json()) as WeatherPayload);
            setWeatherError(false);
        } catch {
            setWeatherError(true);
        }
        // coordsKey is the stable identity of the coordinate pair.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coordsKey, locationLabel]);

    useEffect(() => {
        void loadWeather();
    }, [loadWeather]);

    useEffect(() => {
        let cancelled = false;
        fetchListingCounts().then(res => { if (!cancelled) setCounts(res); });
        return () => { cancelled = true; };
    }, [user?.id]);

    const today = weather?.daily?.[0];

    return (
        <section className="md:hidden px-4 pt-4 pb-2">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">
                {greeting()} <span aria-hidden>👋</span>
            </h1>

            {/* Weather */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2c5926] via-[#1f8c30] to-[#34a832] text-white shadow-lg shadow-[#2c5926]/20 p-4">
                {/* Soft light blooms, purely decorative */}
                <span aria-hidden className="pointer-events-none absolute -top-10 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <span aria-hidden className="pointer-events-none absolute -bottom-12 -left-6 w-28 h-28 rounded-full bg-black/10 blur-xl" />

                {weatherError ? (
                    <div className="relative flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm text-white/90">
                            <span className="material-symbols-outlined">cloud_off</span>
                            Weather unavailable
                        </span>
                        <button
                            onClick={() => { void loadWeather(); }}
                            className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30"
                        >
                            Retry
                        </button>
                    </div>
                ) : !weather ? (
                    <div className="relative animate-pulse space-y-3">
                        <div className="h-10 w-28 rounded bg-white/20" />
                        <div className="h-3 w-44 rounded bg-white/20" />
                    </div>
                ) : (
                    <div className="relative">
                        {/* Place sits on its own line above the reading, so a long
                            name wraps instead of colliding with the temperature. */}
                        <p className="flex items-center gap-1 text-xs font-semibold text-white/85 mb-2">
                            <span className="material-symbols-outlined text-[15px]">location_on</span>
                            <span className="truncate">{shortPlace(weather.location.name)}</span>
                        </p>

                        <div className="flex items-center gap-3">
                            <span className="grid place-items-center w-14 h-14 shrink-0 rounded-2xl bg-white/15">
                                {/* A Material Symbols ligature name, not an emoji —
                                    rendering it as plain text printed the literal
                                    string "partly_cloudy_day". */}
                                <span className="material-symbols-outlined text-[34px] leading-none">
                                    {weather.current.icon}
                                </span>
                            </span>
                            <div className="min-w-0">
                                <p className="text-4xl font-extrabold leading-none tracking-tight">
                                    {Math.round(weather.current.temperature)}°
                                </p>
                                <p className="text-sm text-white/85 truncate mt-1">{weather.current.condition}</p>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2 text-xs">
                            <span className="flex items-center gap-3 text-white/90">
                                {today && (
                                    <>
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                                            {Math.round(today.tempMax)}°
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                            {Math.round(today.tempMin)}°
                                        </span>
                                    </>
                                )}
                                <span className="flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[14px]">humidity_percentage</span>
                                    {Math.round(weather.current.humidity)}%
                                </span>
                            </span>
                            <Link
                                href="/home/toolbox/weather-alerts"
                                className="flex items-center gap-0.5 font-bold text-white whitespace-nowrap hover:underline"
                            >
                                Show more
                                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Location chip — tapping re-detects, which also re-points the weather */}
            <div className="mt-3">
                <button
                    onClick={() => { void requestLocation(); }}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22c33d]/10 text-[#1f8c30] dark:text-[#6abf62] text-xs font-bold disabled:opacity-60"
                >
                    <span className={`material-symbols-outlined text-[15px] text-red-500 ${locationLoading ? 'animate-spin' : ''}`}>
                        {locationLoading ? 'progress_activity' : 'location_on'}
                    </span>
                    <span className="truncate max-w-[10rem]">
                        {locationLoading
                            ? 'Locating…'
                            // Falls back to whatever the weather lookup resolved, so the
                            // chip is never empty once the card has loaded.
                            : shortPlace(locationLabel) || shortPlace(weather?.location.name || '') || 'Set your location'}
                    </span>
                    <span className="material-symbols-outlined text-[15px]">
                        {locationLoading ? '' : 'my_location'}
                    </span>
                </button>

                {/* A blocked permission used to fail silently: the spinner stopped
                    and the same wrong city stayed on screen. */}
                {locationError && !locationLoading && (
                    <p className="mt-1.5 flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                        {locationError}
                    </p>
                )}
            </div>

            {/* Quick actions — a bento grid rather than six identical squares, so
                the two marketplaces read as the primary destinations and the rest
                fall into a clear second tier. */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Row 1 — the two marketplaces, tall and illustrated */}
                <Tile
                    href="/home/rent"
                    label="Rent"
                    caption="Tractors, land, labour"
                    icon="agriculture"
                    count={counts.rent}
                    className="bg-gradient-to-br from-[#e8f5e9] to-[#d6ecd8] dark:from-[#17301a] dark:to-[#122414]"
                    accent="text-[#1f8c30] dark:text-[#6abf62]"
                    tall
                />
                <Tile
                    href="/home/buy-sell"
                    label="Buy & Sell"
                    caption="Post an ad free"
                    icon="storefront"
                    count={counts.sale}
                    className="bg-gradient-to-br from-[#e3f2fd] to-[#d3e7fa] dark:from-[#152634] dark:to-[#101d29]"
                    accent="text-[#1565c0] dark:text-[#64b5f6]"
                    tall
                />

                {/* Row 2 — one wide banner, visually distinct from the squares */}
                <Tile
                    href="/home/services"
                    label="Labour & Services"
                    caption="Borewell, fencing, drone spray, workers"
                    icon="engineering"
                    count={counts.labour}
                    className="col-span-2 bg-gradient-to-r from-[#f3e5f5] to-[#ede0f7] dark:from-[#2a1a2e] dark:to-[#221528]"
                    accent="text-[#7b1fa2] dark:text-[#ce93d8]"
                    wide
                />

                {/* Row 3 — the two reference tools */}
                <Tile
                    href="/home/crops/mandi/prices"
                    label="Market Rates"
                    caption="Live mandi prices"
                    icon="trending_up"
                    className="bg-gradient-to-br from-[#e0f7fa] to-[#cdeff3] dark:from-[#122b2e] dark:to-[#0e2225]"
                    accent="text-[#00838f] dark:text-[#4dd0e1]"
                />
                <Tile
                    href="/home/toolbox"
                    label="Agri Guide"
                    caption="Crops & calculators"
                    icon="eco"
                    className="bg-gradient-to-br from-[#fff8e1] to-[#fdf0cc] dark:from-[#302819] dark:to-[#251f13]"
                    accent="text-[#ef6c00] dark:text-[#ffb74d]"
                />

                {/* Row 4 — personal, so a quieter outlined strip */}
                <Tile
                    href="/home/buy-sell?mine=1"
                    label="My Ads"
                    caption="Edit, mark sold or delete"
                    icon="list_alt"
                    count={counts.mine}
                    className="col-span-2 bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-800"
                    accent="text-gray-800 dark:text-gray-200"
                    wide
                />
            </div>
        </section>
    );
}
