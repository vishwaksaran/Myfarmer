'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import MiraituLoader from '@/components/v2/MiraituLoader';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { Z } from '@/lib/z-layers';
import {
    fetchApprovedLeaseListings,
    fetchApprovedSellListings,
    type LeaseListingRecord,
    type SellListingRecord,
} from '@/app/actions/bookings';
import { fetchMarketplaceLandListings } from '@/app/actions/listings';
import type { Listing } from '@/components/listings/listingTypes';
import { logListingContact, type ContactChannel } from '@/app/actions/listing-contact';

/**
 * The land marketplace's front door.
 *
 * This used to be a hub of three cards (Buy / Sell / Lease) that cost a tap
 * before anyone saw a single listing. The listings are the point, so they now
 * open straight away — sale, lease and rent in one feed, told apart by a badge
 * and the filter chips — and the two *posting* actions moved into the floating
 * button, which is where a marketplace app puts "add" anyway.
 *
 * The per-type pages (/buy, /lease, /rent, /sell) are untouched and still
 * linked from elsewhere; this only replaces the hub in front of them.
 */

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';

/** Store subscription for a value that is fixed for the life of the document. */
const neverChanges = () => () => { };

type Kind = 'sale' | 'lease' | 'rent';

// Full class strings, never built at runtime, so Tailwind keeps them in the build.
const KIND_META: Record<Kind, {
    chip: string;
    badge: string;
    badgeClass: string;
    ribbonClass: string;
    /** Inline colour for the portaled detail modal, which cannot use Tailwind classes. */
    accent: string;
}> = {
    sale: {
        chip: 'Sale',
        badge: 'SALE',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        ribbonClass: 'bg-emerald-600/80',
        accent: '#059669',
    },
    lease: {
        chip: 'Lease',
        badge: 'LEASE',
        badgeClass: 'bg-teal-100 text-teal-700',
        ribbonClass: 'bg-teal-600/80',
        accent: '#0d9488',
    },
    rent: {
        chip: 'Rent',
        badge: 'RENT',
        badgeClass: 'bg-amber-100 text-amber-700',
        ribbonClass: 'bg-amber-600/80',
        accent: '#d97706',
    },
};

// What the "+" opens. Browsing is the page itself, so only the two ways of
// putting land on the market live here.
const POST_ACTIONS = [
    {
        href: '/home/land/sell',
        icon: 'sell',
        label: 'Sell Land',
        caption: 'List your land for sale',
        iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
        href: '/home/land/lease?tab=list',
        icon: 'handshake',
        label: 'Lease / Rent Out',
        caption: 'Offer land for lease or rent',
        iconClass: 'bg-teal-100 text-teal-700',
    },
];

/**
 * Formats a price the owner typed into a free-text field. Anything non-numeric
 * ("60,000", "₹60000", "60000 per acre") is stripped to its digits rather than
 * being fed straight to Number(), which used to render "₹NaN". Returns null
 * when there is nothing usable, so callers can say "on request".
 */
function formatPrice(raw?: string | number | null): string | null {
    if (raw === undefined || raw === null) return null;
    const text = String(raw).trim();
    if (!text) return null;
    const n = Number(text.replace(/[^\d.]/g, ''));
    // Unparseable (e.g. "call me") — show what the owner wrote, never "NaN".
    if (!isFinite(n) || n <= 0) return text;
    return `₹${n.toLocaleString('en-IN')}`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

/** One card in the feed, whatever table row it came from. */
interface LandItem {
    id: string;
    kind: Kind;
    title: string;
    location: string;
    /** Acres, as typed. Empty when the owner left it blank. */
    area: string;
    /** Already formatted and rupee-prefixed, or null for "on request". */
    price: string | null;
    /** "/acre/yr", "/acre/mo" or "" for an outright sale. */
    priceSuffix: string;
    /** Second price line — per-acre rate on a sale, lease duration on a lease. */
    priceNote: string;
    description: string;
    photos: string[];
    seller: string;
    phone: string;
    createdAt: string;
    /** Survey no / taluk / village etc., already filtered to what was filled in. */
    address: { label: string; value: string }[];
    amenities: string[];
}

/** "Village, District, State" — blanks and repeats (village == district) dropped. */
function joinPlace(parts: (string | null | undefined)[]): string {
    return parts
        .map(p => (p ?? '').trim())
        .filter((p, i, all) => p && all.findIndex(q => q.toLowerCase() === p.toLowerCase()) === i)
        .join(', ');
}

function sellToItem(record: SellListingRecord): LandItem {
    const ed = record.extra_data ?? {};
    const perAcre = formatPrice(ed.price_per_acre);
    return {
        id: record.id,
        kind: 'sale',
        title: ed.title?.trim() || 'Farm Land for Sale',
        location: joinPlace([record.location, ed.district, ed.state]),
        area: (ed.area ?? '').trim(),
        price: formatPrice(ed.total_price),
        priceSuffix: '',
        priceNote: perAcre ? `${perAcre}/acre` : '',
        description: (ed.description ?? '').trim(),
        photos: (ed.photos ?? []).filter((p): p is string => typeof p === 'string' && p.length > 0),
        seller: record.full_name,
        phone: record.phone,
        createdAt: record.created_at,
        address: [
            { label: 'District', value: (ed.district ?? '').trim() },
            { label: 'State', value: (ed.state ?? '').trim() },
        ].filter(a => a.value),
        amenities: (ed.amenities ?? '').split(',').map(a => a.trim()).filter(Boolean).slice(0, 6),
    };
}

function leaseToItem(record: LeaseListingRecord): LandItem {
    const ed = record.extra_data ?? {};
    const isRent = ed.service_type === 'rent';
    return {
        id: record.id,
        kind: isRent ? 'rent' : 'lease',
        title: ed.title?.trim() || (isRent ? 'Land for Rent' : 'Land for Lease'),
        location: record.location,
        area: (ed.area ?? '').trim(),
        price: formatPrice(ed.lease_price),
        priceSuffix: isRent ? '/acre/mo' : '/acre/yr',
        priceNote: isRent ? 'Flexible term' : (ed.duration ? `${ed.duration} lease` : ''),
        description: (ed.description ?? '').trim(),
        photos: (ed.photos ?? []).filter((p): p is string => typeof p === 'string' && p.length > 0),
        seller: record.full_name,
        phone: record.phone,
        createdAt: record.created_at,
        address: [
            { label: 'Survey No.', value: (ed.survey_no ?? '').trim() },
            { label: 'District', value: (ed.district ?? '').trim() },
            { label: 'Taluk', value: (ed.taluk ?? '').trim() },
            { label: 'Hobli', value: (ed.hobli ?? '').trim() },
            { label: 'Village', value: (ed.village ?? '').trim() },
        ].filter(a => a.value),
        amenities: [],
    };
}

/**
 * Land posted on the Rent or Buy & Sell board.
 *
 * Those two boards already show this page's rows; this is the other half of
 * the trade, so land listed for rent from the Rent board turns up here rather
 * than only on the board it was posted from.
 *
 * The board's form asks for none of the land-specific fields — no acreage, no
 * survey number — so those stay empty and the price unit the seller chose
 * ("Per month", "Per acre") becomes the note under the price.
 */
function boardToItem(listing: Listing): LandItem {
    const note = [
        listing.priceUnit && listing.priceUnit !== 'Total' ? listing.priceUnit : '',
        listing.negotiable ? 'negotiable' : '',
    ].filter(Boolean).join(' · ');

    return {
        // Prefixed so it can never collide with a service_bookings UUID.
        id: `board:${listing.id}`,
        kind: listing.mode === 'rent' ? 'rent' : 'sale',
        title: listing.title,
        location: joinPlace([listing.location, listing.district, listing.state]),
        area: '',
        price: formatPrice(listing.price),
        priceSuffix: '',
        priceNote: note,
        description: listing.description,
        photos: listing.images,
        // fetchMarketplaceLandListings looks the name up from `profiles`;
        // older rows whose owner has no profile fall back to the generic.
        seller: listing.contactName || 'Miraitu member',
        phone: listing.contactPhone,
        createdAt: listing.createdAt,
        address: [
            { label: 'District', value: listing.district },
            { label: 'State', value: listing.state },
        ].filter(a => a.value),
        amenities: [],
    };
}

export default function LandFeed() {
    const { user } = useAuth();
    const isGuest = !user || user.isGuest;

    const [items, setItems] = useState<LandItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | Kind>('all');

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [gallery, setGallery] = useState<{ photos: string[]; index: number } | null>(null);
    const [detailItem, setDetailItem] = useState<LandItem | null>(null);
    const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);
    const [contactItem, setContactItem] = useState<LandItem | null>(null);
    const [shareToast, setShareToast] = useState('');

    // Overlays and the floating button are portaled to document.body so they
    // escape the `relative z-10` on <main>. `document` only exists after
    // hydration, and a bare `typeof document` check would disagree between the
    // server render and the first client render — useSyncExternalStore is the
    // hydration-safe way to say "false on the server, true once mounted".
    const canPortal = useSyncExternalStore(neverChanges, () => true, () => false);

    // Escape closes the post menu, same as tapping the backdrop.
    useEffect(() => {
        if (!fabOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFabOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [fabOpen]);

    useEffect(() => {
        let cancelled = false;
        // One feed, two tables' worth of rows: the land board's own
        // service_bookings, plus the land posted on the Rent and Buy & Sell
        // boards. A failure in any of them is reported rather than silently
        // showing half a marketplace.
        Promise.all([fetchApprovedSellListings(), fetchApprovedLeaseListings(), fetchMarketplaceLandListings()])
            .then(([sell, lease, board]) => {
                if (cancelled) return;
                if (sell.error || lease.error || board.error) {
                    setError(sell.error || lease.error || board.error || null);
                }
                const merged = [
                    ...sell.data.map(sellToItem),
                    ...lease.data.map(leaseToItem),
                    ...board.data.map(boardToItem),
                ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setItems(merged);
            })
            .catch(() => { if (!cancelled) setError('Failed to load listings'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const counts = useMemo(() => ({
        all: items.length,
        sale: items.filter(i => i.kind === 'sale').length,
        lease: items.filter(i => i.kind === 'lease').length,
        rent: items.filter(i => i.kind === 'rent').length,
    }), [items]);

    const filtered = useMemo(
        () => (filter === 'all' ? items : items.filter(i => i.kind === filter)),
        [items, filter]
    );

    // Keyboard nav for the lightbox
    useEffect(() => {
        if (!gallery) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setGallery(null);
            if (e.key === 'ArrowRight') setGallery(g => g && g.index < g.photos.length - 1 ? { ...g, index: g.index + 1 } : g);
            if (e.key === 'ArrowLeft') setGallery(g => g && g.index > 0 ? { ...g, index: g.index - 1 } : g);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [gallery]);

    const handleContactClick = (item: LandItem) => {
        if (isGuest) {
            setShowLoginModal(true);
            return;
        }
        setContactItem(item);
    };

    // Records the tap in Admin → Activity Log. Fire-and-forget — the tel:/wa.me
    // link opens regardless of whether this lands.
    const trackContact = (item: LandItem, channel: ContactChannel) => {
        void logListingContact({
            channel,
            listingId: item.id,
            listingType: item.kind === 'sale' ? 'sell' : item.kind,
            listingTitle: item.title,
            sellerName: item.seller,
            sellerPhone: item.phone,
            location: item.location,
        }).catch(() => { /* tracking must never block the user */ });
    };

    const shareItem = async (item: LandItem) => {
        const text = [
            `${item.title} — ${KIND_META[item.kind].chip === 'Sale' ? 'For Sale' : `For ${KIND_META[item.kind].chip}`}`,
            `📍 ${item.location}`,
            item.area ? `📐 ${item.area} Acres` : '',
            item.price ? `💰 ${item.price}${item.priceSuffix}` : '',
            item.description ? `\n${item.description.slice(0, 120)}…` : '',
            '\nFind more on Miraitu 🌾',
        ].filter(Boolean).join('\n');
        const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
        try {
            if (navigator.share) {
                await navigator.share({ title: item.title, text, url });
            } else {
                await navigator.clipboard.writeText(`${text}\n\n${url}`);
                setShareToast('Link copied to clipboard!');
                setTimeout(() => setShareToast(''), 3000);
            }
        } catch {
            // user cancelled share — do nothing
        }
    };

    return (
        <>
            <div className="px-3 md:px-6 py-5 md:py-8 pb-28 md:pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Back nav — this is now the first screen of the section, so
                        it needs its own way out. The arrow is the thumb target on
                        a phone; the crumbs carry the same link on wider screens. */}
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4">
                        <Link
                            href="/home"
                            aria-label="Back to Home"
                            className="w-8 h-8 -ml-1 grid place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all shrink-0"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="text-gray-900 dark:text-white font-semibold">Land</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 md:mb-8">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-xs border border-green-200 mb-2">
                                Farmers Land Marketplace
                            </span>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                Land for sale, lease &amp; rent
                            </h1>
                            <p className="hidden md:block text-base text-gray-500 mt-2 font-medium">
                                Verified listings from farmers and land owners across the country.
                            </p>
                        </div>
                        <NearbyLocation />
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <MiraituLoader fullScreen={false} label="Loading listings…" />
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                            <span className="material-symbols-outlined text-3xl text-red-400 mb-2 block">error</span>
                            <p className="text-sm text-red-600 font-medium">Could not load listings. Please try again later.</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && items.length === 0 && (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">grass</span>
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No listings yet</p>
                            <p className="text-sm text-gray-500 mb-5">Be the first to put your land on the marketplace.</p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                {POST_ACTIONS.map(a => (
                                    <Link
                                        key={a.href}
                                        href={a.href}
                                        className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        {a.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feed */}
                    {!loading && !error && items.length > 0 && (
                        <>
                            {/* Filter chips */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                {(['all', 'sale', 'lease', 'rent'] as const).map(key => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === key
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                                    >
                                        {key === 'all' ? 'All' : KIND_META[key].chip} ({counts[key]})
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 mb-4">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span>{' '}
                                {filtered.length === 1 ? 'listing' : 'listings'}
                            </p>

                            {filtered.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    No {filter} listings yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {filtered.map(item => {
                                        const meta = KIND_META[item.kind];
                                        const photos = item.photos.length ? item.photos : [FALLBACK_IMAGE];
                                        return (
                                            <div
                                                key={item.id}
                                                className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                            >
                                                <div
                                                    className="relative h-40 md:h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                                    onClick={() => setGallery({ photos, index: 0 })}
                                                >
                                                    <img
                                                        src={photos[0]}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">zoom_in</span>
                                                    </div>
                                                    <div className={`absolute bottom-2 left-2 px-2 py-0.5 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md ${meta.ribbonClass}`}>
                                                        {item.priceNote || `For ${meta.chip}`}
                                                    </div>
                                                    {photos.length > 1 && (
                                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs">photo_library</span>
                                                            {photos.length}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-3 md:p-5">
                                                    <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
                                                        <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors flex-1">
                                                            {item.title}
                                                        </h3>
                                                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                                                            {meta.badge}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                                                        <span className="material-symbols-outlined text-sm md:text-base">location_on</span>
                                                        {item.location}
                                                    </div>
                                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                                        {item.area && (
                                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                <span className="material-symbols-outlined text-sm">square_foot</span>
                                                                {item.area} Acres
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                            <span className="material-symbols-outlined text-sm">person</span>
                                                            {item.seller}
                                                        </div>
                                                    </div>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                                                    )}
                                                    <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="flex items-baseline justify-between mb-2">
                                                            <p className="text-base md:text-xl font-bold text-primary">
                                                                {item.price ? `${item.price}${item.priceSuffix}` : 'Price on request'}
                                                            </p>
                                                            <p className="text-[10px] md:text-xs text-gray-500 ml-2 shrink-0">{timeAgo(item.createdAt)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => shareItem(item)}
                                                                title="Share"
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-semibold hover:text-primary hover:border-primary transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">share</span>
                                                                Share
                                                            </button>
                                                            <button
                                                                onClick={() => { setDetailItem(item); setDetailPhotoIdx(0); }}
                                                                className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Floating "post a listing" button ──────────────────────────────
                Portaled to <body>: page content renders inside
                `<main class="relative z-10">`, whose stacking context was burying
                this button under the app-wide WhatsApp / Talk-to-Expert stack —
                which is why it looked missing on desktop.

                Sides are swapped per breakpoint because that stack itself swaps:
                it is bottom-LEFT on phones (so this sits right, above the bottom
                nav) and bottom-RIGHT from md up (so this sits left). Neither
                breakpoint has the two in the same corner. */}
            {canPortal && createPortal(
                <div style={{ zIndex: Z.FLOATING }} className="fixed inset-0 pointer-events-none">
                    {/* Dimmed, blurred backdrop — only while open, and only it
                        catches taps, so the page stays inert underneath. */}
                    <div
                        onClick={() => setFabOpen(false)}
                        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
                            fabOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                        }`}
                    />

                    <div className="absolute right-4 bottom-24 md:right-auto md:left-8 md:bottom-8 flex flex-col items-end md:items-start gap-3 pointer-events-auto">
                        {/* Menu. Kept mounted so it can animate both ways, and the
                            rows stagger in from the button rather than all at once. */}
                        <div
                            id="land-post-menu"
                            className={`flex flex-col items-stretch gap-2.5 w-[17.5rem] max-w-[calc(100vw-2rem)] origin-bottom-right md:origin-bottom-left transition-all duration-200 ${
                                fabOpen
                                    ? 'opacity-100 translate-y-0 scale-100'
                                    : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
                            }`}
                        >
                            <p className="text-[11px] font-bold uppercase tracking-wider text-white/90 drop-shadow px-1">
                                What would you like to do?
                            </p>
                            {POST_ACTIONS.map((action, i) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    onClick={() => setFabOpen(false)}
                                    tabIndex={fabOpen ? 0 : -1}
                                    style={{ transitionDelay: fabOpen ? `${60 + i * 60}ms` : '0ms' }}
                                    className={`group flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1a231a] shadow-2xl border border-black/5 dark:border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.25)] active:scale-[0.97] ${
                                        fabOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                                    }`}
                                >
                                    <span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${action.iconClass}`}>
                                        <span className="material-symbols-outlined text-[22px]">{action.icon}</span>
                                    </span>
                                    <span className="min-w-0 flex-1 text-left">
                                        <span className="block text-sm font-bold text-gray-900 dark:text-white leading-tight">{action.label}</span>
                                        <span className="block text-[11px] text-gray-500 leading-snug mt-0.5">{action.caption}</span>
                                    </span>
                                    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-lg shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
                                        arrow_forward
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* The button itself. Grows a soft halo while open so the
                            × reads as "this is what you tap to dismiss". */}
                        <button
                            onClick={() => setFabOpen(o => !o)}
                            aria-expanded={fabOpen}
                            aria-controls="land-post-menu"
                            aria-label={fabOpen ? 'Close listing options' : 'Post a land listing'}
                            className={`relative w-14 h-14 md:w-16 md:h-16 self-end md:self-start rounded-full bg-primary text-white grid place-items-center transition-all duration-200 active:scale-90 hover:-translate-y-0.5 ${
                                fabOpen
                                    ? 'shadow-[0_0_0_6px_rgba(34,195,61,0.25),0_12px_28px_rgba(0,0,0,0.35)]'
                                    : 'shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
                            }`}
                        >
                            {/* One pulse ring, idle only — an attractor for the
                                primary action that goes quiet once it is open. */}
                            {!fabOpen && (
                                <span aria-hidden className="absolute inset-0 rounded-full bg-primary/40 animate-ping pointer-events-none" />
                            )}
                            <span className={`material-symbols-outlined text-3xl md:text-4xl relative transition-transform duration-300 ${fabOpen ? 'rotate-[135deg]' : ''}`}>
                                add
                            </span>
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Login modal — shown when a guest taps Contact */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            {/* ── Photo gallery lightbox ── */}
            {canPortal && gallery && createPortal(
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: Z.LIGHTBOX, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}
                    onClick={() => setGallery(null)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{gallery.index + 1} / {gallery.photos.length}</span>
                        <button onClick={() => setGallery(null)} style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '24px' }}>close</span>
                        </button>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', position: 'relative', minHeight: 0 }} onClick={e => e.stopPropagation()}>
                        <img
                            key={gallery.index}
                            src={gallery.photos[gallery.index]}
                            alt={`Photo ${gallery.index + 1}`}
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', userSelect: 'none' }}
                            onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                        />
                        {gallery.index > 0 && (
                            <button
                                onClick={() => setGallery(g => g ? { ...g, index: g.index - 1 } : g)}
                                style={{ position: 'absolute', left: '8px', padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex' }}
                            >
                                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>chevron_left</span>
                            </button>
                        )}
                        {gallery.index < gallery.photos.length - 1 && (
                            <button
                                onClick={() => setGallery(g => g ? { ...g, index: g.index + 1 } : g)}
                                style={{ position: 'absolute', right: '8px', padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex' }}
                            >
                                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>chevron_right</span>
                            </button>
                        )}
                    </div>

                    {gallery.photos.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', flexShrink: 0, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            {gallery.photos.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => setGallery(g => g ? { ...g, index: i } : g)}
                                    style={{ flexShrink: 0, width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: gallery.index === i ? '2px solid white' : '2px solid transparent', opacity: gallery.index === i ? 1 : 0.5, cursor: 'pointer', padding: 0 }}
                                >
                                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>,
                document.body
            )}

            {/* ── Listing detail modal ── */}
            {canPortal && detailItem && createPortal((() => {
                const item = detailItem;
                const meta = KIND_META[item.kind];
                const photos = item.photos.length ? item.photos : [FALLBACK_IMAGE];
                const heroImg = photos[detailPhotoIdx] || photos[0];
                return (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: Z.MODAL, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                        onClick={() => setDetailItem(null)}
                    >
                        <div
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ position: 'relative', height: '240px', background: '#f3f4f6', flexShrink: 0 }}>
                                <img
                                    src={heroImg}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                                <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', background: meta.accent }}>
                                    FOR {meta.badge}
                                </div>
                                <button onClick={() => setDetailItem(null)} style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>close</span>
                                </button>
                                {photos.length > 1 && (
                                    <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', gap: '6px', justifyContent: 'center', padding: '0 12px' }}>
                                        {photos.map((src, i) => (
                                            <button key={i} onClick={() => setDetailPhotoIdx(i)} style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: detailPhotoIdx === i ? '2px solid white' : '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {detailPhotoIdx > 0 && (
                                    <button onClick={() => setDetailPhotoIdx(i => i - 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '22px' }}>chevron_left</span>
                                    </button>
                                )}
                                {detailPhotoIdx < photos.length - 1 && (
                                    <button onClick={() => setDetailPhotoIdx(i => i + 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '22px' }}>chevron_right</span>
                                    </button>
                                )}
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{item.title}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                    {item.location}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                    {[
                                        { icon: 'square_foot', label: 'Area', value: item.area ? `${item.area} Acres` : '—' },
                                        { icon: 'payments', label: item.kind === 'sale' ? 'Price' : item.kind === 'rent' ? 'Rent' : 'Lease Price', value: item.price ? `${item.price}${item.priceSuffix}` : 'On request' },
                                        { icon: item.kind === 'sale' ? 'straighten' : 'schedule', label: item.kind === 'sale' ? 'Per Acre' : 'Term', value: item.priceNote || '—' },
                                    ].map(stat => (
                                        <div key={stat.label} style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16a34a', display: 'block', marginBottom: '4px' }}>{stat.icon}</span>
                                            <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0, wordBreak: 'break-word' }}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {item.address.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Land Location Details</p>
                                        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {item.address.map(({ label, value }) => (
                                                <div key={label}>
                                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px' }}>{label}</p>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.amenities.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Amenities</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {item.amenities.map(a => (
                                                <span key={a} style={{ background: '#f0fdf4', color: '#15803d', fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '999px' }}>{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.description && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>About the Land</p>
                                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{item.description}</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f9fafb', borderRadius: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>person</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Listed by</p>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>{item.seller}</p>
                                    </div>
                                    <p style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>{timeAgo(item.createdAt)}</p>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', flexShrink: 0, display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => shareItem(item)}
                                    title="Share"
                                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#374151', flexShrink: 0 }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
                                    Share
                                </button>
                                <button
                                    onClick={() => setDetailItem(null)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', color: '#374151' }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { handleContactClick(item); if (!isGuest) setDetailItem(null); }}
                                    style={{ flex: 2, padding: '12px', borderRadius: '12px', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{isGuest ? 'lock' : 'call'}</span>
                                    {isGuest ? 'Login to Contact' : 'Contact Owner'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })(), document.body)}

            {/* ── Contact owner modal ── */}
            {canPortal && contactItem && createPortal((() => {
                const item = contactItem;
                const digits = (item.phone ?? '').replace(/\D/g, '').slice(-10);
                // First 5 digits shown, last 5 masked — the full number is still
                // used in the call and WhatsApp links.
                const masked = digits.length === 10 ? `${digits.slice(0, 5)} •••••` : 'N/A';
                const intent = item.kind === 'sale' ? 'buying' : item.kind === 'rent' ? 'renting' : 'leasing';
                return (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: Z.MODAL + 1, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                        onClick={() => setContactItem(null)}
                    >
                        <div
                            style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '384px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>{item.seller}</p>
                                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{item.title} · {item.location}</p>
                                </div>
                                <button onClick={() => setContactItem(null)} style={{ padding: '6px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '20px' }}>close</span>
                                </button>
                            </div>

                            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>phone</span>
                                <span style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '0.05em' }}>+91 {masked}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <a
                                    href={`tel:+91${digits}`}
                                    onClick={() => trackContact(item, 'call')}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#16a34a', color: 'white', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                                    Call Now
                                </a>
                                <a
                                    href={`https://wa.me/91${digits}?text=${encodeURIComponent(`Hi, I saw your land listing "${item.title}" at ${item.location} on Miraitu. I'm interested in ${intent} it.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackContact(item, 'whatsapp')}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#25D366', color: 'white', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}
                                >
                                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'white' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.563 4.14 1.539 5.875L.054 23.477a.5.5 0 0 0 .613.612l5.744-1.506A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.938a9.934 9.934 0 0 1-5.062-1.377l-.362-.215-3.757.985.995-3.65-.236-.376A9.944 9.944 0 0 1 2.062 12C2.062 6.509 6.509 2.062 12 2.062c5.491 0 9.938 4.447 9.938 9.938 0 5.491-4.447 9.938-9.938 9.938z" /></svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })(), document.body)}

            {/* ── Share toast ── */}
            {canPortal && shareToast && createPortal(
                <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: Z.TOAST, background: '#111', color: 'white', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>check_circle</span>
                    {shareToast}
                </div>,
                document.body
            )}
        </>
    );
}
