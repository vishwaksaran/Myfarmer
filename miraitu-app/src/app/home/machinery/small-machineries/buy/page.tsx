'use client';

import { useState } from 'react';
import MachineryListing from '@/components/home/machinery/MachineryListing';
import CompareModal from '@/components/home/machinery/CompareModal';

const usedSmallMachineries = [
    {
        id: 1,
        name: 'Honda Power Tiller GX390',
        category: 'Small Machinery',
        specs: '9 HP • Diesel • Good Condition',
        price: '₹75,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Honda',
        hp: '9',
        year: '2021',
        location: 'Coimbatore, Tamil Nadu',
        condition: 'Good',
    },
    {
        id: 2,
        name: 'VST Power Weeder',
        category: 'Small Machinery',
        specs: '5 HP • Petrol • Excellent',
        price: '₹35,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'VST',
        hp: '5',
        year: '2022',
        location: 'Madurai, Tamil Nadu',
        condition: 'Excellent',
    },
    {
        id: 3,
        name: 'Kirloskar Pump 5HP',
        category: 'Small Machinery',
        specs: '5 HP • Diesel • Fair Condition',
        price: '₹22,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Kirloskar',
        hp: '5',
        year: '2019',
        location: 'Belgaum, Karnataka',
        condition: 'Fair',
    },
    {
        id: 4,
        name: 'Stihl MS 250 Chainsaw',
        category: 'Small Machinery',
        specs: '3 HP • Petrol • Like New',
        price: '₹28,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Stihl',
        hp: '3',
        year: '2023',
        location: 'Kerala',
        condition: 'Excellent',
    },
];

export default function BuySmallMachineriesPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = usedSmallMachineries.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Small Machineries</h1>
                    <p className="text-gray-500">Browse pre-owned power tillers, weeders, and farm equipment.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Power Tiller</option>
                        <option>Power Weeder</option>
                        <option>Pump Set</option>
                        <option>Chainsaw</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Condition</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Fair</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹25,000</option>
                        <option>₹25,000 - ₹50,000</option>
                        <option>₹50,000 - ₹1,00,000</option>
                        <option>Above ₹1,00,000</option>
                    </select>
                </div>

                <MachineryListing
                    items={usedSmallMachineries}
                    type="used"
                    onCompare={toggleSelection}
                    selectedForCompare={selectedItems}
                />

                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />
            </div>
        </div>
    );
}
