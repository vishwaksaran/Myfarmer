'use client';

import { useState } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import CompareModal from '@/components/v2/machinery/CompareModal';

type TabType = 'new' | 'sell' | 'buy';

const tabs = [
    {
        id: 'new' as TabType,
        title: 'New JCB',
        shortTitle: 'New',
        icon: 'add_circle',
        description: 'Browse brand new JCB machines',
        bgColor: 'bg-emerald-500',
    },
    {
        id: 'sell' as TabType,
        title: 'Sell Used',
        shortTitle: 'Sell',
        icon: 'sell',
        description: 'List your JCB for sale',
        bgColor: 'bg-orange-500',
    },
    {
        id: 'buy' as TabType,
        title: 'Buy Used',
        shortTitle: 'Buy',
        icon: 'shopping_cart',
        description: 'Find pre-owned JCB machines',
        bgColor: 'bg-blue-500',
    },
];

const newItems = [
    {
        id: 1,
        name: 'JCB 3DX Backhoe Loader',
        category: 'JCB',
        specs: '76 HP • 4WD • Hydraulic System',
        price: '₹28,50,000',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '76',
        warranty: '3 Years',
    },
    {
        id: 2,
        name: 'JCB 4DX Super',
        category: 'JCB',
        specs: '92 HP • Turbocharged • Extended Reach',
        price: '₹35,00,000',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '92',
        warranty: '3 Years',
    },
    {
        id: 3,
        name: 'L&T Komatsu PC130',
        category: 'Excavator',
        specs: '95 HP • Crawler • Heavy Duty',
        price: '₹42,00,000',
        image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400&h=300&fit=crop',
        brand: 'L&T Komatsu',
        hp: '95',
        warranty: '2 Years',
    },
    {
        id: 4,
        name: 'Caterpillar 424B2',
        category: 'Backhoe',
        specs: '86 HP • 4x4 • Power Shift',
        price: '₹38,50,000',
        image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop',
        brand: 'Caterpillar',
        hp: '86',
        warranty: '3 Years',
    },
];

const usedItems = [
    {
        id: 101,
        name: 'JCB 3DX 2019 Model',
        category: 'JCB',
        specs: '74 HP • Good Condition • 2800 Hrs',
        price: '₹18,50,000',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '74',
        year: '2019',
        location: 'Mumbai, Maharashtra',
        condition: 'Good',
    },
    {
        id: 102,
        name: 'Tata Hitachi EX110',
        category: 'Excavator',
        specs: '82 HP • Excellent Condition',
        price: '₹22,00,000',
        image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400&h=300&fit=crop',
        brand: 'Tata Hitachi',
        hp: '82',
        year: '2020',
        location: 'Bangalore, Karnataka',
        condition: 'Excellent',
    },
    {
        id: 103,
        name: 'JCB 2DX 2018',
        category: 'JCB',
        specs: '68 HP • Well Maintained',
        price: '₹14,50,000',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
        brand: 'JCB',
        hp: '68',
        year: '2018',
        location: 'Chennai, Tamil Nadu',
        condition: 'Fair',
    },
];

export default function JCBPage() {
    const [activeTab, setActiveTab] = useState<TabType>('new');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState('All');

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    };

    const filteredUsedItems = selectedCondition === 'All'
        ? usedItems
        : usedItems.filter(t => t.condition === selectedCondition);

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Compact Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">front_loader</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JCB & Excavators</h1>
                            <p className="text-sm text-gray-500">Browse, buy, or sell heavy equipment</p>
                        </div>
                    </div>
                    <Link href="/v2/machinery" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="hidden sm:inline">Back to Machinery</span>
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
                                    {tab.icon}
                                </span>
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {tab.title}
                                </p>
                                <p className="text-xs text-gray-500">{tab.description}</p>
                            </div>
                            <p className={`font-bold sm:hidden ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                                {tab.shortTitle}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'new' && (
                        <div className="animate-fadeIn">
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{newItems.length}</span> new machines with warranty
                                </p>
                            </div>
                            <MachineryListing items={newItems} type="new" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}

                    {activeTab === 'sell' && (
                        <div className="animate-fadeIn">
                            <SellMachineryForm category="jcb" />
                        </div>
                    )}

                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-2 mb-6">
                                {['All', 'Excellent', 'Good', 'Fair'].map((condition) => (
                                    <button
                                        key={condition}
                                        onClick={() => setSelectedCondition(condition)}
                                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedCondition === condition
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsedItems.length}</span> used machines
                                </p>
                            </div>
                            <MachineryListing items={filteredUsedItems} type="used" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}
                </div>

                <CompareModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} items={[]} />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}
