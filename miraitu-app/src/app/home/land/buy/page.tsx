'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { fetchApprovedSellListings, type SellListingRecord } from '@/app/actions/bookings';
import { logListingContact, type ContactChannel } from '@/app/actions/listing-contact';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';

// Maps the land_category ids saved by the Sell form to the filter chip labels.
const LAND_CATEGORY_LABELS: Record<string, string> = {
    agriculture: 'Agriculture',
    farmhouse: 'Farm House',
    orchard: 'Orchard',
    plantation: 'Plantation',
    irrigated: 'Irrigated',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

/** ₹45,00,000 — full Indian-grouped rupee amount. */
function formatRupees(value?: string): string {
    const n = Number(String(value ?? '').replace(/[^\d.]/g, ''));
    if (!n || isNaN(n)) return 'Price on request';
    return `₹${n.toLocaleString('en-IN')}`;
}

/** ₹8L / ₹1.2Cr — compact amount for the stats row. */
function formatCompact(n: number): string {
    if (!n || isNaN(n)) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

interface ListingView {
    id: string;
    title: string;
    location: string;
    district: string;
    state: string;
    /** Village / locality as typed on the Sell form, before district and state are appended. */
    village: string;
    area: string;
    areaValue: number;
    price: string;
    priceValue: number;
    pricePerAcre: string;
    pricePerAcreValue: number;
    type: string;
    image: string;
    /** Every photo the seller uploaded. */
    photos: string[];
    verified: boolean;
    featured: boolean;
    amenities: string[];
    seller: string;
    phone: string;
    description: string;
    postedDate: string;
    createdAt: number;
}

/** Photos to show in the lightbox — the seller's uploads, else the cover image. */
function galleryOf(listing: ListingView): string[] {
    return listing.photos.length > 0 ? listing.photos : [listing.image];
}

function toView(record: SellListingRecord): ListingView {
    const ed = record.extra_data ?? {};
    const areaValue = Number(String(ed.area ?? '').replace(/[^\d.]/g, ''));
    const priceValue = Number(String(ed.total_price ?? '').replace(/[^\d.]/g, ''));
    const perAcreValue = Number(String(ed.price_per_acre ?? '').replace(/[^\d.]/g, ''));

    // Photos the seller uploaded at submit time, in the order they picked them.
    const photos = (ed.photos ?? []).filter((p): p is string => typeof p === 'string' && p.length > 0);

    // "Village, District, State" — skip blanks and repeats (e.g. village == district).
    const locationParts: string[] = [];
    for (const part of [record.location, ed.district, ed.state]) {
        const clean = (part ?? '').trim();
        if (clean && !locationParts.some(p => p.toLowerCase() === clean.toLowerCase())) {
            locationParts.push(clean);
        }
    }

    return {
        id: record.id,
        title: ed.title?.trim() || 'Farm Land for Sale',
        location: locationParts.join(', '),
        district: (ed.district ?? '').trim(),
        state: (ed.state ?? '').trim(),
        village: (record.location ?? '').trim(),
        area: areaValue ? `${areaValue} Acre${areaValue === 1 ? '' : 's'}` : '—',
        areaValue: areaValue || 0,
        price: formatRupees(ed.total_price),
        priceValue: priceValue || 0,
        pricePerAcre: perAcreValue ? `${formatRupees(ed.price_per_acre)}/acre` : '',
        pricePerAcreValue: perAcreValue || 0,
        type: LAND_CATEGORY_LABELS[ed.land_category ?? ''] ?? 'Agriculture',
        image: photos[0] || FALLBACK_IMAGE,
        photos,
        // Admin set the status to "confirmed" (a reviewed listing) rather than
        // just flipping the Publish toggle.
        verified: record.status === 'confirmed',
        featured: ed.featured === true,
        amenities: (ed.amenities ?? '')
            .split(',')
            .map(a => a.trim())
            .filter(Boolean)
            .slice(0, 4),
        seller: record.full_name,
        phone: record.phone,
        description: (ed.description ?? '').trim(),
        postedDate: timeAgo(record.created_at),
        createdAt: new Date(record.created_at).getTime(),
    };
}

export default function BuyLandPage() {
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [listings, setListings] = useState<ListingView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [contactListing, setContactListing] = useState<ListingView | null>(null);
    const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);
    const [gallery, setGallery] = useState<{ photos: string[]; index: number } | null>(null);
    const [shareToast, setShareToast] = useState('');

    // Keyboard nav for the photo lightbox
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

    useEffect(() => {
        let cancelled = false;
        fetchApprovedSellListings()
            .then(res => {
                if (cancelled) return;
                if (res.error) setError(res.error);
                else setListings(res.data.map(toView));
            })
            .catch(() => { if (!cancelled) setError('Failed to load listings'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    // Only admin-approved listings (newest first — the query already orders by
    // created_at desc).
    const allListings = listings;

    // Chips are derived from what is actually listed, so no filter is ever a dead end.
    const landTypes = useMemo(
        () => ['All', ...Array.from(new Set(allListings.map(l => l.type))).sort()],
        [allListings]
    );

    const filteredListings = useMemo(() => {
        const rows = selectedType === 'All'
            ? [...allListings]
            : allListings.filter(l => l.type === selectedType);

        switch (sortBy) {
            case 'price-low': rows.sort((a, b) => a.priceValue - b.priceValue); break;
            case 'price-high': rows.sort((a, b) => b.priceValue - a.priceValue); break;
            case 'area': rows.sort((a, b) => b.areaValue - a.areaValue); break;
            // 'newest' keeps the newest-published order from the query.
            default: break;
        }
        return rows;
    }, [allListings, selectedType, sortBy]);

    // Stats are computed from what the grid actually shows, so the two can never contradict.
    const stats = useMemo(() => {
        const sellers = new Set(allListings.map(l => `${l.seller}|${l.phone}`)).size;
        const districts = new Set(allListings.map(l => l.district).filter(Boolean)).size;
        const perAcre = allListings.map(l => l.pricePerAcreValue).filter(v => v > 0);
        const avg = perAcre.length ? perAcre.reduce((s, v) => s + v, 0) / perAcre.length : 0;
        return [
            { label: 'Total Listings', value: String(allListings.length), icon: 'list_alt', color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
            { label: 'Verified Sellers', value: String(sellers), icon: 'verified_user', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Districts Covered', value: String(districts), icon: 'location_on', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
            { label: 'Avg Price/Acre', value: formatCompact(avg), icon: 'currency_rupee', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
        ];
    }, [allListings]);

    const handleContactClick = (listing: ListingView) => {
        if (!user || user.isGuest) {
            setShowLoginModal(true);
            return;
        }
        setDetailPhotoIdx(0);
        setContactListing(listing);
    };

    const shareListing = async (listing: ListingView) => {
        const text = [
            `${listing.title} — For Sale`,
            `📍 ${listing.location}`,
            listing.areaValue ? `📐 ${listing.area}` : '',
            listing.priceValue ? `💰 ${listing.price}${listing.pricePerAcre ? ` (${listing.pricePerAcre})` : ''}` : '',
            listing.description ? `\n${listing.description.slice(0, 120)}…` : '',
            '\nFind more on Miraitu 🌾',
        ].filter(Boolean).join('\n');
        const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
        try {
            if (navigator.share) {
                await navigator.share({ title: listing.title, text, url });
            } else {
                await navigator.clipboard.writeText(`${text}\n\n${url}`);
                setShareToast('Link copied to clipboard!');
                setTimeout(() => setShareToast(''), 3000);
            }
        } catch {
            // user cancelled share — do nothing
        }
    };

    // Fire-and-forget — the tel:/wa.me link opens regardless of whether this lands.
    const trackContact = (listing: ListingView, channel: ContactChannel) => {
        void logListingContact({
            channel,
            listingId: listing.id,
            listingType: 'sell',
            listingTitle: listing.title,
            sellerName: listing.seller,
            sellerPhone: listing.phone,
            location: listing.location,
        }).catch(() => { /* tracking must never block the user */ });
    };

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Buy</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Buy Farm Land
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            Browse verified agricultural land for sale across the country
                        </p>
                    </div>
                    <NearbyLocation />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-gray-800 text-center">
                            <div className={`w-8 md:w-10 h-8 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-lg md:rounded-xl ${stat.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-base md:text-lg">{stat.icon}</span>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] md:text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-2">
                        {landTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                                    selectedType === type
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="area">Area: Largest First</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs md:text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{filteredListings.length}</span> listings
                    </p>
                    {loading && (
                        <span className="flex items-center gap-1 text-[11px] md:text-xs text-gray-400">
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                            Loading latest…
                        </span>
                    )}
                </div>

                {/* Error — the grid below falls back to the empty state */}
                {!loading && error && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                        <span className="material-symbols-outlined text-lg text-red-500">error</span>
                        <p className="text-xs md:text-sm text-red-700 dark:text-red-400">
                            Could not load the latest listings — {error}
                        </p>
                    </div>
                )}

                {/* Listings Grid */}
                {filteredListings.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                {/* Image — tap to open the seller's full photo gallery */}
                                <div className="relative h-40 md:h-48 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setGallery({ photos: galleryOf(listing), index: 0 })}
                                        className="block w-full h-full cursor-zoom-in"
                                        aria-label={`View photos of ${listing.title}`}
                                    >
                                        <img
                                            src={listing.image}
                                            alt={listing.title}
                                            onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </button>
                                    {listing.photos.length > 1 && (
                                        <span className="absolute bottom-2 md:bottom-3 right-2 md:right-3 px-2 py-0.5 md:py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg flex items-center gap-1 pointer-events-none">
                                            <span className="material-symbols-outlined text-xs">photo_library</span>
                                            {listing.photos.length}
                                        </span>
                                    )}
                                    {listing.featured && (
                                        <span className="absolute top-2 md:top-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-amber-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md">
                                            Featured
                                        </span>
                                    )}
                                    {listing.verified && (
                                        <span className="absolute top-2 md:top-3 right-2 md:right-3 px-2 py-0.5 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">verified</span>
                                            Verified
                                        </span>
                                    )}
                                    <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg">
                                        {listing.type}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-3 md:p-5">
                                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {listing.title}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                                        <span className="material-symbols-outlined text-sm md:text-base">location_on</span>
                                        {listing.location}
                                    </div>

                                    {/* Details Row */}
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">square_foot</span>
                                            {listing.area}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            {listing.seller}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 ml-auto">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {listing.postedDate}
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    {listing.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                                            {listing.amenities.map((amenity, i) => (
                                                <span key={i} className="px-1.5 md:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs rounded-md font-medium">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-base md:text-xl font-bold text-primary">{listing.price}</p>
                                            {listing.pricePerAcre && (
                                                <p className="text-[10px] md:text-xs text-gray-500">{listing.pricePerAcre}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleContactClick(listing)}
                                            className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors"
                                        >
                                            Contact Seller
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state — no approved listings yet, or the filter excludes them all */}
                {!loading && filteredListings.length === 0 && (
                    <div className="bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-12 md:py-16 text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-green-600">landscape</span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                            {selectedType === 'All' ? 'No land listings yet' : `No ${selectedType} land right now`}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 max-w-sm mx-auto mb-5">
                            {selectedType === 'All'
                                ? 'New listings appear here once a seller posts and our team approves them.'
                                : 'Try a different land type, or check back soon for new listings.'}
                        </p>
                        {selectedType === 'All' ? (
                            <Link href="/home/land/sell" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors">
                                <span className="material-symbols-outlined text-base">post_add</span>
                                List Your Land
                            </Link>
                        ) : (
                            <button
                                onClick={() => setSelectedType('All')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-8 md:mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl md:rounded-2xl p-6 md:p-10 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Can&apos;t Find What You&apos;re Looking For?</h2>
                    <p className="text-sm md:text-base text-white/80 mb-4 md:mb-6">Post your requirements and let verified sellers reach out to you</p>
                    <Link href="/home/land/sell" className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white text-green-700 font-bold text-sm md:text-base rounded-lg md:rounded-xl hover:bg-green-50 transition-colors">
                        <span className="material-symbols-outlined text-base md:text-lg">post_add</span>
                        Post Requirement
                    </Link>
                </div>
            </div>

            {/* Listing detail modal — same layout as the Lease detail modal.
                Only reachable by signed-in users. Portaled to document.body so no
                parent stacking context (sticky header, transformed card) clips it;
                safe without a mount guard because it only opens on a click. */}
            {contactListing && createPortal((() => {
                const listing = contactListing;
                const photos = listing.photos.length ? listing.photos : [listing.image];
                const heroImg = photos[detailPhotoIdx] || photos[0];
                const address = [
                    listing.village && { label: 'Village / Locality', value: listing.village },
                    listing.district && { label: 'District', value: listing.district },
                    listing.state && { label: 'State', value: listing.state },
                    listing.type && { label: 'Land Type', value: listing.type },
                ].filter(Boolean) as { label: string; value: string }[];

                return (
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 99997, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                        onClick={() => setContactListing(null)}
                    >
                        <div
                            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Photo section */}
                            <div style={{ position: 'relative', height: '240px', background: '#f3f4f6', flexShrink: 0 }}>
                                <img
                                    src={heroImg}
                                    alt={listing.title}
                                    onClick={() => setGallery({ photos, index: detailPhotoIdx })}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)', pointerEvents: 'none' }} />
                                {/* type badge */}
                                <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', background: '#16a34a' }}>
                                    FOR SALE
                                </div>
                                {/* close */}
                                <button onClick={() => setContactListing(null)} style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>close</span>
                                </button>
                                {/* thumbnails */}
                                {photos.length > 1 && (
                                    <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', gap: '6px', justifyContent: 'center', padding: '0 12px' }}>
                                        {photos.map((src, i) => (
                                            <button key={i} onClick={() => setDetailPhotoIdx(i)} style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: detailPhotoIdx === i ? '2px solid white' : '2px solid rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* nav arrows */}
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

                            {/* Scrollable body */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{listing.title}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                    {listing.location}
                                </div>

                                {/* Key stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                    {[
                                        { icon: 'square_foot', label: 'Area', value: listing.area },
                                        { icon: 'payments', label: 'Price', value: listing.price },
                                        { icon: 'currency_rupee', label: 'Per Acre', value: listing.pricePerAcre || '—' },
                                    ].map(stat => (
                                        <div key={stat.label} style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16a34a', display: 'block', marginBottom: '4px' }}>{stat.icon}</span>
                                            <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0, wordBreak: 'break-word' }}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Address details */}
                                {address.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Land Location Details</p>
                                        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            {address.map(item => (
                                                <div key={item.label}>
                                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px' }}>{item.label}</p>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Amenities */}
                                {listing.amenities.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Amenities</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {listing.amenities.map(a => (
                                                <span key={a} style={{ padding: '5px 10px', borderRadius: '8px', background: '#f3f4f6', color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {listing.description && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>About the Land</p>
                                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{listing.description}</p>
                                    </div>
                                )}

                                {/* Listed by */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f9fafb', borderRadius: '12px', marginBottom: '4px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>person</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Listed by</p>
                                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>{listing.seller}</p>
                                    </div>
                                    <p style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>{listing.postedDate}</p>
                                </div>
                            </div>

                            {/* Footer CTA */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', flexShrink: 0, display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => shareListing(listing)}
                                    title="Share"
                                    style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#374151', flexShrink: 0 }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
                                    Share
                                </button>
                                <a
                                    href={`tel:+91${listing.phone}`}
                                    onClick={() => trackContact(listing, 'call')}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                                    Call
                                </a>
                                <a
                                    href={`https://wa.me/91${listing.phone}?text=${encodeURIComponent(`Hi, I saw your land listing "${listing.title}" at ${listing.location} on Miraitu. I'm interested in buying it.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackContact(listing, 'whatsapp')}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#22c55e', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })(), document.body)}

            {/* Share toast */}
            {shareToast && createPortal(
                <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 999999, background: '#111', color: 'white', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>check_circle</span>
                    {shareToast}
                </div>,
                document.body
            )}

            {/* Photo lightbox — every image the seller uploaded. Portaled at a
                higher z-index than the detail modal so zooming from it works. */}
            {gallery && createPortal(
                <div style={{ zIndex: 99999 }} className="fixed inset-0 flex items-center justify-center bg-black/90 p-4" onClick={() => setGallery(null)}>
                    <button
                        onClick={() => setGallery(null)}
                        className="absolute top-4 right-4 flex items-center justify-center size-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        aria-label="Close photos"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>

                    <img
                        src={gallery.photos[gallery.index]}
                        alt={`Photo ${gallery.index + 1} of ${gallery.photos.length}`}
                        onClick={e => e.stopPropagation()}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                        className="max-h-[80vh] max-w-full rounded-xl object-contain"
                    />

                    {gallery.photos.length > 1 && (
                        <>
                            {gallery.index > 0 && (
                                <button
                                    onClick={e => { e.stopPropagation(); setGallery(g => g && { ...g, index: g.index - 1 }); }}
                                    className="absolute left-3 md:left-6 flex items-center justify-center size-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    aria-label="Previous photo"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                            )}
                            {gallery.index < gallery.photos.length - 1 && (
                                <button
                                    onClick={e => { e.stopPropagation(); setGallery(g => g && { ...g, index: g.index + 1 }); }}
                                    className="absolute right-3 md:right-6 flex items-center justify-center size-11 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    aria-label="Next photo"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            )}
                            <span className="absolute bottom-6 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                                {gallery.index + 1} / {gallery.photos.length}
                            </span>
                        </>
                    )}
                </div>,
                document.body
            )}

            {/* Login modal — shown when a guest taps Contact Seller */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}
