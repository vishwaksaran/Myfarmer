'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

const newDrones = [
    {
        id: 1,
        name: 'DJI Agras T40',
        category: 'Drone',
        specs: '40L Tank • 10.8m Spray Width • AI Terrain',
        price: '₹12,50,000',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop',
        brand: 'DJI',
        hp: 'Electric',
    },
    {
        id: 2,
        name: 'DJI Agras T20P',
        category: 'Drone',
        specs: '20L Tank • 7m Spray Width • RTK',
        price: '₹8,75,000',
        image: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=400&h=300&fit=crop',
        brand: 'DJI',
        hp: 'Electric',
    },
    {
        id: 3,
        name: 'Garuda Kisan Drone',
        category: 'Drone',
        specs: '10L Tank • Made in India • Easy Operation',
        price: '₹4,50,000',
        image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=300&fit=crop',
        brand: 'Garuda',
        hp: 'Electric',
    },
    {
        id: 4,
        name: 'IoTech World Agri Drone',
        category: 'Drone',
        specs: '16L Tank • GPS Mapping • Auto Return',
        price: '₹6,25,000',
        image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop',
        brand: 'IoTech',
        hp: 'Electric',
    },
    {
        id: 5,
        name: 'Marut Drones AG-365',
        category: 'Drone',
        specs: '10L Tank • Swarm Ready • 30 min Flight',
        price: '₹5,00,000',
        image: 'https://images.unsplash.com/photo-1506947411487-a56738267384?w=400&h=300&fit=crop',
        brand: 'Marut',
        hp: 'Electric',
    },
    {
        id: 6,
        name: 'DJI Phantom 4 Multispectral',
        category: 'Drone',
        specs: 'Mapping • NDVI Analysis • Survey Grade',
        price: '₹7,50,000',
        image: 'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=400&h=300&fit=crop',
        brand: 'DJI',
        hp: 'Electric',
    },
];

export default function NewDronesPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeFromCompare = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const compareItems = newDrones.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="drones" currentAction="new" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Agricultural Drones</h1>
                    <p className="text-gray-500">Browse the latest spraying and surveying drones for precision agriculture.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Spraying Drone</option>
                        <option>Survey Drone</option>
                        <option>Mapping Drone</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>DJI</option>
                        <option>Garuda</option>
                        <option>IoTech</option>
                        <option>Marut</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Tank Capacity</option>
                        <option>Under 10L</option>
                        <option>10-20L</option>
                        <option>20-40L</option>
                        <option>Above 40L</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹5 Lakhs</option>
                        <option>₹5-8 Lakhs</option>
                        <option>₹8-12 Lakhs</option>
                        <option>Above ₹12 Lakhs</option>
                    </select>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                <MachineryListing
                    items={newDrones}
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

