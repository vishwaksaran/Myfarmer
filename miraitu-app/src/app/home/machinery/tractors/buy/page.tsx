'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

const usedTractors = [
    {
        id: 1,
        name: 'Mahindra Arjun 555 DI',
        category: 'Tractor',
        specs: '55 HP • 2WD • Good Condition',
        price: '₹4,50,000',
        image: 'https://images.pexels.com/photos/7532304/pexels-photo-7532304.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Mahindra',
        hp: '55',
        year: '2019',
        location: 'Pune, Maharashtra',
        condition: 'Good',
    },
    {
        id: 2,
        name: 'John Deere 5045D',
        category: 'Tractor',
        specs: '45 HP • Power Steering • Well Maintained',
        price: '₹5,20,000',
        image: 'https://images.pexels.com/photos/5358849/pexels-photo-5358849.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'John Deere',
        hp: '45',
        year: '2020',
        location: 'Nashik, Maharashtra',
        condition: 'Excellent',
    },
    {
        id: 3,
        name: 'Swaraj 744 FE',
        category: 'Tractor',
        specs: '48 HP • 4WD • Single Owner',
        price: '₹3,80,000',
        image: 'https://images.pexels.com/photos/2253412/pexels-photo-2253412.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Swaraj',
        hp: '48',
        year: '2018',
        location: 'Belgaum, Karnataka',
        condition: 'Fair',
    },
    {
        id: 4,
        name: 'Sonalika DI 750 III',
        category: 'Tractor',
        specs: '50 HP • HDM Technology • Low Hours',
        price: '₹4,85,000',
        image: 'https://images.pexels.com/photos/2889440/pexels-photo-2889440.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Sonalika',
        hp: '50',
        year: '2021',
        location: 'Ludhiana, Punjab',
        condition: 'Excellent',
    },
    {
        id: 5,
        name: 'Eicher 485',
        category: 'Tractor',
        specs: '48 HP • Oil Immersed Brakes • Original Paint',
        price: '₹3,25,000',
        image: 'https://images.pexels.com/photos/6844900/pexels-photo-6844900.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'Eicher',
        hp: '48',
        year: '2017',
        location: 'Sangli, Maharashtra',
        condition: 'Good',
    },
    {
        id: 6,
        name: 'TAFE 45 DI',
        category: 'Tractor',
        specs: '45 HP • Dual Clutch • Complete Service History',
        price: '₹4,10,000',
        image: 'https://images.pexels.com/photos/162371/tractor-round-baler-custom-work-hay-162371.jpeg?auto=compress&cs=tinysrgb&w=800',
        brand: 'TAFE',
        hp: '45',
        year: '2019',
        location: 'Coimbatore, Tamil Nadu',
        condition: 'Excellent',
    },
];

export default function BuyTractorsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState('All');

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeFromCompare = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const compareItems = usedTractors.filter(item => selectedItems.includes(item.id));

    const filteredTractors = selectedCondition === 'All'
        ? usedTractors
        : usedTractors.filter(t => t.condition === selectedCondition);

    return (
        <div className="px-3 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="tractors" currentAction="buy" />
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Tractors</h1>
                    <p className="text-gray-500">Browse verified pre-owned tractors from trusted sellers. Request quotes instantly.</p>
                </div>

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
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
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
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTractors.length}</span> used tractors
                    </p>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                {/* Listing */}
                <MachineryListing
                    items={filteredTractors}
                    type="used"
                    onCompare={toggleSelection}
                    selectedForCompare={selectedItems}
                />

                {/* Compare Modal */}
                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />
            </div>
        </div>
    );
}

