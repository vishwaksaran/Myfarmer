'use client';

import { useState } from 'react';
import Link from 'next/link';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { useSubmissionCopy } from '@/lib/service-availability';
import { useBookingSubmit } from '@/lib/useBookingSubmit';

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

export default function SellLandPage() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        district: '',
        state: '',
        area: '',
        pricePerAcre: '',
        totalPrice: '',
        description: '',
        amenities: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

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
            setFormData({ title: '', location: '', district: '', state: '', area: '', pricePerAcre: '', totalPrice: '', description: '', amenities: '', contactName: '', contactPhone: '' });
            previews.forEach(url => URL.revokeObjectURL(url));
            setPhotos([]);
            setPreviews([]);
            setAgreedToTerms(false);
        } else {
            setErrors({ submit: result.error || 'Failed to submit' });
        }
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
                            <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-3xl md:text-4xl text-white">check</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">{submission.heading}</h2>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">{submission.message}</p>
                            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
}
