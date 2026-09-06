'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import NearbyLocation from '@/components/v2/NearbyLocation';
import MiraituLogo from '@/components/MiraituLogo';
import LivestockAdGrid from '@/components/livestock/LivestockAdGrid';
import { fetchLivestockListings, type LivestockAd, type LivestockType } from '@/app/actions/livestock';
import { uploadListingImages, createListing } from '@/lib/supabase-db';
import supabase from '@/lib/supabase';

type TabType = 'browse' | 'buy' | 'sell';

// Category data with real images
const categories = [
    { id: 'cattle', nameKey: 'livestock.cattle', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop', path: '/home/livestock/cattle' },
    { id: 'goats-sheep', nameKey: 'livestock.goatsSheep', image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=200&h=200&fit=crop', path: '/home/livestock/goats-sheep' },
    { id: 'poultry', nameKey: 'livestock.poultry', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&h=200&fit=crop', path: '/home/livestock/poultry' },
    { id: 'fish', nameKey: 'livestock.fishAquaculture', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=200&h=200&fit=crop', path: '/home/livestock/fish' },
    { id: 'others', nameKey: 'livestock.others', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop', path: '/home/livestock/others' },
];

/**
 * The chips across the top. 'sell' is deliberately absent: the "Post a
 * Livestock" button in the empty state is the way into the sell form now, so a
 * chip beside it would be a second door to the same room. The 'sell' TabType
 * and its form are untouched — only the chip is gone.
 */
const tabs = [
    { id: 'browse' as TabType, titleKey: 'livestockPage.browse', icon: 'category', bgColor: 'bg-blue-500' },
    { id: 'buy' as TabType, titleKey: 'livestockPage.buy', icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
];

/**
 * The Buy tab's category chips.
 *
 * `value` is a LivestockType, the same id the five sub-pages and the sell form
 * use, so a chip filters the fetched ads directly instead of matching on a
 * display label that translation would break.
 */
const categoryFilters: { value: LivestockType | 'all'; key: string }[] = [
    { value: 'all', key: 'common.all' },
    { value: 'cattle', key: 'livestock.cattle' },
    { value: 'goats', key: 'livestock.goatsSheep' },
    { value: 'poultry', key: 'livestock.poultry' },
    { value: 'fish', key: 'livestock.fish' },
    { value: 'others', key: 'livestock.others' },
];

/**
 * These ids drive the form; they are not what the database stores.
 *
 * `marketplace_listings.category` only accepts the buckets in migration 030,
 * of which 'animals' is the livestock one — 'cattle' and 'poultry' were being
 * rejected outright (23514). The bucket goes in `category`, the animal in
 * `subcategory` using listingTypes.SUBCATEGORIES.animals so the Buy & Sell
 * filters match, and the raw id survives in `specs`.
 */
const DB_SUBCATEGORY: Record<string, string> = {
    cattle: 'Cow',
    goats: 'Goat & Sheep',
    poultry: 'Poultry',
    fish: 'Fish & Aqua',
    others: 'Other Livestock',
};

const sellCategories = [
    { id: 'cattle', name: 'Cattle', icon: '🐄' },
    { id: 'goats', name: 'Goats & Sheep', icon: '🐐' },
    { id: 'poultry', name: 'Poultry', icon: '🐔' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
    { id: 'others', name: 'Others', icon: '🐾' },
];

/**
 * Category-specific detail fields for the Sell form.
 *
 * A single fixed set of fields asked every seller for Milk Yield — meaningless
 * for poultry, fish and rabbits — while never asking a poultry seller the things
 * that actually price a lot (bird count, layer vs broiler, eggs/day). Each
 * category now declares its own fields, and both rendering and validation are
 * driven off this one table.
 */
type SellField = {
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'select';
    options?: string[];
};

const CATEGORY_FIELDS: Record<string, SellField[]> = {
    cattle: [
        { key: 'breed', label: 'Breed', placeholder: 'e.g. Gir', required: true },
        { key: 'age', label: 'Age', placeholder: 'e.g. 3 Years', required: true },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Female (Cow)', 'Male (Bull)', 'Calf'] },
        { key: 'milkYield', label: 'Milk Yield (L/day)', placeholder: 'e.g. 12' },
        { key: 'lactation', label: 'Lactation No.', placeholder: 'e.g. 2' },
        { key: 'weight', label: 'Weight (Kg)', placeholder: 'e.g. 450' },
        { key: 'quantity', label: 'Quantity (Heads)', placeholder: 'e.g. 1' },
    ],
    goats: [
        { key: 'breed', label: 'Breed', placeholder: 'e.g. Osmanabadi', required: true },
        { key: 'age', label: 'Age', placeholder: 'e.g. 2 Years', required: true },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Female', 'Male', 'Mixed Lot'] },
        { key: 'weight', label: 'Weight (Kg)', placeholder: 'e.g. 35' },
        { key: 'quantity', label: 'Quantity (Heads)', placeholder: 'e.g. 2', required: true },
    ],
    poultry: [
        { key: 'breed', label: 'Breed / Variety', placeholder: 'e.g. Kadaknath', required: true },
        { key: 'birdType', label: 'Bird Type', type: 'select', options: ['Layer', 'Broiler', 'Desi / Country', 'Breeder', 'Chicks'], required: true },
        { key: 'age', label: 'Age', placeholder: 'e.g. 6 Months', required: true },
        { key: 'quantity', label: 'Quantity (Birds)', placeholder: 'e.g. 50', required: true },
        { key: 'eggsPerDay', label: 'Eggs / Day', placeholder: 'e.g. 40' },
        { key: 'avgWeight', label: 'Avg Weight (Kg)', placeholder: 'e.g. 1.8' },
    ],
    fish: [
        { key: 'species', label: 'Species', placeholder: 'e.g. Rohu', required: true },
        { key: 'stage', label: 'Stage', type: 'select', options: ['Spawn', 'Fry', 'Fingerling', 'Juvenile', 'Table Size'], required: true },
        { key: 'quantity', label: 'Quantity (Pieces)', placeholder: 'e.g. 10000', required: true },
        { key: 'avgWeight', label: 'Avg Weight (g)', placeholder: 'e.g. 50' },
    ],
    others: [
        { key: 'animalType', label: 'Animal Type', placeholder: 'e.g. Rabbit', required: true },
        { key: 'breed', label: 'Breed', placeholder: 'e.g. White Giant' },
        { key: 'age', label: 'Age', placeholder: 'e.g. 6 Months' },
        { key: 'quantity', label: 'Quantity', placeholder: 'e.g. 10' },
        { key: 'weight', label: 'Weight (Kg)', placeholder: 'e.g. 3' },
    ],
};

/** Title hint matched to the category, so the example is never a cow for a fish seller. */
const TITLE_PLACEHOLDER: Record<string, string> = {
    cattle: 'e.g. Pure Gir Cow',
    goats: 'e.g. Osmanabadi Goat Pair',
    poultry: 'e.g. Kadaknath Breeding Stock - 50 Birds',
    fish: 'e.g. Rohu Fingerlings - 10,000',
    others: 'e.g. White Giant Rabbits - 10 Pairs',
};

// useSearchParams must sit inside a Suspense boundary, or the production
// build fails to prerender this route.
export default function LivestockPage() {
    return (
        <Suspense fallback={null}>
            <LivestockBrowser />
        </Suspense>
    );
}

function LivestockBrowser() {
    const { t } = useLanguage();
    /**
     * `?tab=sell&category=cattle` — how the five livestock pages hand a seller
     * straight to the right form. They keep no form of their own, so this is
     * the only way in from there. An unknown category is ignored rather than
     * rejected: a stale link should open the form, not an error.
     */
    const searchParams = useSearchParams();
    const wantsSell = searchParams.get('tab') === 'sell';
    const wantsSellCategory = (() => {
        const c = searchParams.get('category');
        return c && sellCategories.some(s => s.id === c) ? c : '';
    })();
    // Opens on the listings, not the category grid: with the welcome modal
    // gone this is the first thing a farmer sees, and "what is for sale" is
    // the question they came with.
    const [activeTab, setActiveTab] = useState<TabType>(wantsSell ? 'sell' : 'buy');
    const [selectedCategory, setSelectedCategory] = useState<LivestockType | 'all'>('all');
    const [selectedSellCategory, setSelectedSellCategory] = useState(wantsSellCategory);
    /** Every livestock ad, of all five types — see the effect below. */
    const [ads, setAds] = useState<LivestockAd[]>([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [adsError, setAdsError] = useState<string | null>(null);
    const [sellSubmitting, setSellSubmitting] = useState(false);
    const [sellError, setSellError] = useState('');
    const [sellSuccess, setSellSuccess] = useState(false);
    const [sellFormErrors, setSellFormErrors] = useState<string[]>([]);
    const [sellForm, setSellForm] = useState({
        title: '',
        price: '',
        phone: '',
        location: '',
        district: '',
        state: '',
        description: '',
        imageFiles: [] as File[],
        /** Category-specific answers, keyed by CATEGORY_FIELDS[category][].key */
        specs: {} as Record<string, string>,
    });

    /** Fields for the chosen category; empty until one is picked. */
    const activeFields = CATEGORY_FIELDS[selectedSellCategory] ?? [];

    // Switching category swaps the questions, so previous answers no longer apply
    // (a poultry "Eggs/Day" must not survive into a Fish listing).
    const handleSellCategoryChange = (categoryId: string) => {
        if (categoryId === selectedSellCategory) return;
        setSelectedSellCategory(categoryId);
        setSellForm(p => ({ ...p, specs: {} }));
        setSellFormErrors([]);
    };

    const setSpec = (key: string, value: string) =>
        setSellForm(p => ({ ...p, specs: { ...p.specs, [key]: value } }));

    /**
     * The Buy tab reads the same ads the five sub-pages do, all five types at
     * once. It used to render a hardcoded empty array, so it showed "0
     * listings" and the empty state even when /home/livestock/poultry had ads
     * on it — the two pages disagreed about what was for sale.
     *
     * `reloadAds` also runs after a successful post, so a seller sees their own
     * animal in the grid instead of having to reload the page.
     */
    const reloadAds = useCallback(() => {
        setAdsLoading(true);
        return fetchLivestockListings('all')
            .then(res => { setAds(res.data); setAdsError(res.error ?? null); })
            .catch(() => setAdsError('Failed to load listings'))
            .finally(() => setAdsLoading(false));
    }, []);

    useEffect(() => {
        let cancelled = false;
        fetchLivestockListings('all')
            .then(res => {
                if (cancelled) return;
                setAds(res.data);
                setAdsError(res.error ?? null);
            })
            .catch(() => { if (!cancelled) setAdsError('Failed to load listings'); })
            .finally(() => { if (!cancelled) setAdsLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filteredListings = useMemo(
        () => (selectedCategory === 'all' ? ads : ads.filter(a => a.type === selectedCategory)),
        [ads, selectedCategory]
    );

    const validateSellForm = (): boolean => {
        const errs: string[] = [];
        if (!selectedSellCategory) errs.push('Please select a category');
        if (!sellForm.title.trim()) errs.push('Title is required');
        // Required detail fields come from the category's own spec.
        for (const field of activeFields) {
            if (field.required && !(sellForm.specs[field.key] ?? '').trim()) {
                errs.push(`${field.label} is required`);
            }
        }
        if (!sellForm.price.trim()) errs.push('Price is required');
        if (sellForm.phone.replace(/D/g, '').length !== 10) {
            errs.push('Enter a valid 10-digit phone number');
        }
        if (!sellForm.location.trim()) errs.push('Location is required');
        if (!sellForm.district.trim()) errs.push('District is required');
        if (!sellForm.state) errs.push('State is required');
        setSellFormErrors(errs);
        return errs.length === 0;
    };

    const handleSellSubmit = async () => {
        if (!validateSellForm()) return;
        setSellSubmitting(true);
        setSellError('');

        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                setSellError('Please log in to list your livestock');
                setSellSubmitting(false);
                return;
            }

            let imageUrls: string[] = [];
            if (sellForm.imageFiles.length > 0) {
                imageUrls = await uploadListingImages(authUser.id, sellForm.imageFiles);
            }

            const priceNum = Number(sellForm.price.replace(/,/g, ''));
            const { error } = await createListing({
                user_id: authUser.id,
                listing_type: 'livestock',
                // See DB_SUBCATEGORY — 'cattle' is not a value this column accepts.
                category: 'animals',
                subcategory: DB_SUBCATEGORY[selectedSellCategory] ?? 'Other Livestock',
                title: sellForm.title,
                description: sellForm.description,
                price: priceNum,
                contact_phone: sellForm.phone.replace(/D/g, ''),
                location: sellForm.location,
                district: sellForm.district,
                state: sellForm.state,
                images: imageUrls,
                // Only the fields this category actually asked for, blanks dropped.
                specs: {
                    // The page's own category id, kept because DB_SUBCATEGORY
                    // is lossy: 'cattle' covers both cows and buffalo.
                    livestock_type: selectedSellCategory,
                    ...Object.fromEntries(
                        activeFields
                            .map(f => [f.key, (sellForm.specs[f.key] ?? '').trim()])
                            .filter(([, value]) => value !== '')
                    ),
                },
            });

            if (error) {
                setSellError(error);
            } else {
                setSellSuccess(true);
                // So "Browse Listings" from the success screen shows the animal
                // just posted rather than the grid as it was on page load.
                void reloadAds();
            }
        } catch (err) {
            setSellError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setSellSubmitting(false);
        }
    };



    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                                    {t('livestockPage.title')} <span className="text-primary">{t('livestockPage.titleHighlight')}</span>
                                </h1>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                                    {t('livestockPage.subtitle')}
                                </p>
                            </div>
                            <NearbyLocation />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
                        {tabs.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`relative flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 p-2.5 md:p-4 rounded-lg md:rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'}`}>
                                {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 md:w-8 h-1 bg-primary rounded-full" />}
                                <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <span className={`material-symbols-outlined text-lg md:text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                                </div>
                                <p className={`font-bold text-xs md:text-sm text-center md:text-left leading-tight ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{t(tab.titleKey)}</p>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="min-h-[500px]">
                        {/* Browse Categories Tab */}
                        {activeTab === 'browse' && (
                            <div className="animate-fadeIn">
                                {/* Categories */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-8 md:mb-10">
                                    {categories.map((category) => (
                                        <Link key={category.id} href={category.path}
                                            className="group relative rounded-lg md:rounded-2xl p-2 md:p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden bg-[#d4edda] dark:bg-emerald-900/30">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 md:w-20 h-16 md:h-20 rounded-lg md:rounded-2xl bg-[#c8e6c9] dark:bg-emerald-800/50 flex items-center justify-center mb-2 md:mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                                    <img src={category.image} alt={t(category.nameKey)} className="w-full h-full object-cover rounded-lg md:rounded-xl" />
                                                </div>
                                                {/* No listing count: the numbers that used to sit here
                                                    were invented and bore no relation to the ads posted. */}
                                                <h3 className="font-bold text-gray-900 dark:text-white text-center text-xs md:text-sm">{t(category.nameKey)}</h3>
                                            </div>
                                            <div className="absolute bottom-1 md:bottom-3 right-1 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-primary text-base md:text-lg">arrow_forward</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* The Featured strip is gone with the seeded ads it
                                    rendered: nothing marks a real listing as featured,
                                    so it was a starred heading over a permanently
                                    empty grid. */}

                                {/* The stats bar was removed: "5,000+ verified sellers",
                                    "25,000+ animals listed", "10,000+ successful trades",
                                    "500+ districts covered" were hardcoded marketing figures, not
                                    anything measured — and with the seeded listings gone they sat
                                    directly above an empty marketplace. The services page dropped
                                    its equivalent block for the same reason. Recover from git
                                    history if these ever become real numbers. */}
                            </div>
                        )}

                        {/* Buy Tab */}
                        {activeTab === 'buy' && (
                            <div className="animate-fadeIn">
                                {/* All Listings */}
                                <div className="pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-3 md:mb-4">All Listings</h2>

                                    {/* Category Filters */}
                                    <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
                                        {categoryFilters.map((cat) => (
                                            <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                                                className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${selectedCategory === cat.value ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                                                {t(cat.key)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mb-4 md:mb-6">
                                        <p className="text-xs md:text-base text-gray-600 dark:text-gray-400">
                                            {t('livestockPage.showingListings').replace('{count}', String(filteredListings.length))}
                                        </p>
                                    </div>

                                    {/* Listings Grid, or the same empty state the
                                        Buy & Sell board shows — that is where the
                                        button lands, so the two should match.
                                        "Nothing posted" must wait for the fetch,
                                        or it flashes over ads that are on their way. */}
                                    {adsLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : adsError ? (
                                        <div className="text-center py-16 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">error</span>
                                            <p className="text-gray-500 font-medium px-6">{adsError}</p>
                                            <button
                                                onClick={() => { void reloadAds(); }}
                                                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110"
                                            >
                                                <span className="material-symbols-outlined text-lg">refresh</span>
                                                Try again
                                            </button>
                                        </div>
                                    ) : filteredListings.length === 0 ? (
                                        <div className="text-center py-16 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">pets</span>
                                            <p className="text-gray-500 font-medium px-6">
                                                No livestock here yet — be the first to post one.
                                            </p>
                                            <button
                                                onClick={() => setActiveTab('sell')}
                                                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110"
                                            >
                                                <span className="material-symbols-outlined text-lg">add</span>
                                                Post a Livestock
                                            </button>
                                        </div>
                                    ) : (
                                        <LivestockAdGrid ads={filteredListings} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sell Tab */}
                        {activeTab === 'sell' && (
                            <div className="animate-fadeIn max-w-3xl mx-auto">
                                {sellSuccess ? (
                                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="material-symbols-outlined text-3xl text-white">check</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Livestock Listed!</h2>
                                        <p className="text-sm text-gray-500 mb-6">Your listing is now active. Buyers can find it in the marketplace.</p>
                                        <div className="flex gap-3 justify-center">
                                            <button onClick={() => { setSellSuccess(false); setSellForm({ title: '', price: '', phone: '', location: '', district: '', state: '', description: '', imageFiles: [], specs: {} }); setSelectedSellCategory(''); }}
                                                className="px-6 py-3 rounded-xl bg-primary text-white font-bold">{t('livestockPage.listAnother')}</button>
                                            <button onClick={() => setActiveTab('buy')}
                                                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold">{t('livestockPage.browseMarket')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800">
                                        {/* The Sell chip used to double as the way back
                                            out of this form. With it gone, the form needs
                                            its own exit. */}
                                        <button
                                            onClick={() => setActiveTab('buy')}
                                            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                            {t('livestockPage.browseMarket')}
                                        </button>
                                        <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">{t('livestockPage.sellYourLivestock')}</h2>
                                        <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8">{t('livestockPage.sellYourLivestockDesc')}</p>

                                        {/* Category — a dropdown rather than the five icon
                                            tiles it used to be, so it reads as one field in
                                            a column of fields instead of a separate widget. */}
                                        <div className="mb-5 md:mb-6">
                                            <label htmlFor="livestock-category" className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Select Category *</label>
                                            <div className="relative">
                                                <select
                                                    id="livestock-category"
                                                    value={selectedSellCategory}
                                                    onChange={(e) => handleSellCategoryChange(e.target.value)}
                                                    className="w-full px-3 md:px-4 py-2 md:py-3 pr-9 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base appearance-none"
                                                >
                                                    <option value="">Select</option>
                                                    {sellCategories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                                    ))}
                                                </select>
                                                    <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xl">expand_more</span>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4 md:space-y-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Title *</label>
                                                    <input type="text" placeholder={TITLE_PLACEHOLDER[selectedSellCategory] || 'e.g. Pure Gir Cow'} value={sellForm.title} onChange={(e) => setSellForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Price (₹) *</label>
                                                    <input type="text" placeholder="e.g. 85000" value={sellForm.price} onChange={(e) => setSellForm(p => ({ ...p, price: e.target.value }))} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base" />
                                                </div>
                                            </div>

                                            {/* Category-specific details */}
                                            {!selectedSellCategory ? (
                                                <div className="flex items-center gap-2 px-3 md:px-4 py-3 rounded-lg md:rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs md:text-sm">
                                                    <span className="material-symbols-outlined text-lg">info</span>
                                                    Pick a category above to see the details we need for it.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {activeFields.map(field => (
                                                        <div key={field.key}>
                                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                                                                {field.label}{field.required ? ' *' : ''}
                                                            </label>
                                                            {field.type === 'select' ? (
                                                                <div className="relative">
                                                                    <select
                                                                        value={sellForm.specs[field.key] ?? ''}
                                                                        onChange={(e) => setSpec(field.key, e.target.value)}
                                                                        className="w-full px-3 md:px-4 py-2 md:py-3 pr-9 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base appearance-none"
                                                                    >
                                                                        <option value="">Select</option>
                                                                        {(field.options ?? []).map(opt => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                    <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xl">expand_more</span>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    placeholder={field.placeholder}
                                                                    value={sellForm.specs[field.key] ?? ''}
                                                                    onChange={(e) => setSpec(field.key, e.target.value)}
                                                                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    placeholder="10-digit number"
                                                    value={sellForm.phone}
                                                    onChange={(e) => setSellForm(p => ({ ...p, phone: e.target.value.replace(/D/g, '').slice(0, 10) }))}
                                                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base"
                                                />
                                                <p className="mt-1 text-[11px] text-gray-400">Buyers will call this number.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Location *</label>
                                                    <input type="text" placeholder="e.g. Rajkot" value={sellForm.location} onChange={(e) => setSellForm(p => ({ ...p, location: e.target.value }))} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">District *</label>
                                                    <input type="text" placeholder="e.g. Rajkot" value={sellForm.district} onChange={(e) => setSellForm(p => ({ ...p, district: e.target.value }))} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">State *</label>
                                                    <div className="relative">
                                                        <select value={sellForm.state} onChange={(e) => setSellForm(p => ({ ...p, state: e.target.value }))}
                                                            className="w-full px-3 md:px-4 py-2 md:py-3 pr-9 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base appearance-none">
                                                            <option value="">Select</option>
                                                            {['Maharashtra', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Karnataka', 'Rajasthan', 'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala'].map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                        <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xl">expand_more</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Description</label>
                                                <textarea placeholder="Describe your animal in detail..." rows={3} value={sellForm.description} onChange={(e) => setSellForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none text-sm md:text-base" />
                                            </div>
                                            <div>
                                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Photos</label>
                                                <div className="relative p-4 md:p-8 rounded-lg md:rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-center cursor-pointer hover:border-primary/50 transition-all">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files) {
                                                                setSellForm(p => ({ ...p, imageFiles: [...p.imageFiles, ...Array.from(e.target.files!)] }));
                                                            }
                                                        }}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <span className="material-symbols-outlined text-2xl md:text-4xl text-primary mb-1 md:mb-2 block">add_photo_alternate</span>
                                                    <p className="text-xs md:text-sm text-gray-500">Click to upload photos (max 5)</p>
                                                </div>
                                                {sellForm.imageFiles.length > 0 && (
                                                    <div className="mt-3 flex gap-2 flex-wrap">
                                                        {sellForm.imageFiles.map((img, idx) => (
                                                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                                                                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                                                <button onClick={() => setSellForm(p => ({ ...p, imageFiles: p.imageFiles.filter((_, i) => i !== idx) }))}
                                                                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-xs">close</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {(sellFormErrors.length > 0 || sellError) && (
                                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                    {sellError && <p className="text-sm text-red-600 flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{sellError}</p>}
                                                    {sellFormErrors.map((err, i) => (
                                                        <p key={i} className="text-sm text-red-600 flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{err}</p>
                                                    ))}
                                                </div>
                                            )}

                                            <button onClick={handleSellSubmit} disabled={sellSubmitting}
                                                className={`w-full py-2.5 md:py-4 rounded-lg md:rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm md:text-lg hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 ${sellSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {sellSubmitting ? 'Submitting...' : <><span className="material-symbols-outlined">publish</span>Publish Listing</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* The contact and login modals that stood here belonged to
                        the seeded ListingCard. LivestockAdGrid owns both now, so
                        the Buy tab and the five type pages gate the seller's
                        number the same way. */}

                    {/* The "What would you like to do?" welcome modal was removed.
                        It interrupted every visit with a Buy/Sell/Skip choice before the
                        farmer had seen a single animal — and two of its three buttons only
                        switched a tab that is visible anyway. The page now opens straight
                        on the listings, with the empty state carrying the Post button when
                        there is nothing to show. */}
                </div>

                <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
            </div>
        </div>
    );
}

