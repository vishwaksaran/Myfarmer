'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'buy' | 'sell';

const listings = [
    { id: 1, name: 'Rohu Fish Farm Setup', type: 'Rohu', quantity: '500 kg capacity', price: '₹1,50,000', location: 'Andhra Pradesh', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', verified: true },
    { id: 2, name: 'Catla Fingerlings - 10000', type: 'Catla', quantity: '10,000 pcs', price: '₹25,000', location: 'West Bengal', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', verified: true },
    { id: 3, name: 'Prawn Farm Ready', type: 'Vannamei', quantity: '2 acre', price: '₹8,00,000', location: 'Gujarat', image: 'https://images.unsplash.com/photo-1565680018093-ebb6e5f79f89?w=400&h=300&fit=crop', verified: false },
    { id: 4, name: 'Tilapia Seeds', type: 'Tilapia', quantity: '5,000 pcs', price: '₹15,000', location: 'Tamil Nadu', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', verified: true },
];

export default function FishPage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fish & Aquaculture</h1>
                        <Link href="/v2/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Fish farming and aquaculture</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {(['buy', 'sell'] as TabType[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${activeTab === tab ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a]'}`}>
                            {activeTab === tab && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === tab ? (tab === 'buy' ? 'bg-emerald-500' : 'bg-orange-500') : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab === 'buy' ? 'shopping_cart' : 'sell'}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab === 'buy' ? 'Buy' : 'Sell'}</p>
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((l) => (
                                <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold">✓ Verified</div>}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{l.type} • {l.quantity}</p>
                                        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-lg font-bold text-primary">{l.price}</p>
                                            <p className="text-xs text-gray-500">{l.location}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary text-center mb-6">Sell Fish / Aquaculture</h2>
                            <div className="space-y-4">
                                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800"><option>Fish Type</option><option>Rohu</option><option>Catla</option><option>Tilapia</option><option>Prawn</option></select>
                                <input placeholder="Quantity" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <input placeholder="Price (₹)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <input placeholder="Location" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <button className="w-full py-4 rounded-xl bg-primary text-white font-bold">Publish</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
