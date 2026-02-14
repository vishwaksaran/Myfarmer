'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';

const usedJCBs = [
    {
        id: 1,
        name: 'JCB 3DX Super',
        category: 'JCB',
        specs: '76 HP • Backhoe Loader • Well Maintained',
        price: '₹18,50,000',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '76',
        year: '2021',
        location: 'Pune, Maharashtra',
        condition: 'Excellent',
    },
    {
        id: 2,
        name: 'JCB 3DX',
        category: 'JCB',
        specs: '74 HP • 4WD • Low Hours',
        price: '₹14,75,000',
        image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '74',
        year: '2019',
        location: 'Nashik, Maharashtra',
        condition: 'Good',
    },
    {
        id: 3,
        name: 'JCB 4DX',
        category: 'JCB',
        specs: '92 HP • Heavy Duty • Single Owner',
        price: '₹28,00,000',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '92',
        year: '2022',
        location: 'Bangalore, Karnataka',
        condition: 'Excellent',
    },
    {
        id: 4,
        name: 'JCB Skid Steer 135',
        category: 'JCB',
        specs: '45 HP • Compact • Fair Condition',
        price: '₹9,50,000',
        image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '45',
        year: '2018',
        location: 'Hyderabad, Telangana',
        condition: 'Fair',
    },
];

export default function BuyJCBPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = usedJCBs.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used JCB's</h1>
                    <p className="text-gray-500">Browse verified pre-owned JCB equipment from trusted sellers.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Backhoe Loader</option>
                        <option>Skid Steer</option>
                        <option>Telehandler</option>
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
                        <option>Older</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹10 Lakhs</option>
                        <option>₹10-20 Lakhs</option>
                        <option>₹20-30 Lakhs</option>
                        <option>Above ₹30 Lakhs</option>
                    </select>
                </div>

                <MachineryListing
                    items={usedJCBs}
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

