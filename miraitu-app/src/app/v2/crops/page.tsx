'use client';

import { useState } from 'react';
import Link from 'next/link';

const marketHighlights = [
    { crop: 'Wheat', price: '₹2,450/qtl', change: '+2.3%', trend: 'up' },
    { crop: 'Rice (Basmati)', price: '₹3,850/qtl', change: '+1.8%', trend: 'up' },
    { crop: 'Soybean', price: '₹4,200/qtl', change: '-0.5%', trend: 'down' },
    { crop: 'Cotton', price: '₹6,100/qtl', change: '+3.1%', trend: 'up' },
    { crop: 'Maize', price: '₹2,150/qtl', change: '+0.8%', trend: 'up' },
    { crop: 'Groundnut', price: '₹5,800/qtl', change: '-1.2%', trend: 'down' },
];

const popularCrops = [
    { name: 'Wheat', icon: 'grain', listings: 245, avgPrice: '₹2,450/qtl' },
    { name: 'Rice', icon: 'rice_bowl', listings: 312, avgPrice: '₹3,200/qtl' },
    { name: 'Tomato', icon: 'eco', listings: 189, avgPrice: '₹45/kg' },
    { name: 'Onion', icon: 'eco', listings: 156, avgPrice: '₹32/kg' },
    { name: 'Potato', icon: 'eco', listings: 203, avgPrice: '₹28/kg' },
    { name: 'Soybean', icon: 'spa', listings: 98, avgPrice: '₹4,200/qtl' },
];

const quickActions = [
    { name: 'Mandi Prices', description: 'Check live prices from nearby mandis', icon: 'trending_up', href: '/v2/crops/mandi/prices', color: 'bg-primary' },
    { name: 'Buy Crops', description: 'Browse available produce listings', icon: 'shopping_cart', href: '/v2/crops/buy/grains', color: 'bg-primary' },
    { name: 'Sell Crops', description: 'List your harvest for sale', icon: 'sell', href: '/v2/crops/sell/list', color: 'bg-primary' },
    { name: 'Nearby Mandis', description: 'Find mandis near your location', icon: 'location_on', href: '/v2/crops/mandi/nearby', color: 'bg-primary' },
];

export default function CropsPage() {
    const [selectedRegion, setSelectedRegion] = useState('Maharashtra');

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Crops <span className="text-primary">Market</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Get live mandi prices, buy directly from farmers, or sell your produce at the best rates.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-white text-2xl">{action.icon}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{action.name}</h3>
                            <p className="text-sm text-gray-500">{action.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Market Highlights */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Highlights</h2>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        >
                            <option>Maharashtra</option>
                            <option>Punjab</option>
                            <option>Madhya Pradesh</option>
                            <option>Uttar Pradesh</option>
                            <option>Karnataka</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {marketHighlights.map((item) => (
                            <div
                                key={item.crop}
                                className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                                <p className="text-sm text-gray-500 mb-1">{item.crop}</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{item.price}</p>
                                <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    <span className="material-symbols-outlined text-sm">
                                        {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {item.change}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Crops */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Crops</h2>
                        <Link href="/v2/crops/buy/grains" className="text-primary font-semibold hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularCrops.map((crop) => (
                            <Link
                                key={crop.name}
                                href={`/v2/crops/buy/grains?crop=${crop.name.toLowerCase()}`}
                                className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-2xl">{crop.icon}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{crop.name}</h3>
                                <p className="text-sm text-gray-500">{crop.listings} listings</p>
                                <p className="text-sm font-semibold text-primary mt-1">{crop.avgPrice}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Call to Action - Green theme */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to sell your harvest?</h2>
                            <p className="text-white/90">List your produce and connect with buyers directly. No middlemen, better prices.</p>
                        </div>
                        <Link
                            href="/v2/crops/sell/list"
                            className="shrink-0 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            Start Selling →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
