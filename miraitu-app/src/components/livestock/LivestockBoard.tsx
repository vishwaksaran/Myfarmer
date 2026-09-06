'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { fetchLivestockListings, type LivestockAd, type LivestockType } from '@/app/actions/livestock';
import { logListingContact, type ContactChannel } from '@/app/actions/listing-contact';
import { formatRupees } from '@/components/listings/listingFormat';
import { Z } from '@/lib/z-layers';

/**
 * The five livestock pages — cattle, goats & sheep, poultry, fish, others.
 *
 * All five were hardcoded arrays of stock photos with invented sellers and
 * phone numbers, so an ad a farmer posted could never appear on them and the
 * numbers on screen rang nobody. They now read the real ads (see
 * `fetchLivestockListings`); only the copy, the filter and which details a
 * card shows differ, which is what BOARDS below holds.
 *
 * Posting still belongs to the one working form on /home/livestock — the Sell
 * tab here hands the seller to it rather than keeping a second, dead copy.
 */

interface BoardConfig {
    title: string;
    subtitle: string;
    /** Stands in for a photo the seller did not upload. */
    emoji: string;
    buyTab: string;
    sellTab: string;
    /** What the first dropdown filters on — a key in the ad's `specs`. */
    filterKey: string;
    /** Its "no filter" label: breeds, varieties or species, as the page reads. */
    filterAll: string;
    /** What "Showing 6 …" counts. */
    noun: string;
    /** The details under a card's title, most telling first. */
    chips: (specs: Record<string, string>) => (string | undefined)[];
    /** The sell form's own category id — /home/livestock?tab=sell&category=… */
    sellCategory: string;
    /** One line under the Sell tab's heading. */
    sellCaption: string;
}

/** "50 birds", and nothing at all when the seller left the count blank. */
const count = (n: string | undefined, word: string) => (n ? `${n} ${word}` : undefined);

/**
 * `milkYield` → "Milk Yield". The spec keys come from the sell form's
 * CATEGORY_FIELDS, which lives in a page module and so cannot be imported
 * here; every key there is camelCase, which is all this needs to know.
 */
const specLabel = (key: string) =>
    key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

const BOARDS: Record<LivestockType, BoardConfig> = {
    cattle: {
        title: 'Cattle Marketplace',
        subtitle: 'Buy or sell cows, bulls & buffaloes',
        emoji: '🐄',
        buyTab: 'Buy Cattle',
        sellTab: 'Sell Cattle',
        filterKey: 'breed',
        filterAll: 'All Breeds',
        noun: 'cattle',
        chips: s => [s.breed, s.age, s.gender, s.milkYield ? `${s.milkYield} L/day` : undefined],
        sellCategory: 'cattle',
        sellCaption: 'List a cow, bull or buffalo for sale',
    },
    goats: {
        title: 'Goats & Sheep',
        subtitle: 'For meat, milk and wool production',
        emoji: '🐐',
        buyTab: 'Buy Goats & Sheep',
        sellTab: 'Sell',
        filterKey: 'breed',
        filterAll: 'All Breeds',
        noun: 'listings',
        chips: s => [s.breed, s.age, s.gender, count(s.quantity, 'heads')],
        sellCategory: 'goats',
        sellCaption: 'List goats or sheep for sale',
    },
    poultry: {
        title: 'Poultry Marketplace',
        subtitle: 'Chickens, ducks, turkeys & more',
        emoji: '🐔',
        buyTab: 'Buy Poultry',
        sellTab: 'Sell Poultry',
        filterKey: 'breed',
        filterAll: 'All Varieties',
        noun: 'listings',
        chips: s => [
            s.breed,
            s.birdType,
            count(s.quantity, 'birds'),
            s.eggsPerDay ? `${s.eggsPerDay} eggs/day` : undefined,
        ],
        sellCategory: 'poultry',
        sellCaption: 'List birds, chicks or eggs for sale',
    },
    fish: {
        title: 'Fish & Aquaculture',
        subtitle: 'Fish farming and aquaculture',
        emoji: '🐟',
        buyTab: 'Buy Fish',
        sellTab: 'Sell Fish',
        filterKey: 'species',
        filterAll: 'All Species',
        noun: 'listings',
        chips: s => [s.species, s.stage, count(s.quantity, 'pcs'), s.avgWeight ? `${s.avgWeight} g avg` : undefined],
        sellCategory: 'fish',
        sellCaption: 'List seed, fingerlings or table fish for sale',
    },
    others: {
        title: 'Other Livestock',
        subtitle: 'Rabbits, pigeons, bees, quails & more',
        emoji: '🐾',
        buyTab: 'Buy',
        sellTab: 'Sell',
        filterKey: 'animalType',
        filterAll: 'All Types',
        noun: 'listings',
        chips: s => [s.animalType, s.breed, s.age, count(s.quantity, 'nos')],
        sellCategory: 'others',
        sellCaption: 'List rabbits, pigeons, bees and anything else',
    },
};

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

function priceLine(ad: LivestockAd): string {
    if (ad.price === null) return 'Price on request';
    const unit = ad.priceUnit && ad.priceUnit !== 'Total' ? ` ${ad.priceUnit}` : '';
    return `${formatRupees(ad.price)}${unit}`;
}

export default function LivestockBoard({ type }: { type: LivestockType }) {
    const cfg = BOARDS[type];
    const { user } = useAuth();

    const [ads, setAds] = useState<LivestockAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [variety, setVariety] = useState('all');
    const [band, setBand] = useState('all');
    const [place, setPlace] = useState('all');
    /** The ad whose full detail sheet is open — a card tap, not a contact tap. */
    const [detailAd, setDetailAd] = useState<LivestockAd | null>(null);
    const [detailImage, setDetailImage] = useState(0);
    const [contactAd, setContactAd] = useState<LivestockAd | null>(null);
    const [pendingContact, setPendingContact] = useState<LivestockAd | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const sellHref = `/home/livestock?tab=sell&category=${cfg.sellCategory}`;

    useEffect(() => {
        let cancelled = false;
        fetchLivestockListings(type)
            .then(res => {
                if (cancelled) return;
                setAds(res.data);
                setError(res.error ?? null);
            })
            .catch(() => { if (!cancelled) setError('Failed to load listings'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [type]);

    /**
     * Signing in from the contact prompt continues where the buyer left off:
     * the ad they tapped opens the moment `user` arrives. Derived rather than
     * copied across in an effect, which would fire a second render for a
     * value already known during the first.
     */
    const openContact = contactAd ?? (user ? pendingContact : null);
    /** Both, or a dismissed modal would reopen on the next render. */
    const closeContact = () => { setContactAd(null); setPendingContact(null); };

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

    const openDetail = (ad: LivestockAd) => { setDetailAd(ad); setDetailImage(0); };

    const handleContactClick = (ad: LivestockAd) => {
        // The contact modal is the one overlay above the detail sheet; closing
        // the sheet first keeps a single dialog on screen rather than stacking
        // two, and dismissing contact returns the buyer to the grid.
        setDetailAd(null);
        if (user) {
            setContactAd(ad);
            return;
        }
        setPendingContact(ad);
        setShowLoginModal(true);
    };

    // Records the tap in Admin → Activity Log. Fire-and-forget — the tel:/wa.me
    // link opens whether or not this lands.
    const trackContact = (ad: LivestockAd, channel: ContactChannel) => {
        void logListingContact({
            channel,
            listingId: ad.id,
            listingType: 'livestock',
            listingTitle: ad.title,
            sellerPhone: ad.phone,
            location: ad.location,
        }).catch(() => { /* tracking must never block the buyer */ });
    };

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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filtered.map(ad => {
                                            const chips = cfg.chips(ad.specs).filter(Boolean).slice(0, 4) as string[];
                                            return (
                                                // The whole card opens the ad; only the button inside
                                                // was clickable before, so the photo, title and
                                                // truncated description led nowhere.
                                                <div key={ad.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={`View ${ad.title}`}
                                                    onClick={() => openDetail(ad)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(ad); }
                                                    }}
                                                    className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
                                                        {ad.images[0] ? (
                                                            <img src={ad.images[0]} alt={ad.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : (
                                                            <div className="w-full h-full grid place-items-center text-6xl" aria-hidden>{cfg.emoji}</div>
                                                        )}
                                                        {ad.subcategory && (
                                                            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-900/80 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                                {ad.subcategory}
                                                            </div>
                                                        )}
                                                        {ad.images.length > 1 && (
                                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-semibold flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-sm">photo_library</span>{ad.images.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <h3 className="font-bold text-gray-900 dark:text-white">{ad.title}</h3>
                                                        {chips.length > 0 && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                                                {chips.map((chip, i) => (
                                                                    <span key={chip} className="flex items-center gap-2">
                                                                        {i > 0 && <span aria-hidden>•</span>}
                                                                        {i === 0
                                                                            ? <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{chip}</span>
                                                                            : <span>{chip}</span>}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {ad.description && (
                                                            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{ad.description}</p>
                                                        )}
                                                        <div className="flex justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                            <p className="text-lg font-bold text-primary">{priceLine(ad)}</p>
                                                            {ad.location && (
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 min-w-0">
                                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                                    <span className="truncate">{ad.location.split(',')[0]}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleContactClick(ad); }}
                                                            disabled={!ad.phone}
                                                            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">call</span>
                                                            {ad.phone ? 'Contact Seller' : 'No number given'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
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

                {/* Detail sheet — the full ad behind a card: every photo, every
                    spec the seller filled in, and the description unclipped. */}
                {detailAd && (
                    <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: Z.MODAL }}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailAd(null)} />

                        <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1a231a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                            {/* Photos */}
                            <div className="relative bg-gray-100 dark:bg-gray-800 shrink-0">
                                {detailAd.images.length > 0 ? (
                                    <div className="relative aspect-[4/3]">
                                        <img src={detailAd.images[detailImage]} alt={detailAd.title} className="w-full h-full object-cover" />
                                        {detailAd.images.length > 1 && (
                                            <>
                                                <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                                                    {detailImage > 0 ? (
                                                        <button onClick={() => setDetailImage(i => i - 1)} aria-label="Previous photo"
                                                            className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                                        </button>
                                                    ) : <div />}
                                                    {detailImage < detailAd.images.length - 1 ? (
                                                        <button onClick={() => setDetailImage(i => i + 1)} aria-label="Next photo"
                                                            className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                        </button>
                                                    ) : <div />}
                                                </div>
                                                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/45 text-white text-xs font-medium">
                                                    {detailImage + 1}/{detailAd.images.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-[4/3] grid place-items-center text-6xl" aria-hidden>{cfg.emoji}</div>
                                )}
                                <button onClick={() => setDetailAd(null)} aria-label="Close"
                                    className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            {/* Details */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {detailAd.subcategory && (
                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-semibold">
                                        {detailAd.subcategory}
                                    </span>
                                )}
                                <h2 className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white break-words">{detailAd.title}</h2>
                                <p className="mt-1 text-lg font-extrabold text-primary">{priceLine(detailAd)}</p>

                                {detailAd.location && (
                                    <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="material-symbols-outlined text-base text-red-500">location_on</span>
                                        {[detailAd.location, detailAd.district, detailAd.state].filter(Boolean).join(', ')}
                                    </p>
                                )}

                                {Object.keys(detailAd.specs).length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Details</h3>
                                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            {Object.entries(detailAd.specs).map(([key, value]) => (
                                                <div key={key}>
                                                    <dt className="text-xs text-gray-500">{specLabel(key)}</dt>
                                                    <dd className="font-semibold text-gray-900 dark:text-white break-words">{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                )}

                                {detailAd.description && (
                                    <div className="mt-4">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line break-words leading-relaxed">
                                            {detailAd.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Same gate as the card's button — the number is never
                                shown until the buyer is signed in. */}
                            <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                                <button
                                    onClick={() => handleContactClick(detailAd)}
                                    disabled={!detailAd.phone}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">call</span>
                                    {detailAd.phone ? 'Contact Seller' : 'No number given'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact modal — signed-in buyers only */}
                {openContact && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => closeContact()}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <button onClick={() => closeContact()} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">call</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Seller</h3>
                                <p className="text-gray-500 mb-4">{openContact.title}</p>
                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`tel:${openContact.phone}`}
                                        onClick={() => trackContact(openContact, 'call')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined">call</span>
                                        Call {openContact.phone}
                                    </a>
                                    <a
                                        href={`https://wa.me/${openContact.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackContact(openContact, 'whatsapp')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        Chat on WhatsApp
                                    </a>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Choose how you want to contact the seller</p>
                            </div>
                        </div>
                    </div>
                )}

                <LoginModal isOpen={showLoginModal && !user} onClose={() => setShowLoginModal(false)} />

                <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
            </div>
        </div>
    );
}
