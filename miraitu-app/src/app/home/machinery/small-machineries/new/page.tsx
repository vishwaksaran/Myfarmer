'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

const newSmallMachineries = [
    {
        id: 1,
        name: 'Honda Power Tiller',
        category: 'Small Machinery',
        specs: '8.5 HP • Diesel • Rotary Tiller',
        price: '₹1,25,000',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Honda',
        hp: '8.5',
    },
    {
        id: 2,
        name: 'VST Shakti Power Weeder',
        category: 'Small Machinery',
        specs: '5 HP • Petrol • Multi-Purpose',
        price: '₹65,000',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        brand: 'VST Shakti',
        hp: '5',
    },
    {
        id: 3,
        name: 'Kirloskar Pump Set',
        category: 'Small Machinery',
        specs: '5 HP • Diesel • Irrigation Pump',
        price: '₹45,000',
        image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop',
        brand: 'Kirloskar',
        hp: '5',
    },
    {
        id: 4,
        name: 'Stihl Chainsaw MS 180',
        category: 'Small Machinery',
        specs: '2 HP • Petrol • 16" Bar',
        price: '₹18,500',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
        brand: 'Stihl',
        hp: '2',
    },
    {
        id: 5,
        name: 'Aspee Knapsack Sprayer',
        category: 'Small Machinery',
        specs: '16L • Manual • Brass Pump',
        price: '₹3,500',
        image: 'https://images.unsplash.com/photo-1588684658936-f1c3b8d3c2e8?w=400&h=300&fit=crop',
        brand: 'Aspee',
        hp: 'Manual',
    },
    {
        id: 6,
        name: 'Neptune Brush Cutter',
        category: 'Small Machinery',
        specs: '2.5 HP • Petrol • 4-Stroke',
        price: '₹12,500',
        image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop',
        brand: 'Neptune',
        hp: '2.5',
    },
];

export default function NewSmallMachineriesPage() {
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

    const compareItems = newSmallMachineries.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="small-machineries" currentAction="new" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Small Machineries</h1>
                    <p className="text-gray-500">Browse power tillers, weeders, pumps, and other small farm equipment.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Power Tiller</option>
                        <option>Power Weeder</option>
                        <option>Pump Set</option>
                        <option>Chainsaw</option>
                        <option>Sprayer</option>
                        <option>Brush Cutter</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Brands</option>
                        <option>Honda</option>
                        <option>VST Shakti</option>
                        <option>Kirloskar</option>
                        <option>Stihl</option>
                        <option>Neptune</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹10,000</option>
                        <option>₹10,000 - ₹50,000</option>
                        <option>₹50,000 - ₹1,00,000</option>
                        <option>Above ₹1,00,000</option>
                    </select>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                <MachineryListing
                    items={newSmallMachineries}
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

