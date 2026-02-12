'use client';

import Link from 'next/link';

export default function BuyCropsPage() {
    const categories = [
        { name: 'Grains & Cereals', icon: 'grain', href: '/v2/crops/buy/grains', count: 456, examples: 'Wheat, Rice, Maize' },
        { name: 'Vegetables', icon: 'eco', href: '/v2/crops/buy/vegetables', count: 312, examples: 'Onion, Potato, Tomato' },
        { name: 'Fruits', icon: 'nutrition', href: '/v2/crops/buy/fruits', count: 189, examples: 'Mango, Banana, Grapes' },
        { name: 'Pulses & Legumes', icon: 'spa', href: '/v2/crops/buy/pulses', count: 145, examples: 'Chana, Moong, Toor' },
    ];

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-6">
                    <Link
                        href="/v2/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Buy <span className="text-primary">Crops</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Browse quality produce directly from farmers. Best prices, verified sellers.
                    </p>
                </div>

                {/* Categories */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="group flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary text-4xl">{cat.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{cat.examples}</p>
                                <p className="text-primary font-semibold">{cat.count} listings available</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-2 transition-all">
                                arrow_forward
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Info Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Verified Sellers</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                All listings are from verified farmers. Look for the verified badge for extra trust.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
