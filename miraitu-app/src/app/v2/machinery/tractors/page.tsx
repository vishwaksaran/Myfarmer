'use client';

import { useState } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import CompareModal from '@/components/v2/machinery/CompareModal';

type TabType = 'new' | 'sell' | 'buy';

const tabs = [
    {
        id: 'new' as TabType,
        title: 'New Tractors',
        shortTitle: 'New',
        icon: 'add_circle',
        description: 'Browse brand new tractors',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-500',
        lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        id: 'sell' as TabType,
        title: 'Sell Used',
        shortTitle: 'Sell',
        icon: 'sell',
        description: 'List your tractor for sale',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-500',
        lightBg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
        id: 'buy' as TabType,
        title: 'Buy Used',
        shortTitle: 'Buy',
        icon: 'shopping_cart',
        description: 'Find pre-owned tractors',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
];

// New tractors data
const newTractors = [
    {
        id: 1,
        name: 'Mahindra Yuvo 575 DI',
        category: 'Tractor',
        specs: '45 HP • 4 Cylinder • 4WD • Power Steering',
        price: '₹7,20,000',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
        brand: 'Mahindra',
        hp: '45',
        warranty: '6 Years',
        fuelType: 'Diesel',
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
    },
    {
        id: 3,
        name: 'Swaraj 855 FE',
        category: 'Tractor',
        specs: '52 HP • Oil Immersed Brakes • 4WD',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Swaraj',
        hp: '52',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
    {
        id: 4,
        name: 'Sonalika Tiger DI 60',
        category: 'Tractor',
        specs: '60 HP • Multi Speed PTO • Hydraulic',
        price: '₹9,10,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Sonalika',
        hp: '60',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
    {
        id: 5,
        name: 'New Holland 3630 TX Plus',
        category: 'Tractor',
        specs: '55 HP • Synchromesh Gearbox • Air Cleaner',
        price: '₹8,75,000',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'New Holland',
        hp: '55',
        warranty: '4 Years',
        fuelType: 'Diesel',
    },
    {
        id: 6,
        name: 'Kubota MU4501',
        category: 'Tractor',
        specs: '45 HP • ISM Technology • 8F+2R Gears',
        price: '₹7,85,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '45',
        warranty: '5 Years',
        fuelType: 'Diesel',
    },
];

// Used tractors data
const usedTractors = [
    {
        id: 101,
        name: 'Mahindra Arjun 555 DI',
        category: 'Tractor',
        specs: '55 HP • 2WD • Good Condition',
        price: '₹4,50,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Mahindra',
        hp: '55',
        year: '2019',
        location: 'Pune, Maharashtra',
        condition: 'Good',
    },
    {
        id: 102,
        name: 'John Deere 5045D',
        category: 'Tractor',
        specs: '45 HP • Power Steering • Well Maintained',
        price: '₹5,20,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'John Deere',
        hp: '45',
        year: '2020',
        location: 'Nashik, Maharashtra',
        condition: 'Excellent',
    },
    {
        id: 103,
        name: 'Swaraj 744 FE',
        category: 'Tractor',
        specs: '48 HP • 4WD • Single Owner',
        price: '₹3,80,000',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'Swaraj',
        hp: '48',
        year: '2018',
        location: 'Belgaum, Karnataka',
        condition: 'Fair',
    },
    {
        id: 104,
        name: 'Sonalika DI 750 III',
        category: 'Tractor',
        specs: '50 HP • HDM Technology • Low Hours',
        price: '₹4,85,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Sonalika',
        hp: '50',
        year: '2021',
        location: 'Ludhiana, Punjab',
        condition: 'Excellent',
    },
    {
        id: 105,
        name: 'Eicher 485',
        category: 'Tractor',
        specs: '48 HP • Oil Immersed Brakes • Original Paint',
        price: '₹3,25,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Eicher',
        hp: '48',
        year: '2017',
        location: 'Sangli, Maharashtra',
        condition: 'Good',
    },
    {
        id: 106,
        name: 'TAFE 45 DI',
        category: 'Tractor',
        specs: '45 HP • Dual Clutch • Complete Service History',
        price: '₹4,10,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'TAFE',
        hp: '45',
        year: '2019',
        location: 'Coimbatore, Tamil Nadu',
        condition: 'Excellent',
    },
];

export default function TractorsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('new');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState('All');

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const filteredUsedTractors = selectedCondition === 'All'
        ? usedTractors
        : usedTractors.filter(t => t.condition === selectedCondition);

    const compareItems = [...newTractors, ...usedTractors].filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Compact Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">agriculture</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tractors Marketplace</h1>
                            <p className="text-sm text-gray-500">Browse, buy, or sell tractors</p>
                        </div>
                    </div>
                    <Link
                        href="/v2/machinery"
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="hidden sm:inline">Back to Machinery</span>
                    </Link>
                </div>

                {/* Navigation Tabs - Compact Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30 hover:shadow-md'
                                }`}
                        >
                            {/* Active Indicator */}
                            {activeTab === tab.id && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                            )}

                            {/* Icon */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'
                                    }`}>
                                    {tab.icon}
                                </span>
                            </div>

                            {/* Text */}
                            <div className="text-left hidden sm:block">
                                <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                                    }`}>
                                    {tab.title}
                                </p>
                                <p className="text-xs text-gray-500">{tab.description}</p>
                            </div>
                            <p className={`font-bold sm:hidden ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                                }`}>
                                {tab.shortTitle}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[500px]">
                    {/* New Tractors Content */}
                    {activeTab === 'new' && (
                        <div className="animate-fadeIn">
                            {/* Filters Bar */}
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>All Brands</option>
                                    <option>Mahindra</option>
                                    <option>John Deere</option>
                                    <option>Swaraj</option>
                                    <option>Sonalika</option>
                                    <option>New Holland</option>
                                    <option>Kubota</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>HP Range</option>
                                    <option>25-35 HP</option>
                                    <option>35-45 HP</option>
                                    <option>45-55 HP</option>
                                    <option>55-65 HP</option>
                                    <option>65+ HP</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Price Range</option>
                                    <option>Under ₹5 Lakhs</option>
                                    <option>₹5-8 Lakhs</option>
                                    <option>₹8-12 Lakhs</option>
                                    <option>Above ₹12 Lakhs</option>
                                </select>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                        <option>Popular</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{newTractors.length}</span> new tractors with warranty
                                </p>
                            </div>

                            {/* Listing */}
                            <MachineryListing
                                items={newTractors}
                                type="new"
                                onCompare={toggleSelection}
                                selectedForCompare={selectedItems}
                            />
                        </div>
                    )}

                    {/* Sell Used Content */}
                    {activeTab === 'sell' && (
                        <div className="animate-fadeIn">
                            <SellMachineryForm category="tractors" />
                        </div>
                    )}

                    {/* Buy Used Content */}
                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            {/* Condition Tabs */}
                            <div className="flex items-center gap-2 mb-6">
                                {['All', 'Excellent', 'Good', 'Fair'].map((condition) => (
                                    <button
                                        key={condition}
                                        onClick={() => setSelectedCondition(condition)}
                                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedCondition === condition
                                            ? 'bg-primary text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>

                            {/* Filters Bar */}
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>All Brands</option>
                                    <option>Mahindra</option>
                                    <option>John Deere</option>
                                    <option>Swaraj</option>
                                    <option>Sonalika</option>
                                    <option>Eicher</option>
                                    <option>TAFE</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Year</option>
                                    <option>2024</option>
                                    <option>2023</option>
                                    <option>2022</option>
                                    <option>2021</option>
                                    <option>2020</option>
                                    <option>Older</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Price Range</option>
                                    <option>Under ₹3 Lakhs</option>
                                    <option>₹3-5 Lakhs</option>
                                    <option>₹5-7 Lakhs</option>
                                    <option>Above ₹7 Lakhs</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Location</option>
                                    <option>Maharashtra</option>
                                    <option>Karnataka</option>
                                    <option>Punjab</option>
                                    <option>Tamil Nadu</option>
                                </select>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                        <option>Recently Added</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Year: Newest</option>
                                    </select>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsedTractors.length}</span> used tractors
                                </p>
                            </div>

                            {/* Listing */}
                            <MachineryListing
                                items={filteredUsedTractors}
                                type="used"
                                onCompare={toggleSelection}
                                selectedForCompare={selectedItems}
                            />
                        </div>
                    )}
                </div>

                {/* Compare Modal */}
                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
