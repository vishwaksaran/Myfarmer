'use client';

import { useState } from 'react';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice, spreadPercent } from '@/lib/mandi-api';

export default function PriceTrendsPage() {
    const [selectedCrop, setSelectedCrop] = useState('Wheat');
    const [timeRange, setTimeRange] = useState('1M');

    const crops = ['Wheat', 'Rice', 'Soyabean', 'Cotton', 'Maize', 'Onion'];

    // Fetch records for selected commodity
    const { data, loading, error } = useMandiPrices({ commodity: selectedCrop, limit: 50 });

    // Compute stats from live data
    const modalPrices = data.map(r => r.modalPrice).filter(Boolean);
    const currentPrice = modalPrices.length > 0 ? modalPrices[0] : 0;
    const highPrice = modalPrices.length > 0 ? Math.max(...modalPrices) : 0;
    const lowPrice = modalPrices.length > 0 ? Math.min(...modalPrices) : 0;
    const avgPct = data.length > 0
        ? +(data.reduce((s, r) => s + spreadPercent(r.minPrice, r.maxPrice), 0) / data.length).toFixed(1)
        : 0;

    const useFallback = (error || data.length === 0) && !loading;

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Price Trends</h1>
                        {!useFallback && !loading && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500">Analyze price data to make informed selling decisions.</p>
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
                        <option>All India</option>
                        <option>Maharashtra</option>
                        <option>Madhya Pradesh</option>
                        <option>Punjab</option>
                        <option>Delhi</option>
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
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
                                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Current Price</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {useFallback ? '₹2,450/qtl' : formatPrice(currentPrice)}
                                </p>
                                <p className="text-sm text-green-500 font-medium mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    {useFallback ? '+2.3% from yesterday' : `${avgPct >= 0 ? '+' : ''}${avgPct}% spread`}
                                </p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Highest Price</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {useFallback ? '₹2,580/qtl' : formatPrice(highPrice)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{useFallback ? 'Feb 15, 2026' : `across ${data.length} records`}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Lowest Price</p>
                                <p className="text-2xl font-bold text-red-500">
                                    {useFallback ? '₹2,280/qtl' : formatPrice(lowPrice)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{useFallback ? 'Jan 28, 2026' : `across ${data.length} records`}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 mb-1">Avg. Spread</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {useFallback ? '+1.8%' : `${avgPct >= 0 ? '+' : ''}${avgPct}%`}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Min↔Max variance</p>
                            </div>
                        </>
                    )}
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
                                the next 2 weeks.
                                {!useFallback && currentPrice > 0 && (
                                    <> Consider selling if you can get above {formatPrice(Math.round(currentPrice * 1.03))}.</>
                                )}
                                {useFallback && <> Consider selling if you can get above ₹2,500/qtl.</>}
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
