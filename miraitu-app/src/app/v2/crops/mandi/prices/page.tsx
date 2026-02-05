'use client';

import { useState } from 'react';

const mandiPrices = [
    { id: 1, crop: 'Wheat', variety: 'Sharbati', mandi: 'Indore Mandi', price: '₹2,450', unit: 'qtl', change: '+2.3%', trend: 'up', arrival: '1,250 qtl' },
    { id: 2, crop: 'Rice', variety: 'Basmati 1121', mandi: 'Karnal Mandi', price: '₹3,850', unit: 'qtl', change: '+1.8%', trend: 'up', arrival: '890 qtl' },
    { id: 3, crop: 'Soybean', variety: 'Yellow', mandi: 'Ujjain Mandi', price: '₹4,200', unit: 'qtl', change: '-0.5%', trend: 'down', arrival: '560 qtl' },
    { id: 4, crop: 'Cotton', variety: 'DCH-32', mandi: 'Rajkot Mandi', price: '₹6,100', unit: 'qtl', change: '+3.1%', trend: 'up', arrival: '780 qtl' },
    { id: 5, crop: 'Maize', variety: 'Hybrid', mandi: 'Davangere Mandi', price: '₹2,150', unit: 'qtl', change: '+0.8%', trend: 'up', arrival: '450 qtl' },
    { id: 6, crop: 'Groundnut', variety: 'Bold', mandi: 'Junagadh Mandi', price: '₹5,800', unit: 'qtl', change: '-1.2%', trend: 'down', arrival: '320 qtl' },
    { id: 7, crop: 'Onion', variety: 'Red', mandi: 'Lasalgaon Mandi', price: '₹3,200', unit: 'qtl', change: '+5.2%', trend: 'up', arrival: '2,100 qtl' },
    { id: 8, crop: 'Potato', variety: 'Jyoti', mandi: 'Agra Mandi', price: '₹1,800', unit: 'qtl', change: '-2.1%', trend: 'down', arrival: '1,800 qtl' },
    { id: 9, crop: 'Tomato', variety: 'Hybrid', mandi: 'Kolar Mandi', price: '₹2,500', unit: 'qtl', change: '+8.5%', trend: 'up', arrival: '950 qtl' },
    { id: 10, crop: 'Chilli', variety: 'Guntur', mandi: 'Guntur Mandi', price: '₹12,500', unit: 'qtl', change: '+1.5%', trend: 'up', arrival: '420 qtl' },
];

export default function MandiPricesPage() {
    const [selectedState, setSelectedState] = useState('All States');
    const [selectedCrop, setSelectedCrop] = useState('All Crops');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPrices = mandiPrices.filter(item => {
        if (selectedCrop !== 'All Crops' && item.crop !== selectedCrop) return false;
        if (searchQuery && !item.crop.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.mandi.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Mandi Prices</h1>
                    <p className="text-gray-500">Real-time commodity prices from agricultural markets across India.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search crop or mandi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    >
                        <option>All States</option>
                        <option>Maharashtra</option>
                        <option>Madhya Pradesh</option>
                        <option>Punjab</option>
                        <option>Gujarat</option>
                        <option>Karnataka</option>
                        <option>Uttar Pradesh</option>
                    </select>
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    >
                        <option>All Crops</option>
                        <option>Wheat</option>
                        <option>Rice</option>
                        <option>Soybean</option>
                        <option>Cotton</option>
                        <option>Maize</option>
                        <option>Onion</option>
                        <option>Tomato</option>
                    </select>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    Last updated: Today, 2:30 PM IST
                    <button className="ml-2 text-primary font-semibold hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Refresh
                    </button>
                </div>

                {/* Price Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Crop</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Variety</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Mandi</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Price</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Change</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Arrival</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredPrices.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900 dark:text-white">{item.crop}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.variety}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-lg">store</span>
                                                <span className="text-gray-600 dark:text-gray-300">{item.mandi}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-gray-900 dark:text-white">{item.price}</span>
                                            <span className="text-gray-500 text-sm">/{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1 font-semibold ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                                                </span>
                                                {item.change}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300">{item.arrival}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="material-symbols-outlined text-primary text-3xl mb-3">info</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">About Mandi Prices</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Prices shown are modal prices (most common transaction price) reported by respective Agricultural Produce Market Committees (APMCs).
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-emerald-600 text-3xl mb-3">notifications</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Price Alerts</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Set price alerts for your crops and get notified when prices reach your target. Never miss the best selling opportunity.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                        <span className="material-symbols-outlined text-teal-600 text-3xl mb-3">analytics</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Price Trends</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            View historical price trends and make informed decisions about when to sell your produce.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
