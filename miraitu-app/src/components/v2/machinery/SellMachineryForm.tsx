'use client';

import { useState } from 'react';
import { uploadListingImages, createListing } from '@/lib/supabase-db';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import supabase from '@/lib/supabase';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';
import { MACHINERY_SUBCATEGORY } from '@/lib/machinery-listings';

/**
 * Section headings inside one page — this used to be a three-step wizard.
 *
 * A wizard hid two thirds of the questions behind a Next button, so a seller
 * could not see what they were in for, could not fix a detail on an earlier
 * screen without walking back, and met the validation for each part three
 * screens apart. It also forced Year and the headline spec to be asked twice,
 * once per step, both writing the same field. One page asks each thing once and
 * reports everything missing together.
 */
function Section({ icon, title, blurb, children }: {
    icon: string;
    title: string;
    blurb: string;
    children: React.ReactNode;
}) {
    return (
        <section className="skeuo-card rounded-3xl p-5 md:p-8">
            <div className="flex items-start gap-3 mb-6">
                <span className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </span>
                <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h2>
                    <p className="text-xs md:text-sm text-gray-500">{blurb}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

// Custom Drone SVG Icon
const DroneIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ width: '1.875rem', height: '1.875rem' }}
    >
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <line x1="5" y1="7" x2="5" y2="8" />
        <line x1="19" y1="7" x2="19" y2="8" />
        <line x1="7" y1="6" x2="10" y2="10" />
        <line x1="17" y1="6" x2="14" y2="10" />
        <rect x="8" y="10" width="8" height="5" rx="1" />
        <line x1="11" y1="15" x2="10" y2="19" />
        <line x1="13" y1="15" x2="14" y2="19" />
        <line x1="9" y1="19" x2="11" y2="19" />
        <line x1="13" y1="19" x2="15" y2="19" />
        <rect x="10" y="16" width="4" height="3" rx="0.5" />
    </svg>
);

// Per-category copy and field shapes. The form is always rendered from a
// category-specific page (/home/machinery/<category>/sell), so the category is
// fixed and every label, placeholder and option list is tailored to it rather
// than asking the seller to pick a category first.
interface CategoryConfig {
    name: string;          // plural, for the locked chip
    singular: string;      // used in the heading — "Sell Your Tractor"
    icon: string;
    modelPlaceholder: string;
    /**
     * The one headline spec, asked as a range.
     *
     * There used to be a second, free-text spec field on the wizard's step 2 —
     * "Horsepower (HP)" for a tractor but "Number of Tynes / Discs" for an
     * implement — bound to the *same* state as this one, so whichever the
     * seller filled last silently overwrote the other. One field, one meaning.
     */
    specLabel: string;
    specIcon: string;
    specOptions: string[];
    specUnit: string;
    /** Usage / wear measure — engine hours, seasons, flight hours. */
    usageLabel: string;
    usagePlaceholder: string;
    usageUnit: string;
    /** Whether the HP-based price estimator is meaningful for this category. */
    showEstimate: boolean;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    tractors: {
        name: 'Tractors', singular: 'Tractor', icon: 'agriculture',
        modelPlaceholder: 'e.g. Yuvo 575 DI',
        specLabel: 'Engine Power', specIcon: 'speed',
        specOptions: ['25-35', '35-45', '45-55', '55-65', '65-75', '75+'], specUnit: 'HP',
        usageLabel: 'Hours Used (Engine)', usagePlaceholder: 'e.g. 1200', usageUnit: 'HRS',
        showEstimate: true,
    },
    jcb: {
        name: 'JCBs & Excavators', singular: 'JCB', icon: 'front_loader',
        modelPlaceholder: 'e.g. 3DX Super',
        specLabel: 'Engine Power', specIcon: 'speed',
        specOptions: ['70-90', '90-110', '110-140', '140+'], specUnit: 'HP',
        usageLabel: 'Hours Used (Engine)', usagePlaceholder: 'e.g. 4500', usageUnit: 'HRS',
        showEstimate: true,
    },
    'small-machineries': {
        name: 'Small Machineries', singular: 'Machine', icon: 'precision_manufacturing',
        modelPlaceholder: 'e.g. VST Shakti 130 DI',
        specLabel: 'Engine Power', specIcon: 'speed',
        specOptions: ['2-5', '5-8', '8-13', '13+'], specUnit: 'HP',
        usageLabel: 'Hours Used (Engine)', usagePlaceholder: 'e.g. 300', usageUnit: 'HRS',
        showEstimate: false,
    },
    implements: {
        name: 'Implements', singular: 'Implement', icon: 'handyman',
        modelPlaceholder: 'e.g. 9 Tyne Cultivator',
        specLabel: 'Working Width', specIcon: 'straighten',
        specOptions: ['3-5', '5-7', '7-9', '9+'], specUnit: 'FT',
        usageLabel: 'Seasons Used', usagePlaceholder: 'e.g. 4', usageUnit: 'SEASONS',
        showEstimate: false,
    },
    harvesters: {
        name: 'Harvesters', singular: 'Harvester', icon: 'grass',
        modelPlaceholder: 'e.g. Preet 987',
        specLabel: 'Engine Power', specIcon: 'speed',
        specOptions: ['60-80', '80-100', '100-120', '120+'], specUnit: 'HP',
        usageLabel: 'Hours Used (Engine)', usagePlaceholder: 'e.g. 2000', usageUnit: 'HRS',
        showEstimate: true,
    },
    drones: {
        name: 'Agri Drones', singular: 'Agri Drone', icon: 'drone',
        modelPlaceholder: 'e.g. Agras T30',
        specLabel: 'Tank Capacity', specIcon: 'water_drop',
        specOptions: ['5-10', '10-16', '16-20', '20+'], specUnit: 'L',
        usageLabel: 'Flight Hours', usagePlaceholder: 'e.g. 120', usageUnit: 'HRS',
        showEstimate: false,
    },
};

const FALLBACK_CONFIG = CATEGORY_CONFIG.tractors;

/**
 * The number stored for a spec bucket like "45-55" or "140+".
 *
 * This used to be `opt.split('-')[0]`, which is right for a hyphenated range
 * but leaves the open-ended top bucket as the string "140+". Number("140+") is
 * NaN, so picking the highest option on any category — every specOptions list
 * ends in one — poisoned the price estimate into "₹NaN - ₹NaN" and wrote "140+"
 * into specs.hp, where the listing cards then read it back as a number.
 */
function specOptionValue(option: string): string {
    return option.split('-')[0].replace(/\D/g, '');
}

/**
 * A rough resale band from horsepower and age, or null when it cannot be
 * computed. Null rather than a hardcoded fallback: the old one was a fixed
 * "₹4,50,000 - ₹5,10,000", a tractor-shaped figure that was shown just as
 * confidently on the JCB and harvester pages.
 */
function estimateValue(hp: string, year: string): string | null {
    const power = Number(hp);
    const bought = Number(year);
    if (!hp || !year || !Number.isFinite(power) || !Number.isFinite(bought)) return null;
    if (power <= 0 || bought <= 0) return null;

    const age = new Date().getFullYear() - bought;
    const low = Math.floor(power * 7000 - age * 15000 + 300000);
    const high = Math.floor(power * 9000 - age * 12000 + 400000);
    // An old, low-powered machine can drive the formula negative; a negative
    // asking price is worse than no suggestion at all.
    if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high <= low) return null;

    return `₹${low.toLocaleString('en-IN')} - ₹${high.toLocaleString('en-IN')}`;
}

// The page's category id is not what the database stores — see
// MACHINERY_SUBCATEGORY for why, and note that the category buy pages read the
// same map back. Keeping one copy is what stops the two sides drifting.

const brands: Record<string, string[]> = {
    tractors: ['Mahindra', 'John Deere', 'Swaraj', 'Sonalika', 'New Holland', 'Kubota', 'TAFE', 'Eicher'],
    jcb: ['JCB', 'L&T Komatsu', 'Caterpillar', 'Volvo', 'Tata Hitachi', 'CASE', 'Hyundai'],
    'small-machineries': ['Honda', 'VST Shakti', 'Kirloskar', 'Stihl', 'Neptune', 'Aspee', 'Greaves'],
    implements: ['Fieldking', 'Mahindra', 'John Deere', 'Landforce', 'Shaktiman', 'Khedut'],
    harvesters: ['Kubota', 'John Deere', 'Preet', 'Dashmesh', 'New Holland', 'Claas'],
    drones: ['DJI', 'Garuda', 'IoTech', 'Marut', 'General Aeronautics', 'Throttle Aerospace'],
};

interface SellMachineryFormProps {
    category?: string;
}

export default function SellMachineryForm({ category = 'tractors' }: SellMachineryFormProps) {
    const submission = useSubmissionCopy('request');
    // The category comes from the page and never changes — each category has its
    // own /sell page, so there is nothing for the seller to choose here.
    const selectedCategory = category;
    const config = CATEGORY_CONFIG[category] ?? FALLBACK_CONFIG;
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        category: category,
        brand: '',
        model: '',
        year: '',
        hp: '',
        hoursUsed: '',
        fuelType: 'Diesel',
        tireCondition: 75,
        hasServiceHistory: false,
        images: [] as File[],
        price: '',
        description: '',
        location: '',
        district: '',
        state: '',
        phone: '',
    });

    const estimatedValue = estimateValue(formData.hp, formData.year);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!)],
            }));
        }
    };

    /** Everything the listing needs, checked in one pass at submit. */
    const validate = (): boolean => {
        const errs: string[] = [];
        if (!formData.brand) errs.push('Please select a brand');
        if (!formData.model.trim()) errs.push('Please enter the model name');
        if (!formData.year) errs.push('Please select year of purchase');
        if (!formData.hp) errs.push(`Please select ${config.specLabel.toLowerCase()}`);
        if (!formData.hoursUsed.trim()) errs.push(`Please enter ${config.usageLabel.toLowerCase()}`);
        if (!formData.location.trim()) errs.push('Please enter your location');
        if (!formData.district.trim()) errs.push('Please enter your district');
        if (!formData.state.trim()) errs.push('Please select your state');
        // \D, not D — the old pattern stripped the letter D and left spaces and
        // "+" in place, so any number typed with formatting failed this check.
        if (formData.phone.replace(/\D/g, '').length !== 10) {
            errs.push('Enter a valid 10-digit phone number');
        }
        if (!formData.price.trim()) errs.push('Please enter your asking price');
        else if (isNaN(Number(formData.price.replace(/,/g, '')))) errs.push('Enter a valid price');
        if (formData.images.length === 0) errs.push('Please upload at least one photo');
        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSubmitError('Please log in to list your machinery');
                setIsSubmitting(false);
                return;
            }

            // Upload images
            let imageUrls: string[] = [];
            if (formData.images.length > 0) {
                imageUrls = await uploadListingImages(user.id, formData.images);
            }

            const priceNum = Number(formData.price.replace(/,/g, ''));
            const { error } = await createListing({
                user_id: user.id,
                listing_type: 'machinery',
                // See MACHINERY_SUBCATEGORY — 'tractors' is not a value this column accepts.
                category: 'machinery',
                subcategory: MACHINERY_SUBCATEGORY[selectedCategory] ?? 'Other Machinery',
                title: `${formData.brand} ${formData.model}`,
                brand: formData.brand,
                model: formData.model,
                description: formData.description,
                price: priceNum,
                location: formData.location,
                district: formData.district,
                state: formData.state,
                contact_phone: formData.phone.replace(/\D/g, ''),
                images: imageUrls,
                specs: {
                    // The page's own category id, kept because MACHINERY_SUBCATEGORY
                    // is lossy in one direction: several ids can map onto the
                    // same subcategory label.
                    machinery_type: selectedCategory,
                    year: formData.year,
                    hp: formData.hp,
                    hoursUsed: formData.hoursUsed,
                    fuelType: formData.fuelType,
                    tireCondition: formData.tireCondition,
                    hasServiceHistory: formData.hasServiceHistory,
                },
            });

            if (error) {
                setSubmitError(error);
            } else {
                setShowSuccess(true);
            }
        } catch (err) {
            setSubmitError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Heading */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Sell Your {config.singular}</h1>
                <p className="text-sm text-gray-500">
                    Everything on one page — fill what applies and publish when you are ready.
                </p>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
                className="space-y-5 md:space-y-6"
            >
                {/* ── Basic details ───────────────────────────────────────── */}
                <Section icon="info" title="Basic details" blurb={`What your ${config.singular.toLowerCase()} is and how old`}>
                    {/* Locked category — this page only lists this one category */}
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 px-4 py-3">
                        <div className="size-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            {config.icon === 'drone' ? (
                                <DroneIcon className="text-primary" />
                            ) : (
                                <span className="material-symbols-outlined text-2xl">{config.icon}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Listing category</p>
                            <p className="font-bold text-primary">{config.name}</p>
                        </div>
                        <a
                            href="/home/machinery"
                            className="shrink-0 text-xs font-bold text-gray-500 hover:text-primary underline underline-offset-2"
                        >
                            Change
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">factory</span>
                                <select
                                    value={formData.brand}
                                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                    className="w-full pl-12 pr-10 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select Brand</option>
                                    {brands[selectedCategory]?.map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Model Name *</label>
                            <input
                                type="text"
                                value={formData.model}
                                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                placeholder={config.modelPlaceholder}
                                className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Year and the headline spec are each asked once. The wizard
                        asked both twice — a range select on step 1 and a free-text
                        box on step 2 — with both writing the same field. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Year of Purchase *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">calendar_month</span>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    className="w-full pl-12 pr-10 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{config.specLabel} ({config.specUnit}) *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{config.specIcon}</span>
                                <select
                                    value={formData.hp}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
                                    className="w-full pl-12 pr-10 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select {config.specLabel}</option>
                                    {config.specOptions.map((opt) => (
                                        <option key={opt} value={specOptionValue(opt)}>{opt} {config.specUnit}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ── Condition & specs ───────────────────────────────────── */}
                <Section icon="build" title="Condition &amp; specs" blurb="Usage, fuel and wear — what a buyer asks first">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
                        <div className="lg:col-span-2 space-y-5 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{config.usageLabel} *</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">schedule</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formData.hoursUsed}
                                            onChange={(e) => setFormData(prev => ({ ...prev, hoursUsed: e.target.value }))}
                                            placeholder={config.usagePlaceholder}
                                            className="w-full pl-12 pr-20 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">{config.usageUnit}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Fuel Type</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">local_gas_station</span>
                                        <select
                                            value={formData.fuelType}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                                            className="w-full pl-12 pr-10 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                        >
                                            <option>Diesel</option>
                                            <option>Petrol</option>
                                            <option>Electric</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tire Condition Slider */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tire Condition</label>
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                        {formData.tireCondition >= 75 ? 'GOOD' : formData.tireCondition >= 40 ? 'FAIR' : 'WORN'} ({formData.tireCondition}%)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={formData.tireCondition}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tireCondition: Number(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>WORN OUT</span>
                                    <span>BRAND NEW</span>
                                </div>
                            </div>

                            {/* Service History Toggle */}
                            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="material-symbols-outlined text-gray-400 shrink-0">history</span>
                                    <div className="min-w-0">
                                        <p className="font-semibold">Complete Service History</p>
                                        <p className="text-xs text-gray-500">Includes original logs and company records</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.hasServiceHistory}
                                    aria-label="Complete service history"
                                    onClick={() => setFormData(prev => ({ ...prev, hasServiceHistory: !prev.hasServiceHistory }))}
                                    className={`w-14 h-7 shrink-0 rounded-full transition-colors ${formData.hasServiceHistory ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${formData.hasServiceHistory ? 'translate-x-7' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Pro Seller Tip & Estimated Value */}
                        <div className="space-y-5">
                            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">👍</span>
                                    <span className="font-bold text-amber-800 dark:text-amber-200">Pro Seller Tip</span>
                                </div>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Machines with <strong>detailed service history</strong> sell 35% faster on Miraitu. Highlighting genuine tire wear increases buyer trust.
                                </p>
                            </div>

                            {/* The estimator is an HP × age formula, so it is only shown for
                                categories where the headline spec really is horsepower. */}
                            {config.showEstimate && (
                                <div className="p-6 rounded-2xl bg-primary text-white">
                                    <p className="text-sm text-white/70 mb-1">Estimated Value</p>
                                    {estimatedValue ? (
                                        <>
                                            <p className="text-2xl font-bold mb-2">{estimatedValue}</p>
                                            <p className="text-xs text-white/60 uppercase tracking-wide">Based on current market trends</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-white/70 mt-1">
                                            Pick the year and {config.specLabel.toLowerCase()} above and we will suggest a range.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                {/* ── Location & contact ──────────────────────────────────── */}
                <Section icon="location_on" title="Location &amp; contact" blurb="Where the machine is and who a buyer should call">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location / Village *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g. Indore, Dewas"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                placeholder="e.g. Indore"
                                className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">State *</label>
                            <div className="relative">
                                <select
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                    className="w-full px-4 pr-10 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                >
                                    <option value="">Select State</option>
                                    {['Maharashtra', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Karnataka', 'Rajasthan', 'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala', 'Chhattisgarh', 'Jharkhand', 'Assam'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Phone Number *</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">call</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                    placeholder="10-digit number"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Buyers will call this number.</p>
                        </div>
                    </div>
                </Section>

                {/* ── Photos & price ──────────────────────────────────────── */}
                <Section icon="photo_camera" title="Photos &amp; price" blurb="The first thing a buyer sees, and the number they judge it by">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Upload Photos *</label>
                        <div className="relative p-8 md:p-12 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-primary mb-3 block">add_photo_alternate</span>
                                <h3 className="text-base md:text-lg font-bold text-primary-dark mb-1">Drag and drop photos</h3>
                                <p className="text-sm text-gray-500">or click to browse from your device</p>
                                <p className="text-xs text-gray-400 mt-2">JPG • PNG • MAX 10MB each</p>
                            </div>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="mt-4 flex gap-3 flex-wrap">
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            aria-label={`Remove photo ${idx + 1}`}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                images: prev.images.filter((_, i) => i !== idx)
                                            }))}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Asking Price *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">₹</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="Enter price"
                                className="w-full pl-10 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-xl md:text-2xl font-bold"
                            />
                        </div>
                        {config.showEstimate && estimatedValue && (
                            <p className="text-sm text-gray-500 mt-2">Suggested range: {estimatedValue}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder={`Add any additional details about your ${config.singular.toLowerCase()}...`}
                            rows={4}
                            className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none"
                        />
                    </div>
                </Section>

                {/* ── Publish ─────────────────────────────────────────────── */}
                <div className="skeuo-card rounded-3xl p-5 md:p-8">
                    <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                    {(errors.length > 0 || submitError) && (
                        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-1">
                            {submitError && (
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">error</span>{submitError}
                                </p>
                            )}
                            {errors.map((err, i) => (
                                <p key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">error</span>{err}
                                </p>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !agreedToTerms}
                        className={`mt-5 w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors ${isSubmitting || !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Submitting…' : 'Publish Listing'}
                        {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSuccess(false)}>
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                        <div className="text-center">
                            <div className={`w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 ${SUBMISSION_ACCENT.circle} rounded-full flex items-center justify-center shadow-lg`}>
                                <span className={`material-symbols-outlined text-3xl md:text-4xl ${SUBMISSION_ACCENT.icon}`}>{SUBMISSION_ICON}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">{submission.heading}</h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">{submission.message}</p>
                            <button onClick={() => setShowSuccess(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
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
