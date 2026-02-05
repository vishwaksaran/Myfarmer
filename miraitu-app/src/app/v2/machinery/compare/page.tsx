'use client';

import { useState } from 'react';
import CompareModal from '@/components/v2/machinery/CompareModal';
import Link from 'next/link';

const allMachinery = [
    {
        id: 1,
        name: 'Mahindra Yuvo 575 DI',
        category: 'Tractor',
        specs: '45 HP • 4 Cylinder • 4WD',
        price: '₹7,20,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '45',
        warranty: '6 Years',
        fuelType: 'Diesel',
        badge: 'POPULAR',
    },
    {
        id: 2,
        name: 'John Deere 5050E',
        category: 'Tractor',
        specs: '50 HP • Power Steering • Dual Clutch',
        price: '₹8,55,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM8TSKMPgBVKfBrFRv35XUcQxeNHBCocIJr-EhVwMsXpwRhwUfh8cJyAb_jlT3KlL-gTNVeV0UmU686uHIlpl66NlgQc8j2y6cEKwXPEkUMRpxvpQ6NljEMRXJdg2BvModl1ckkJlngdiilgPFQIdLBDuxv2QILSkUIwinzeUFso79NyvpTB4JTb2CHOOWK7Wi5DzLIQfkaqRyRnCmqmDFKoA88uyZOE_7mB9NHLUZ34oThbXIRVjACMbxoUB-EgVCwZECqbl8XnE',
        brand: 'John Deere',
        hp: '50',
        warranty: '5 Years',
        fuelType: 'Diesel',
        badge: 'LATEST MODEL',
    },
    {
        id: 3,
        name: 'Fieldstar Disc Harrow',
        category: 'Implement',
        specs: '16 Discs • Heavy Duty • Mounted',
        price: '₹55,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrP7cN8CTOtAkybDCL0QlIA-JizzfFm72xhbedX54SXeP4sbtxIadoSuijbGsc06AkXwxnUGnebgrcKT3PFZgziYLbXXBogmFMQ7xsAkpUYd5JPOZAaqHAfqbXgDQjkgbin1xqfhrWYaZKPOfumKTzC3EM3vOdwhqexqjl4m4-_9vRyI_ub_fWBU49A9oNMzlgBLNY7E9svHG0jZ7CBGCrA52KpkUC3qmlwTihE8bkTBp3_Z3WcD8yf3tzkKvKK6xIiZOPaQbOPyHC',
        brand: 'Fieldstar',
        hp: 'N/A',
        warranty: '2 Years',
        fuelType: 'Mounted',
    },
    {
        id: 4,
        name: 'Kubota Combine Harvester',
        category: 'Harvester',
        specs: 'Self-Propelled • 4-Row • Efficient',
        price: '₹12,50,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '85',
        warranty: '3 Years',
        fuelType: 'Diesel',
    },
];

const filters = {
    category: ['All', 'Tractors', 'JCB', 'Small Machineries', 'Implements', 'Harvesters', 'Drones'],
    brands: ['All Brands', 'Mahindra', 'John Deere', 'Swaraj', 'Kubota', 'Fieldstar', 'JCB', 'DJI', 'Honda'],
};

export default function ComparePage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [hpRange, setHpRange] = useState([20, 75]);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const filteredMachinery = allMachinery.filter(item => {
        if (selectedCategory !== 'All' && !item.category.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, -1))) {
            return false;
        }
        if (selectedBrand !== 'All Brands' && item.brand !== selectedBrand) {
            return false;
        }
        return true;
    });

    const compareItems = allMachinery.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Compare Models</h1>
                    <p className="text-gray-500">Select up to 3 machines to compare technical specifications, fuel efficiency, and maintenance costs.</p>
                </div>

                {/* Compare Selection Bar */}
                <div className="flex items-center justify-between mb-8 p-4 rounded-2xl bg-white dark:bg-[#1a231a] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500">Selected for comparison:</span>
                        <div className="flex gap-2">
                            {[0, 1, 2].map((idx) => (
                                <div
                                    key={idx}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedItems[idx]
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}
                                >
                                    {selectedItems[idx] ? (
                                        <span className="material-symbols-outlined text-lg">check</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCompareModal(true)}
                        disabled={selectedItems.length < 2}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${selectedItems.length >= 2
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">compare_arrows</span>
                        Launch Comparison Tool
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="skeuo-card rounded-2xl p-6 sticky top-32">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">tune</span>
                                Filters
                            </h3>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Category</label>
                                <div className="space-y-2">
                                    {filters.category.map((cat) => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Brand</label>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                >
                                    {filters.brands.map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            {/* HP Range */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Horse Power (HP)</label>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={hpRange[1]}
                                    onChange={(e) => setHpRange([20, Number(e.target.value)])}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{hpRange[0]} HP</span>
                                    <span>{hpRange[1]} HP</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSelectedBrand('All Brands');
                                    setHpRange([20, 75]);
                                }}
                                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Machinery Grid */}
                    <div className="flex-1">
                        {/* View Toggle & Sort */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                                <button className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-sm font-medium shadow-sm">
                                    Grid View
                                </button>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500">
                                    List View
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Show Service Centers</span>
                                <label className="flex items-center gap-2">
                                    <select className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
                                        <option>Sort by: Popular</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest First</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMachinery.map((item) => {
                                const isSelected = selectedItems.includes(item.id);
                                const isDisabled = !isSelected && selectedItems.length >= 3;

                                return (
                                    <div
                                        key={item.id}
                                        className="skeuo-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Checkbox */}
                                        <label
                                            className={`absolute right-3 top-3 z-10 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            <input
                                                checked={isSelected}
                                                onChange={() => toggleSelection(item.id)}
                                                disabled={isDisabled}
                                                className="h-6 w-6 rounded-lg border-white/50 bg-black/20 text-primary focus:ring-0"
                                                type="checkbox"
                                            />
                                        </label>

                                        {/* Badge */}
                                        {item.badge && (
                                            <div className="absolute left-3 top-3 z-10">
                                                <span className="inline-block rounded-lg bg-accent px-2 py-1 text-xs font-bold text-black">
                                                    {item.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div
                                            className="aspect-[4/3] w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                            style={{ backgroundImage: `url('${item.image}')` }}
                                        />

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{item.specs}</p>

                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <span>WARRANTY</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{item.warranty}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <span>FUEL</span>
                                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{item.fuelType}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <span className="text-xs text-gray-500">Estimated Price</span>
                                                        <p className="text-lg font-bold text-primary">{item.price}*</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/v2/machinery/tractors/new?id=${item.id}`}
                                                        className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium text-sm text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button className="flex-1 py-2 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors">
                                                        Request Quote
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Load More */}
                        <div className="text-center mt-8">
                            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <span className="material-symbols-outlined">expand_more</span>
                                Discover More Machinery
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compare Modal */}
            <CompareModal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                items={compareItems}
            />
        </div>
    );
}
