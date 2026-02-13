'use client';

import { useState } from 'react';
import MachineryListing from '@/components/home/machinery/MachineryListing';
import CompareModal from '@/components/home/machinery/CompareModal';

const newHarvesters = [
    {
        id: 1,
        name: 'Kubota DC-70G Plus',
        category: 'Harvester',
        specs: '70 HP • 4-Row • Grain Tank 1200L',
        price: '₹14,50,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '70',
    },
    {
        id: 2,
        name: 'John Deere S440',
        category: 'Harvester',
        specs: '85 HP • Self-Propelled • Smart Technology',
        price: '₹18,75,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'John Deere',
        hp: '85',
    },
    {
        id: 3,
        name: 'Preet 987',
        category: 'Harvester',
        specs: '101 HP • Track Type • Wide Drum',
        price: '₹12,80,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Preet',
        hp: '101',
    },
    {
        id: 4,
        name: 'Dashmesh 912',
        category: 'Harvester',
        specs: '75 HP • Self-Propelled • Straw Chopper',
        price: '₹11,50,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Dashmesh',
        hp: '75',
    },
    {
        id: 5,
        name: 'New Holland TC5.30',
        category: 'Harvester',
        specs: '109 HP • 14ft Header • Air Conditioned',
        price: '₹22,00,000',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'New Holland',
        hp: '109',
    },
    {
        id: 6,
        name: 'Claas Crop Tiger 30',
        category: 'Harvester',
        specs: '67 HP • Terra Trac • Multi-Crop',
        price: '₹16,25,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Claas',
        hp: '67',
    },
];

export default function NewHarvestersPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = newHarvesters.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Harvesters</h1>
                    <p className="text-gray-500">Browse combine harvesters and reaper machines with manufacturer warranty.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>Kubota</option>
                        <option>John Deere</option>
                        <option>Preet</option>
                        <option>Dashmesh</option>
                        <option>New Holland</option>
                        <option>Claas</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>HP Range</option>
                        <option>60-75 HP</option>
                        <option>75-90 HP</option>
                        <option>90-110 HP</option>
                        <option>Above 110 HP</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Type</option>
                        <option>Self-Propelled</option>
                        <option>Tractor Mounted</option>
                        <option>Track Type</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹12 Lakhs</option>
                        <option>₹12-16 Lakhs</option>
                        <option>₹16-20 Lakhs</option>
                        <option>Above ₹20 Lakhs</option>
                    </select>
                </div>

                <MachineryListing
                    items={newHarvesters}
                    type="new"
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
