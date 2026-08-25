'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import MiraituLoader from '@/components/v2/MiraituLoader';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import { useSubmissionCopy } from '@/lib/service-availability';
import { fetchApprovedLeaseListings, type LeaseListingRecord } from '@/app/actions/bookings';
import { logListingContact, type ContactChannel } from '@/app/actions/listing-contact';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import { Z } from '@/lib/z-layers';

async function uploadLeasePhoto(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    try {
        const res = await fetch('/api/upload/lease-photo', { method: 'POST', body: fd });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('[uploadLeasePhoto] API error:', err);
            return null;
        }
        const { url } = await res.json();
        return url ?? null;
    } catch (err) {
        console.error('[uploadLeasePhoto] fetch error:', err);
        return null;
    }
}

type TabType = 'browse' | 'list';

// Full class strings (not built at runtime) so Tailwind keeps them in the build.
const SERVICE_TYPE_OPTIONS = [
    {
        key: 'lease' as const,
        icon: 'handshake',
        title: 'Long-term Lease',
        subtitle: 'Fixed term, priced per year',
        hint: 'price is per acre per year, and a lease duration is required.',
        borderOn: 'border-teal-600',
        bgOn: 'bg-teal-50 dark:bg-teal-900/20',
        textOn: 'text-teal-700 dark:text-teal-400',
        iconOn: 'bg-teal-600 text-white',
        bannerBg: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
        key: 'rent' as const,
        icon: 'home',
        title: 'Short-term Rent',
        subtitle: 'Flexible, priced per month',
        hint: 'price is per acre per month, and no duration is needed.',
        borderOn: 'border-amber-500',
        bgOn: 'bg-amber-50 dark:bg-amber-900/20',
        textOn: 'text-amber-700 dark:text-amber-400',
        iconOn: 'bg-amber-500 text-white',
        bannerBg: 'bg-amber-50 dark:bg-amber-900/20',
    },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';

/**
 * Formats a price the seller typed into a free-text field. Anything non-numeric
 * ("60,000", "₹60000", "60000 per acre") is stripped down to its digits rather
 * than being fed straight to Number(), which used to render "₹NaN".
 * Returns null when there is nothing usable, so callers can say "on request".
 */
function formatPrice(raw?: string | number | null): string | null {
    if (raw === undefined || raw === null) return null;
    const text = String(raw).trim();
    if (!text) return null;
    const n = Number(text.replace(/[^\d.]/g, ''));
    // Unparseable (e.g. "call me") — show what the seller wrote, never "NaN".
    if (!isFinite(n) || n <= 0) return text;
    return `₹${n.toLocaleString('en-IN')}`;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

export default function LeaseLandPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('browse');
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ── Gallery lightbox state ────────────────────────────────────────
    const [gallery, setGallery] = useState<{ photos: string[]; index: number } | null>(null);

    // ── Contact modal state ───────────────────────────────────────────
    const [contactListing, setContactListing] = useState<LeaseListingRecord | null>(null);

    // ── Detail modal state ────────────────────────────────────────────
    const [detailListing, setDetailListing] = useState<LeaseListingRecord | null>(null);
    const [detailPhotoIdx, setDetailPhotoIdx] = useState(0);

    // ── Share / toast state ───────────────────────────────────────────
    const [shareToast, setShareToast] = useState('');

    // Portal mount — ensures modals render at document.body, bypassing any parent stacking context
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const handleContactClick = (listing: LeaseListingRecord) => {
        if (!user || user.isGuest) {
            setShowLoginModal(true);
            return;
        }
        setContactListing(listing);
    };

    // Records the tap in Admin → Activity Log. Fire-and-forget — the tel:/wa.me
    // link opens regardless of whether this lands.
    const trackContact = (listing: LeaseListingRecord, channel: ContactChannel) => {
        void logListingContact({
            channel,
            listingId: listing.id,
            listingType: listing.extra_data?.service_type === 'rent' ? 'rent' : 'lease',
            listingTitle: listing.extra_data?.title,
            sellerName: listing.full_name,
            sellerPhone: listing.phone,
            location: listing.location,
        }).catch(() => { /* tracking must never block the user */ });
    };

    const shareListing = async (listing: LeaseListingRecord) => {
        const ed = listing.extra_data;
        const isRent = ed.service_type === 'rent';
        const title = ed.title || 'Land for Lease';
        const text = [
            `${title} — ${isRent ? 'For Rent' : 'For Lease'}`,
            `📍 ${listing.location}`,
            ed.area ? `📐 ${ed.area} Acres` : '',
            formatPrice(ed.lease_price) ? `💰 ${formatPrice(ed.lease_price)}${isRent ? '/acre/month' : '/acre/year'}` : '',
            ed.description ? `\n${ed.description.slice(0, 120)}…` : '',
            '\nFind more on Miraitu 🌾',
        ].filter(Boolean).join('\n');
        const url = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
        try {
            if (navigator.share) {
                await navigator.share({ title, text, url });
            } else {
                await navigator.clipboard.writeText(`${text}\n\n${url}`);
                setShareToast('Link copied to clipboard!');
                setTimeout(() => setShareToast(''), 3000);
            }
        } catch {
            // user cancelled share — do nothing
        }
    };

    // Keyboard nav for lightbox
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

    // ── Browse tab state ─────────────────────────────────────────────
    const [listings, setListings] = useState<LeaseListingRecord[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<'all' | 'lease' | 'rent'>('all');

    useEffect(() => {
        if (activeTab !== 'browse') return;
        setListingsLoading(true);
        setListingsError(null);
        fetchApprovedLeaseListings()
            .then(res => {
                if (res.error) setListingsError(res.error);
                else setListings(res.data);
            })
            .finally(() => setListingsLoading(false));
    }, [activeTab]);

    // ── List tab state ───────────────────────────────────────────────
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [serviceType, setServiceType] = useState<'lease' | 'rent'>('lease');
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        surveyNo: '',
        district: '',
        taluk: '',
        hobli: '',
        village: '',
        area: '',
        leasePrice: '',
        duration: '',
        description: '',
        contactName: '',
        contactPhone: '',
    });
    const { submit, submitting } = useBookingSubmit();
    const submission = useSubmissionCopy();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Land title is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.area.trim()) newErrors.area = 'Area is required';
        else if (isNaN(Number(formData.area))) newErrors.area = 'Enter a valid number';
        if (!formData.leasePrice.trim()) newErrors.leasePrice = 'Price is required';
        else if (isNaN(Number(formData.leasePrice))) newErrors.leasePrice = 'Enter digits only — no commas, ₹ or text';
        if (serviceType === 'lease' && !formData.duration) newErrors.duration = 'Duration is required';
        if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.contactPhone.replace(/[\s+-]/g, '').slice(-10))) newErrors.contactPhone = 'Enter a valid 10-digit phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 5 * 1024 * 1024;
        const newPhotos: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files) {
            if (photos.length + newPhotos.length >= 3) { alert('Maximum 3 photos allowed'); break; }
            if (file.size > maxSize) { alert(`${file.name} exceeds 5MB limit`); continue; }
            newPhotos.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setPhotos([...photos, ...newPhotos]);
        setPreviews([...previews, ...newPreviews]);
    };

    const removePhoto = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setPhotos(photos.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Require login — show modal for guests
        if (!user || user.isGuest) {
            setShowLoginModal(true);
            return;
        }

        if (!validate()) return;

        // 1. Upload photos to Supabase Storage first
        let photoUrls: string[] = [];
        if (photos.length > 0) {
            setUploadingPhotos(true);
            try {
                const uploads = await Promise.all(photos.map(uploadLeasePhoto));
                photoUrls = uploads.filter((url): url is string => url !== null);
            } finally {
                setUploadingPhotos(false);
            }
        }

        // 2. Save booking with photo URLs in extra_data
        const result = await submit({
            module: 'land',
            category: 'lease',
            full_name: formData.contactName,
            phone: formData.contactPhone,
            location: formData.location,
            extra_data: {
                service_type: serviceType,
                title: formData.title,
                area: formData.area,
                lease_price: formData.leasePrice,
                ...(serviceType === 'lease' && { duration: formData.duration }),
                description: formData.description,
                photos: photoUrls,
                ...(formData.surveyNo && { survey_no: formData.surveyNo }),
                ...(formData.district && { district: formData.district }),
                ...(formData.taluk && { taluk: formData.taluk }),
                ...(formData.hobli && { hobli: formData.hobli }),
                ...(formData.village && { village: formData.village }),
            },
        });

        if (result.success) {
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 6000);
            // Reset form
            setServiceType('lease');
            setFormData({ title: '', location: '', surveyNo: '', district: '', taluk: '', hobli: '', village: '', area: '', leasePrice: '', duration: '', description: '', contactName: '', contactPhone: '' });
            previews.forEach(url => URL.revokeObjectURL(url));
            setPhotos([]);
            setPreviews([]);
            setAgreedToTerms(false);
        } else {
            setErrors({ submit: result.error || 'Failed to submit' });
        }
    };

    const isBusy = submitting || uploadingPhotos;

    return (
        <>
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Lease</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Lease Farm Land
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            Long-term leasing opportunities for productive farming
                        </p>
                    </div>
                    <NearbyLocation />
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                    {[
                        { id: 'browse' as TabType, title: 'Find Land to Lease', icon: 'search', bgColor: 'bg-teal-500' },
                        { id: 'list' as TabType, title: 'List Your Land for Lease', icon: 'add_circle', bgColor: 'bg-emerald-500' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-2xl font-bold transition-all text-center md:text-left ${activeTab === tab.id
                                    ? `${tab.bgColor} text-white shadow-lg`
                                    : 'bg-white dark:bg-[#1a231a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/30'
                                }`}
                        >
                            <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl mx-auto md:mx-0 flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className="material-symbols-outlined text-lg md:text-xl">{tab.icon}</span>
                            </div>
                            <span className="text-xs md:text-sm">{tab.title}</span>
                        </button>
                    ))}
                </div>

                {/* ── Browse Tab ─────────────────────────────────────────────── */}
                {activeTab === 'browse' && (
                    <div className="animate-fadeIn">
                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-lg md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-teal-100 dark:border-teal-900/30">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-teal-600 text-xl md:text-2xl mt-0.5">info</span>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-teal-800 dark:text-teal-300 mb-1">How Land Leasing Works</h3>
                                    <p className="text-xs md:text-sm text-teal-700/80 dark:text-teal-400/80">
                                        Lease agricultural land for 3-10 years. You get full farming rights with a yearly rental fee. All agreements are registered and legally binding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {listingsLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <MiraituLoader fullScreen={false} label="Loading listings…" />
                            </div>
                        )}

                        {/* Error */}
                        {!listingsLoading && listingsError && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-red-400 mb-2 block">error</span>
                                <p className="text-sm text-red-600 font-medium">Could not load listings. Please try again later.</p>
                            </div>
                        )}

                        {/* Empty state */}
                        {!listingsLoading && !listingsError && listings.length === 0 && (
                            <div className="bg-white dark:bg-[#1a231a] rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">grass</span>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">No listings yet</p>
                                <p className="text-sm text-gray-500 mb-4">Be the first to list your land for lease.</p>
                                <button
                                    onClick={() => setActiveTab('list')}
                                    className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    List Your Land
                                </button>
                            </div>
                        )}

                        {/* Listings Grid */}
                        {!listingsLoading && !listingsError && listings.length > 0 && (() => {
                            const filtered = typeFilter === 'all' ? listings : listings.filter(l => (l.extra_data.service_type ?? 'lease') === typeFilter);
                            return (
                                <>
                                    {/* Type filter chips */}
                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                        {(['all', 'lease', 'rent'] as const).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setTypeFilter(t)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${typeFilter === t ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                                            >
                                                {t === 'all' ? `All (${listings.length})` : t === 'lease' ? `Lease (${listings.filter(l => (l.extra_data.service_type ?? 'lease') === 'lease').length})` : `Rent (${listings.filter(l => l.extra_data.service_type === 'rent').length})`}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 mb-4">
                                        Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> {typeFilter === 'all' ? '' : typeFilter + ' '}{filtered.length === 1 ? 'opportunity' : 'opportunities'}
                                    </p>
                                    {filtered.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400 text-sm">No {typeFilter} listings yet.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                            {filtered.map((listing) => {
                                                const ed = listing.extra_data;
                                                const isRent = ed.service_type === 'rent';
                                                const photos = ed.photos?.length ? ed.photos : [FALLBACK_IMAGE];
                                                const heroImage = photos[0];
                                                return (
                                                    <div key={listing.id} className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                        {/* Clickable image → opens gallery */}
                                                        <div
                                                            className="relative h-40 md:h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                                            onClick={() => setGallery({ photos, index: 0 })}
                                                        >
                                                            <img
                                                                src={heroImage}
                                                                alt={ed.title || 'Land listing'}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">zoom_in</span>
                                                            </div>
                                                            {/* Service type badge */}
                                                            <div className={`absolute bottom-2 left-2 px-2 py-0.5 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md ${isRent ? 'bg-amber-600/80' : 'bg-teal-600/80'}`}>
                                                                {isRent ? 'For Rent' : ed.duration ? `${ed.duration} Lease` : 'For Lease'}
                                                            </div>
                                                            {photos.length > 1 && (
                                                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-xs">photo_library</span>
                                                                    {photos.length}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="p-3 md:p-5">
                                                            <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
                                                                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors flex-1">
                                                                    {ed.title || 'Land for Lease'}
                                                                </h3>
                                                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isRent ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                                                                    {isRent ? 'RENT' : 'LEASE'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                                                                <span className="material-symbols-outlined text-sm md:text-base">location_on</span>
                                                                {listing.location}
                                                            </div>
                                                            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                                                {ed.area && (
                                                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                        <span className="material-symbols-outlined text-sm">square_foot</span>
                                                                        {ed.area} Acres
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                                    {listing.full_name}
                                                                </div>
                                                            </div>
                                                            {ed.description && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{ed.description}</p>
                                                            )}
                                                            <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                                                {/* Price row */}
                                                                <div className="flex items-baseline justify-between mb-2">
                                                                    <p className="text-base md:text-xl font-bold text-primary">
                                                                        {formatPrice(ed.lease_price)
                                                                            ? `${formatPrice(ed.lease_price)}${isRent ? '/acre/mo' : '/acre/yr'}`
                                                                            : 'Price on request'}
                                                                    </p>
                                                                    <p className="text-[10px] md:text-xs text-gray-500 ml-2 shrink-0">{timeAgo(listing.created_at)}</p>
                                                                </div>
                                                                {/* Actions row */}
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => shareListing(listing)}
                                                                        title="Share"
                                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-semibold hover:text-primary hover:border-primary transition-colors"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">share</span>
                                                                        Share
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { setDetailListing(listing); setDetailPhotoIdx(0); }}
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
                            );
                        })()}
                    </div>
                )}

                {/* ── List Your Land Tab ─────────────────────────────────────── */}
                {activeTab === 'list' && (
                    <div className="animate-fadeIn max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">List Your Land</h2>
                            <p className="text-sm md:text-base text-gray-500 text-center mb-4 md:mb-6">Connect with farmers looking for land</p>

                            {/* Service type — selectable cards. A plain segmented toggle made it
                                hard to tell which side was active, so each option is now a card
                                that visibly changes (ring, tint, check badge) plus a confirmation
                                strip below restating the choice and what it changes. */}
                            <div className="mb-6 md:mb-8">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What are you offering?</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Listing type">
                                    {SERVICE_TYPE_OPTIONS.map(opt => {
                                        const selected = serviceType === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => { setServiceType(opt.key); setErrors({}); }}
                                                className={`relative text-left rounded-2xl border-2 p-4 transition-all duration-200 ${selected
                                                    ? `${opt.borderOn} ${opt.bgOn} shadow-md`
                                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'}`}
                                            >
                                                {selected && (
                                                    <span className={`absolute top-3 right-3 material-symbols-outlined text-xl ${opt.textOn}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        check_circle
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-11 shrink-0 rounded-xl flex items-center justify-center transition-colors ${selected ? opt.iconOn : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                                        <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                                                    </div>
                                                    <div className="min-w-0 pr-6">
                                                        <p className={`font-bold text-sm ${selected ? opt.textOn : 'text-gray-700 dark:text-gray-300'}`}>{opt.title}</p>
                                                        <p className="text-[11px] text-gray-500 leading-snug">{opt.subtitle}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Live confirmation of the current choice */}
                                {(() => {
                                    const active = SERVICE_TYPE_OPTIONS.find(o => o.key === serviceType)!;
                                    return (
                                        <div key={active.key} className={`animate-fade-in mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 ${active.bannerBg}`}>
                                            <span className={`material-symbols-outlined text-base shrink-0 ${active.textOn}`}>info</span>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                                Listing as <span className={`font-bold ${active.textOn}`}>{active.title}</span> — {active.hint}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 10 Acres Paddy Land" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">District / City</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Chamarajanagar" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.location ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                    </div>
                                </div>

                                {/* Detailed address */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Detailed Address <span className="font-normal normal-case">(optional)</span></p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Survey / S.No</label>
                                            <input type="text" name="surveyNo" value={formData.surveyNo} onChange={handleChange} placeholder="e.g. 255" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Taluk</label>
                                            <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} placeholder="e.g. Chamarajanagar" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hobli</label>
                                            <input type="text" name="hobli" value={formData.hobli} onChange={handleChange} placeholder="e.g. Harave" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Village</label>
                                            <input type="text" name="village" value={formData.village} onChange={handleChange} placeholder="e.g. Harave" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">District</label>
                                            <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Chamarajanagar" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className={`grid gap-3 md:gap-4 ${serviceType === 'lease' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Area (Acres)</label>
                                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 10" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.area ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                            {serviceType === 'lease' ? 'Lease Price (₹/acre/year)' : 'Rent Price (₹/acre/month)'}
                                        </label>
                                        <input type="text" name="leasePrice" value={formData.leasePrice} onChange={handleChange} placeholder="e.g. 50000" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.leasePrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.leasePrice && <p className="text-red-500 text-xs mt-1">{errors.leasePrice}</p>}
                                    </div>
                                    {serviceType === 'lease' && (
                                        <div>
                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lease Duration</label>
                                            <select name="duration" value={formData.duration} onChange={handleChange} className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.duration ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`}>
                                                <option value="">Select Duration</option>
                                                <option>1 Year</option>
                                                <option>2 Years</option>
                                                <option>3 Years</option>
                                                <option>5 Years</option>
                                                <option>10 Years</option>
                                                <option>Can be discussed</option>
                                            </select>
                                            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your land, soil type, water sources, current crops..." className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base resize-none" />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Land Photos ({photos.length}/3)
                                        <span className="ml-2 font-normal text-gray-400">— uploaded to cloud, shown publicly after approval</span>
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={photos.length >= 3}
                                        className="hidden"
                                        id="photoInputLease"
                                    />
                                    <label
                                        htmlFor="photoInputLease"
                                        className={`block border-2 border-dashed rounded-lg md:rounded-2xl p-4 md:p-8 text-center ${photos.length >= 3
                                                ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                                : 'border-gray-300 dark:border-gray-700 hover:border-primary cursor-pointer transition-colors'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-400 mb-1 md:mb-2 block">add_a_photo</span>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">{photos.length >= 3 ? 'Max 3 photos reached' : 'Upload land photos'}</p>
                                        <p className="text-[10px] md:text-xs text-gray-400 mt-1">JPG, PNG up to 5MB each • Max 3 photos</p>
                                    </label>
                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative group rounded-lg md:rounded-xl overflow-hidden">
                                                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 md:h-40 object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-white text-3xl">delete</span>
                                                    </button>
                                                    <span className="absolute top-1 md:top-2 right-1 md:right-2 px-1.5 md:px-2 py-0.5 bg-black/70 text-white text-[10px] md:text-xs font-bold rounded-md">
                                                        {index + 1}/3
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Full Name" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.contactName ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.contactPhone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                                    </div>
                                </div>

                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Progress hint during upload */}
                                {uploadingPhotos && (
                                    <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                        Uploading photos…
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!agreedToTerms || isBusy}
                                    className={`w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2 ${(!agreedToTerms || isBusy) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isBusy ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                            {uploadingPhotos ? 'Uploading photos…' : 'Submitting…'}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg md:text-xl">publish</span>
                                            Submit {serviceType === 'lease' ? 'Lease' : 'Rent'} Listing
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSuccessModal(false)}>
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                            <div className="text-center">
                                <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-3xl md:text-4xl text-white">check</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">{submission.heading}</h2>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">{submission.message}</p>
                                <button onClick={() => { setShowSuccessModal(false); setActiveTab('browse'); }} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                    View All Listings
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
            </div>

            {/* Login modal — shown when guest tries to submit */}
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>

        {/* ── Photo Gallery Lightbox — rendered via portal to bypass any parent stacking context ── */}
        {mounted && gallery && createPortal(
            <div
                style={{ position: 'fixed', inset: 0, zIndex: Z.LIGHTBOX, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}
                onClick={() => setGallery(null)}
            >
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{gallery.index + 1} / {gallery.photos.length}</span>
                    <button onClick={() => setGallery(null)} style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '24px' }}>close</span>
                    </button>
                </div>

                {/* Main image */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', position: 'relative', minHeight: 0 }} onClick={e => e.stopPropagation()}>
                    <img
                        key={gallery.index}
                        src={gallery.photos[gallery.index]}
                        alt={`Photo ${gallery.index + 1}`}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px', userSelect: 'none' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
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

                {/* Thumbnail strip */}
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

        {/* ── Contact Owner Modal — rendered via portal ── */}
        {mounted && contactListing && createPortal(
            <div
                style={{ position: 'fixed', inset: 0, zIndex: Z.MODAL + 1, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                onClick={() => setContactListing(null)}
            >
                <div
                    style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '384px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', margin: 0 }}>{contactListing.full_name}</p>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{contactListing.extra_data.title || 'Land for Lease'} · {contactListing.location}</p>
                        </div>
                        <button onClick={() => setContactListing(null)} style={{ padding: '6px', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ color: '#6b7280', fontSize: '20px' }}>close</span>
                        </button>
                    </div>

                    {(() => {
                        const digits = (contactListing.phone ?? '').replace(/\D/g, '').slice(-10);
                        // Show first 5 digits, mask last 5 — full number used in call/WA links
                        const masked = digits.length === 10
                            ? `${digits.slice(0, 5)} •••••`
                            : 'N/A';
                        return (
                            <>
                                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '20px' }}>phone</span>
                                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#111', letterSpacing: '0.05em' }}>+91 {masked}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <a
                                        href={`tel:+91${digits}`}
                                        onClick={() => trackContact(contactListing, 'call')}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#16a34a', color: 'white', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                                        Call Now
                                    </a>
                                    <a
                                        href={`https://wa.me/91${digits}?text=${encodeURIComponent(`Hi, I saw your land listing "${contactListing.extra_data.title || 'Land for Lease'}" at ${contactListing.location} on Miraitu. I'm interested in leasing it.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackContact(contactListing, 'whatsapp')}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#25D366', color: 'white', fontWeight: 700, borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}
                                    >
                                        <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'white' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.138.563 4.14 1.539 5.875L.054 23.477a.5.5 0 0 0 .613.612l5.744-1.506A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.938a9.934 9.934 0 0 1-5.062-1.377l-.362-.215-3.757.985.995-3.65-.236-.376A9.944 9.944 0 0 1 2.062 12C2.062 6.509 6.509 2.062 12 2.062c5.491 0 9.938 4.447 9.938 9.938 0 5.491-4.447 9.938-9.938 9.938z"/></svg>
                                        WhatsApp
                                    </a>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>,
            document.body
        )}

        {/* ── Listing Detail Modal — rendered via portal ── */}
        {mounted && detailListing && createPortal((() => {
            const ed = detailListing.extra_data;
            const isRent = ed.service_type === 'rent';
            const photos = ed.photos?.length ? ed.photos : [FALLBACK_IMAGE];
            const heroImg = photos[detailPhotoIdx] || photos[0];
            const priceUnit = isRent ? '/acre/month' : '/acre/year';
            const hasAddress = ed.survey_no || ed.district || ed.taluk || ed.hobli || ed.village;
            return (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: Z.MODAL, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    onClick={() => setDetailListing(null)}
                >
                    <div
                        style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.3)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Photo section */}
                        <div style={{ position: 'relative', height: '240px', background: '#f3f4f6', flexShrink: 0 }}>
                            <img
                                src={heroImg}
                                alt={ed.title || 'Land'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            />
                            {/* overlay gradient */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                            {/* type badge */}
                            <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'white', background: isRent ? '#d97706' : '#0d9488' }}>
                                {isRent ? 'FOR RENT' : 'FOR LEASE'}
                            </div>
                            {/* close */}
                            <button onClick={() => setDetailListing(null)} style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>close</span>
                            </button>
                            {/* photo counter + thumbnails */}
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
                            {/* Title row */}
                            <div style={{ marginBottom: '4px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: 0 }}>{ed.title || 'Land Listing'}</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                {detailListing.location}
                            </div>

                            {/* Key stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                                {[
                                    { icon: 'square_foot', label: 'Area', value: ed.area ? `${ed.area} Acres` : '—' },
                                    { icon: 'payments', label: isRent ? 'Rent' : 'Lease Price', value: formatPrice(ed.lease_price) ? `${formatPrice(ed.lease_price)}${priceUnit}` : 'On request' },
                                    { icon: 'schedule', label: 'Duration', value: isRent ? 'Flexible' : (ed.duration || '—') },
                                ].map(stat => (
                                    <div key={stat.label} style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16a34a', display: 'block', marginBottom: '4px' }}>{stat.icon}</span>
                                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0, wordBreak: 'break-word' }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Address details */}
                            {hasAddress && (
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Land Location Details</p>
                                    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {[
                                            ed.survey_no && { label: 'Survey No.', value: ed.survey_no },
                                            ed.district && { label: 'District', value: ed.district },
                                            ed.taluk && { label: 'Taluk', value: ed.taluk },
                                            ed.hobli && { label: 'Hobli', value: ed.hobli },
                                            ed.village && { label: 'Village', value: ed.village },
                                        ].filter(Boolean).map((item) => {
                                            const { label, value } = item as { label: string; value: string };
                                            return (
                                                <div key={label}>
                                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 2px' }}>{label}</p>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: 0 }}>{value}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {ed.description && (
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>About the Land</p>
                                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{ed.description}</p>
                                </div>
                            )}

                            {/* Listed by */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f9fafb', borderRadius: '12px', marginBottom: '4px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>person</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Listed by</p>
                                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', margin: 0 }}>{detailListing.full_name}</p>
                                </div>
                                <p style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>{timeAgo(detailListing.created_at)}</p>
                            </div>
                        </div>

                        {/* Footer CTA */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', flexShrink: 0, display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => shareListing(detailListing)}
                                title="Share"
                                style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: '#374151', flexShrink: 0 }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
                                Share
                            </button>
                            <button
                                onClick={() => setDetailListing(null)}
                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', color: '#374151' }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { handleContactClick(detailListing); if (user && !user.isGuest) setDetailListing(null); }}
                                style={{ flex: 2, padding: '12px', borderRadius: '12px', background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{(!user || user.isGuest) ? 'lock' : 'call'}</span>
                                {(!user || user.isGuest) ? 'Login to Contact' : 'Contact Owner'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        })(), document.body)}

        {/* ── Share toast notification ── */}
        {mounted && shareToast && createPortal(
            <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: Z.TOAST, background: '#111', color: 'white', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4ade80' }}>check_circle</span>
                {shareToast}
            </div>,
            document.body
        )}
        </>
    );
}
