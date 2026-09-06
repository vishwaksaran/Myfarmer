'use client';

import { useEffect, useRef, useState } from 'react';
import {
    CATEGORIES_BY_MODE,
    subcategoryOptions,
    RENT_PRICE_UNITS,
    SALE_PRICE_UNITS,
    LABOUR_PRICE_UNITS,
    type Listing,
    type ListingCategory,
    type ListingInput,
    type ListingMode,
} from './listingTypes';
import { CATEGORY_META, defaultPriceUnit, listingPlaceholders, postCta } from './listingFormat';
import { discardCommunityMedia, uploadCommunityMedia } from '@/lib/community-media';
import { useAppLocation } from '@/context/LocationContext';
import { Z } from '@/lib/z-layers';
import type { PlaceSuggestion } from '@/app/api/geo/places/route';

/**
 * Where the ad is, as opposed to where the person filling the form is.
 *
 * These two were the same thing: district, state and coordinates were all read
 * from the app's current location at submit time, whatever the seller typed in
 * the Location field. Posting a Bobbepalli (Andhra Pradesh) listing from
 * Bengaluru filed it under Bangalore East, Karnataka, with coordinates to
 * match — and editing that ad from a third place moved it again, because the
 * overwrite ran on every save.
 *
 * `label` is what pins these values to the text they describe. When the
 * Location field no longer reads as the pinned place, the pin is dropped and
 * the ad is saved with no coordinates at all, which is honest: a distance we
 * cannot compute is better than one measured from the wrong village.
 */
interface PlacePin {
    label: string;
    district: string;
    state: string;
    lat: number | null;
    lng: number | null;
}

const sameLabel = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

interface ListingFormModalProps {
    isOpen: boolean;
    mode: ListingMode;
    /** Pass a listing to edit it; omit to post a new one. */
    editing?: Listing | null;
    /**
     * Where a new ad should open. The machinery and livestock pages send people
     * here already knowing what they are selling, so the form starts on that
     * category and type instead of making them pick it a second time. Ignored
     * when editing, and ignored if the value is not one this board offers.
     */
    initialCategory?: ListingCategory | null;
    initialSubcategory?: string | null;
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
export default function ListingFormModal({ isOpen, mode, editing, initialCategory, initialSubcategory, onClose, onSubmit }: ListingFormModalProps) {
    const { location } = useAppLocation();
    const priceUnits =
        mode === 'labour' ? LABOUR_PRICE_UNITS : mode === 'rent' ? RENT_PRICE_UNITS : SALE_PRICE_UNITS;

    const categories = CATEGORIES_BY_MODE[mode];
    // Each board opens on its own first category; 'machinery' is not one of
    // the Labour & Services board's two.
    const firstCategory = categories[0];
    /** Where a new ad starts — the caller's category when this board has it. */
    const startCategory =
        initialCategory && categories.includes(initialCategory) ? initialCategory : firstCategory;
    /** Only a type that actually belongs to that category; anything else is dropped. */
    const startSubcategory =
        initialSubcategory && subcategoryOptions(startCategory).includes(initialSubcategory)
            ? initialSubcategory
            : '';
    const [category, setCategory] = useState<ListingCategory>(firstCategory);
    const [subcategory, setSubcategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [price, setPrice] = useState('');
    const [priceUnit, setPriceUnit] = useState<string>(priceUnits[0]);
    const [negotiable, setNegotiable] = useState(false);
    const [locationText, setLocationText] = useState('');
    /** The place the Location text is pinned to — see PlacePin. */
    const [pin, setPin] = useState<PlacePin | null>(null);
    const [placeResults, setPlaceResults] = useState<PlaceSuggestion[]>([]);
    const [placeLoading, setPlaceLoading] = useState(false);
    /** Closed after a pick, so choosing a place does not immediately re-search. */
    const [placeOpen, setPlaceOpen] = useState(false);
    const [contactPhone, setContactPhone] = useState('');
    const [images, setImages] = useState<string[]>([]);
    // Labour & Services only — stored in specs, see migration 032.
    const [workType, setWorkType] = useState('');
    const [workerCount, setWorkerCount] = useState('');
    const [contactName, setContactName] = useState('');
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
            // An ad posted before the type became mandatory — or one under
            // "Other", which no longer offers types — has nothing to preselect.
            setSubcategory(
                subcategoryOptions(editing.category).includes(editing.subcategory) ? editing.subcategory : ''
            );
            setTitle(editing.title);
            setDescription(editing.description);
            setBrand(editing.brand);
            setModel(editing.model);
            setPrice(editing.price === null ? '' : String(editing.price));
            setPriceUnit(editing.priceUnit || defaultPriceUnit(mode, editing.category));
            setNegotiable(editing.negotiable);
            setLocationText(editing.location);
            // The ad's own place, never the editor's current one.
            setPin({
                label: editing.location,
                district: editing.district,
                state: editing.state,
                lat: editing.latitude,
                lng: editing.longitude,
            });
            setContactPhone(editing.contactPhone);
            setImages(editing.images);
            setWorkType(editing.workType);
            setWorkerCount(editing.workerCount === null ? '' : String(editing.workerCount));
            setContactName(editing.contactName);
            // An existing ad already has the unit its owner chose — do not let a
            // category change overwrite it.
            setUnitTouched(true);
        } else {
            setCategory(startCategory);
            setSubcategory(startSubcategory);
            setTitle('');
            setDescription('');
            setBrand('');
            setModel('');
            setPrice('');
            setWorkType('');
            setWorkerCount('');
            setContactName('');
            setPriceUnit(defaultPriceUnit(mode, startCategory));
            setNegotiable(false);
            setLocationText(location?.address || '');
            // A new ad starts where the seller is standing, which is usually
            // right — and is dropped the moment they name a different place.
            setPin(location
                ? {
                    label: location.address,
                    district: location.district || '',
                    state: location.state || '',
                    lat: location.lat || null,
                    lng: location.lng || null,
                }
                : null);
            setContactPhone('');
            setImages([]);
            setUnitTouched(false);
        }
        setPlaceResults([]);
        setPlaceOpen(false);
        setError(null);
        mediaPathsRef.current.clear();
        // priceUnits is derived from `mode` and is stable for a given board.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editing, location?.address, startCategory, startSubcategory]);

    /**
     * Village lookup against /api/geo/places, the same index onboarding uses.
     * It reaches village level and returns district, state and coordinates with
     * each hit, which is what lets a picked place pin the ad accurately.
     */
    useEffect(() => {
        const query = locationText.trim();
        if (!placeOpen || query.length < 2) {
            setPlaceResults([]);
            setPlaceLoading(false);
            return;
        }

        // Debounced so a typed name costs one request, not one per keystroke.
        setPlaceLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/geo/places?q=${encodeURIComponent(query)}`, { signal: controller.signal });
                const data = await res.json();
                setPlaceResults(Array.isArray(data.results) ? data.results : []);
            } catch {
                // Aborted or offline — free typing still works, the ad just
                // saves without coordinates.
                setPlaceResults([]);
            } finally {
                setPlaceLoading(false);
            }
        }, 300);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [locationText, placeOpen]);

    const choosePlace = (place: PlaceSuggestion) => {
        const label = [place.name, place.district].filter(Boolean).join(', ');
        setLocationText(label);
        setPin({
            label,
            district: place.district,
            state: place.state,
            lat: place.latitude,
            lng: place.longitude,
        });
        setPlaceOpen(false);
        setPlaceResults([]);
    };

    /** The pin only counts while the Location field still reads as its place. */
    const activePin = pin && sameLabel(pin.label, locationText) ? pin : null;

    if (!isOpen) return null;

    // Hints follow the chosen category, so the examples always match what the
    // farmer is actually listing.
    const hints = listingPlaceholders(mode, category);

    // Empty for "Other", which is the catch-all itself — that category shows no
    // type field at all.
    const typeOptions = subcategoryOptions(category);

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

        // On this board the submission is a lead for the team to follow up, so
        // a name and a working number are the two things that must be there.
        if (mode === 'labour') {
            if (!contactName.trim()) {
                setError('Add your name so we know who to ask for');
                return;
            }
            if (contactPhone.replace(/D/g, '').length !== 10) {
                setError('Enter a valid 10-digit contact number');
                return;
            }
        }

        const trimmedCount = workerCount.trim();
        const numericCount = trimmedCount === '' ? null : Number(trimmedCount);
        if (numericCount !== null && (!Number.isInteger(numericCount) || numericCount < 1)) {
            setError('Number of workers must be a whole number');
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
            // All four describe the place named above, not the device filling
            // in this form — see PlacePin. Null when the seller typed a place
            // they did not pick from the list, because coordinates borrowed
            // from somewhere else would put the ad in the wrong district.
            district: activePin?.district || undefined,
            state: activePin?.state || undefined,
            latitude: activePin?.lat ?? null,
            longitude: activePin?.lng ?? null,
            images,
            contactPhone,
            workType,
            workerCount: numericCount,
            contactName,
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

    const canSubmit =
        title.trim().length >= 3 &&
        locationText.trim().length > 0 &&
        (price.trim() !== '' || negotiable) &&
        (typeOptions.length === 0 || subcategory !== '');

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
                        {/* Labour submissions are not published anywhere — they
                            are a registration the team follows up on — so the
                            button says what actually happens. */}
                        {uploading ? 'Uploading…' : saving ? 'Saving…' : editing ? 'Save' : mode === 'labour' ? 'Register' : 'Publish'}
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

                    {/* Sub-category — required, because "Machinery" alone covers
                        everything from a tractor to a borewell rig, and a buyer
                        filtering the board would never find an untyped ad. A
                        dropdown rather than chips: eleven machinery types cost
                        four rows of the form before the title is even reached. */}
                    {typeOptions.length > 0 && (
                        <div>
                            <label htmlFor="listing-subcategory" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                {CATEGORY_META[category].label} type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="listing-subcategory"
                                value={subcategory}
                                onChange={(e) => setSubcategory(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            >
                                <option value="">Select {CATEGORY_META[category].label.toLowerCase()} type</option>
                                {typeOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
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

                    {/* Work type / crew size — the Labour & Services equivalent
                        of brand and model. Both optional: a one-person service
                        has no crew size worth stating. */}
                    {mode === 'labour' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="listing-work-type" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Work type</label>
                                <input
                                    id="listing-work-type"
                                    type="text"
                                    value={workType}
                                    onChange={(e) => setWorkType(e.target.value)}
                                    placeholder={category === 'labour' ? 'Harvesting' : 'Borewell drilling'}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                                />
                            </div>
                            <div>
                                <label htmlFor="listing-worker-count" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Number of workers</label>
                                <input
                                    id="listing-worker-count"
                                    type="text"
                                    inputMode="numeric"
                                    value={workerCount}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '' || /^d+$/.test(v)) setWorkerCount(v);
                                    }}
                                    placeholder="5"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                                />
                            </div>
                        </div>
                    )}

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

                    {/* Who to ask for. The phone below is already required; a
                        name makes the call less awkward, so it is optional. */}
                    {mode === 'labour' && (
                        <div>
                            <label htmlFor="listing-contact-name" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                                Your Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="listing-contact-name"
                                type="text"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="e.g. Ramesh"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            />
                        </div>
                    )}

                    {/* Location — where the ad is, which is not always where
                        the seller is standing while they write it. */}
                    <div>
                        <label htmlFor="listing-location" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="listing-location"
                                type="text"
                                autoComplete="off"
                                value={locationText}
                                onChange={(e) => { setLocationText(e.target.value); setPlaceOpen(true); }}
                                onFocus={() => setPlaceOpen(true)}
                                placeholder="Village, district"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22c33d]/30"
                            />

                            {placeOpen && (placeLoading || placeResults.length > 0) && (
                                <ul className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] shadow-xl" style={{ zIndex: 1 }}>
                                    {placeLoading && placeResults.length === 0 ? (
                                        <li className="px-3.5 py-2.5 text-sm text-gray-500">Searching…</li>
                                    ) : placeResults.map(place => (
                                        <li key={place.id}>
                                            <button
                                                type="button"
                                                onClick={() => choosePlace(place)}
                                                className="w-full text-left px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">{place.name}</span>
                                                <span className="block text-xs text-gray-500">
                                                    {[place.district, place.state].filter(Boolean).join(', ')}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* What the ad is actually filed under. Without this the
                            seller had no way to tell a pinned place from a bare
                            line of text that looks identical in the field. */}
                        {activePin && (activePin.district || activePin.state) ? (
                            <p className="mt-1.5 text-xs text-[#1f8c30] dark:text-[#6abf62] flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Listed in {[activePin.district, activePin.state].filter(Boolean).join(', ')}
                            </p>
                        ) : locationText.trim() ? (
                            <p className="mt-1.5 text-xs text-gray-500 flex items-start gap-1">
                                <span className="material-symbols-outlined text-sm shrink-0">info</span>
                                Pick your village from the list so buyers nearby can find this
                                ad and see how far away it is.
                            </p>
                        ) : null}
                    </div>

                    {/* Contact */}
                    <div>
                        <label htmlFor="listing-phone" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                            Contact number {mode === 'labour' && <span className="text-red-500">*</span>}
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
