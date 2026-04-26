'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import { fetchApprovedLeaseListings, type LeaseListingRecord } from '@/app/actions/bookings';

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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';

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
    const [activeTab, setActiveTab] = useState<TabType>('browse');

    // ── Browse tab state ─────────────────────────────────────────────
    const [listings, setListings] = useState<LeaseListingRecord[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState<string | null>(null);

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
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        area: '',
        leasePrice: '',
        duration: '',
        description: '',
        contactName: '',
        contactPhone: '',
    });
    const { submit, submitting } = useBookingSubmit();

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
        if (!formData.leasePrice.trim()) newErrors.leasePrice = 'Lease price is required';
        if (!formData.duration) newErrors.duration = 'Duration is required';
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
                title: formData.title,
                area: formData.area,
                lease_price: formData.leasePrice,
                duration: formData.duration,
                description: formData.description,
                photos: photoUrls,
            },
        });

        if (result.success) {
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 6000);
            // Reset form
            setFormData({ title: '', location: '', area: '', leasePrice: '', duration: '', description: '', contactName: '', contactPhone: '' });
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
                                <span className="material-symbols-outlined text-4xl text-teal-500 animate-spin">progress_activity</span>
                                <p className="text-sm text-gray-500">Loading listings…</p>
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
                        {!listingsLoading && !listingsError && listings.length > 0 && (
                            <>
                                <p className="text-xs md:text-sm text-gray-500 mb-4">
                                    Showing <span className="font-bold text-gray-900 dark:text-white">{listings.length}</span> lease {listings.length === 1 ? 'opportunity' : 'opportunities'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {listings.map((listing) => {
                                        const ed = listing.extra_data;
                                        const heroImage = ed.photos?.[0] || FALLBACK_IMAGE;
                                        return (
                                            <div key={listing.id} className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                {/* Image */}
                                                <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                    <img
                                                        src={heroImage}
                                                        alt={ed.title || 'Land listing'}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                                                    />
                                                    {ed.duration && (
                                                        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-teal-600/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg">
                                                            {ed.duration} Lease
                                                        </div>
                                                    )}
                                                    {/* Photo count badge */}
                                                    {ed.photos && ed.photos.length > 1 && (
                                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs">photo_library</span>
                                                            {ed.photos.length}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-3 md:p-5">
                                                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {ed.title || 'Land for Lease'}
                                                    </h3>
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
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                                            {ed.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        <div>
                                                            <p className="text-base md:text-xl font-bold text-primary">
                                                                {ed.lease_price ? `₹${Number(ed.lease_price).toLocaleString('en-IN')}/acre/yr` : 'Price on request'}
                                                            </p>
                                                            <p className="text-[10px] md:text-xs text-gray-500">{timeAgo(listing.created_at)}</p>
                                                        </div>
                                                        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors">
                                                            Contact Owner
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── List Your Land Tab ─────────────────────────────────────── */}
                {activeTab === 'list' && (
                    <div className="animate-fadeIn max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">List Your Land for Lease</h2>
                            <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8">Connect with farmers looking for land to lease</p>

                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 10 Acres Paddy Land" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bellary, Karnataka" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.location ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Area (Acres)</label>
                                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 10" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.area ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lease Price (₹/acre/year)</label>
                                        <input type="text" name="leasePrice" value={formData.leasePrice} onChange={handleChange} placeholder="e.g. 50000" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.leasePrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                        {errors.leasePrice && <p className="text-red-500 text-xs mt-1">{errors.leasePrice}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lease Duration</label>
                                        <select name="duration" value={formData.duration} onChange={handleChange} className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.duration ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`}>
                                            <option value="">Select Duration</option>
                                            <option>1 Year</option>
                                            <option>2 Years</option>
                                            <option>3 Years</option>
                                            <option>5 Years</option>
                                            <option>10 Years</option>
                                        </select>
                                        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                                    </div>
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
                                            Submit Lease Listing
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
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Listing Submitted!</h2>
                                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-bold mb-1">Under Review 🌟</p>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">
                                    Your land lease listing has been submitted. Our team will review and publish it within 24 hours. Once approved, it will appear in the Browse tab for all farmers to see.
                                </p>
                                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl px-4 py-3 mb-4">
                                    <p className="text-sm font-bold text-teal-700 dark:text-teal-400">📞 Our team will contact you shortly</p>
                                </div>
                                <button onClick={() => { setShowSuccessModal(false); setActiveTab('browse'); }} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                    View All Listings
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        </div>
    );
}
