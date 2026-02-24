'use client';

import Link from 'next/link';

export default function SellCropsPage() {
    const options = [
        {
            name: 'List Your Produce',
            icon: 'add_circle',
            href: '/home/crops/sell/list',
            description: 'Create a new listing for your harvest',
        },
        {
            name: 'My Listings',
            icon: 'inventory',
            href: '/home/crops/sell/my-listings',
            description: 'Manage your active listings',
        },
        {
            name: 'Order Requests',
            icon: 'receipt_long',
            href: '/home/crops/sell/orders',
            description: 'View incoming buyer requests',
        },
    ];

    return (
        <div className="px-3 md:px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                        Sell <span className="text-primary">Crops</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl">
                        List your harvest and connect with buyers directly. No middlemen, better prices.
                    </p>
                </div>

                {/* Options — stacks to single column on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                    {options.map((option) => (
                        <Link
                            key={option.name}
                            href={option.href}
                            className="group flex items-center md:flex-col md:items-start gap-4 md:gap-0 p-5 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-0.5 md:hover:-translate-y-1"
                        >
                            {/* Icon — uniform green gradient */}
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 md:mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{option.icon}</span>
                            </div>
                            {/* Text */}
                            <div className="min-w-0">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-2 truncate">{option.name}</h3>
                                <p className="text-sm md:text-base text-gray-500 leading-snug">{option.description}</p>
                            </div>
                            {/* Arrow — only on mobile row layout */}
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors ml-auto md:hidden flex-shrink-0">chevron_right</span>
                        </Link>
                    ))}
                </div>

                {/* Stats — 2 cols on mobile, 3 on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">12,500+</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Active Listings</p>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">8,000+</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Verified Sellers</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">15%</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Better Prices Avg.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white text-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Ready to sell your harvest?</h2>
                    <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">Create your first listing in under 5 minutes</p>
                    <Link
                        href="/home/crops/sell/list"
                        className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                        Create Listing
                    </Link>
                </div>
            </div>
        </div>
    );
}
