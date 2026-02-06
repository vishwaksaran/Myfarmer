'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'buy' | 'sell';

const types = ['All Types', 'Rabbits', 'Ducks', 'Turkeys', 'Pigeons', 'Quails', 'Bees', 'Silkworms'];

const listings = [
    { id: 1, name: 'White Giant Rabbits - 10 Pairs', type: 'Rabbits', count: 20, price: '₹8,000', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop', verified: true, seller: 'Amit Kulkarni', phone: '+91 98765 43210' },
    { id: 2, name: 'Fancy Pigeons - 5 Pairs', type: 'Pigeons', count: 10, price: '₹15,000', location: 'Hyderabad, Telangana', image: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=400&h=300&fit=crop', verified: true, seller: 'Ravi Kumar', phone: '+91 87654 32109' },
    { id: 3, name: 'Bee Colony with Box - 5 Units', type: 'Bees', count: 5, price: '₹25,000', location: 'Coorg, Karnataka', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop', verified: false, seller: 'Krishna Gowda', phone: '+91 76543 21098' },
    { id: 4, name: 'Japanese Quails - 100 Birds', type: 'Quails', count: 100, price: '₹12,000', location: 'Salem, TN', image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=300&fit=crop', verified: true, seller: 'Selvam M', phone: '+91 65432 10987' },
];

export default function OthersPage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');
    const [selectedType, setSelectedType] = useState('All Types');
    const [contactModal, setContactModal] = useState<{ open: boolean; seller: string; phone: string } | null>(null);

    const filteredListings = selectedType === 'All Types' ? listings : listings.filter(l => l.type === selectedType);

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Other Livestock</h1>
                        <Link href="/v2/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Rabbits, pigeons, bees, quails & more</p>
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
                        <div>
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    {types.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold">{filteredListings.length}</span> listings</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredListings.map((l) => (
                                    <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span>Verified</div>}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{l.type} • {l.count} units</p>
                                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-lg font-bold text-primary">{l.price}</p>
                                                <p className="text-xs text-gray-500">{l.location.split(',')[0]}</p>
                                            </div>
                                            <button onClick={() => setContactModal({ open: true, seller: l.seller, phone: l.phone })}
                                                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                                                <span className="material-symbols-outlined text-lg">call</span>Contact Seller
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold text-primary text-center mb-6">Sell Other Livestock</h2>
                            <div className="space-y-4">
                                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800"><option>Select Type</option>{types.slice(1).map(t => <option key={t}>{t}</option>)}</select>
                                <input type="number" placeholder="Count/Quantity" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <input placeholder="Price (₹)" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <input placeholder="Location" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800" />
                                <textarea placeholder="Description" rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 resize-none" />
                                <button className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold">Publish Listing</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Modal */}
                {contactModal?.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setContactModal(null)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                        <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setContactModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">call</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Seller</h3>
                                <p className="text-gray-500 mb-4">{contactModal.seller}</p>
                                <a href={`tel:${contactModal.phone}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl">
                                    <span className="material-symbols-outlined">call</span>{contactModal.phone}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
