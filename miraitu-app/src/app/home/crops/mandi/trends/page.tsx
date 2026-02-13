'use client';

import { useState } from 'react';

export default function PriceTrendsPage() {
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [timeRange, setTimeRange] = useState('1M');

    const crops = ['Wheat', 'Rice', 'Soybean', 'Cotton', 'Maize', 'Onion'];

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Price Trends</h1>
                    <p className="text-gray-500">Analyze historical price trends to make informed selling decisions.</p>
                </div>

                {/* Crop Selection */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {crops.map((crop) => (
                        <button
                            key={crop}
                            onClick={() => setSelectedCrop(crop)}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedCrop === crop
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {crop}
                        </button>
                    ))}
                </div>

                {/* Time Range */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                        {['1W', '1M', '3M', '6M', '1Y'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <select className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Indore Mandi</option>
                        <option>All India Average</option>
                        <option>Pune Mandi</option>
                        <option>Delhi Mandi</option>
                    </select>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-400 mb-3">show_chart</span>
                            <p className="text-gray-500 text-lg font-medium">Price Trend Chart</p>
                            <p className="text-gray-400 text-sm">Interactive chart coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹2,450/qtl</p>
                        <p className="text-sm text-green-500 font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            +2.3% from yesterday
                        </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-1">30-Day High</p>
                        <p className="text-2xl font-bold text-green-500">₹2,580/qtl</p>
                        <p className="text-sm text-gray-500 mt-1">Feb 15, 2026</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-1">30-Day Low</p>
                        <p className="text-2xl font-bold text-red-500">₹2,280/qtl</p>
                        <p className="text-sm text-gray-500 mt-1">Jan 28, 2026</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 mb-1">Avg. Change</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">+1.8%</p>
                        <p className="text-sm text-gray-500 mt-1">Per week average</p>
                    </div>
                </div>

                {/* Analysis */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-3xl text-primary">insights</span>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">AI Price Forecast</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Based on historical trends, government procurement, and market demand, <strong>{selectedCrop}</strong> prices
                                are expected to remain <span className="text-green-500 font-semibold">stable to slightly bullish</span> over
                                the next 2 weeks. Consider selling if you can get above ₹2,500/qtl.
                            </p>
                            <button className="mt-4 text-primary font-semibold hover:underline flex items-center gap-1">
                                View detailed analysis
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
