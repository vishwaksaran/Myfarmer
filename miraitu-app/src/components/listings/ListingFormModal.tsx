'use client';

import { useEffect, useRef, useState } from 'react';
import {
    CATEGORIES_BY_MODE,
    SUBCATEGORIES,
    RENT_PRICE_UNITS,
    SALE_PRICE_UNITS,
    type Listing,
    type ListingCategory,
    type ListingInput,
    type ListingMode,
} from './listingTypes';
import { CATEGORY_META, defaultPriceUnit, listingPlaceholders, postCta } from './listingFormat';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';
import { useAppLocation } from '@/context/LocationContext';
import { Z } from '@/lib/z-layers';

interface ListingFormModalProps {
    isOpen: boolean;
    mode: ListingMode;
    /** Pass a listing to edit it; omit to post a new one. */
    editing?: Listing | null;
    onClose: () => void;
    onSubmit: (input: ListingInput) => Promise<{ success: boolean; error?: string }>;
}

const MAX_PHOTOS = 6;

/**
 * The Post an Ad / List for Rent form.
 *
 * Photos upload to storage as they are picked, so the submit is a single small
 * request rather than megabytes of base64 — and anything uploaded for an ad
 * that is never published gets deleted instead of orphaned.
 */
export default function ListingFormModal({ isOpen, mode, editing, onClose, onSubmit }: ListingFormModalProps) {
    const { location } = useAppLocation();
    const priceUnits = mode === 'rent' ? RENT_PRICE_UNITS : SALE_PRICE_UNITS;

    const categories = CATEGORIES_BY_MODE[mode];
    const [category, setCategory] = useState<ListingCategory>('machinery');
    const [subcategory, setSubcategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState<string>(priceUnits[0]);
    const [negotiable, setNegotiable] = useState(false);
    const [locationText, setLocationText] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    /** Public URL → storage path, for cleaning up an abandoned draft. */
    const mediaPathsRef = useRef<Map<string, string>>(new Map());
    /** Once the farmer picks a unit themselves, category changes stop overriding it. */
    const [unitTouched, setUnitTouched] = useState(false);

    /** Switching category re-points the hints and, unless overridden, the unit. */
    const chooseCategory = (next: ListingCategory) => {
        setCategory(next);
        // The old sub-category belongs to the old category, so it cannot carry
        // over — the server rejects a mismatched pair.
        setSubcategory('');
        if (!unitTouched) setPriceUnit(defaultPriceUnit(mode, next));
    };

    // Load the ad being edited, or prefill a new one from the app's location.
    useEffect(() => {
        if (!isOpen) return;
        if (editing) {
            setCategory(editing.category);
            setSubcategory(editing.subcategory || '');
            setTitle(editing.title);
            setDescription(editing.description);
            setBrand(editing.brand);
            setModel(editing.model);
            setPrice(editing.price === null ? '' : String(editing.price));
            setPriceUnit(editing.priceUnit || defaultPriceUnit(mode, editing.category));
            setNegotiable(editing.negotiable);
            setLocationText(editing.location);
            setContactPhone(editing.contactPhone);
            setImages(editing.images);
            // An existing ad already has the unit its owner chose — do not let a
            // category change overwrite it.
            setUnitTouched(true);
        } else {
            setCategory('machinery');
            setSubcategory('');
            setTitle('');
            setDescription('');
            setBrand('');
            setModel('');
            setPrice('');
            setPriceUnit(defaultPriceUnit(mode, 'machinery'));
            setNegotiable(false);
            setLocationText(location?.address || '');
            setContactPhone('');
            setImages([]);
            setUnitTouched(false);
        }
        setError(null);
        mediaPathsRef.current.clear();
        // priceUnits is derived from `mode` and is stable for a given board.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editing, location?.address]);

    if (!isOpen) return null;

    // Hints follow the chosen category, so the examples always match what the
    // farmer is actually listing.
    const hints = listingPlaceholders(mode, category);

    const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        e.target.value = '';
        if (picked.length === 0) return;
        setError(null);

        void (async () => {
            setUploading(true);
            for (const file of picked) {
                if (images.length + mediaPathsRef.current.size >= MAX_PHOTOS) {
                    setError(`You can add up to ${MAX_PHOTOS} photos`);
                    break;
                }
                const { media, error: uploadError } = await uploadCommunityMedia(file, 'image');
                if (media) {
                    mediaPathsRef.current.set(media.url, media.path);
                    setImages(prev => (prev.length >= MAX_PHOTOS ? prev : [...prev, media.url]));
                } else {
                    setError(uploadError || 'Upload failed. Please try again.');
                }
            }
            setUploading(false);
        })();
    };

    const removePhoto = (url: string) => {
        setImages(prev => prev.filter(i => i !== url));
        const path = mediaPathsRef.current.get(url);
        if (path) {
            mediaPathsRef.current.delete(url);
            void discardCommunityMedia([path]);
        }
    };

    const handleSubmit = async () => {
        if (uploading || saving) return;
        setError(null);

        const trimmedPrice = price.trim();
        const numericPrice = trimmedPrice === '' ? null : Number(trimmedPrice);
        if (numericPrice !== null && !Number.isFinite(numericPrice)) {
            setError('Enter the price as a number');
            return;
        }

        setSaving(true);
        const result = await onSubmit({
            mode,
            category,
            subcategory,
            title,
            description,
            brand,
            model,
            price: numericPrice,
            priceUnit,
            negotiable,
            location: locationText,
            district: location?.district,
            state: location?.state,
            // Coordinates come from the app's location so cards can show
            // "6.0 km away" to other farmers.
            latitude: editing?.latitude ?? location?.lat ?? null,
            longitude: editing?.longitude ?? location?.lng ?? null,
            images,
            contactPhone,
        });
        setSaving(false);

        if (!result.success) {
            // Keep the draft and its uploads so the user can just retry.
            setError(result.error || 'Could not save your listing');
            return;
        }

        mediaPathsRef.current.clear(); // the listing owns these photos now
        onClose();
    };

    /** Closing without publishing throws away photos uploaded for this draft. */
    const handleClose = () => {
        if (saving) return;
        const orphans = [...mediaPathsRef.current.values()];
        mediaPathsRef.current.clear();
        void discardCommunityMedia(orphans);
        onClose();
    };

    const canSubmit = title.trim().length >= 3 && locationText.trim().length > 0 && (price.trim() !== '' || negotiable);

    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: Z.MODAL }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1a231a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                        {editing ? 'Edit listing' : postCta(mode)}
                    </h3>
                    <button
                        onClick={() => { void handleSubmit(); }}
                        disabled={!canSubmit || uploading || saving}
                        className="px-4 py-2 rounded-full bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading…' : saving ? 'Saving…' : editing ? 'Save' : 'Publish'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(c => (
                                <button
                                    key={c}
                                    onClick={() => chooseCategory(c)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${category === c
                                        ? 'bg-[#22c33d] text-white shadow-sm'
                                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span aria-hidden>{CATEGORY_META[c].emoji}</span>
                                    {CATEGORY_META[c].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub-category — appears once a category is picked, because
                        "Machinery" alone covers everything from a tractor to a
                        borewell rig. Optional, so it never blocks publishing. */}
                    {SUBCATEGORIES[category]?.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                                {CATEGORY_META[category].label} type
                                <span className="ml-1 font-normal text-gray-400">(optional)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SUBCATEGORIES[category].map(sub => {
                                    const active = subcategory === sub;
                                    return (
                                        <button
                                            key={sub}
                                            // Tapping the active chip clears it, so a
                                            // mis-tap is undoable without reloading.
                                            onClick={() => setSubcategory(active ? '' : sub)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active
                                                ? 'bg-[#1f8c30] text-white shadow-sm'
                                                : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#22c33d]/50'
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="listing-title" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="listing-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={hints.title}
                            maxLength={120}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                        />
                    </div>

                    {/* Price + unit */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="listing-price" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                Price (₹)
                            </label>
                            <input
                                id="listing-price"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder={hints.price}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            />
                        </div>
                        <div>
                            <label htmlFor="listing-unit" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                Per
                            </label>
                            <select
                                id="listing-unit"
                                value={priceUnit}
                                onChange={(e) => { setPriceUnit(e.target.value); setUnitTouched(true); }}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            >
                                {priceUnits.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={negotiable}
                            onChange={(e) => setNegotiable(e.target.checked)}
                            className="w-4 h-4 accent-[#22c33d]"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Price is negotiable
                            <span className="block text-[11px] text-gray-400">Tick this to post without a fixed price</span>
                        </span>
                    </label>

                    {/* Brand / model — useful for machinery and vehicles */}
                    {(category === 'machinery' || category === 'vehicles') && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="listing-brand" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Brand</label>
                                <input
                                    id="listing-brand"
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="Swaraj"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                                />
                            </div>
                            <div>
                                <label htmlFor="listing-model" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Model</label>
                                <input
                                    id="listing-model"
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="735 XT"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <label htmlFor="listing-location" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="listing-location"
                            type="text"
                            value={locationText}
                            onChange={(e) => setLocationText(e.target.value)}
                            placeholder="Village, district"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                        />
                    </div>

                    {/* Contact */}
                    <div>
                        <label htmlFor="listing-phone" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                            Contact number
                        </label>
                        <input
                            id="listing-phone"
                            type="tel"
                            inputMode="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="Buyers will call this number"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="listing-desc" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Details</label>
                        <textarea
                            id="listing-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder={hints.details}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                        />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                            Photos <span className="font-normal text-gray-400">({images.length}/{MAX_PHOTOS})</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {images.map(url => (
                                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removePhoto(url)}
                                        aria-label="Remove photo"
                                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined text-white text-xs">close</span>
                                    </button>
                                </div>
                            ))}
                            {images.length < MAX_PHOTOS && (
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-[#22c33d]/40 bg-[#22c33d]/5 flex flex-col items-center justify-center gap-0.5 hover:bg-[#22c33d]/10 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[#22c33d]">
                                        {uploading ? 'progress_activity' : 'add_a_photo'}
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-500">
                                        {uploading ? 'Uploading' : 'Add'}
                                    </span>
                                </button>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium flex-1">{error}</span>
                            <button onClick={() => setError(null)} aria-label="Dismiss" className="text-red-400 hover:text-red-600">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
