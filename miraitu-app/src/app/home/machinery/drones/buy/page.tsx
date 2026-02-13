'use client';

import { useState } from 'react';
import MachineryListing from '@/components/home/machinery/MachineryListing';
import CompareModal from '@/components/home/machinery/CompareModal';

const usedDrones = [
    {
        id: 1,
        name: 'DJI Agras T20',
        category: 'Drone',
        specs: '20L Tank • RTK Module • 500 Hours',
        price: '₹5,50,000',
        image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop',
        brand: 'DJI',
        hp: 'Electric',
        year: '2022',
        location: 'Pune, Maharashtra',
        condition: 'Excellent',
    },
    {
        id: 2,
        name: 'Garuda Kisan Drone 10L',
        category: 'Drone',
        specs: '10L Tank • Well Maintained • Training Included',
        price: '₹2,75,000',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=300&fit=crop',
        brand: 'Garuda',
        hp: 'Electric',
        year: '2021',
        location: 'Hyderabad, Telangana',
        condition: 'Good',
    },
    {
        id: 3,
        name: 'DJI Phantom 4 Pro',
        category: 'Drone',
        specs: 'Survey Drone • 4K Camera • Low Hours',
        price: '₹1,85,000',
        image: 'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=400&h=300&fit=crop',
        brand: 'DJI',
        hp: 'Electric',
        year: '2020',
        location: 'Bangalore, Karnataka',
        condition: 'Good',
    },
    {
        id: 4,
        name: 'IoTech Agri Drone 16L',
        category: 'Drone',
        specs: '16L Tank • Spare Batteries • Fair Condition',
        price: '₹3,25,000',
        image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop',
        brand: 'IoTech',
        hp: 'Electric',
        year: '2021',
        location: 'Chennai, Tamil Nadu',
        condition: 'Fair',
    },
];

export default function BuyDronesPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const compareItems = usedDrones.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Drones</h1>
                    <p className="text-gray-500">Browse pre-owned agricultural drones with verified flight hours.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>DJI</option>
                        <option>Garuda</option>
                        <option>IoTech</option>
                        <option>Marut</option>
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
                        <option>Under ₹2 Lakhs</option>
                        <option>₹2-4 Lakhs</option>
                        <option>₹4-6 Lakhs</option>
                        <option>Above ₹6 Lakhs</option>
                    </select>
                </div>

                <MachineryListing
                    items={usedDrones}
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
