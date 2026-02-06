'use client';

import { useState } from 'react';
import Link from 'next/link';

type TabType = 'buy' | 'sell';

const tabs = [
    { id: 'buy' as TabType, title: 'Buy Cattle', icon: 'shopping_cart', bgColor: 'bg-emerald-500' },
    { id: 'sell' as TabType, title: 'Sell Cattle', icon: 'sell', bgColor: 'bg-orange-500' },
];

const breeds = ['All Breeds', 'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Murrah', 'Mehsana', 'Holstein', 'Jersey'];

const listings = [
    { id: 1, name: 'Pure Gir Cow', breed: 'Gir', age: '4 Years', milkYield: '12 L/day', price: '₹85,000', location: 'Rajkot, Gujarat', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: true },
    { id: 2, name: 'Murrah Buffalo', breed: 'Murrah', age: '5 Years', milkYield: '15 L/day', price: '₹1,20,000', location: 'Karnal, Haryana', image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&h=300&fit=crop', verified: true },
    { id: 3, name: 'Sahiwal Cow', breed: 'Sahiwal', age: '3 Years', milkYield: '10 L/day', price: '₹75,000', location: 'Amritsar, Punjab', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=300&fit=crop', verified: false },
    { id: 4, name: 'Jersey Cross', breed: 'Jersey', age: '2 Years', milkYield: '18 L/day', price: '₹65,000', location: 'Pune, Maharashtra', image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=400&h=300&fit=crop', verified: true },
    { id: 5, name: 'Red Sindhi Bull', breed: 'Red Sindhi', age: '4 Years', milkYield: '-', price: '₹55,000', location: 'Jodhpur, Rajasthan', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&h=300&fit=crop', verified: false },
    { id: 6, name: 'Holstein Friesian', breed: 'Holstein', age: '3 Years', milkYield: '22 L/day', price: '₹1,50,000', location: 'Bangalore, Karnataka', image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=400&h=300&fit=crop', verified: true },
];

export default function CattlePage() {
    const [activeTab, setActiveTab] = useState<TabType>('buy');
    const [selectedBreed, setSelectedBreed] = useState('All Breeds');

    const filteredListings = selectedBreed === 'All Breeds' ? listings : listings.filter(l => l.breed === selectedBreed);

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cattle Marketplace</h1>
                        <Link href="/v2/livestock" className="text-gray-500 hover:text-primary text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Livestock
                        </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Buy or sell cows, bulls & buffaloes</p>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${activeTab === tab.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a231a] hover:border-primary/30'}`}>
                            {activeTab === tab.id && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === tab.id ? tab.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className={`material-symbols-outlined text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`}>{tab.icon}</span>
                            </div>
                            <p className={`font-bold ${activeTab === tab.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{tab.title}</p>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'buy' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                                <select value={selectedBreed} onChange={(e) => setSelectedBreed(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    {breeds.map(b => <option key={b}>{b}</option>)}
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Price Range</option><option>Under ₹50K</option><option>₹50K-1L</option><option>Above ₹1L</option>
                                </select>
                                <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                                    <option>Location</option><option>Gujarat</option><option>Haryana</option><option>Punjab</option><option>Maharashtra</option>
                                </select>
                            </div>
                            <div className="mb-6"><p className="text-gray-600 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredListings.length}</span> cattle</p></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredListings.map((l) => (
                                    <div key={l.id} className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img src={l.image} alt={l.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            {l.verified && <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span>Verified</div>}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{l.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{l.breed}</span>
                                                <span>•</span><span>{l.age}</span>
                                                {l.milkYield !== '-' && <><span>•</span><span>{l.milkYield}</span></>}
                                            </div>
                                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <p className="text-lg font-bold text-primary">{l.price}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{l.location.split(',')[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'sell' && (
                        <div className="animate-fadeIn max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-bold text-primary text-center mb-2">Sell Your Cattle</h2>
                                <p className="text-gray-500 text-center mb-8">Fill in the details to list your animal</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Breed</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"><option value="">Select Breed</option>{breeds.slice(1).map(b => <option key={b}>{b}</option>)}</select></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Age</label>
                                            <input type="text" placeholder="e.g. 3 Years" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Milk Yield (L/day)</label>
                                            <input type="text" placeholder="e.g. 12" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                        <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (₹)</label>
                                            <input type="text" placeholder="e.g. 85000" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    </div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                        <input type="text" placeholder="e.g. Rajkot, Gujarat" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                        <textarea placeholder="Describe your animal..." rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Photos</label>
                                        <div className="p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-center cursor-pointer hover:border-primary/50 transition-all">
                                            <span className="material-symbols-outlined text-3xl text-primary mb-1">add_photo_alternate</span>
                                            <p className="text-sm text-gray-500">Click to upload photos</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">publish</span>Publish Listing
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
        </div>
    );
}
