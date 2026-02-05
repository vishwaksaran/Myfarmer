'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';

const usedHarvesters = [
    {
        id: 1,
        name: 'Preet 949',
        category: 'Harvester',
        specs: '91 HP • Self-Propelled • Excellent Condition',
        price: '₹8,50,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Preet',
        hp: '91',
        year: '2021',
        location: 'Ludhiana, Punjab',
        condition: 'Excellent',
    },
    {
        id: 2,
        name: 'Dashmesh 9100',
        category: 'Harvester',
        specs: '75 HP • Low Hours • Single Owner',
        price: '₹7,25,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Dashmesh',
        hp: '75',
        year: '2020',
        location: 'Karnal, Haryana',
        condition: 'Good',
    },
    {
        id: 3,
        name: 'Kubota DC-68G',
        category: 'Harvester',
        specs: '68 HP • 4-Row • Well Maintained',
        price: '₹9,80,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Kubota',
        hp: '68',
        year: '2022',
        location: 'Bathinda, Punjab',
        condition: 'Excellent',
    },
    {
        id: 4,
        name: 'New Holland CSX 7060',
        category: 'Harvester',
        specs: '90 HP • Multi-Threshing • Fair Condition',
        price: '₹6,50,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'New Holland',
        hp: '90',
        year: '2018',
        location: 'Amritsar, Punjab',
        condition: 'Fair',
    },
];

export default function BuyHarvestersPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = usedHarvesters.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Harvesters</h1>
                    <p className="text-gray-500">Browse pre-owned combine harvesters and reaper machines from trusted sellers.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>Preet</option>
                        <option>Dashmesh</option>
                        <option>Kubota</option>
                        <option>New Holland</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Condition</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Fair</option>
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
                        <option>Under ₹6 Lakhs</option>
                        <option>₹6-8 Lakhs</option>
                        <option>₹8-10 Lakhs</option>
                        <option>Above ₹10 Lakhs</option>
                    </select>
                </div>

                <MachineryListing
                    items={usedHarvesters}
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
