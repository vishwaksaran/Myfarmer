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
        description: 'Powerful farming tractors for all field operations',
        image: 'https://images.unsplash.com/photo-1605338756138-54285923e911?w=200&h=200&fit=crop',
        count: 245,
        path: '/home/machinery/tractors',
    },
    {
        id: 'jcb',
        name: 'JCB',
        description: 'Heavy-duty construction & earthmoving equipment',
        image: 'https://images.unsplash.com/photo-1621274403997-37aace184f49?w=200&h=200&fit=crop',
        count: 78,
        path: '/home/machinery/jcb',
    },
    {
        id: 'small-machineries',
        name: 'Small Machineries',
        description: 'Compact power tillers & cultivators',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=200&h=200&fit=crop',
        count: 156,
        path: '/home/machinery/small-machineries',
    },
    {
        id: 'implements',
        name: 'Implements',
        description: 'Ploughs, harrows & tractor attachments',
        image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&h=200&fit=crop',
        count: 312,
        path: '/home/machinery/implements',
    },
    {
        id: 'harvesters',
        name: 'Harvesters',
        description: 'Combine harvesters for efficient crop harvesting',
        image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?w=200&h=200&fit=crop',
        count: 64,
        path: '/home/machinery/harvesters',
    },
    {
        id: 'drones',
        name: 'Agri Drones',
        description: 'Agricultural drones for spraying & monitoring',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=200&fit=crop',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
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
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '76',
        type: 'new'
    },
    {
        id: 3,
        name: 'DJI Agras T40',
        category: 'Agri Drone',
        specs: '40L Tank • 10.8m Spray Width',
        price: '₹12,50,000',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop',
        brand: 'DJI',
        type: 'new'
    },
    {
        id: 4,
        name: 'Honda Power Tiller',
        category: 'Small Machinery',
        specs: '8.5 HP • Diesel • Rotary Tiller',
        price: '₹1,25,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Honda',
        hp: '8.5',
        type: 'new'
    },
    {
        id: 5,
        name: 'Kubota DC-70G Plus',
        category: 'Harvester',
        specs: '70 HP • 4-Row • Grain Tank 1200L',
        price: '₹14,50,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
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
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrP7cN8CTOtAkybDCL0QlIA-JizzfFm72xhbedX54SXeP4sbtxIadoSuijbGsc06AkXwxnUGnebgrcKT3PFZgziYLbXXBogmFMQ7xsAkpUYd5JPOZAaqHAfqbXgDQjkgbin1xqfhrWYaZKPOfumKTzC3EM3vOdwhqexqjl4m4-_9vRyI_ub_fWBU49A9oNMzlgBLNY7E9svHG0jZ7CBGCrA52KpkUC3qmlwTihE8bkTBp3_Z3WcD8yf3tzkKvKK6xIiZOPaQbOPyHC',
        brand: 'Fieldstar',
        type: 'new'
    }
];


export default function MachineryPage() {
    const [selectedCategory, setSelectedCategory] = useState('Tractors');
    const [hpRange, setHpRange] = useState([50, 1000]);
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalCategory, setModalCategory] = useState<typeof categories[0] | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

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
                            <div className="shrink-0">
                                <NearbyLocation />
                            </div>
                        </div>

                        {/* Category Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setModalCategory(category)}
                                    className="group relative rounded-lg md:rounded-2xl p-2 md:p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden bg-[#d4edda] dark:bg-emerald-900/30 text-left"
                                >
                                    {/* Image Container - uniform size with matching bg */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 md:w-20 h-12 md:h-20 rounded-lg md:rounded-2xl bg-[#c8e6c9] dark:bg-emerald-800/50 flex items-center justify-center mb-1.5 md:mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                            />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-center text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 text-center">
                                            {category.count} listings
                                        </p>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute bottom-1.5 md:bottom-3 right-1.5 md:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-primary text-base md:text-lg">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
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
                                className="relative bg-white dark:bg-[#1a231a] rounded-3xl p-0 max-w-md w-full shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                style={{ animation: 'zoomIn95 0.3s ease-out' }}
                            >
                                {/* Modal Header with Image */}
                                <div className="relative h-40 overflow-hidden">
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

                                {/* Action Options */}
                                <div className="p-6 space-y-3">
                                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">What would you like to do?</p>

                                    <Link
                                        href={`${modalCategory.path}/new`}
                                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group/opt"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-2xl">add_circle</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">New {modalCategory.name}</p>
                                            <p className="text-xs text-gray-500">Browse brand new equipment</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                    </Link>

                                    <Link
                                        href={`${modalCategory.path}/buy`}
                                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group/opt"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-2xl">shopping_cart</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">Buy Used {modalCategory.name}</p>
                                            <p className="text-xs text-gray-500">Find pre-owned at great prices</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                    </Link>

                                    <Link
                                        href={`${modalCategory.path}/sell`}
                                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group/opt"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-white text-2xl">sell</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">Sell Used {modalCategory.name}</p>
                                            <p className="text-xs text-gray-500">List your equipment for sale</p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400 group-hover/opt:text-primary group-hover/opt:translate-x-1 transition-all">arrow_forward</span>
                                    </Link>
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
                                        {['Tractors', 'Harvesters', 'Tillers'].map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === cat}
                                                    onChange={() => setSelectedCategory(cat)}
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
                                        min="50"
                                        max="1000"
                                        value={hpRange[1]}
                                        onChange={(e) => setHpRange([50, Number(e.target.value)])}
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
                                        <option>John Deere</option>
                                        <option>Mahindra</option>
                                        <option>Claas</option>
                                        <option>Kubota</option>
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
                                    <p className="text-xs md:text-sm text-gray-500">({featuredMachinery.length} results)</p>
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
                                items={featuredMachinery}
                                type="new"
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
                                        {['Tractors', 'Harvesters', 'Tillers'].map((cat) => (
                                            <label key={cat} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategory === cat}
                                                    onChange={() => setSelectedCategory(cat)}
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
                                        min="50"
                                        max="1000"
                                        value={hpRange[1]}
                                        onChange={(e) => setHpRange([50, Number(e.target.value)])}
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
                                        <option>John Deere</option>
                                        <option>Mahindra</option>
                                        <option>Claas</option>
                                        <option>Kubota</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('Tractors');
                                            setHpRange([50, 1000]);
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

