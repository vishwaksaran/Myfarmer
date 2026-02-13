'use client';

import Link from 'next/link';

export default function MandiPage() {
    const mandiOptions = [
        {
            title: 'Live Prices',
            description: 'Real-time commodity prices from agricultural markets across India',
            icon: 'trending_up',
            href: '/home/crops/mandi',
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
            href: '/home/crops/mandi',
            color: 'bg-green-700',
        },
    ];

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
                    <h2 className="text-2xl font-bold mb-6">Today's Market Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-white/70 text-sm">Markets Reporting</p>
                            <p className="text-3xl font-bold">2,456</p>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">Commodities Tracked</p>
                            <p className="text-3xl font-bold">156</p>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">Total Arrivals</p>
                            <p className="text-3xl font-bold">45.2K qtl</p>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">Avg. Price Change</p>
                            <p className="text-3xl font-bold">+1.2%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
