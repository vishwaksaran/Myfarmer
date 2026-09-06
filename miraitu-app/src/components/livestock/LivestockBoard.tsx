'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchLivestockListings, type LivestockAd, type LivestockType } from '@/app/actions/livestock';
import { useAppLocation } from '@/context/LocationContext';
import { nearFrom } from '@/lib/geo-distance';
import EnableLocationBanner from '@/components/location/EnableLocationBanner';
import LivestockAdGrid from './LivestockAdGrid';
import { BOARDS } from './boards';

/**
 * The five livestock pages — cattle, goats & sheep, poultry, fish, others.
 *
 * All five were hardcoded arrays of stock photos with invented sellers and
 * phone numbers, so an ad a farmer posted could never appear on them and the
 * numbers on screen rang nobody. They now read the real ads (see
 * `fetchLivestockListings`); only the copy, the filter and which details a
 * card shows differ, which is what `BOARDS` in ./boards holds.
 *
 * The cards themselves, the detail sheet and the contact gate are
 * LivestockAdGrid's — /home/livestock renders the same grid over all five
 * types at once, so it lives outside this component.
 *
 * Posting still belongs to the one working form on /home/livestock — the Sell
 * tab here hands the seller to it rather than keeping a second, dead copy.
 */

/**
 * Price bands, applied to the real figure on the ad.
 *
 * An ad with no price sits outside every band rather than being lumped into
 * the cheapest one — "Price on request" is not "Under ₹50K".
 */
const PRICE_BANDS: { id: string; label: string; match: (price: number | null) => boolean }[] = [
    { id: 'all', label: 'Price Range', match: () => true },
    { id: 'low', label: 'Under ₹50K', match: p => p !== null && p < 50_000 },
    { id: 'mid', label: '₹50K – ₹1L', match: p => p !== null && p >= 50_000 && p <= 100_000 },
    { id: 'high', label: 'Above ₹1L', match: p => p !== null && p > 100_000 },
];

/** "Rajkot, Gujarat" collapsed to the one word a filter can group on. */
function placeOf(ad: LivestockAd): string {
    return (ad.district || ad.state || ad.location.split(',')[0] || '').trim();
}

export default function LivestockBoard({ type }: { type: LivestockType }) {
    const cfg = BOARDS[type];
    const { location } = useAppLocation();

    const [ads, setAds] = useState<LivestockAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [variety, setVariety] = useState('all');
    const [band, setBand] = useState('all');
    const [place, setPlace] = useState('all');

    const sellHref = `/home/livestock?tab=sell&category=${cfg.sellCategory}`;

    /**
     * Refetched when the viewer's position changes, because distance is worked
     * out on the server against each ad's coordinates. `nearKey` is the stable
     * identity of an object rebuilt every render.
     */
    const near = nearFrom(location);
    const nearKey = near ? `${near.lat},${near.lng}` : '';

    useEffect(() => {
        let cancelled = false;
        fetchLivestockListings(type, near)
            .then(res => {
                if (cancelled) return;
                setAds(res.data);
                setError(res.error ?? null);
            })
            .catch(() => { if (!cancelled) setError('Failed to load listings'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // `near` is rebuilt each render; nearKey is its stable identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, nearKey]);

    /**
     * Both dropdowns are built from the ads on the page rather than a fixed
     * list. A hardcoded roll of breeds offered filters that matched nothing —
     * this way every option has at least one animal behind it.
     */
    const varieties = useMemo(() => {
        const seen = new Set(ads.map(a => a.specs[cfg.filterKey]).filter((v): v is string => !!v));
        return [...seen].sort((a, b) => a.localeCompare(b));
    }, [ads, cfg.filterKey]);

    const places = useMemo(() => {
        const seen = new Set(ads.map(placeOf).filter(Boolean));
        return [...seen].sort((a, b) => a.localeCompare(b));
    }, [ads]);

    const filtered = useMemo(() => {
        const bandMatch = PRICE_BANDS.find(b => b.id === band)?.match ?? (() => true);
        return ads.filter(ad =>
            (variety === 'all' || ad.specs[cfg.filterKey] === variety) &&
            (place === 'all' || placeOf(ad) === place) &&
            bandMatch(ad.price)
        );
    }, [ads, variety, band, place, cfg.filterKey]);

    const selectClass =
        'px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium';

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cfg.title}</h1>
                        <Link href="/home/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{cfg.subtitle}</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {([
                        { id: 'buy' as const, title: cfg.buyTab, icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
                        { id: 'sell' as const, title: cfg.sellTab, icon: 'sell', bgColor: 'bg-orange-500' },
                    ]).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'}`}>
                            {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.title}</p>
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            {/* Only worth asking for a location when there is
                                something on screen to measure against. */}
                            {ads.length > 0 && <EnableLocationBanner />}

                            {/* Filters — hidden until there is something to filter. */}
                            {ads.length > 0 && (
                                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                    {varieties.length > 0 && (
                                        <select value={variety} onChange={e => setVariety(e.target.value)} className={selectClass}>
                                            <option value="all">{cfg.filterAll}</option>
                                            {varieties.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    )}
                                    <select value={band} onChange={e => setBand(e.target.value)} className={selectClass}>
                                        {PRICE_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                                    </select>
                                    {places.length > 0 && (
                                        <select value={place} onChange={e => setPlace(e.target.value)} className={selectClass}>
                                            <option value="all">Location</option>
                                            {places.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 text-sm text-red-600 dark:text-red-300">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="h-80 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 animate-pulse" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">pets</span>
                                    <p className="text-gray-500 font-medium px-6">
                                        {ads.length === 0
                                            ? `No ${cfg.noun} here yet — be the first to post one.`
                                            : 'Nothing matches those filters.'}
                                    </p>
                                    {ads.length === 0 ? (
                                        <Link
                                            href={sellHref}
                                            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            Post a Listing
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => { setVariety('all'); setBand('all'); setPlace('all'); }}
                                            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold"
                                        >
                                            <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> {cfg.noun}
                                        </p>
                                    </div>
                                    <LivestockAdGrid ads={filtered} />
                                </>
                            )}
                        </div>
                    )}

                    {/* Sell tab — one door to one form. The copy of this form that
                        used to live here had no submit handler at all. */}
                    {activeTab === 'sell' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 grid place-items-center text-3xl" aria-hidden>{cfg.emoji}</div>
                                <h2 className="text-2xl font-bold text-primary mb-2">{cfg.sellTab}</h2>
                                <p className="text-gray-500 mb-6">{cfg.sellCaption}</p>
                                <Link
                                    href={sellHref}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    Open the listing form
                                </Link>
                                <p className="text-xs text-gray-400 mt-4">
                                    Your ad appears here and on Buy &amp; Sell under Animals.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
            </div>
        </div>
    );
}
