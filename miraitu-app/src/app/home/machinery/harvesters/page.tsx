'use client';

import { useState } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import CompareModal from '@/components/v2/machinery/CompareModal';

type TabType = 'new' | 'sell' | 'buy';

const tabs = [
    { id: 'new' as TabType, title: 'New Harvesters', shortTitle: 'New', icon: 'add_circle', description: 'Browse brand new harvesters', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Used', shortTitle: 'Sell', icon: 'sell', description: 'List your harvester for sale', bgColor: 'bg-orange-500' },
    { id: 'buy' as TabType, title: 'Buy Used', shortTitle: 'Buy', icon: 'shopping_cart', description: 'Find pre-owned harvesters', bgColor: 'bg-blue-500' },
];

const newItems = [
    { id: 1, name: 'John Deere S780', category: 'Combine', specs: '473 HP • 12.8L Engine • Smart Tech', price: '₹2,85,00,000', image: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?w=400&h=300&fit=crop', brand: 'John Deere', hp: '473', warranty: '3 Years' },
    { id: 2, name: 'Kubota DC-70G Plus', category: 'Combine', specs: '70 HP • Track Type • Rice Specialist', price: '₹18,50,000', image: 'https://images.unsplash.com/photo-1602867741746-6df80f40b3f6?w=400&h=300&fit=crop', brand: 'Kubota', hp: '70', warranty: '2 Years' },
    { id: 3, name: 'Preet 987 Deluxe', category: 'Combine', specs: '101 HP • Self Propelled • AC Cabin', price: '₹22,00,000', image: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?w=400&h=300&fit=crop', brand: 'Preet', hp: '101', warranty: '2 Years' },
    { id: 4, name: 'Claas Crop Tiger 40', category: 'Combine', specs: '125 HP • Terra Trac • Multi Crop', price: '₹35,00,000', image: 'https://images.unsplash.com/photo-1602867741746-6df80f40b3f6?w=400&h=300&fit=crop', brand: 'Claas', hp: '125', warranty: '3 Years' },
];

const usedItems = [
    { id: 101, name: 'Preet 849 2020', category: 'Combine', specs: '85 HP • Good Condition • 1200 Hrs', price: '₹12,50,000', image: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?w=400&h=300&fit=crop', brand: 'Preet', hp: '85', year: '2020', location: 'Ludhiana, Punjab', condition: 'Good' },
    { id: 102, name: 'Dashmesh 912 2019', category: 'Combine', specs: '91 HP • Excellent Condition', price: '₹14,00,000', image: 'https://images.unsplash.com/photo-1602867741746-6df80f40b3f6?w=400&h=300&fit=crop', brand: 'Dashmesh', hp: '91', year: '2019', location: 'Amritsar, Punjab', condition: 'Excellent' },
    { id: 103, name: 'New Holland TC5.30 2018', category: 'Combine', specs: '120 HP • Well Maintained', price: '₹18,00,000', image: 'https://images.unsplash.com/photo-1635174815612-fd9636f70146?w=400&h=300&fit=crop', brand: 'New Holland', hp: '120', year: '2018', location: 'Karnal, Haryana', condition: 'Good' },
];

export default function HarvestersPage() {
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
                            <span className="material-symbols-outlined text-primary text-2xl">grass</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Harvesters Marketplace</h1>
                            <p className="text-sm text-gray-500">Combine harvesters for efficient harvesting</p>
                        </div>
                    </div>
                    <Link href="/home/machinery" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm">
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
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{newItems.length}</span> new harvesters</p></div>
                            <MachineryListing items={newItems} type="new" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}
                    {activeTab === 'sell' && <div className="animate-fadeIn"><SellMachineryForm category="harvesters" /></div>}
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
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsedItems.length}</span> used harvesters</p></div>
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

