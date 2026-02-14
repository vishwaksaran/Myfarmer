'use client';

import { useState } from 'react';
import Link from 'next/link';

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
        name: 'Drones',
        description: 'Agricultural drones for spraying & monitoring',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=200&fit=crop',
        count: 42,
        path: '/home/machinery/drones',
    },
];

// Sample machinery for comparison
const sampleMachinery = [
    {
        id: 1,
        name: 'Titan TX-500',
        brand: 'John Deere Series',
        category: 'TRACTOR',
        power: '450 HP',
        efficiency: '12.5 L/h',
        weight: '9,500 kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
    },
    {
        id: 2,
        name: 'Xerion 5000 VC',
        brand: 'Claas Machinery',
        category: 'TRACTOR',
        power: '530 HP',
        efficiency: '14.2 L/h',
        weight: '16,000 kg',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM8TSKMPgBVKfBrFRv35XUcQxeNHBCocIJr-EhVwMsXpwRhwUfh8cJyAb_jlT3KlL-gTNVeV0UmU686uHIlpl66NlgQc8j2y6cEKwXPEkUMRpxvpQ6NljEMRXJdg2BvModl1ckkJlngdiilgPFQIdLBDuxv2QILSkUIwinzeUFso79NyvpTB4JTb2CHOOWK7Wi5DzLIQfkaqRyRnCmqmDFKoA88uyZOE_7mB9NHLUZ34oThbXIRVjACMbxoUB-EgVCwZECqbl8XnE',
        badge: 'NEW ARRIVAL',
        originalPrice: '$365,000',
        price: '$320,000',
    },
    {
        id: 3,
        name: 'Titan TX-600',
        brand: 'John Deere',
        category: 'TRACTOR',
        power: '460 HP',
        efficiency: '12.5 L/h',
        weight: '9,500 kg',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        badge: 'ECO-CERTIFIED',
    },
];

export default function MachineryPage() {
    const [compareSlots, setCompareSlots] = useState<(typeof sampleMachinery[0] | null)[]>([null, null, null]);
    const [selectedCategory, setSelectedCategory] = useState('Tractors');
    const [hpRange, setHpRange] = useState([50, 1000]);
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalCategory, setModalCategory] = useState<typeof categories[0] | null>(null);

    const addToCompare = (item: typeof sampleMachinery[0]) => {
        const emptySlotIndex = compareSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            const newSlots = [...compareSlots];
            newSlots[emptySlotIndex] = item;
            setCompareSlots(newSlots);
        }
    };

    const removeFromCompare = (index: number) => {
        const newSlots = [...compareSlots];
        newSlots[index] = null;
        setCompareSlots(newSlots);
    };

    const filledSlots = compareSlots.filter(slot => slot !== null).length;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <div className="px-6 pb-12 py-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Hero Section with Category Cards */}
                    <div className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Agricultural Machinery
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Browse our comprehensive collection of farm equipment and machinery
                                </p>
                            </div>
                            <NearbyLocation />
                        </div>

                        {/* Category Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setModalCategory(category)}
                                    className="group relative rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden bg-[#d4edda] dark:bg-emerald-900/30 text-left"
                                >
                                    {/* Image Container - uniform size with matching bg */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-2xl bg-[#c8e6c9] dark:bg-emerald-800/50 flex items-center justify-center mb-3 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-center text-sm mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                            {category.count} listings
                                        </p>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
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

                    {/* Compare Selected Models Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">compare_arrows</span>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare Selected Models</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {compareSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    className={`relative rounded-2xl border-2 border-dashed transition-all ${slot
                                        ? 'border-primary/30 bg-white dark:bg-[#1a231a]'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                        }`}
                                >
                                    {slot ? (
                                        <div className="p-4">
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCompare(index)}
                                                className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined">close</span>
                                            </button>

                                            <div className="flex gap-4">
                                                {/* Image */}
                                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden shrink-0">
                                                    <img
                                                        src={slot.image}
                                                        alt={slot.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded mb-1">
                                                        {slot.category}
                                                    </span>
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                                        {slot.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mb-2">{slot.brand}</p>

                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-gray-400">POWER</span>
                                                            <p className="font-semibold text-gray-700 dark:text-gray-200">{slot.power}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">EFFICIENCY</span>
                                                            <p className="font-semibold text-gray-700 dark:text-gray-200">{slot.efficiency}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 flex flex-col items-center justify-center min-h-[140px]">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                                <span className="material-symbols-outlined text-primary text-2xl">add</span>
                                            </div>
                                            <p className="text-sm text-gray-500">Slot {index + 1}: Add Model</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Launch Comparison Button */}
                        {filledSlots >= 2 && (
                            <div className="mt-4 text-center">
                                <Link
                                    href="/home/machinery/compare"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                                >
                                    <span className="material-symbols-outlined">compare_arrows</span>
                                    Launch Comparison Tool
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex gap-8">
                        {/* Filters Sidebar */}
                        <div className="w-64 shrink-0">
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
                        <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Available Machinery
                                    </h2>
                                    <p className="text-sm text-gray-500">(42 results)</p>
                                </div>

                                <div className="flex items-center gap-4">
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

                            {/* Machinery Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sampleMachinery.map((item) => {
                                    const isInCompare = compareSlots.some(slot => slot?.id === item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group"
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />

                                                {/* Badge */}
                                                {item.badge && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded-lg ${item.badge === 'NEW ARRIVAL'
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-green-500 text-white'
                                                            }`}>
                                                            {item.badge}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Compare Button */}
                                                <button
                                                    onClick={() => !isInCompare && addToCompare(item)}
                                                    disabled={isInCompare || filledSlots >= 3}
                                                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${isInCompare
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white/90 text-gray-700 hover:bg-primary hover:text-white'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {isInCompare ? 'check' : 'add'}
                                                    </span>
                                                    COMPARE
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-3">{item.brand}</p>

                                                {/* Price */}
                                                {item.price && (
                                                    <div className="mb-3">
                                                        {item.originalPrice && (
                                                            <span className="text-sm text-gray-400 line-through mr-2">
                                                                {item.originalPrice}
                                                            </span>
                                                        )}
                                                        <span className="text-lg font-bold text-primary">{item.price}</span>
                                                    </div>
                                                )}

                                                {/* Specs */}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">bolt</span>
                                                        {item.power}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">local_gas_station</span>
                                                        {item.efficiency}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">scale</span>
                                                        {item.weight}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

