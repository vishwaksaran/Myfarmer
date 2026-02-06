'use client';

import { useState } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import CompareModal from '@/components/v2/machinery/CompareModal';

type TabType = 'new' | 'sell' | 'buy';

const tabs = [
    { id: 'new' as TabType, title: 'New Machines', shortTitle: 'New', icon: 'add_circle', description: 'Browse brand new equipment', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Used', shortTitle: 'Sell', icon: 'sell', description: 'List your equipment for sale', bgColor: 'bg-orange-500' },
    { id: 'buy' as TabType, title: 'Buy Used', shortTitle: 'Buy', icon: 'shopping_cart', description: 'Find pre-owned equipment', bgColor: 'bg-blue-500' },
];

const newItems = [
    { id: 1, name: 'Honda Power Tiller FJ500', category: 'Tiller', specs: '5 HP • Petrol • 4-Stroke', price: '₹65,000', image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop', brand: 'Honda', hp: '5', warranty: '2 Years' },
    { id: 2, name: 'VST Shakti 130 DI', category: 'Tiller', specs: '13 HP • Diesel • Heavy Duty', price: '₹1,85,000', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', brand: 'VST Shakti', hp: '13', warranty: '3 Years' },
    { id: 3, name: 'Kirloskar Brush Cutter', category: 'Brush Cutter', specs: '2 HP • Petrol • Low Vibration', price: '₹12,500', image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop', brand: 'Kirloskar', hp: '2', warranty: '1 Year' },
    { id: 4, name: 'Neptune Weeder', category: 'Weeder', specs: '3.5 HP • Petrol • Compact', price: '₹28,000', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop', brand: 'Neptune', hp: '3.5', warranty: '2 Years' },
];

const usedItems = [
    { id: 101, name: 'Honda Tiller 2020', category: 'Tiller', specs: '5 HP • Good Condition', price: '₹42,000', image: 'https://images.unsplash.com/photo-1592805144716-feeccccef5ac?w=400&h=300&fit=crop', brand: 'Honda', hp: '5', year: '2020', location: 'Pune', condition: 'Good' },
    { id: 102, name: 'VST Shakti 2019', category: 'Tiller', specs: '12 HP • Well Maintained', price: '₹1,20,000', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', brand: 'VST Shakti', hp: '12', year: '2019', location: 'Nashik', condition: 'Excellent' },
    { id: 103, name: 'Stihl Brush Cutter', category: 'Brush Cutter', specs: '2 HP • Like New', price: '₹8,500', image: 'https://images.unsplash.com/photo-1605002623881-8ac1989da9d7?w=400&h=300&fit=crop', brand: 'Stihl', hp: '2', year: '2021', location: 'Bangalore', condition: 'Excellent' },
];

export default function SmallMachineriesPage() {
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

    const filteredUsedItems = selectedCondition === 'All' ? usedItems : usedItems.filter(t => t.condition === selectedCondition);

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">precision_manufacturing</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Small Machineries</h1>
                            <p className="text-sm text-gray-500">Power tillers, brush cutters, and more</p>
                        </div>
                    </div>
                    <Link href="/v2/machinery" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="hidden sm:inline">Back to Machinery</span>
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'}`}>
                            {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.title}</p>
                                <p className="text-xs text-gray-500">{tab.description}</p>
                            </div>
                            <p className={`font-bold sm:hidden ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.shortTitle}</p>
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'new' && (
                        <div className="animate-fadeIn">
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{newItems.length}</span> new machines</p></div>
                            <MachineryListing items={newItems} type="new" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}
                    {activeTab === 'sell' && <div className="animate-fadeIn"><SellMachineryForm category="small-machineries" /></div>}
                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-2 mb-6">
                                {['All', 'Excellent', 'Good', 'Fair'].map((condition) => (
                                    <button key={condition} onClick={() => setSelectedCondition(condition)}
                                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedCondition === condition ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'}`}>
                                        {condition}
                                    </button>
                                ))}
                            </div>
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsedItems.length}</span> used machines</p></div>
                            <MachineryListing items={filteredUsedItems} type="used" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}
                </div>
                <CompareModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} items={[]} />
            </div>
            <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
        </div>
    );
}
