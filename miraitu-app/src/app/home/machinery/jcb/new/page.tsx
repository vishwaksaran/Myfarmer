'use client';

import { useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';

const newJCBs = [
    {
        id: 1,
        name: 'JCB 3DX Super',
        category: 'JCB',
        specs: '76 HP • 4WD • Backhoe Loader',
        price: '₹32,50,000',
        image: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '76',
    },
    {
        id: 2,
        name: 'JCB 3DX Xtra',
        category: 'JCB',
        specs: '85 HP • 4WD • Extended Reach',
        price: '₹38,75,000',
        image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '85',
    },
    {
        id: 3,
        name: 'JCB 4DX',
        category: 'JCB',
        specs: '92 HP • 4WD • Heavy Duty',
        price: '₹45,00,000',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '92',
    },
    {
        id: 4,
        name: 'JCB VMT 330',
        category: 'JCB',
        specs: '75 HP • Vibratory Roller',
        price: '₹28,00,000',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '75',
    },
    {
        id: 5,
        name: 'JCB Skid Steer 155',
        category: 'JCB',
        specs: '49 HP • Compact • Versatile',
        price: '₹22,50,000',
        image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '49',
    },
    {
        id: 6,
        name: 'JCB Telehandler 530-70',
        category: 'JCB',
        specs: '97 HP • 7m Reach • 3T Capacity',
        price: '₹55,00,000',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '97',
    },
];

export default function NewJCBPage() {
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

    const compareItems = newJCBs.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="jcb" currentAction="new" />
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New JCB's</h1>
                    <p className="text-gray-500">Browse brand new JCB backhoe loaders and construction equipment with manufacturer warranty.</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All Types</option>
                        <option>Backhoe Loader</option>
                        <option>Skid Steer</option>
                        <option>Telehandler</option>
                        <option>Roller</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>HP Range</option>
                        <option>40-60 HP</option>
                        <option>60-80 HP</option>
                        <option>80-100 HP</option>
                        <option>Above 100 HP</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Price Range</option>
                        <option>Under ₹25 Lakhs</option>
                        <option>₹25-35 Lakhs</option>
                        <option>₹35-50 Lakhs</option>
                        <option>Above ₹50 Lakhs</option>
                    </select>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                <MachineryListing
                    items={newJCBs}
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

