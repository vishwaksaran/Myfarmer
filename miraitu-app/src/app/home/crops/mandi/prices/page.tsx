'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice, spreadPercent } from '@/lib/mandi-api';

/**
 * What to tell the farmer when the price service does not answer.
 *
 * This page used to drop ten hardcoded rows — Indore wheat, Lasalgaon onion —
 * into the table whenever the fetch failed or came back empty. Filtered to
 * Gram in Andhra Pradesh you were shown Sharbati wheat from Madhya Pradesh,
 * with a LIVE badge over it. Nothing said the numbers were invented, and
 * someone deciding when to sell could act on them. A failure now says so.
 */
function describeError(code: string): { title: string; detail: string } {
    if (code === 'NO_API_KEY') {
        return {
            title: 'Live prices are not set up yet',
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
        title: 'Could not load mandi prices',
        detail: 'Something went wrong while fetching the latest rates. Try again in a moment.',
    };
}

/** Rows per page. The board used to fetch 50 and stop, hiding the rest. */
const PAGE_SIZE = 100;
/** How long typing must pause before the search is sent. */
const SEARCH_DEBOUNCE_MS = 400;
/** A single letter matches most of the table, so it is not worth a query. */
const MIN_SEARCH_CHARS = 2;

/**
 * Crop names per state, remembered for the life of the page.
 *
 * Flipping between two states used to refetch both lists each time, and
 * React StrictMode doubled that again in development.
 */
const facetCache = new Map<string, string[]>();
const facetInflight = new Map<string, Promise<string[]>>();

function loadCropOptions(state: string): Promise<string[]> {
    const key = state || 'all';
    const cached = facetCache.get(key);
    if (cached) return Promise.resolve(cached);

    const pending = facetInflight.get(key);
    if (pending) return pending;

    const params = new URLSearchParams();
    if (state && state !== 'All States') params.set('state', state);

    const request = fetch(`/api/mandi-prices/facets?${params.toString()}`)
        .then(r => r.json())
        .then(j => {
            const list: string[] = Array.isArray(j.commodities) ? j.commodities : [];
            facetCache.set(key, list);
            return list;
        });

    facetInflight.set(key, request);
    request.then(
        () => facetInflight.delete(key),
        () => facetInflight.delete(key),
    );
    return request;
}

export default function MandiPricesPage() {
    const [selectedState, setSelectedState] = useState('All States');
    const [selectedCrop, setSelectedCrop] = useState('All Crops');
    const [searchQuery, setSearchQuery] = useState('');
    // Searching now runs in the database, so it is debounced rather than
    // filtering whatever happened to be on screen.
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    /**
     * Crop names read back from the data.
     *
     * The list was hand-written, and two of its entries ("Chilli(Green)" and
     * "Gram") matched no row anywhere — the feed calls them "Green Chilli",
     * "Dry Chillies", "Bengal Gram(Gram)(Whole)". Picking one guaranteed an
     * empty result. These come from /api/mandi-prices/facets so the dropdown
     * can only offer crops that exist, and it narrows to the chosen state.
     */
    const [cropOptions, setCropOptions] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;
        loadCropOptions(selectedState)
            .then(list => { if (!cancelled) setCropOptions(list); })
            .catch(() => { /* the filter just stays on "All Crops" */ });
        return () => { cancelled = true; };
    }, [selectedState]);

    /**
     * One request per pause in typing, not one per keystroke.
     *
     * The search runs in the database now, so the timer matters: without it
     * "groundnut" would be nine queries. A single letter is also ignored —
     * it matches most of the table and tells the farmer nothing.
     */
    useEffect(() => {
        const t = setTimeout(() => {
            const term = searchQuery.trim();
            setDebouncedSearch(term.length >= MIN_SEARCH_CHARS ? term : '');
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const { data: liveData, total, loading, error, updated, refetch } = useMandiPrices({
        state: selectedState,
        commodity: selectedCrop,
        q: debouncedSearch,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    });

    // Map live API data → same shape as UI
    const livePrices = liveData.map((r, idx) => {
        const pct = spreadPercent(r.minPrice, r.maxPrice);
        return {
            id: idx + 1,
            crop: r.commodity,
            variety: r.variety || '—',
            mandi: `${r.market}, ${r.district}`,
            price: formatPrice(r.modalPrice).replace('/qtl', ''),
            unit: 'qtl',
            change: `${pct >= 0 ? '+' : ''}${pct}%`,
            trend: pct >= 0 ? 'up' : 'down',
            arrival: r.arrivalDate
                ? new Date(r.arrivalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : '—',
        };
    });

    const hasCropFilter = selectedCrop !== 'All Crops';
    const hasStateFilter = selectedState !== 'All States';
    const hasFilters = hasCropFilter || hasStateFilter;

    /** Names the exact combination that came back empty, so the row is specific. */
    const filterSummary = hasCropFilter && hasStateFilter
        ? `${selectedCrop} in ${selectedState}`
        : hasCropFilter
            ? selectedCrop
            : hasStateFilter
                ? `any crop in ${selectedState}`
                : 'any mandi';

    const clearFilters = () => {
        setSelectedState('All States');
        setSelectedCrop('All Crops');
        setSearchQuery('');
        setDebouncedSearch('');
        setPage(1);
    };

    // Server-side paging over the full result set.
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastOnPage = Math.min(page * PAGE_SIZE, total);
    const goToPage = (n: number) => {
        setPage(Math.min(Math.max(1, n), totalPages));
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Only ever a real timestamp — the old hardcoded "Today, 2:30 PM IST"
    // claimed a fetch had just succeeded even when none had.
    const lastUpdated = updated
        ? new Date(updated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : null;

    return (
        <div className="px-4 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-4 sm:py-6">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Live Mandi Prices</h1>
                        {/* LIVE only when rates are actually on screen. It used to sit
                            above the hardcoded sample rows too. */}
                        {!loading && !error && livePrices.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                LIVE
                            </span>
                        )}
                        {!loading && error && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">cloud_off</span>
                                UNAVAILABLE
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500">
                        {!loading && error
                            ? describeError(error).title + '. No rates are shown rather than stale or sample ones.'
                            : 'Real-time commodity prices from agricultural markets across India via data.gov.in.'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search crop or mandi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm sm:text-base"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <select
                            value={selectedState}
                            /* The crop list is per state, so a crop picked for the
                               old state may not be traded in the new one. Reset it
                               here rather than in an effect watching the options. */
                            onChange={(e) => { setSelectedState(e.target.value); setSelectedCrop('All Crops'); setPage(1); }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base min-w-0"
                        >
                            <option>All States</option>
                            <option>Andhra Pradesh</option>
                            <option>Arunachal Pradesh</option>
                            <option>Assam</option>
                            <option>Bihar</option>
                            <option>Chhattisgarh</option>
                            <option>Goa</option>
                            <option>Gujarat</option>
                            <option>Haryana</option>
                            <option>Himachal Pradesh</option>
                            <option>Jharkhand</option>
                            <option>Karnataka</option>
                            <option>Kerala</option>
                            <option>Madhya Pradesh</option>
                            <option>Maharashtra</option>
                            <option>Manipur</option>
                            <option>Meghalaya</option>
                            <option>Mizoram</option>
                            <option>Nagaland</option>
                            <option>Odisha</option>
                            <option>Punjab</option>
                            <option>Rajasthan</option>
                            <option>Sikkim</option>
                            <option>Tamil Nadu</option>
                            <option>Telangana</option>
                            <option>Tripura</option>
                            <option>Uttar Pradesh</option>
                            <option>Uttarakhand</option>
                            <option>West Bengal</option>
                            <option>Andaman and Nicobar Islands</option>
                            <option>Chandigarh</option>
                            <option>Dadra and Nagar Haveli and Daman and Diu</option>
                            <option>Delhi</option>
                            <option>Jammu and Kashmir</option>
                            <option>Ladakh</option>
                            <option>Lakshadweep</option>
                            <option>Puducherry</option>
                        </select>
                        {/* Options come from the data, so every one of them can
                            return rows. The old hand-written list offered
                            "Chilli(Green)" and "Gram", which match nothing. */}
                        <select
                            value={selectedCrop}
                            onChange={(e) => { setSelectedCrop(e.target.value); setPage(1); }}
                            disabled={cropOptions.length === 0}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base min-w-0 disabled:opacity-60"
                        >
                            <option>All Crops</option>
                            {cropOptions.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    {lastUpdated ? `Last updated: ${lastUpdated}` : 'Not updated yet'}
                    <button
                        onClick={refetch}
                        className="ml-2 text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Refresh
                    </button>
                    {/* The board used to fetch 50 rows and give no hint that
                        hundreds more existed. */}
                    {!loading && !error && total > 0 && (
                        <span className="ml-auto font-medium">
                            Showing {firstOnPage.toLocaleString('en-IN')}&ndash;{lastOnPage.toLocaleString('en-IN')} of{' '}
                            {total.toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                {/* Price Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 sm:mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm sm:text-base">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Crop</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide hidden sm:table-cell">Variety</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Mandi</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Price</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Change</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide hidden sm:table-cell">Arrival</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right"><div className="h-4 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right"><div className="h-4 w-10 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : error ? (
                                    /* The fetch failed. Say so and offer the retry,
                                       instead of quietly filling the table with
                                       numbers nobody reported. */
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-6 py-10 sm:py-14 text-center">
                                            <span className="material-symbols-outlined text-4xl sm:text-5xl text-amber-400 mb-3 block">cloud_off</span>
                                            <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5">
                                                {describeError(error).title}
                                            </p>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                                {describeError(error).detail}
                                            </p>
                                            <button
                                                onClick={refetch}
                                                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg">refresh</span>
                                                Try again
                                            </button>
                                        </td>
                                    </tr>
                                ) : livePrices.length === 0 && debouncedSearch ? (
                                    /* The search ran against the whole set in the
                                       database and still found nothing. */
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-6 py-10 sm:py-14 text-center">
                                            <span className="material-symbols-outlined text-4xl sm:text-5xl text-gray-300 mb-3 block">search_off</span>
                                            <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5">
                                                Nothing matches &ldquo;{debouncedSearch}&rdquo;
                                            </p>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                                No crop, mandi or district{hasFilters ? ` under the current filters` : ''} has
                                                that in its name. Check the spelling, or search for a crop like
                                                &ldquo;chilli&rdquo; or a mandi like &ldquo;Guntur&rdquo;.
                                            </p>
                                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setPage(1); }}
                                                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all"
                                                >
                                                    Clear search
                                                </button>
                                                {hasFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                    >
                                                        Clear filters too
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : livePrices.length === 0 ? (
                                    /* The service answered, but no mandi reported this
                                       crop today. That is normal, so point somewhere
                                       useful rather than just saying "no results". */
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-6 py-10 sm:py-14 text-center">
                                            <span className="material-symbols-outlined text-4xl sm:text-5xl text-gray-300 mb-3 block">storefront</span>
                                            <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg mb-1.5">
                                                No prices reported for {filterSummary}
                                            </p>
                                            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                                                Not every crop is traded in every mandi each day, and markets stay
                                                shut on holidays. Try another crop, pick a different state, or look
                                                across all of India.
                                            </p>
                                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                                {hasCropFilter && (
                                                    <button
                                                        onClick={() => setSelectedCrop('All Crops')}
                                                        className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all"
                                                    >
                                                        Show all crops{hasStateFilter ? ` in ${selectedState}` : ''}
                                                    </button>
                                                )}
                                                {hasStateFilter && (
                                                    <button
                                                        onClick={() => setSelectedState('All States')}
                                                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                    >
                                                        Search all states
                                                    </button>
                                                )}
                                                {hasFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                                    >
                                                        Clear filters
                                                    </button>
                                                )}
                                                <button
                                                    onClick={refetch}
                                                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all inline-flex items-center gap-1.5"
                                                >
                                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                                    Refresh
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    livePrices.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.crop}</span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{item.variety}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <span className="material-symbols-outlined text-gray-400 text-base sm:text-lg hidden sm:inline">store</span>
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{item.mandi}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{item.price}</span>
                                                <span className="text-gray-500 text-xs sm:text-sm">/{item.unit}</span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <span className={`inline-flex items-center gap-0.5 sm:gap-1 font-semibold text-sm sm:text-base ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                    <span className="material-symbols-outlined text-xs sm:text-sm">
                                                        {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                                                    </span>
                                                    {item.change}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-600 dark:text-gray-300 hidden sm:table-cell">{item.arrival}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pager over the whole result set, not just what was fetched. */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex-wrap">
                            <p className="text-xs sm:text-sm text-gray-500">
                                Page {page.toLocaleString('en-IN')} of {totalPages.toLocaleString('en-IN')}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
                                >
                                    Last
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-4 sm:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl mb-2 sm:mb-3">info</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">About Mandi Prices</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Prices shown are modal prices (most common transaction price) reported by respective Agricultural Produce Market Committees (APMCs) via data.gov.in.
                        </p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl sm:text-3xl mb-2 sm:mb-3">notifications</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Price Alerts</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Set price alerts for your crops and get notified when prices reach your target. Never miss the best selling opportunity.
                        </p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                        <span className="material-symbols-outlined text-teal-600 text-2xl sm:text-3xl mb-2 sm:mb-3">analytics</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Price Trends</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            View historical price trends and make informed decisions about when to sell your produce.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
