'use client';

import { useState } from 'react';
import Link from 'next/link';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import SellMachineryForm from '@/components/v2/machinery/SellMachineryForm';
import CompareModal from '@/components/v2/machinery/CompareModal';

type TabType = 'new' | 'sell' | 'buy';

const tabs = [
    { id: 'new' as TabType, title: 'New Drones', shortTitle: 'New', icon: 'add_circle', description: 'Browse brand new agri-drones', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Used', shortTitle: 'Sell', icon: 'sell', description: 'List your drone for sale', bgColor: 'bg-orange-500' },
    { id: 'buy' as TabType, title: 'Buy Used', shortTitle: 'Buy', icon: 'shopping_cart', description: 'Find pre-owned drones', bgColor: 'bg-blue-500' },
];

const newItems = [
    { id: 1, name: 'DJI Agras T40', category: 'Sprayer Drone', specs: '40L Tank • 20m Spray Width • AI Obstacle Avoidance', price: '₹12,50,000', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', brand: 'DJI', warranty: '2 Years' },
    { id: 2, name: 'Garuda Kisan Drone', category: 'Sprayer Drone', specs: '16L Tank • GPS Mapping • Made in India', price: '₹4,50,000', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=300&fit=crop', brand: 'Garuda', warranty: '1 Year' },
    { id: 3, name: 'Marut Drontech AG 365', category: 'Survey Drone', specs: '45 Min Flight • 4K Camera • RTK GPS', price: '₹6,80,000', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop', brand: 'Marut', warranty: '2 Years' },
    { id: 4, name: 'IoTechWorld Agri Drone', category: 'Sprayer Drone', specs: '10L Tank • Autonomous Flight • DGCA Approved', price: '₹3,50,000', image: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400&h=300&fit=crop', brand: 'IoTechWorld', warranty: '1 Year' },
];

const usedItems = [
    { id: 101, name: 'DJI Agras MG-1 2021', category: 'Sprayer Drone', specs: '10L Tank • Good Condition • 200 Hrs', price: '₹3,20,000', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', brand: 'DJI', year: '2021', location: 'Hyderabad, Telangana', condition: 'Good' },
    { id: 102, name: 'Garuda Drone 2022', category: 'Sprayer Drone', specs: '16L Tank • Excellent Condition', price: '₹2,80,000', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&h=300&fit=crop', brand: 'Garuda', year: '2022', location: 'Bangalore, Karnataka', condition: 'Excellent' },
    { id: 103, name: 'Custom Agri Drone 2020', category: 'Sprayer Drone', specs: '5L Tank • Fair Condition', price: '₹85,000', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop', brand: 'Custom', year: '2020', location: 'Chennai, Tamil Nadu', condition: 'Fair' },
];

export default function DronesPage() {
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                                <circle cx="5" cy="5" r="2" /><circle cx="19" cy="5" r="2" />
                                <line x1="5" y1="7" x2="5" y2="8" /><line x1="19" y1="7" x2="19" y2="8" />
                                <line x1="7" y1="6" x2="10" y2="10" /><line x1="17" y1="6" x2="14" y2="10" />
                                <rect x="8" y="10" width="8" height="5" rx="1" />
                                <line x1="11" y1="15" x2="10" y2="19" /><line x1="13" y1="15" x2="14" y2="19" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drones Marketplace</h1>
                            <p className="text-sm text-gray-500">Agricultural drones for spraying & monitoring</p>
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
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{newItems.length}</span> new drones with warranty</p></div>
                            <MachineryListing items={newItems} type="new" onCompare={toggleSelection} selectedForCompare={selectedItems} />
                        </div>
                    )}
                    {activeTab === 'sell' && <div className="animate-fadeIn"><SellMachineryForm category="drones" /></div>}
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
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredUsedItems.length}</span> used drones</p></div>
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
