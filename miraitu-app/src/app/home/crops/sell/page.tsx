'use client';

import Link from 'next/link';

export default function SellCropsPage() {
    const options = [
        {
            name: 'List Your Produce',
            icon: 'add_circle',
            href: '/home/crops/sell/list',
            description: 'Create a new listing for your harvest',
            color: 'bg-primary'
        },
        {
            name: 'My Listings',
            icon: 'inventory',
            href: '/home/crops/sell/my-listings',
            description: 'Manage your active listings',
            color: 'bg-emerald-600'
        },
        {
            name: 'Order Requests',
            icon: 'receipt_long',
            href: '/home/crops/sell/orders',
            description: 'View incoming buyer requests',
            color: 'bg-teal-600'
        },
    ];

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Sell <span className="text-primary">Crops</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        List your harvest and connect with buyers directly. No middlemen, better prices.
                    </p>
                </div>

                {/* Options */}
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {options.map((option) => (
                        <Link
                            key={option.name}
                            href={option.href}
                            className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-white text-3xl">{option.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{option.name}</h3>
                            <p className="text-gray-500">{option.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-3xl font-bold text-primary">12,500+</p>
                        <p className="text-gray-500">Active Listings</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-3xl font-bold text-primary">8,000+</p>
                        <p className="text-gray-500">Verified Sellers</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-3xl font-bold text-primary">15%</p>
                        <p className="text-gray-500">Better Prices Avg.</p>
                    </div>
                </div>

                {/* CTA - Green theme */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to sell your harvest?</h2>
                    <p className="text-white/90 mb-6">Create your first listing in under 5 minutes</p>
                    <Link
                        href="/home/crops/sell/list"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Listing
                    </Link>
                </div>
            </div>
        </div>
    );
}
