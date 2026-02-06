'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'buy' | 'sell';

const tabs = [
    { id: 'buy' as TabType, title: 'Buy Poultry', icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Poultry', icon: 'sell', bgColor: 'bg-orange-500' },
];

const types = ['All Types', 'Country Chicken', 'Broiler', 'Layer', 'Kadaknath', 'Duck', 'Turkey', 'Quail'];

const listings = [
    { id: 1, name: 'Country Chicken - 50 Birds', type: 'Country Chicken', count: 50, price: '₹15,000', location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', verified: true },
    { id: 2, name: 'Layer Hens - 100 Birds', type: 'Layer', count: 100, price: '₹35,000', location: 'Namakkal, TN', image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=400&h=300&fit=crop', verified: true },
    { id: 3, name: 'Kadaknath Pair', type: 'Kadaknath', count: 2, price: '₹3,500', location: 'Jhabua, MP', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop', verified: false },
    { id: 4, name: 'Broiler Chicks - 500', type: 'Broiler', count: 500, price: '₹17,500', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=400&h=300&fit=crop', verified: true },
    { id: 5, name: 'Ducks - 20 Birds', type: 'Duck', count: 20, price: '₹8,000', location: 'Alappuzha, Kerala', image: 'https://images.unsplash.com/photo-1459682687441-7761439a709d?w=400&h=300&fit=crop', verified: false },
    { id: 6, name: 'Turkey Pair', type: 'Turkey', count: 2, price: '₹6,000', location: 'Bangalore, Karnataka', image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=300&fit=crop', verified: true },
];

export default function PoultryPage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');
    const [selectedType, setSelectedType] = useState('All Types');

    const filteredListings = selectedType === 'All Types' ? listings : listings.filter(l => l.type === selectedType);

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Poultry Marketplace</h1>
                        <Link href="/v2/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Chickens, ducks, turkeys & more</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a]'}`}>
                            {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.title}</p>
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div>
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    {types.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Price Range</option><option>Under ₹10K</option><option>₹10K-25K</option><option>Above ₹25K</option>
                                </select>
                            </div>
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold">{filteredListings.length}</span> listings</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((l) => (
                                    <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold">✓ Verified</div>}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{l.type} • {l.count} birds</p>
                                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-lg font-bold text-primary">{l.price}</p>
                                                <p className="text-xs text-gray-500">{l.location.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary text-center mb-6">Sell Your Poultry</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800"><option>Select Type</option>{types.slice(1).map(t => <option key={t}>{t}</option>)}</select>
                                    <input type="number" placeholder="Count" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                </div>
                                <input placeholder="Price (₹)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <input placeholder="Location" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <button className="w-full py-4 rounded-xl bg-primary text-white font-bold">Publish Listing</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
