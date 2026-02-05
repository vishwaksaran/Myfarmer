'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
    {
        name: 'Mandi',
        icon: 'store',
        path: '/v2/crops/mandi',
        submenu: [
            { name: 'Live Prices', path: '/v2/crops/mandi/prices', icon: 'trending_up' },
            { name: 'Nearby Mandis', path: '/v2/crops/mandi/nearby', icon: 'location_on' },
            { name: 'Price Trends', path: '/v2/crops/mandi/trends', icon: 'analytics' },
        ],
    },
    {
        name: 'Buy Crops',
        icon: 'shopping_cart',
        path: '/v2/crops/buy',
        submenu: [
            { name: 'Grains & Cereals', path: '/v2/crops/buy/grains', icon: 'grain' },
            { name: 'Vegetables', path: '/v2/crops/buy/vegetables', icon: 'eco' },
            { name: 'Fruits', path: '/v2/crops/buy/fruits', icon: 'nutrition' },
            { name: 'Pulses & Legumes', path: '/v2/crops/buy/pulses', icon: 'spa' },
        ],
    },
    {
        name: 'Sell Crops',
        icon: 'sell',
        path: '/v2/crops/sell',
        submenu: [
            { name: 'List Your Produce', path: '/v2/crops/sell/list', icon: 'add_circle' },
            { name: 'My Listings', path: '/v2/crops/sell/my-listings', icon: 'inventory' },
            { name: 'Order Requests', path: '/v2/crops/sell/orders', icon: 'receipt_long' },
        ],
    },
];

export default function CropsNav() {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleDropdownClick = (categoryName: string) => {
        setOpenDropdown(openDropdown === categoryName ? null : categoryName);
    };

    return (
        <>
            <nav className="bg-white dark:bg-[#1a231a] border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="mx-auto max-w-[1280px] px-6">
                    <div className="flex items-center gap-2 py-3">
                        {/* Back to V2 Home */}
                        <Link
                            href="/v2"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span className="font-medium hidden sm:inline">Home</span>
                        </Link>

                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 shrink-0" />

                        {/* Category Dropdowns */}
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="relative shrink-0"
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <button
                                        onClick={() => handleDropdownClick(category.name)}
                                        onMouseEnter={() => setOpenDropdown(category.name)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${pathname.startsWith(category.path)
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{category.icon}</span>
                                        <span className="hidden md:inline">{category.name}</span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openDropdown === category.name && (
                                        <>
                                            {/* Invisible bridge to prevent gap */}
                                            <div className="absolute left-0 right-0 h-2 top-full" />
                                            <div className="absolute top-full left-0 pt-2 z-50">
                                                <div className="w-64 bg-white dark:bg-[#1c251b] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                    {category.submenu.map((item, idx) => (
                                                        <Link
                                                            key={item.path}
                                                            href={item.path}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className={`flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${pathname === item.path
                                                                ? 'bg-primary/5 text-primary font-semibold'
                                                                : 'text-gray-700 dark:text-gray-200'
                                                                } ${idx !== category.submenu.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                                                        >
                                                            <span className={`material-symbols-outlined ${pathname === item.path ? 'text-primary' : 'text-gray-400'}`}>
                                                                {item.icon}
                                                            </span>
                                                            <div>
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Market Overview Button - Green theme */}
                        <div className="shrink-0 ml-2">
                            <Link
                                href="/v2/crops"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                            >
                                <span className="material-symbols-outlined">monitoring</span>
                                <span className="hidden sm:inline">Market Overview</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
