'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { getMSP, getCropEmoji, spreadPercent } from '@/lib/mandi-api';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

interface CropPrice {
    crop: string;
    icon: string;
    msp: number;
    mandi: number;
    unit: string;
    change: number;
    markets: { name: string; price: number; trend: 'up' | 'down' | 'stable' }[];
}

/**
 * What to tell the farmer when the price service does not answer.
 *
 * This page used to fall back to eight hardcoded crops whenever the fetch
 * failed, under a LIVE badge, so an outage looked like a quiet market rather
 * than an outage. Same change as the Mandi Prices board.
 */
function describeError(code: string): { title: string; detail: string } {
    if (code === 'NO_API_KEY') {
        return {
            title: 'Live rates are not set up yet',
            detail: 'This board needs a data.gov.in API key before it can show mandi rates. Nothing is wrong on your side.',
        };
    }
    if (code === 'NETWORK_ERROR') {
        return {
            title: 'Could not reach the price service',
            detail: 'Check your internet connection and try again.',
        };
    }
    if (code.startsWith('UPSTREAM_')) {
        return {
            title: 'data.gov.in is not responding',
            detail: 'The government price service is down or busy right now. This usually clears on its own, so try again in a few minutes.',
        };
    }
    return {
        title: 'Could not load market rates',
        detail: 'Something went wrong while fetching the latest rates. Try again in a moment.',
    };
}

type SortBy = 'name' | 'price' | 'change';

export default function MarketRatesPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCrop, setSelectedCrop] = useState<CropPrice | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('name');

    // Fetch broad set of records — 200 across all India
    const { data: rawData, loading, error, refetch } = useMandiPrices({ limit: 200 });

    // Transform live data → CropPrice[] grouped by commodity
    const liveCrops = useMemo<CropPrice[]>(() => {
        if (rawData.length === 0) return [];

        const grouped: Record<string, typeof rawData> = {};
        for (const r of rawData) {
            if (!grouped[r.commodity]) grouped[r.commodity] = [];
            grouped[r.commodity].push(r);
        }

        return Object.entries(grouped).map(([commodity, records]) => {
            const avgModal = Math.round(records.reduce((s, r) => s + r.modalPrice, 0) / records.length);
            const pct = spreadPercent(
                Math.min(...records.map(r => r.minPrice)),
                Math.max(...records.map(r => r.maxPrice)),
            );
            const markets = records.slice(0, 4).map(r => ({
                name: `${r.market}, ${r.district}`,
                price: r.modalPrice,
                trend: (r.modalPrice > avgModal ? 'up' : r.modalPrice < avgModal ? 'down' : 'stable') as 'up' | 'down' | 'stable',
            }));

            return {
                crop: commodity,
                icon: getCropEmoji(commodity),
                msp: getMSP(commodity),
                mandi: avgModal,
                unit: 'quintal',
                change: pct,
                markets,
            };
        });
    }, [rawData]);

    let filtered = liveCrops.filter(c =>
        c.crop.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'price') filtered = [...filtered].sort((a, b) => b.mandi - a.mandi);
    else if (sortBy === 'change') filtered = [...filtered].sort((a, b) => b.change - a.change);
    else filtered = [...filtered].sort((a, b) => a.crop.localeCompare(b.crop));

    const trendIcon = (t: 'up' | 'down' | 'stable') =>
        t === 'up' ? 'trending_up' : t === 'down' ? 'trending_down' : 'trending_flat';
    const trendColor = (t: 'up' | 'down' | 'stable') =>
        t === 'up' ? 'text-green-600' : t === 'down' ? 'text-red-500' : 'text-gray-400';

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
                        <span className="text-primary font-bold">{tp('Market Rates')}</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <span className="material-symbols-outlined text-2xl">trending_up</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">{tp('Market Rates')}</h1>
                            {!loading && !error && liveCrops.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    {tp('LIVE')}
                                </span>
                            )}
                            {!loading && error && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">cloud_off</span>
                                    {tp('UNAVAILABLE')}
                                </span>
                            )}
                        </div>
                        <p className="text-sm md:text-base text-gray-500">
                            {!loading && error
                                ? tp(describeError(error).title) + '. ' + tp('No rates are shown rather than stale or sample ones.')
                                : tp('Live mandi prices, MSP comparisons, and market trends for major crops.')}
                        </p>
                    </div>

                    {/* Search & Sort */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder={tp('Search crop name...')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full skeuo-inset rounded-xl pl-10 pr-4 py-3 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['name', 'price', 'change'] as SortBy[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${sortBy === s
                                        ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
                                        }`}
                                >
                                    {s === 'name' ? tp('A-Z') : s === 'price' ? tp('Price ↓') : tp('Change ↓')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Crop Price Cards */}
                        <div className="lg:col-span-2">
                          {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeuo-card rounded-2xl p-5 animate-pulse">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                                                <div><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" /><div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" /></div>
                                            </div>
                                            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                                        </div>
                                        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                ))}
                            </div>
                          ) : error ? (
                            /* The fetch failed. Say so, rather than filling the grid
                               with rates no mandi reported. */
                            <div className="skeuo-card rounded-2xl p-10 text-center">
                                <span className="material-symbols-outlined text-5xl text-amber-400 mb-3 block">cloud_off</span>
                                <p className="font-bold text-gray-900 dark:text-white text-lg mb-1.5">
                                    {tp(describeError(error).title)}
                                </p>
                                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                    {tp(describeError(error).detail)}
                                </p>
                                <button
                                    onClick={refetch}
                                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    {tp('Try again')}
                                </button>
                            </div>
                          ) : liveCrops.length === 0 ? (
                            /* The service answered with nothing — a holiday or a quiet
                               trading day. Normal, and worth saying plainly. */
                            <div className="skeuo-card rounded-2xl p-10 text-center">
                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">storefront</span>
                                <p className="font-bold text-gray-900 dark:text-white text-lg mb-1.5">
                                    {tp('No mandi rates reported today')}
                                </p>
                                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                    {tp('Markets stay shut on holidays and some days go unreported. Check back later, or open the full Mandi Prices board to search a specific crop or state.')}
                                </p>
                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        onClick={refetch}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        {tp('Refresh')}
                                    </button>
                                    <Link
                                        href="/home/crops/mandi/prices"
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                    >
                                        {tp('Open Mandi Prices')}
                                    </Link>
                                </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map(crop => (
                                    <button
                                        key={crop.crop}
                                        onClick={() => setSelectedCrop(crop)}
                                        className={`skeuo-card rounded-2xl p-5 text-left transition-all hover:-translate-y-1 ${selectedCrop?.crop === crop.crop ? 'ring-2 ring-primary/40' : ''}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{crop.icon}</span>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{tp(crop.crop)}</h4>
                                                    <span className="text-xs text-gray-400">{tp('per {unit}').replace('{unit}', tp(crop.unit))}</span>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-1 ${crop.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="material-symbols-outlined text-sm">{crop.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                                <span className="text-sm font-bold">{crop.change >= 0 ? '+' : ''}{crop.change}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">{tp('Mandi Price')}</p>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">₹{crop.mandi.toLocaleString('en-IN')}</p>
                                            </div>
                                            {crop.msp > 0 && (
                                                <div className="ml-auto text-right">
                                                    <p className="text-xs text-gray-400 font-bold">MSP</p>
                                                    <p className="text-lg font-bold text-primary">₹{crop.msp.toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                        </div>
                                        {crop.msp > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold ${crop.mandi >= crop.msp ? 'text-green-600' : 'text-red-500'}`}>
                                                        {crop.mandi >= crop.msp
                                                            ? tp('▲ ₹{amt} above MSP').replace('{amt}', (crop.mandi - crop.msp).toLocaleString('en-IN'))
                                                            : tp('▼ ₹{amt} below MSP').replace('{amt}', (crop.msp - crop.mandi).toLocaleString('en-IN'))}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="skeuo-card rounded-2xl p-10 text-center col-span-full">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">search_off</span>
                                        <p className="font-bold text-gray-500">{tp('No crops found matching "{q}"').replace('{q}', searchTerm)}</p>
                                    </div>
                                )}
                            </div>
                          )}
                        </div>

                        {/* Detail Panel */}
                        <div className="lg:col-span-1">
                            {selectedCrop ? (
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 sticky top-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-4xl">{selectedCrop.icon}</span>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{tp(selectedCrop.crop)}</h3>
                                            <p className="text-xs text-gray-400">{tp('Market-wise rates per {unit}').replace('{unit}', tp(selectedCrop.unit))}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {selectedCrop.markets.map(m => (
                                            <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{m.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-900 dark:text-white">₹{m.price.toLocaleString('en-IN')}</span>
                                                    <span className={`material-symbols-outlined text-lg ${trendColor(m.trend)}`}>{trendIcon(m.trend)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedCrop.msp > 0 && (
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{tp('MSP (Government)')}</p>
                                            <p className="text-2xl font-black text-primary">₹{selectedCrop.msp.toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-1">{tp('Minimum Support Price for 2025-26 season')}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50">
                                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-sm mt-0.5">tips_and_updates</span>
                                            <span>{tp('Prices are indicative and updated daily from AGMARKNET. Actual prices may vary at your local mandi.')}</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="skeuo-card rounded-2xl p-8 text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-3">touch_app</span>
                                    <p className="font-bold text-gray-400 text-sm">{tp('Tap on a crop to view market-wise rates')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 skeuo-card rounded-2xl p-5 border-l-4 border-amber-400">
                        <p className="text-xs text-gray-500 flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                            <span>{tp('Prices are sourced from AGMARKNET via data.gov.in (Government Open Data) and various state APMC portals. MSP figures are for Kharif/Rabi 2025-26. Always verify with your local mandi before selling. Miraitu is not responsible for pricing inaccuracies.')}</span>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
