'use client';

import Link from 'next/link';

export default function MandiPage() {
    const mandiOptions = [
        {
            title: 'Live Prices',
            description: 'Real-time commodity prices from agricultural markets across India',
            icon: 'trending_up',
            href: '/v2/crops/mandi/prices',
            color: 'bg-primary',
        },
        {
            title: 'Nearby Mandis',
            description: 'Find agricultural markets near your location',
            icon: 'location_on',
            href: '/v2/crops/mandi/nearby',
            color: 'bg-emerald-600',
        },
        {
            title: 'Price Trends',
            description: 'Analyze historical price trends for better selling decisions',
            icon: 'analytics',
            href: '/v2/crops/mandi/trends',
            color: 'bg-teal-600',
        },
    ];

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Mandi <span className="text-primary">Information</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Get live mandi prices, find nearby markets, and analyze price trends to maximize your profits.
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {mandiOptions.map((option) => (
                        <Link
                            key={option.title}
                            href={option.href}
                            className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-2"
                        >
                            <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-white text-3xl">{option.icon}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{option.title}</h3>
                            <p className="text-gray-500">{option.description}</p>
                            <div className="mt-6 text-primary font-semibold flex items-center gap-2">
                                Explore
                                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats - Green theme */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white">
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
