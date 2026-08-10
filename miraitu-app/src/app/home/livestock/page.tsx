'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import NearbyLocation from '@/components/v2/NearbyLocation';
import MiraituLogo from '@/components/MiraituLogo';
import LoginModal from '@/components/auth/LoginModal';
import { uploadListingImages, createListing } from '@/lib/supabase-db';
import supabase from '@/lib/supabase';

type TabType = 'browse' | 'buy' | 'sell';

// Category data with real images
const categories = [
    { id: 'cattle', nameKey: 'livestock.cattle', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop', count: 245, path: '/home/livestock/cattle' },
    { id: 'goats-sheep', nameKey: 'livestock.goatsSheep', image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=200&h=200&fit=crop', count: 189, path: '/home/livestock/goats-sheep' },
    { id: 'poultry', nameKey: 'livestock.poultry', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&h=200&fit=crop', count: 312, path: '/home/livestock/poultry' },
    { id: 'fish', nameKey: 'livestock.fishAquaculture', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=200&h=200&fit=crop', count: 156, path: '/home/livestock/fish' },
    { id: 'others', nameKey: 'livestock.others', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop', count: 78, path: '/home/livestock/others' },
];

const tabs = [
    { id: 'browse' as TabType, titleKey: 'livestockPage.browse', icon: 'category', bgColor: 'bg-blue-500' },
    { id: 'buy' as TabType, titleKey: 'livestockPage.buy', icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, titleKey: 'livestockPage.sell', icon: 'sell', bgColor: 'bg-orange-500' },
];

// Featured listings
const featuredListings = [
    { id: 101, name: 'Premium Gir Cow', category: 'Cattle', breed: 'Gir', age: '3 Years', milkYield: '14 L/day', price: '₹95,000', location: 'Rajkot, Gujarat', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: true, seller: 'Shyam Patel', phone: '+91 99887 76655', featured: true },
    { id: 102, name: 'Murrah Buffalo Pair', category: 'Cattle', breed: 'Murrah', age: '4 Years', milkYield: '18 L/day', price: '₹2,40,000', location: 'Karnal, Haryana', image: 'https://images.unsplash.com/photo-1619452104266-0d23df2119ac?w=400&h=300&fit=crop', verified: true, seller: 'Hardev Singh', phone: '+91 88776 65544', featured: true },
    { id: 103, name: 'Kadaknath Breeding Stock', category: 'Poultry', breed: 'Kadaknath', age: '1 Year', milkYield: '-', price: '₹12,000', location: 'Jhabua, MP', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', verified: true, seller: 'Mohan Bhil', phone: '+91 77665 54433', featured: true },
];

const allListings = [
    { id: 1, name: 'Pure Gir Cow', category: 'Cattle', breed: 'Gir', age: '4 Years', milkYield: '12 L/day', price: '₹85,000', location: 'Rajkot, Gujarat', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: true, seller: 'Ramesh Patel', phone: '+91 98765 43210' },
    { id: 2, name: 'Murrah Buffalo', category: 'Cattle', breed: 'Murrah', age: '5 Years', milkYield: '15 L/day', price: '₹1,20,000', location: 'Karnal, Haryana', image: 'https://images.unsplash.com/photo-1619452104266-0d23df2119ac?w=400&h=300&fit=crop', verified: true, seller: 'Sukhdev Singh', phone: '+91 87654 32109' },
    { id: 3, name: 'Osmanabadi Goat Pair', category: 'Goats & Sheep', breed: 'Osmanabadi', age: '2 Years', milkYield: '-', price: '₹25,000', location: 'Osmanabad, Maharashtra', image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=400&h=300&fit=crop', verified: false, seller: 'Vijay Jadhav', phone: '+91 76543 21098' },
    { id: 4, name: 'Country Chicken - 50 Birds', category: 'Poultry', breed: 'Country', age: '6 Months', milkYield: '-', price: '₹15,000', location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', verified: true, seller: 'Murugan K', phone: '+91 65432 10987' },
    { id: 5, name: 'Rabbits - 10 Pairs', category: 'Others', breed: 'White Giant', age: '6 Months', milkYield: '-', price: '₹8,000', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', verified: true, seller: 'Amit Kulkarni', phone: '+91 54321 09876' },
    { id: 6, name: 'Rohu Fingerlings - 10000', category: 'Fish', breed: 'Rohu', age: 'Fresh', milkYield: '-', price: '₹25,000', location: 'Kolkata, WB', image: 'https://images.unsplash.com/photo-1731552466988-26d1dbeff4ee?w=400&h=300&fit=crop', verified: false, seller: 'Pranab Das', phone: '+91 43210 98765' },
    { id: 7, name: 'Sahiwal Cow', category: 'Cattle', breed: 'Sahiwal', age: '3 Years', milkYield: '10 L/day', price: '₹75,000', location: 'Amritsar, Punjab', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=300&fit=crop', verified: true, seller: 'Gurpreet Kaur', phone: '+91 32109 87654' },
    { id: 8, name: 'Layer Hens - 100 Birds', category: 'Poultry', breed: 'Layer', age: '8 Months', milkYield: '-', price: '₹35,000', location: 'Namakkal, TN', image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=400&h=300&fit=crop', verified: true, seller: 'Selvam R', phone: '+91 21098 76543' },
];

const categoryFilters = [
    { value: 'All', key: 'common.all' },
    { value: 'Cattle', key: 'livestock.cattle' },
    { value: 'Goats & Sheep', key: 'livestock.goatsSheep' },
    { value: 'Poultry', key: 'livestock.poultry' },
    { value: 'Fish', key: 'livestock.fish' },
    { value: 'Others', key: 'livestock.others' },
];

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

export default function LivestockPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('browse');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSellCategory, setSelectedSellCategory] = useState('');
    const [contactModal, setContactModal] = useState<{ open: boolean; seller: string; phone: string } | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingContact, setPendingContact] = useState<{ seller: string; phone: string } | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(true);
    const [sellSubmitting, setSellSubmitting] = useState(false);
    const [sellError, setSellError] = useState('');
    const [sellSuccess, setSellSuccess] = useState(false);
    const [sellFormErrors, setSellFormErrors] = useState<string[]>([]);
    const [sellForm, setSellForm] = useState({
        title: '',
        price: '',
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

    // Auth context
    const { user } = useAuth();

    // Effect to handle post-login action
    useEffect(() => {
        if (user && pendingContact) {
            setContactModal({ open: true, ...pendingContact });
            setPendingContact(null);
            setShowLoginModal(false);
        }
    }, [user, pendingContact]);

    const filteredListings = selectedCategory === 'All' ? allListings : allListings.filter(l => l.category === selectedCategory);

    const translateAge = (age: string) =>
        age
            .replace(/\bYears\b/g, t('common.years'))
            .replace(/\bYear\b/g, t('common.year'))
            .replace(/\bMonths\b/g, t('common.months'))
            .replace(/\bMonth\b/g, t('common.month'))
            .replace(/\bFresh\b/g, t('common.fresh'));

    const translateMilkYield = (my: string) =>
        my.replace('L/day', t('common.lperday'));

    const handleContactClick = (seller: string, phone: string) => {
        if (user) {
            setContactModal({ open: true, seller, phone });
        } else {
            setPendingContact({ seller, phone });
            setShowLoginModal(true);
        }
    };

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
                category: selectedSellCategory,
                title: sellForm.title,
                description: sellForm.description,
                price: priceNum,
                location: sellForm.location,
                district: sellForm.district,
                state: sellForm.state,
                images: imageUrls,
                // Only the fields this category actually asked for, blanks dropped.
                specs: Object.fromEntries(
                    activeFields
                        .map(f => [f.key, (sellForm.specs[f.key] ?? '').trim()])
                        .filter(([, value]) => value !== '')
                ),
            });

            if (error) {
                setSellError(error);
            } else {
                setSellSuccess(true);
            }
        } catch (err) {
            setSellError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setSellSubmitting(false);
        }
    };


    // Listing Card Component
    const ListingCard = ({ listing, showFeaturedBadge = false }: { listing: typeof allListings[0], showFeaturedBadge?: boolean }) => (
        <div className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img src={listing.image} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {listing.verified && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span>{t('common.verified')}
                    </div>
                )}
                {showFeaturedBadge && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">star</span>{t('common.featured')}
                    </div>
                )}
                {!showFeaturedBadge && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 text-xs font-semibold">{listing.category}</div>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white">{listing.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{listing.breed}</span>
                    <span>•</span><span>{translateAge(listing.age)}</span>
                    {listing.milkYield !== '-' && <><span>•</span><span>{translateMilkYield(listing.milkYield)}</span></>}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-lg font-bold text-primary">{listing.price}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {listing.location.split(',')[0]}
                    </p>
                </div>
                {/* Contact Button */}
                <button
                    onClick={() => handleContactClick(listing.seller, listing.phone)}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                    <span className="material-symbols-outlined text-lg">call</span>
                    {t('livestockPage.contactSeller')}
                </button>
            </div>
        </div>
    );

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
                                                <h3 className="font-bold text-gray-900 dark:text-white text-center text-xs md:text-sm mb-1">{t(category.nameKey)}</h3>
                                                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 text-center">{category.count} {t('common.listings')}</p>
                                            </div>
                                            <div className="absolute bottom-1 md:bottom-3 right-1 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-primary text-base md:text-lg">arrow_forward</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* {t('livestockPage.featured')} */}
                                <div className="mb-8 md:mb-10">
                                    <div className="flex items-center gap-2 mb-3 md:mb-6">
                                        <span className="material-symbols-outlined text-amber-500 text-lg md:text-xl">star</span>
                                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('livestockPage.featured')}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        {featuredListings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} showFeaturedBadge={true} />
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
                                        <div>
                                            <div className="w-10 md:w-14 h-10 md:h-14 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg md:text-2xl">verified_user</span>
                                            </div>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">5,000+</p>
                                            <p className="text-xs md:text-sm text-gray-500">{t('livestockPage.verifiedSellers')}</p>
                                        </div>
                                        <div>
                                            <div className="w-10 md:w-14 h-10 md:h-14 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg md:text-2xl">pets</span>
                                            </div>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">25,000+</p>
                                            <p className="text-xs md:text-sm text-gray-500">{t('livestockPage.animalsListed')}</p>
                                        </div>
                                        <div>
                                            <div className="w-10 md:w-14 h-10 md:h-14 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg md:text-2xl">handshake</span>
                                            </div>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">10,000+</p>
                                            <p className="text-xs md:text-sm text-gray-500">{t('livestockPage.successfulTrades')}</p>
                                        </div>
                                        <div>
                                            <div className="w-10 md:w-14 h-10 md:h-14 mx-auto mb-2 md:mb-3 rounded-lg md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-lg md:text-2xl">location_on</span>
                                            </div>
                                            <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                                            <p className="text-xs md:text-sm text-gray-500">{t('livestockPage.districtsCovered')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buy Tab */}
                        {activeTab === 'buy' && (
                            <div className="animate-fadeIn">
                                {/* Featured Section */}
                                <div className="mb-6 md:mb-8">
                                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                                        <span className="material-symbols-outlined text-amber-500 text-lg md:text-xl">star</span>
                                        <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">{t('livestockPage.featured')}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        {featuredListings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} showFeaturedBadge={true} />
                                        ))}
                                    </div>
                                </div>

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

                                    {/* Listings Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                        {filteredListings.map((listing) => (
                                            <ListingCard key={listing.id} listing={listing} />
                                        ))}
                                    </div>
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
                                            <button onClick={() => { setSellSuccess(false); setSellForm({ title: '', price: '', location: '', district: '', state: '', description: '', imageFiles: [], specs: {} }); setSelectedSellCategory(''); }}
                                                className="px-6 py-3 rounded-xl bg-primary text-white font-bold">{t('livestockPage.listAnother')}</button>
                                            <button onClick={() => setActiveTab('buy')}
                                                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold">{t('livestockPage.browseMarket')}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800">
                                        <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">{t('livestockPage.sellYourLivestock')}</h2>
                                        <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8">{t('livestockPage.sellYourLivestockDesc')}</p>

                                        {/* Category Selection */}
                                        <div className="mb-6 md:mb-8">
                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 md:mb-4">Select Category *</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                                                {sellCategories.map((cat) => (
                                                    <button key={cat.id} onClick={() => handleSellCategoryChange(cat.id)}
                                                        className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 text-center transition-all ${selectedSellCategory === cat.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'}`}>
                                                        <span className="text-xl md:text-2xl mb-0.5 md:mb-1 block">{cat.icon}</span>
                                                        <span className={`text-[10px] md:text-xs font-semibold line-clamp-2 ${selectedSellCategory === cat.id ? 'text-primary' : 'text-gray-600'}`}>{cat.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-4 md:space-y-5">
                                            <div className="grid grid-cols-2 gap-2 md:gap-4">
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
                                                <div className="grid grid-cols-2 gap-2 md:gap-4">
                                                    {activeFields.map(field => (
                                                        <div key={field.key}>
                                                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                                                                {field.label}{field.required ? ' *' : ''}
                                                            </label>
                                                            {field.type === 'select' ? (
                                                                <select
                                                                    value={sellForm.specs[field.key] ?? ''}
                                                                    onChange={(e) => setSpec(field.key, e.target.value)}
                                                                    className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base appearance-none"
                                                                >
                                                                    <option value="">Select</option>
                                                                    {(field.options ?? []).map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
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
                                            <div className="grid grid-cols-3 gap-2 md:gap-4">
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
                                                    <select value={sellForm.state} onChange={(e) => setSellForm(p => ({ ...p, state: e.target.value }))}
                                                        className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-sm md:text-base appearance-none">
                                                        <option value="">Select</option>
                                                        {['Maharashtra', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Karnataka', 'Rajasthan', 'Gujarat', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala'].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
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

                    {/* Contact Modal (only shows if logged in) */}
                    {contactModal?.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setContactModal(null)}>
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                            <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setContactModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl">call</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Seller</h3>
                                    <p className="text-gray-500 mb-4">{contactModal.seller}</p>
                                    <div className="flex flex-col gap-3">
                                        <a href={`tel:${contactModal.phone}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                            <span className="material-symbols-outlined">call</span>
                                            Call {contactModal.phone}
                                        </a>
                                        <a href={`https://wa.me/${contactModal.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            Chat on WhatsApp
                                        </a>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-4">Choose how you want to contact the seller</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* New "Welcome Back" Login Modal */}
                    <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

                    {/* Livestock Welcome Modal - shows on page load */}
                    {showWelcomeModal && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowWelcomeModal(false)}
                            style={{ animation: 'fadeIn 0.2s ease-out' }}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                            <div
                                className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-0 max-w-md w-full shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                style={{ animation: 'zoomIn95 0.3s ease-out' }}
                            >
                                {/* Modal Header */}
                                <div className="relative h-44 overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&h=300&fit=crop"
                                        alt="Livestock"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <button
                                        onClick={() => setShowWelcomeModal(false)}
                                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 rounded-full p-1.5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                    <div className="absolute bottom-4 left-6">
                                        <h3 className="text-2xl font-black text-white">{t('livestockPage.title')} {t('livestockPage.titleHighlight')}</h3>
                                        <p className="text-white/70 text-sm">{t('livestockPage.modalSubtitle')}</p>
                                    </div>
                                </div>

                                {/* Action Options */}
                                <div className="p-6 space-y-3">
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">{t('livestockPage.whatToDo')}</p>

                                    <button
                                        onClick={() => { setActiveTab('buy'); setShowWelcomeModal(false); }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group/opt text-left"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-3xl">shopping_cart</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{t('livestockPage.buy')}</p>
                                            <p className="text-xs text-gray-500">{t('livestockPage.buyDesc')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                    </button>

                                    <button
                                        onClick={() => { setActiveTab('sell'); setShowWelcomeModal(false); }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group/opt text-left"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-3xl">sell</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{t('livestockPage.sell')}</p>
                                            <p className="text-xs text-gray-500">{t('livestockPage.sellModalDesc')}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                    </button>

                                    <button
                                        onClick={() => setShowWelcomeModal(false)}
                                        className="w-full text-center text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pt-2 transition-colors"
                                    >
                                        {t('livestockPage.skipBrowse')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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

