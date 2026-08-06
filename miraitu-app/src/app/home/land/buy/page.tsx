'use client';

import { useEffect, useMemo, useState } from 'react';
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
    area: string;
    areaValue: number;
    price: string;
    priceValue: number;
    pricePerAcre: string;
    pricePerAcreValue: number;
    type: string;
    image: string;
    /** Every photo the seller uploaded. Empty for the showcase listings. */
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

// Showcase listings that always lead the grid. Admin-approved listings from
// `service_bookings` are appended after these. Delete this array to show only
// real listings.
const HELPLINE = '9380306475';
const DEMO_LISTINGS: ListingView[] = [
    {
        id: 'demo-1',
        title: '5 Acres Irrigated Farm Land',
        location: 'Mandya, Karnataka', district: 'Mandya',
        area: '5 Acres', areaValue: 5,
        price: '₹45,00,000', priceValue: 4500000,
        pricePerAcre: '₹9,00,000/acre', pricePerAcreValue: 900000,
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        photos: [],
        verified: true, featured: true,
        amenities: ['Borewell', 'Fencing', 'Road Access'],
        seller: 'Ramesh Kumar', phone: HELPLINE,
        description: '', postedDate: '2 days ago', createdAt: 0,
    },
    {
        id: 'demo-2',
        title: '10 Acres Dry Land with Mango Trees',
        location: 'Ramanagara, Karnataka', district: 'Ramanagara',
        area: '10 Acres', areaValue: 10,
        price: '₹70,00,000', priceValue: 7000000,
        pricePerAcre: '₹7,00,000/acre', pricePerAcreValue: 700000,
        type: 'Orchard',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        photos: [],
        verified: true, featured: true,
        amenities: ['Mango Trees', 'Electricity', 'Compound Wall'],
        seller: 'Suresh Gowda', phone: HELPLINE,
        description: '', postedDate: '5 days ago', createdAt: 0,
    },
    {
        id: 'demo-3',
        title: '3 Acres Farm House Land',
        location: 'Mysore, Karnataka', district: 'Mysore',
        area: '3 Acres', areaValue: 3,
        price: '₹1,20,00,000', priceValue: 12000000,
        pricePerAcre: '₹40,00,000/acre', pricePerAcreValue: 4000000,
        type: 'Farm House',
        image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&h=300&fit=crop',
        photos: [],
        verified: false, featured: false,
        amenities: ['Farm House', 'Swimming Pool', 'Garden'],
        seller: 'Prakash Reddy', phone: HELPLINE,
        description: '', postedDate: '1 week ago', createdAt: 0,
    },
    {
        id: 'demo-4',
        title: '8 Acres Coconut Plantation',
        location: 'Hassan, Karnataka', district: 'Hassan',
        area: '8 Acres', areaValue: 8,
        price: '₹56,00,000', priceValue: 5600000,
        pricePerAcre: '₹7,00,000/acre', pricePerAcreValue: 700000,
        type: 'Plantation',
        image: 'https://images.unsplash.com/photo-1591543620767-582b2e76369e?w=400&h=300&fit=crop',
        photos: [],
        verified: true, featured: false,
        amenities: ['200+ Coconut Trees', 'Borewell', 'Canal Water'],
        seller: 'Mahesh B', phone: HELPLINE,
        description: '', postedDate: '3 days ago', createdAt: 0,
    },
    {
        id: 'demo-5',
        title: '15 Acres Agriculture Land',
        location: 'Tumkur, Karnataka', district: 'Tumkur',
        area: '15 Acres', areaValue: 15,
        price: '₹90,00,000', priceValue: 9000000,
        pricePerAcre: '₹6,00,000/acre', pricePerAcreValue: 600000,
        type: 'Agriculture',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        photos: [],
        verified: true, featured: false,
        amenities: ['Open Well', 'Road Access', 'Electricity'],
        seller: 'Venkatesh N', phone: HELPLINE,
        description: '', postedDate: '1 day ago', createdAt: 0,
    },
    {
        id: 'demo-6',
        title: '2 Acres Irrigated Land Near Highway',
        location: 'Davangere, Karnataka', district: 'Davangere',
        area: '2 Acres', areaValue: 2,
        price: '₹24,00,000', priceValue: 2400000,
        pricePerAcre: '₹12,00,000/acre', pricePerAcreValue: 1200000,
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
        photos: [],
        verified: true, featured: false,
        amenities: ['Highway Access', 'Drip Irrigation', 'Power Supply'],
        seller: 'Deepak M', phone: HELPLINE,
        description: '', postedDate: '4 days ago', createdAt: 0,
    },
];

export default function BuyLandPage() {
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [listings, setListings] = useState<ListingView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [contactListing, setContactListing] = useState<ListingView | null>(null);
    const [gallery, setGallery] = useState<{ photos: string[]; index: number } | null>(null);

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

    // Showcase listings first, then the admin-approved ones (newest first —
    // the query already orders by created_at desc).
    const allListings = useMemo(() => [...DEMO_LISTINGS, ...listings], [listings]);

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
            // 'newest' keeps the showcase-first, then newest-published order.
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
        setContactListing(listing);
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

                {/* Error — non-blocking: the showcase listings below still render */}
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

            {/* Contact Seller modal — only reachable by signed-in users */}
            {contactListing && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setContactListing(null)}>
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-6 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">{contactListing.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{contactListing.location}</p>
                            </div>
                            <button onClick={() => setContactListing(null)} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {contactListing.photos.length > 0 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                                {contactListing.photos.map((photo, i) => (
                                    <img
                                        key={photo}
                                        src={photo}
                                        alt={`${contactListing.title} photo ${i + 1}`}
                                        onClick={() => setGallery({ photos: contactListing.photos, index: i })}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        className="h-16 w-20 shrink-0 rounded-lg object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
                                    />
                                ))}
                            </div>
                        )}

                        {contactListing.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-4">{contactListing.description}</p>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Seller</p>
                            <p className="font-bold text-gray-900 dark:text-white">{contactListing.seller}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">+91 {contactListing.phone}</p>
                        </div>

                        <div className="flex gap-2">
                            <a
                                href={`tel:+91${contactListing.phone}`}
                                onClick={() => trackContact(contactListing, 'call')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">call</span>
                                Call
                            </a>
                            <a
                                href={`https://wa.me/91${contactListing.phone}?text=${encodeURIComponent(`Hi, I saw your land listing "${contactListing.title}" at ${contactListing.location} on Miraitu. I'm interested in buying it.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => trackContact(contactListing, 'whatsapp')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white font-bold text-sm rounded-xl hover:bg-green-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">chat</span>
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo lightbox — every image the seller uploaded */}
            {gallery && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4" onClick={() => setGallery(null)}>
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
                </div>
            )}

            {/* Login modal — shown when a guest taps Contact Seller */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
}
