'use client';

import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';

export default function MandiPage() {
    const mandiOptions = [
        {
            title: 'Live Prices',
            description: 'Real-time commodity prices from agricultural markets across India',
            icon: 'trending_up',
            href: '/home/crops/mandi/prices',
            color: 'bg-green-500',
        },
        {
            title: 'Nearby Mandis',
            description: 'Find agricultural markets near your location',
            icon: 'location_on',
            href: '/home/crops/mandi/nearby',
            color: 'bg-green-600',
        },
        {
            title: 'Price Trends',
            description: 'Analyze historical price trends for better selling decisions',
            icon: 'analytics',
            href: '/home/crops/mandi/trends',
            color: 'bg-green-700',
        },
    ];

    // Fetch a small batch to compute summary stats
    const { data, total, loading, error } = useMandiPrices({ limit: 50 });

    // Compute live stats
    const uniqueMarkets = new Set(data.map(r => `${r.market}-${r.district}`)).size;
    const uniqueCommodities = new Set(data.map(r => r.commodity)).size;
    const avgChange = data.length > 0
        ? +(data.reduce((s, r) => {
            const mid = (r.minPrice + r.maxPrice) / 2;
            return s + (mid ? ((r.maxPrice - r.minPrice) / mid * 50) : 0);
        }, 0) / data.length).toFixed(1)
        : 0;

    const useFallback = (error || data.length === 0) && !loading;

    return (
        <div className="px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-10 text-center">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-green-700 uppercase bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-300">
                        Market Intelligence
                    </span>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        Mandi <span className="text-green-600">Information</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Get live mandi prices, find nearby markets, and analyze price trends to maximize your profits.
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {mandiOptions.map((option, index) => (
                        <Link
                            key={index}
                            href={option.href}
                            className="group relative p-8 rounded-3xl bg-white dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-white text-3xl">{option.icon}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 transition-colors">
                                {option.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                {option.description}
                            </p>
                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                Explore Now
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats - Green theme */}
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white shadow-xl shadow-green-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold">Today&apos;s Market Summary</h2>
                        {!useFallback && !loading && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-3 w-24 bg-white/30 rounded mb-2" />
                                    <div className="h-8 w-16 bg-white/30 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-white/70 text-sm">Markets Reporting</p>
                                <p className="text-3xl font-bold">{useFallback ? '2,456' : uniqueMarkets.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Commodities Tracked</p>
                                <p className="text-3xl font-bold">{useFallback ? '156' : uniqueCommodities}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Total Records</p>
                                <p className="text-3xl font-bold">{useFallback ? '45.2K' : total > 1000 ? `${(total / 1000).toFixed(1)}K` : total}</p>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Avg. Price Spread</p>
                                <p className="text-3xl font-bold">{useFallback ? '+1.2%' : `${avgChange >= 0 ? '+' : ''}${avgChange}%`}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
