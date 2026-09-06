'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

// Uploads to the shared `listing-images` bucket and returns the public URL.
// Same endpoint the Lease form uses — it is not lease-specific.
async function uploadLandPhoto(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    try {
        const res = await fetch('/api/upload/lease-photo', { method: 'POST', body: fd });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error('[uploadLandPhoto] API error:', err);
            return null;
        }
        const { url } = await res.json();
        return url ?? null;
    } catch (err) {
        console.error('[uploadLandPhoto] fetch error:', err);
        return null;
    }
}

const landCategories = [
    { id: 'agriculture', name: 'Agriculture Land', icon: '🌾' },
    { id: 'farmhouse', name: 'Farm House', icon: '🏡' },
    { id: 'orchard', name: 'Orchard', icon: '🍊' },
    { id: 'plantation', name: 'Plantation', icon: '🌴' },
    { id: 'irrigated', name: 'Irrigated Land', icon: '💧' },
];

interface SellFormData {
    title: string;
    location: string;
    district: string;
    state: string;
    area: string;
    pricePerAcre: string;
    totalPrice: string;
    description: string;
    amenities: string;
    contactName: string;
    contactPhone: string;
}

const BLANK_SELL_FORM: SellFormData = {
    title: '', location: '', district: '', state: '', area: '', pricePerAcre: '',
    totalPrice: '', description: '', amenities: '', contactName: '', contactPhone: '',
};

/**
 * Where an abandoned "Sell Your Farm Land" draft is parked in sessionStorage.
 *
 * This form used to have no login gate at all — a guest could submit it
 * outright. Adding one, the same way the Lease form's already works, means
 * this page needs the same safety net: the React state itself survives the
 * login modal (it's an overlay, not a navigation) but a genuine reload does
 * not, so text fields are persisted as they're typed and restored on the
 * next visit. Photos are not — a File object cannot survive sessionStorage.
 */
const SELL_DRAFT_KEY = 'miraitu.landSell.draft';

interface SellDraft {
    selectedCategory: string;
    formData: SellFormData;
    agreedToTerms: boolean;
}

export default function SellLandPage() {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [formData, setFormData] = useState<SellFormData>(BLANK_SELL_FORM);
    /** True once a saved draft has been read back onto the form, for the banner below. */
    const [draftRestored, setDraftRestored] = useState(false);
    const { submit, submitting } = useBookingSubmit();
    const submission = useSubmissionCopy('request');

    /**
     * Set the instant Submit is blocked for login, consumed the instant login
     * succeeds. A ref rather than state: it must not persist across an actual
     * remount, or a login made later for something unrelated would silently
     * post a draft the seller typed and may no longer want — see the effect
     * below and SELL_DRAFT_KEY's comment for the sessionStorage half of this.
     */
    const pendingLoginSubmit = useRef(false);
    /** Skips the persistence effect's first run — see its own comment. */
    const isFirstPersist = useRef(true);

    // Read back a draft left from a previous visit — a genuine navigation
    // away (not just the login modal) is the one case the ref above can't
    // cover, since a fresh mount starts with pendingLoginSubmit false. Runs
    // once; deliberately does not auto-submit even if already logged in, so
    // returning to this page days later never posts old data without a click.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(SELL_DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw) as Partial<SellDraft>;
            const hasContent = !!draft.formData && Object.values(draft.formData).some(v => typeof v === 'string' && v.trim());
            if (!hasContent) {
                sessionStorage.removeItem(SELL_DRAFT_KEY);
                return;
            }
            setSelectedCategory(draft.selectedCategory || '');
            setFormData(prev => ({ ...prev, ...draft.formData }));
            setAgreedToTerms(!!draft.agreedToTerms);
            setDraftRestored(true);
        } catch {
            sessionStorage.removeItem(SELL_DRAFT_KEY);
        }
        // Deliberately once, on mount.
    }, []);

    // Keeps the draft current as the seller types. Skips its first run so it
    // never fires with the blank initial state ahead of the restore effect
    // above and overwrite a draft that effect hasn't read yet.
    useEffect(() => {
        if (isFirstPersist.current) { isFirstPersist.current = false; return; }
        const hasContent = Object.values(formData).some(v => v.trim());
        try {
            if (hasContent) {
                sessionStorage.setItem(SELL_DRAFT_KEY, JSON.stringify({ selectedCategory, formData, agreedToTerms }));
            } else {
                sessionStorage.removeItem(SELL_DRAFT_KEY);
            }
        } catch {
            /* Private-mode or full storage — the in-memory ref-based resume still works. */
        }
    }, [formData, selectedCategory, agreedToTerms]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Land title is required';
        if (!formData.area.trim()) newErrors.area = 'Total area is required';
        else if (isNaN(Number(formData.area))) newErrors.area = 'Enter a valid number';
        if (!formData.location.trim()) newErrors.location = 'Village/Town is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pricePerAcre.trim()) newErrors.pricePerAcre = 'Price per acre is required';
        else if (isNaN(Number(formData.pricePerAcre))) newErrors.pricePerAcre = 'Enter a valid number';
        if (!formData.totalPrice.trim()) newErrors.totalPrice = 'Total price is required';
        else if (isNaN(Number(formData.totalPrice))) newErrors.totalPrice = 'Enter a valid number';
        if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.contactPhone.replace(/[\s+-]/g, '').slice(-10))) newErrors.contactPhone = 'Enter a valid 10-digit phone number';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxSize = 5 * 1024 * 1024; // 5MB
        const newPhotos: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files) {
            if (photos.length + newPhotos.length >= 3) {
                alert('Maximum 3 photos allowed');
                break;
            }
            if (file.size > maxSize) {
                alert(`${file.name} exceeds 5MB limit`);
                continue;
            }
            newPhotos.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setPhotos([...photos, ...newPhotos]);
        setPreviews([...previews, ...newPreviews]);
    };

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        URL.revokeObjectURL(previews[index]);
        setPhotos(newPhotos);
        setPreviews(newPreviews);
    };

    /**
     * The actual submission — upload, save, reset. Split out from
     * `handleSubmit` so the effect below can run exactly this once login
     * completes, without re-running the auth check it just passed.
     */
    const performSubmit = async () => {
        // 1. Upload photos to Supabase Storage first — the Buy page shows the
        // first one as the listing image.
        let photoUrls: string[] = [];
        if (photos.length > 0) {
            setUploadingPhotos(true);
            try {
                const uploads = await Promise.all(photos.map(uploadLandPhoto));
                photoUrls = uploads.filter((url): url is string => url !== null);
            } finally {
                setUploadingPhotos(false);
            }
        }

        // 2. Save the booking with the photo URLs in extra_data.
        const result = await submit({
            module: 'land',
            category: 'sell',
            full_name: formData.contactName,
            phone: formData.contactPhone,
            location: formData.location,
            extra_data: {
                title: formData.title,
                district: formData.district,
                state: formData.state,
                area: formData.area,
                price_per_acre: formData.pricePerAcre,
                total_price: formData.totalPrice,
                description: formData.description,
                amenities: formData.amenities,
                land_category: selectedCategory,
                photos: photoUrls,
            },
        });
        if (result.success) {
            setShowSuccessModal(true);
            setTimeout(() => setShowSuccessModal(false), 6000);
            // Reset form
            setSelectedCategory('');
            setFormData(BLANK_SELL_FORM);
            previews.forEach(url => URL.revokeObjectURL(url));
            setPhotos([]);
            setPreviews([]);
            setAgreedToTerms(false);
            setDraftRestored(false);
            try { sessionStorage.removeItem(SELL_DRAFT_KEY); } catch { /* nothing left to clean up */ }
        } else {
            setErrors({ submit: result.error || 'Failed to submit' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // A guest can fill in every field here — nothing stopped them before
        // this gate existed — and only meets the login wall at this point.
        // Remembering the attempt is what turns "closed the login modal,
        // form's still sitting there, now what?" into "logged in, and it's
        // already posted" — the same fix already applied to the Lease form.
        if (!user || user.isGuest) {
            pendingLoginSubmit.current = true;
            setShowLoginModal(true);
            return;
        }

        if (!validate()) return;
        await performSubmit();
    };

    /**
     * Finishes the submission the instant login succeeds, so the seller never
     * has to notice the form was fine all along and press Submit a second
     * time. Fires only for a submit blocked in *this* mounted instance
     * (`pendingLoginSubmit` is a ref, reset to false on every fresh mount) —
     * logging in later for something unrelated must never quietly post a
     * draft the seller has since abandoned.
     */
    useEffect(() => {
        if (!pendingLoginSubmit.current) return;
        if (!user || user.isGuest) return;
        pendingLoginSubmit.current = false;
        // Re-validate rather than assume: something could have gone stale
        // (e.g. the phone field) while the login modal was up.
        if (!validate()) return;
        void performSubmit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Sell</span>
                </div>

                {/* Header */}
                <div className="text-center mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Sell Your Farm Land
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        List your property and reach thousands of verified buyers with zero brokerage
                    </p>
                </div>

                {/* Benefits Row */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
                    {[
                        { icon: 'money_off', title: 'Zero Commission', desc: 'No brokerage fees' },
                        { icon: 'visibility', title: '10K+ Buyers', desc: 'Active audience' },
                        { icon: 'verified_user', title: 'Verified Process', desc: 'Secure listing' },
                    ].map((benefit, i) => (
                        <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg md:rounded-2xl p-3 md:p-5 text-center border border-green-100 dark:border-green-900/30">
                            <span className="material-symbols-outlined text-xl md:text-3xl text-green-600 mb-1 md:mb-2 block">{benefit.icon}</span>
                            <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white mb-0.5">{benefit.title}</h3>
                            <p className="text-[10px] md:text-xs text-gray-500">{benefit.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                        {/* Only shown when the fields below came back from a
                            previous, unfinished visit — see SELL_DRAFT_KEY. */}
                        {draftRestored && (
                            <div className="mb-4 md:mb-6 flex items-start gap-2.5 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3.5 py-3">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 shrink-0">restore</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                        Picked up where you left off
                                    </p>
                                    <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-0.5">
                                        We kept what you&apos;d typed. Photos don&apos;t carry over — please re-add them.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setFormData(BLANK_SELL_FORM);
                                        setAgreedToTerms(false);
                                        setErrors({});
                                        setDraftRestored(false);
                                        try { sessionStorage.removeItem(SELL_DRAFT_KEY); } catch { /* nothing left to clean up */ }
                                    }}
                                    className="text-xs font-bold text-green-700 dark:text-green-400 hover:underline shrink-0"
                                >
                                    Start fresh
                                </button>
                            </div>
                        )}

                        {/* Category Selection */}
                        <div className="mb-6 md:mb-8">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 md:mb-4">Select Land Type</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                                {landCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 text-center transition-all ${selectedCategory === cat.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'
                                            }`}
                                    >
                                        <span className="text-xl md:text-2xl mb-0.5 md:mb-1 block">{cat.icon}</span>
                                        <span className={`text-[10px] md:text-xs font-semibold line-clamp-2 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-600'
                                            }`}>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Land Details */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">info</span>
                            Land Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 5 Acres Irrigated Farm Land" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Total Area (Acres)</label>
                                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 5" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.area ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">location_on</span>
                            Location
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Village / Town</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Srirangapatna" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.location ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">District</label>
                                <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Mandya" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.district ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                                <select name="state" value={formData.state} onChange={handleChange} className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.state ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`}>
                                    <option value="">Select State</option>
                                    <option>Karnataka</option>
                                    <option>Maharashtra</option>
                                    <option>Tamil Nadu</option>
                                    <option>Andhra Pradesh</option>
                                    <option>Kerala</option>
                                    <option>Telangana</option>
                                    <option>Gujarat</option>
                                    <option>Rajasthan</option>
                                    <option>Madhya Pradesh</option>
                                    <option>Uttar Pradesh</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">currency_rupee</span>
                            Pricing
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price Per Acre (₹)</label>
                                <input type="text" name="pricePerAcre" value={formData.pricePerAcre} onChange={handleChange} placeholder="e.g. 900000" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.pricePerAcre ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.pricePerAcre && <p className="text-red-500 text-xs mt-1">{errors.pricePerAcre}</p>}
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Total Price (₹)</label>
                                <input type="text" name="totalPrice" value={formData.totalPrice} onChange={handleChange} placeholder="e.g. 4500000" className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border ${errors.totalPrice ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} text-sm md:text-base`} />
                                {errors.totalPrice && <p className="text-red-500 text-xs mt-1">{errors.totalPrice}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description & Amenities</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your land, facilities, water sources, crops grown, nearby landmarks..." className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base resize-none" />
                        </div>

                        {/* Upload Photos */}
                        <div className="mb-6">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Upload Land Photos ({photos.length}/3)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={photos.length >= 3}
                                className="hidden"
                                id="photoInput"
                            />
                            <label
                                htmlFor="photoInput"
                                className={`block border-2 border-dashed rounded-lg md:rounded-2xl p-4 md:p-8 text-center ${photos.length >= 3
                                        ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-700 hover:border-primary cursor-pointer transition-colors'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-400 mb-1 md:mb-2 block">add_a_photo</span>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">{photos.length >= 3 ? 'Max 3 photos reached' : 'Tap to upload land photos'}</p>
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

                        {/* Contact Info */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">call</span>
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
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

                        {/* Terms Agreement */}
                        <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!agreedToTerms || submitting || uploadingPhotos}
                            className={`w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2 ${!agreedToTerms || submitting || uploadingPhotos ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-lg md:text-xl ${submitting || uploadingPhotos ? 'animate-spin' : ''}`}>
                                {submitting || uploadingPhotos ? 'progress_activity' : 'publish'}
                            </span>
                            {uploadingPhotos ? 'Uploading photos…' : submitting ? 'Submitting…' : 'Submit Listing for Review'}
                        </button>
                        {errors.submit && (
                            <p className="mt-3 text-center text-xs md:text-sm font-semibold text-red-600">{errors.submit}</p>
                        )}
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSuccessModal(false)}>
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                        <div className="text-center">
                            <div className={`w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 ${SUBMISSION_ACCENT.circle} rounded-full flex items-center justify-center shadow-lg`}>
                                <span className={`material-symbols-outlined text-3xl md:text-4xl ${SUBMISSION_ACCENT.icon}`}>{SUBMISSION_ICON}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">{submission.heading}</h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">{submission.message}</p>
                            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
}
