'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';

const usedImplements = [
    {
        id: 1,
        name: 'Mahindra Rotavator 7ft',
        category: 'Implement',
        specs: '7 Feet • 56 Blades • Good Condition',
        price: '₹45,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'Mahindra',
        hp: '7 Feet',
        year: '2021',
        location: 'Pune, Maharashtra',
        condition: 'Good',
    },
    {
        id: 2,
        name: 'Fieldking Disc Harrow',
        category: 'Implement',
        specs: '20 Discs • Hydraulic Lift • Excellent',
        price: '₹38,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Fieldking',
        hp: '20 Discs',
        year: '2020',
        location: 'Nashik, Maharashtra',
        condition: 'Excellent',
    },
    {
        id: 3,
        name: 'Shaktiman Cultivator',
        category: 'Implement',
        specs: '11 Tynes • Spring Loaded • Fair',
        price: '₹15,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Shaktiman',
        hp: '11 Tynes',
        year: '2019',
        location: 'Sangli, Maharashtra',
        condition: 'Fair',
    },
    {
        id: 4,
        name: 'Lemken MB Plough',
        category: 'Implement',
        specs: '2 Bottom • Reversible • Low Use',
        price: '₹28,000',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Lemken',
        hp: '2 Bottom',
        year: '2022',
        location: 'Kolhapur, Maharashtra',
        condition: 'Excellent',
    },
];

export default function BuyImplementsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = usedImplements.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Implements</h1>
                    <p className="text-gray-500">Browse verified pre-owned farming implements from trusted sellers.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Rotavator</option>
                        <option>Disc Harrow</option>
                        <option>Cultivator</option>
                        <option>Plough</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Condition</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Fair</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹20,000</option>
                        <option>₹20,000 - ₹40,000</option>
                        <option>Above ₹40,000</option>
                    </select>
                </div>

                <MachineryListing
                    items={usedImplements}
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
