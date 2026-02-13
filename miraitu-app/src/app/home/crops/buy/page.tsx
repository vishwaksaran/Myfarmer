'use client';

import Link from 'next/link';
import { useState } from 'react';

const cropCategories = [
    {
        name: 'Food Grains',
        emoji: '🌾',
        color: 'from-amber-500 to-yellow-600',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-300',
        items: ['Rice', 'Wheat', 'Maize (Corn)', 'Barley', 'Millets (Jowar, Bajra, Ragi)']
    },
    {
        name: 'Pulses (Dal)',
        emoji: '🫘',
        color: 'from-orange-500 to-red-500',
        lightBg: 'bg-orange-50 dark:bg-orange-900/15',
        border: 'border-orange-200 dark:border-orange-800/40',
        text: 'text-orange-700 dark:text-orange-300',
        items: ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chana (Bengal Gram)', 'Masoor Dal']
    },
    {
        name: 'Oil Seeds',
        emoji: '🌻',
        color: 'from-yellow-500 to-amber-600',
        lightBg: 'bg-yellow-50 dark:bg-yellow-900/15',
        border: 'border-yellow-200 dark:border-yellow-800/40',
        text: 'text-yellow-700 dark:text-yellow-300',
        items: ['Groundnut', 'Sunflower', 'Mustard', 'Sesame (Til)', 'Soybean', 'Castor']
    },
    {
        name: 'Fruits',
        emoji: '🍎',
        color: 'from-red-500 to-pink-500',
        lightBg: 'bg-red-50 dark:bg-red-900/15',
        border: 'border-red-200 dark:border-red-800/40',
        text: 'text-red-700 dark:text-red-300',
        items: ['Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate', 'Papaya', 'Watermelon']
    },
    {
        name: 'Vegetables',
        emoji: '🥦',
        color: 'from-green-500 to-emerald-600',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Chilli', 'Cabbage', 'Cauliflower', 'Carrot', 'Beans']
    },
    {
        name: 'Spices & Condiments',
        emoji: '🌿',
        color: 'from-teal-500 to-emerald-600',
        lightBg: 'bg-teal-50 dark:bg-teal-900/15',
        border: 'border-teal-200 dark:border-teal-800/40',
        text: 'text-teal-700 dark:text-teal-300',
        items: ['Turmeric', 'Coriander', 'Cumin', 'Pepper', 'Cardamom', 'Cloves']
    },
    {
        name: 'Commercial / Cash Crops',
        emoji: '🌱',
        color: 'from-emerald-500 to-green-700',
        lightBg: 'bg-emerald-50 dark:bg-emerald-900/15',
        border: 'border-emerald-200 dark:border-emerald-800/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        items: ['Cotton', 'Sugarcane', 'Tobacco', 'Jute', 'Tea', 'Coffee']
    },
    {
        name: 'Fodder Crops',
        emoji: '🌾',
        color: 'from-lime-500 to-green-600',
        lightBg: 'bg-lime-50 dark:bg-lime-900/15',
        border: 'border-lime-200 dark:border-lime-800/40',
        text: 'text-lime-700 dark:text-lime-300',
        items: ['Napier Grass', 'Lucerne (Alfalfa)', 'Fodder Maize']
    },
    {
        name: 'Plantation Crops',
        emoji: '🌿',
        color: 'from-green-600 to-teal-700',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Coconut', 'Arecanut', 'Rubber']
    },
    {
        name: 'Flowers (Floriculture)',
        emoji: '🌸',
        color: 'from-pink-500 to-rose-600',
        lightBg: 'bg-pink-50 dark:bg-pink-900/15',
        border: 'border-pink-200 dark:border-pink-800/40',
        text: 'text-pink-700 dark:text-pink-300',
        items: ['Rose', 'Jasmine', 'Marigold', 'Lily']
    },
    {
        name: 'Cereals (Additional)',
        emoji: '🌾',
        color: 'from-amber-600 to-yellow-700',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-300',
        items: ['Oats', 'Rye', 'Foxtail Millet', 'Little Millet', 'Kodo Millet']
    },
    {
        name: 'Leafy Vegetables (Greens)',
        emoji: '🌿',
        color: 'from-green-500 to-lime-600',
        lightBg: 'bg-green-50 dark:bg-green-900/15',
        border: 'border-green-200 dark:border-green-800/40',
        text: 'text-green-700 dark:text-green-300',
        items: ['Spinach', 'Fenugreek Leaves (Methi)', 'Amaranthus', 'Curry Leaves', 'Coriander Leaves', 'Mint']
    },
    {
        name: 'Nuts & Dry Fruits',
        emoji: '🥜',
        color: 'from-amber-700 to-yellow-800',
        lightBg: 'bg-amber-50 dark:bg-amber-900/15',
        border: 'border-amber-200 dark:border-amber-800/40',
        text: 'text-amber-800 dark:text-amber-300',
        items: ['Almond', 'Cashew', 'Walnut', 'Pistachio', 'Dates']
    },
    {
        name: 'Root & Tuber Crops',
        emoji: '🥔',
        color: 'from-yellow-700 to-orange-700',
        lightBg: 'bg-yellow-50 dark:bg-yellow-900/15',
        border: 'border-yellow-200 dark:border-yellow-800/40',
        text: 'text-yellow-800 dark:text-yellow-300',
        items: ['Sweet Potato', 'Tapioca (Cassava)', 'Yam', 'Beetroot', 'Radish']
    },
    {
        name: 'Exotic / High-Value Crops',
        emoji: '🍄',
        color: 'from-purple-500 to-indigo-600',
        lightBg: 'bg-purple-50 dark:bg-purple-900/15',
        border: 'border-purple-200 dark:border-purple-800/40',
        text: 'text-purple-700 dark:text-purple-300',
        items: ['Mushroom', 'Broccoli', 'Zucchini', 'Cherry Tomato', 'Dragon Fruit', 'Avocado']
    },
    {
        name: 'Medicinal & Herbal Crops',
        emoji: '🌿',
        color: 'from-teal-600 to-cyan-700',
        lightBg: 'bg-teal-50 dark:bg-teal-900/15',
        border: 'border-teal-200 dark:border-teal-800/40',
        text: 'text-teal-700 dark:text-teal-300',
        items: ['Aloe Vera', 'Ashwagandha', 'Tulsi', 'Lemongrass', 'Stevia']
    },
    {
        name: 'Fiber Crops',
        emoji: '🌾',
        color: 'from-stone-500 to-stone-700',
        lightBg: 'bg-stone-50 dark:bg-stone-900/15',
        border: 'border-stone-200 dark:border-stone-800/40',
        text: 'text-stone-700 dark:text-stone-300',
        items: ['Flax', 'Hemp', 'Banana Fiber']
    }
];

export default function BuyCropsPage() {
    const [search, setSearch] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const filteredCategories = cropCategories
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item =>
                item.toLowerCase().includes(search.toLowerCase())
            )
        }))
        .filter(cat =>
            search === '' ||
            cat.name.toLowerCase().includes(search.toLowerCase()) ||
            cat.items.length > 0
        );

    const totalCrops = cropCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d]">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-green-900">
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-8 md:py-14 relative z-10">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-bold hover:bg-white/20 transition-all mb-6 backdrop-blur-sm"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Crops
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Buy <span className="text-lime-300">Crops</span>
                    </h1>
                    <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mb-8">
                        Browse {totalCrops}+ varieties across {cropCategories.length} categories. Best prices, verified sellers.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl">search</span>
                        <input
                            type="text"
                            placeholder="Search for crops... e.g. Rice, Mango, Turmeric"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:bg-white/15 transition-all backdrop-blur-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Grid */}
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-10">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                    {[
                        { label: 'Total Categories', value: cropCategories.length.toString(), icon: 'category' },
                        { label: 'Crop Varieties', value: `${totalCrops}+`, icon: 'eco' },
                        { label: 'Verified Sellers', value: '5,200+', icon: 'verified' },
                        { label: 'Avg. Savings', value: '15-25%', icon: 'savings' }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-xl">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs font-semibold text-gray-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Category Cards */}
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">search_off</span>
                        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">No crops found</h3>
                        <p className="text-gray-400 text-sm">Try searching for something else</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCategories.map((cat) => {
                            const isExpanded = expandedCategory === cat.name;
                            const displayItems = search ? cat.items : (isExpanded ? cat.items : cat.items.slice(0, 4));
                            const hasMore = !search && cat.items.length > 4;

                            return (
                                <div
                                    key={cat.name}
                                    className={`group rounded-3xl border ${cat.border} ${cat.lightBg} p-5 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                    onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
                                >
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg`}>
                                                {cat.emoji}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                                                <p className="text-xs font-semibold text-gray-400">{cat.items.length} items</p>
                                            </div>
                                        </div>
                                        <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>

                                    {/* Crop Items */}
                                    <div className="flex flex-wrap gap-2">
                                        {displayItems.map((item) => (
                                            <Link
                                                key={item}
                                                href={`/home/crops/buy/grains?crop=${encodeURIComponent(item)}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-gray-200/50 dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-700 transition-all`}
                                            >
                                                {item}
                                            </Link>
                                        ))}
                                        {hasMore && !isExpanded && (
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${cat.text}`}>
                                                +{cat.items.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Banner */}
                <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl">verified</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white mb-1">100% Verified Sellers</h3>
                            <p className="text-white/70 font-medium text-sm">All listings are from verified farmers. Look for the verified badge for extra trust.</p>
                        </div>
                    </div>
                    <Link
                        href="/home/crops/sell"
                        className="shrink-0 px-6 py-3 rounded-xl bg-white text-green-700 font-bold text-sm hover:bg-green-50 transition-colors shadow-lg"
                    >
                        Start Selling Crops →
                    </Link>
                </div>
            </div>
        </div>
    );
}
