'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import NearbyLocation from '@/components/v2/NearbyLocation';

// Category data with real images
const categories = [
    {
        id: 'tractors',
        name: 'Tractors',
        cardTitle: 'Tractors',
        cardSubtitle: '450+ Units Available',
        description: 'Powerful farming tractors for all field operations',
        image: '/images/machinery/tractor-real.jpg',
        count: 245,
        path: '/home/machinery/tractors',
    },
    {
        id: 'jcb',
        name: 'JCB',
        cardTitle: 'JCBs',
        cardSubtitle: '120+ Heavy Duty',
        description: 'Heavy-duty construction & earthmoving equipment',
        image: '/images/machinery/jcb-real.png',
        count: 78,
        path: '/home/machinery/jcb',
    },
    {
        id: 'small-machineries',
        name: 'Small Machineries',
        cardTitle: 'Small Machineries',
        cardSubtitle: 'Versatile Solutions',
        description: 'Compact power tillers & cultivators',
        image: '/images/machinery/small-machinery-real.png',
        count: 156,
        path: '/home/machinery/small-machineries',
    },
    {
        id: 'implements',
        name: 'Implements',
        cardTitle: 'Implements',
        cardSubtitle: 'Soil Management',
        description: 'Ploughs, harrows & tractor attachments',
        image: '/images/machinery/implants-real.png',
        count: 312,
        path: '/home/machinery/implements',
    },
    {
        id: 'harvesters',
        name: 'Harvesters',
        cardTitle: 'Harvesters',
        cardSubtitle: 'Harvest Tech',
        description: 'Combine harvesters for efficient crop harvesting',
        image: '/images/machinery/harvester-real.png',
        count: 64,
        path: '/home/machinery/harvesters',
    },
    {
        id: 'drones',
        name: 'Agri Drones',
        cardTitle: 'Agri-Drones',
        cardSubtitle: 'Next-Gen Spraying',
        description: 'Agricultural drones for spraying & monitoring',
        image: '/images/machinery/drone-real.png',
        count: 42,
        path: '/home/machinery/drones',
    },
];

const featuredMachinery = [
    {
        id: 1,
        name: 'Mahindra Yuvo 575 DI',
        category: 'Tractor',
        specs: '45 HP • 4 Cylinder • 4WD',
        price: '₹7,20,000',
        image: '/images/machinery/tractorr-1.png',
        brand: 'Mahindra',
        hp: '45',
        type: 'new'
    },
    {
        id: 2,
        name: 'JCB 3DX Super',
        category: 'JCB',
        specs: '76 HP • Backhoe Loader',
        price: '₹28,50,000',
        image: '/images/machinery/featured-jcb.jpg',
        brand: 'JCB',
        hp: '76',
        type: 'new'
    },
    {
        id: 3,
        name: 'Swaraj 744 FE',
        category: 'Tractor',
        specs: '48 HP • 3 Cylinder • 2WD',
        price: '₹6,80,000',
        image: '/images/machinery/banners/swaraj-target.jpg',
        brand: 'Swaraj',
        hp: '48',
        type: 'new'
    },
    {
        id: 4,
        name: 'VST Shakti Power Tiller',
        category: 'Small Machinery',
        specs: '9.5 HP • Diesel • Rotary Tiller',
        price: '₹1,45,000',
        image: '/images/machinery/featured-power-tiller.jpg',
        brand: 'VST Shakti',
        hp: '9.5',
        type: 'new'
    },
    {
        id: 5,
        name: 'Kubota DC-70G Plus',
        category: 'Harvester',
        specs: '70 HP • 4-Row • Grain Tank 1200L',
        price: '₹14,50,000',
        image: '/images/machinery/featured-harvester.jpg',
        brand: 'Kubota',
        hp: '70',
        type: 'new'
    },
    {
        id: 6,
        name: 'Fieldstar Disc Harrow',
        category: 'Implement',
        specs: '16 Discs • Heavy Duty • Mounted',
        price: '₹55,000',
        image: '/images/machinery/harrow.png',
        brand: 'Fieldstar',
        type: 'new'
    }
];


export default function MachineryPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [hpRange, setHpRange] = useState([0, 1000]);
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalCategory, setModalCategory] = useState<typeof categories[0] | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Extract unique brands from data
    const allBrands = Array.from(new Set(featuredMachinery.map((m) => m.brand))).sort();

    // Category name mapping: filter label → data category values
    const categoryMap: Record<string, string[]> = {
        Tractors: ['Tractor'],
        Harvesters: ['Harvester'],
        JCB: ['JCB'],
        'Small Machineries': ['Small Machinery'],
        Implements: ['Implement'],
        Drones: ['Drone'],
    };

    const filterCategories = Object.keys(categoryMap);

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    // Apply filters
    const filteredMachinery = featuredMachinery.filter((item) => {
        // Category filter
        if (selectedCategories.length > 0) {
            const allowedCategories = selectedCategories.flatMap((c) => categoryMap[c] || []);
            if (!allowedCategories.includes(item.category)) return false;
        }
        // HP filter
        if (item.hp) {
            const hp = parseFloat(item.hp);
            if (!isNaN(hp) && (hp < hpRange[0] || hp > hpRange[1])) return false;
        }
        // Brand filter
        if (selectedBrand !== 'All Brands' && item.brand !== selectedBrand) return false;
        return true;
    });

    // Manage overflow and hide other elements when modal is open
    useEffect(() => {
        if (showFilterModal) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            // Hide header
            const header = document.querySelector('header');
            if (header) header.style.display = 'none';
            // Hide bottom nav
            const bottomNav = document.querySelector('nav');
            if (bottomNav) bottomNav.style.display = 'none';

            // Hide WhatsApp icon with specific z-50 class
            const whatsappIcon = document.querySelector('.fixed.z-50.flex.flex-col.items-end.gap-4');
            if (whatsappIcon) {
                (whatsappIcon as any).style.zIndex = '-1';
                (whatsappIcon as any).style.pointerEvents = 'none';
            }
            // Also target by data attribute if available
            const whatsappByHref = document.querySelector('a[href*="wa.me"]');
            if (whatsappByHref) {
                (whatsappByHref as any).style.zIndex = '-1';
                (whatsappByHref as any).style.pointerEvents = 'none';
            }
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            // Show header
            const header = document.querySelector('header');
            if (header) header.style.display = '';
            // Show bottom nav
            const bottomNav = document.querySelector('nav');
            if (bottomNav) bottomNav.style.display = '';

            // Restore WhatsApp icon z-index
            const whatsappIcon = document.querySelector('.fixed.z-50.flex.flex-col.items-end.gap-4');
            if (whatsappIcon) {
                (whatsappIcon as any).style.zIndex = '';
                (whatsappIcon as any).style.pointerEvents = '';
            }
            // Restore by data attribute if available
            const whatsappByHref = document.querySelector('a[href*="wa.me"]');
            if (whatsappByHref) {
                (whatsappByHref as any).style.zIndex = '';
                (whatsappByHref as any).style.pointerEvents = '';
            }
        }
    }, [showFilterModal]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <div className="px-3 md:px-6 pb-12 py-6 md:py-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Hero Section with Category Cards */}
                    <div className="mb-8 md:mb-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Agricultural Machinery
                                </h1>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                                    Browse our comprehensive collection of farm equipment and machinery
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 min-w-0">
                                <Link
                                    href="/home/machinery/compare"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors shrink-0"
                                >
                                    <span className="material-symbols-outlined text-lg">compare_arrows</span>
                                    Compare
                                </Link>
                                <NearbyLocation />
                            </div>
                        </div>

                        {/* Category Cards */}
                        <div className="pb-2">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                {categories.map((category) => {
                                    // Tractors navigate directly to their page
                                    if (category.id === 'tractors') {
                                        return (
                                            <Link
                                                key={category.id}
                                                href={category.path}
                                                className="group relative aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/15 bg-gray-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                            >
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                                                <div className="absolute inset-x-0 bottom-1 md:bottom-1.5 z-10 p-3 md:p-4">
                                                    <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-black text-white leading-[1.08] tracking-tight drop-shadow pr-1 line-clamp-2">
                                                        {category.cardTitle}
                                                    </h3>
                                                    <p className="text-xs md:text-sm text-white/90 leading-tight mt-1 break-words line-clamp-2">
                                                        {category.cardSubtitle ?? `${category.count}+ units available`}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    }
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setModalCategory(category)}
                                            className="group relative aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/15 bg-gray-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                                        >
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                                            <div className="absolute inset-x-0 bottom-1 md:bottom-1.5 z-10 p-3 md:p-4">
                                                <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-black text-white leading-[1.08] tracking-tight drop-shadow pr-1 line-clamp-2">
                                                    {category.cardTitle}
                                                </h3>
                                                <p className="text-xs md:text-sm text-white/90 leading-tight mt-1 break-words line-clamp-2">
                                                    {category.cardSubtitle ?? `${category.count}+ units available`}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Category Action Modal */}
                    {modalCategory && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={() => setModalCategory(null)}
                            style={{ animation: 'fadeIn 0.2s ease-out' }}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                            <div
                                className="relative bg-white dark:bg-[#1a231a] rounded-3xl max-w-md w-full shadow-2xl flex flex-col"
                                style={{ maxHeight: '90vh', animation: 'zoomIn95 0.3s ease-out' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header with Image - fixed height */}
                                <div className="relative h-32 overflow-hidden rounded-t-3xl shrink-0">
                                    <img
                                        src={modalCategory.image}
                                        alt={modalCategory.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                                    <button
                                        onClick={() => setModalCategory(null)}
                                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 rounded-full p-1.5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                    <div className="absolute bottom-4 left-6">
                                        <h3 className="text-2xl font-black text-white">{modalCategory.name}</h3>
                                        <p className="text-white/70 text-sm">{modalCategory.count} listings available</p>
                                    </div>
                                </div>

                                {/* Action Options - scrollable */}
                                <div className="overflow-y-auto p-4 pb-6">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">What would you like to do?</p>
                                    <div className="space-y-2">

                                        <Link
                                            href={`${modalCategory.path}/new`}
                                            onClick={() => setModalCategory(null)}
                                            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group/opt"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-white text-xl">add_circle</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">New {modalCategory.name}</p>
                                                <p className="text-xs text-gray-500">Browse brand new equipment</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-blue-500 group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                        </Link>

                                        <Link
                                            href={`${modalCategory.path}/buy`}
                                            onClick={() => setModalCategory(null)}
                                            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group/opt"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-white text-xl">shopping_cart</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Buy Used {modalCategory.name}</p>
                                                <p className="text-xs text-gray-500">Find pre-owned at great prices</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-emerald-500 group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                        </Link>

                                        <Link
                                            href={`${modalCategory.path}/sell`}
                                            onClick={() => setModalCategory(null)}
                                            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group/opt"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-white text-xl">sell</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Sell Used {modalCategory.name}</p>
                                                <p className="text-xs text-gray-500">List your equipment for sale</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-orange-500 group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                        </Link>

                                        <Link
                                            href={`${modalCategory.path}/rent`}
                                            onClick={() => setModalCategory(null)}
                                            className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group/opt"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-white text-xl">handshake</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Rent {modalCategory.name}</p>
                                                <p className="text-xs text-gray-500">Hire by the hour, day or season</p>
                                            </div>
                                            <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-gray-500 group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                        </Link>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Main Content Grid */}
                    <div className="flex gap-6 md:gap-8">
                        {/* Filters Sidebar - Hidden on Mobile */}
                        <div className="hidden md:block md:w-64 shrink-0">
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-32">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Refine Search</h3>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Category</label>
                                    <div className="space-y-2">
                                        {filterCategories.map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* HP Range Filter */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">HP Range</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={hpRange[1]}
                                        onChange={(e) => setHpRange([0, Number(e.target.value)])}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{hpRange[0]} HP</span>
                                        <span>{hpRange[1]} HP</span>
                                    </div>
                                </div>

                                {/* Brand Filter */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Brand</label>
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                    >
                                        <option>All Brands</option>
                                        {allBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Machinery Listings */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        Available Machinery
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500">({filteredMachinery.length} results)</p>
                                </div>

                                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                    {/* Filter Button - Mobile Only */}
                                    <button
                                        onClick={() => setShowFilterModal(true)}
                                        className="md:hidden flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-base md:text-lg">tune</span>
                                        <span className="text-xs md:text-sm">Filter</span>
                                    </button>

                                    {/* View Toggle */}
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-gray-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">grid_view</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                                ? 'bg-white dark:bg-gray-700 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">view_list</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <MachineryListing
                                items={filteredMachinery}
                                type="new"
                                viewMode={viewMode}
                            />
                        </div>
                    </div>

                    {/* Filter Modal - Mobile Only */}
                    {showFilterModal && (
                        <div
                            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[2rem] p-4 md:hidden bg-black/40 backdrop-blur-sm overflow-y-auto"
                            onClick={() => setShowFilterModal(false)}
                        >
                            <div
                                className="relative w-full max-w-md bg-white dark:bg-[#1a231a] rounded-3xl p-6 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Refine Search</h2>
                                    <button
                                        onClick={() => setShowFilterModal(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Category</label>
                                    <div className="space-y-3">
                                        {filterCategories.map((cat) => (
                                            <label key={cat} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat)}
                                                    onChange={() => toggleCategory(cat)}
                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* HP Range Filter */}
                                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">HP Range</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={hpRange[1]}
                                        onChange={(e) => setHpRange([0, Number(e.target.value)])}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-3">
                                        <span className="font-semibold">{hpRange[0]} HP</span>
                                        <span className="font-semibold">{hpRange[1]} HP</span>
                                    </div>
                                </div>

                                {/* Brand Filter */}
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Brand</label>
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
                                    >
                                        <option>All Brands</option>
                                        {allBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => {
                                            setSelectedCategories([]);
                                            setHpRange([0, 1000]);
                                            setSelectedBrand('All Brands');
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowFilterModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

