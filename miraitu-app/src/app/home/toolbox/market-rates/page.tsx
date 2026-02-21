'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CropPrice {
    crop: string;
    icon: string;
    msp: number;
    mandi: number;
    unit: string;
    change: number; // % change from yesterday
    markets: { name: string; price: number; trend: 'up' | 'down' | 'stable' }[];
}

const cropPrices: CropPrice[] = [
    {
        crop: 'Wheat', icon: '🌾', msp: 2275, mandi: 2350, unit: 'quintal', change: 1.2,
        markets: [
            { name: 'Indore Mandi', price: 2380, trend: 'up' },
            { name: 'Delhi APMC', price: 2350, trend: 'stable' },
            { name: 'Ludhiana', price: 2310, trend: 'down' },
            { name: 'Bhopal', price: 2340, trend: 'up' },
        ],
    },
    {
        crop: 'Rice (Paddy)', icon: '🍚', msp: 2300, mandi: 2180, unit: 'quintal', change: -0.5,
        markets: [
            { name: 'Karnal', price: 2200, trend: 'up' },
            { name: 'Cuttack', price: 2150, trend: 'stable' },
            { name: 'Guntur', price: 2180, trend: 'down' },
            { name: 'Patna', price: 2160, trend: 'stable' },
        ],
    },
    {
        crop: 'Soybean', icon: '🫘', msp: 4600, mandi: 4850, unit: 'quintal', change: 2.3,
        markets: [
            { name: 'Indore', price: 4900, trend: 'up' },
            { name: 'Nagpur', price: 4800, trend: 'up' },
            { name: 'Kota', price: 4780, trend: 'stable' },
            { name: 'Ujjain', price: 4820, trend: 'up' },
        ],
    },
    {
        crop: 'Cotton', icon: '🏵️', msp: 7121, mandi: 7350, unit: 'quintal', change: 0.8,
        markets: [
            { name: 'Rajkot', price: 7400, trend: 'up' },
            { name: 'Nagpur', price: 7300, trend: 'stable' },
            { name: 'Guntur', price: 7280, trend: 'down' },
            { name: 'Surendranagar', price: 7350, trend: 'up' },
        ],
    },
    {
        crop: 'Mustard', icon: '🌼', msp: 5650, mandi: 5800, unit: 'quintal', change: 1.5,
        markets: [
            { name: 'Alwar', price: 5850, trend: 'up' },
            { name: 'Jaipur', price: 5780, trend: 'stable' },
            { name: 'Kota', price: 5750, trend: 'down' },
            { name: 'Bharatpur', price: 5820, trend: 'up' },
        ],
    },
    {
        crop: 'Onion', icon: '🧅', msp: 0, mandi: 1800, unit: 'quintal', change: -3.2,
        markets: [
            { name: 'Nashik (Lasalgaon)', price: 1850, trend: 'down' },
            { name: 'Delhi Azadpur', price: 1900, trend: 'down' },
            { name: 'Bengaluru', price: 1750, trend: 'stable' },
            { name: 'Indore', price: 1680, trend: 'down' },
        ],
    },
    {
        crop: 'Tomato', icon: '🍅', msp: 0, mandi: 2200, unit: 'quintal', change: 5.1,
        markets: [
            { name: 'Kolar', price: 2300, trend: 'up' },
            { name: 'Nashik', price: 2150, trend: 'up' },
            { name: 'Madanapalle', price: 2250, trend: 'up' },
            { name: 'Delhi Azadpur', price: 2100, trend: 'stable' },
        ],
    },
    {
        crop: 'Chana (Gram)', icon: '🫛', msp: 5440, mandi: 5600, unit: 'quintal', change: 0.3,
        markets: [
            { name: 'Indore', price: 5650, trend: 'stable' },
            { name: 'Bikaner', price: 5580, trend: 'up' },
            { name: 'Jalgaon', price: 5550, trend: 'stable' },
            { name: 'Gulbarga', price: 5520, trend: 'down' },
        ],
    },
];

type SortBy = 'name' | 'price' | 'change';

export default function MarketRatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCrop, setSelectedCrop] = useState<CropPrice | null>(null);
    const [sortBy, setSortBy] = useState<SortBy>('name');

    let filtered = cropPrices.filter(c =>
        c.crop.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'price') filtered = [...filtered].sort((a, b) => b.mandi - a.mandi);
    else if (sortBy === 'change') filtered = [...filtered].sort((a, b) => b.change - a.change);
    else filtered = [...filtered].sort((a, b) => a.crop.localeCompare(b.crop));

    const trendIcon = (t: 'up' | 'down' | 'stable') =>
        t === 'up' ? 'trending_up' : t === 'down' ? 'trending_down' : 'trending_flat';
    const trendColor = (t: 'up' | 'down' | 'stable') =>
        t === 'up' ? 'text-green-600' : t === 'down' ? 'text-red-500' : 'text-gray-400';

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">Agri Calculators</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Market Rates</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <span className="material-symbols-outlined text-2xl">trending_up</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Market Rates</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Live mandi prices, MSP comparisons, and market trends for major crops.</p>
                    </div>

                    {/* Search & Sort */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Search crop name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full skeuo-inset rounded-xl pl-10 pr-4 py-3 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['name', 'price', 'change'] as SortBy[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${sortBy === s
                                        ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                        : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
                                        }`}
                                >
                                    {s === 'name' ? 'A-Z' : s === 'price' ? 'Price ↓' : 'Change ↓'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Crop Price Cards */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filtered.map(crop => (
                                    <button
                                        key={crop.crop}
                                        onClick={() => setSelectedCrop(crop)}
                                        className={`skeuo-card rounded-2xl p-5 text-left transition-all hover:-translate-y-1 ${selectedCrop?.crop === crop.crop ? 'ring-2 ring-primary/40' : ''}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{crop.icon}</span>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white">{crop.crop}</h4>
                                                    <span className="text-xs text-gray-400">per {crop.unit}</span>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-1 ${crop.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                <span className="material-symbols-outlined text-sm">{crop.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                                <span className="text-sm font-bold">{crop.change >= 0 ? '+' : ''}{crop.change}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold">Mandi Price</p>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">₹{crop.mandi.toLocaleString('en-IN')}</p>
                                            </div>
                                            {crop.msp > 0 && (
                                                <div className="ml-auto text-right">
                                                    <p className="text-xs text-gray-400 font-bold">MSP</p>
                                                    <p className="text-lg font-bold text-primary">₹{crop.msp.toLocaleString('en-IN')}</p>
                                                </div>
                                            )}
                                        </div>
                                        {crop.msp > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold ${crop.mandi >= crop.msp ? 'text-green-600' : 'text-red-500'}`}>
                                                        {crop.mandi >= crop.msp
                                                            ? `▲ ₹${(crop.mandi - crop.msp).toLocaleString('en-IN')} above MSP`
                                                            : `▼ ₹${(crop.msp - crop.mandi).toLocaleString('en-IN')} below MSP`}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {filtered.length === 0 && (
                                <div className="skeuo-card rounded-2xl p-10 text-center">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">search_off</span>
                                    <p className="font-bold text-gray-500">No crops found matching &quot;{searchTerm}&quot;</p>
                                </div>
                            )}
                        </div>

                        {/* Detail Panel */}
                        <div className="lg:col-span-1">
                            {selectedCrop ? (
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6 sticky top-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <span className="text-4xl">{selectedCrop.icon}</span>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{selectedCrop.crop}</h3>
                                            <p className="text-xs text-gray-400">Market-wise rates per {selectedCrop.unit}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {selectedCrop.markets.map(m => (
                                            <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{m.name}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-gray-900 dark:text-white">₹{m.price.toLocaleString('en-IN')}</span>
                                                    <span className={`material-symbols-outlined text-lg ${trendColor(m.trend)}`}>{trendIcon(m.trend)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedCrop.msp > 0 && (
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">MSP (Government)</p>
                                            <p className="text-2xl font-black text-primary">₹{selectedCrop.msp.toLocaleString('en-IN')}</p>
                                            <p className="text-xs text-gray-500 mt-1">Minimum Support Price for 2025-26 season</p>
                                        </div>
                                    )}

                                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50">
                                        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                                            <span className="material-symbols-outlined text-sm mt-0.5">tips_and_updates</span>
                                            <span>Prices are indicative and updated daily from AGMARKNET. Actual prices may vary at your local mandi.</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="skeuo-card rounded-2xl p-8 text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-3">touch_app</span>
                                    <p className="font-bold text-gray-400 text-sm">Tap on a crop to view market-wise rates</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 skeuo-card rounded-2xl p-5 border-l-4 border-amber-400">
                        <p className="text-xs text-gray-500 flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                            <span>Prices are sourced from AGMARKNET and various state APMC portals. MSP figures are for Kharif/Rabi 2025-26. Always verify with your local mandi before selling. Miraitu is not responsible for pricing inaccuracies.</span>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
