'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
    {
        name: 'Tractors',
        icon: 'agriculture',
        path: '/v2/machinery/tractors',
        submenu: [
            { name: 'New Tractors', path: '/v2/machinery/tractors/new', icon: 'add_circle' },
            { name: 'Buy Used Tractors', path: '/v2/machinery/tractors/buy', icon: 'shopping_cart' },
            { name: 'Sell Used Tractors', path: '/v2/machinery/tractors/sell', icon: 'sell' },
        ],
    },
    {
        name: 'JCB',
        icon: 'front_loader',
        path: '/v2/machinery/jcb',
        submenu: [
            { name: "New JCB's", path: '/v2/machinery/jcb/new', icon: 'add_circle' },
            { name: "Buy Used JCB's", path: '/v2/machinery/jcb/buy', icon: 'shopping_cart' },
            { name: "Sell Used JCB's", path: '/v2/machinery/jcb/sell', icon: 'sell' },
        ],
    },
    {
        name: 'Small Machineries',
        icon: 'precision_manufacturing',
        path: '/v2/machinery/small-machineries',
        submenu: [
            { name: 'New Small Machineries', path: '/v2/machinery/small-machineries/new', icon: 'add_circle' },
            { name: 'Buy Used Small Machineries', path: '/v2/machinery/small-machineries/buy', icon: 'shopping_cart' },
            { name: 'Sell Used Small Machineries', path: '/v2/machinery/small-machineries/sell', icon: 'sell' },
        ],
    },
    {
        name: 'Implements',
        icon: 'handyman',
        path: '/v2/machinery/implements',
        submenu: [
            { name: 'New Implements', path: '/v2/machinery/implements/new', icon: 'add_circle' },
            { name: 'Buy Used Implements', path: '/v2/machinery/implements/buy', icon: 'shopping_cart' },
            { name: 'Sell Used Implements', path: '/v2/machinery/implements/sell', icon: 'sell' },
        ],
    },
    {
        name: 'Harvesters',
        icon: 'grass',
        path: '/v2/machinery/harvesters',
        submenu: [
            { name: 'New Harvesters', path: '/v2/machinery/harvesters/new', icon: 'add_circle' },
            { name: 'Buy Used Harvesters', path: '/v2/machinery/harvesters/buy', icon: 'shopping_cart' },
            { name: 'Sell Used Harvesters', path: '/v2/machinery/harvesters/sell', icon: 'sell' },
        ],
    },
    {
        name: 'Drones',
        icon: 'flight',
        path: '/v2/machinery/drones',
        submenu: [
            { name: 'New Drones', path: '/v2/machinery/drones/new', icon: 'add_circle' },
            { name: 'Buy Used Drones', path: '/v2/machinery/drones/buy', icon: 'shopping_cart' },
            { name: 'Sell Used Drones', path: '/v2/machinery/drones/sell', icon: 'sell' },
        ],
    },
];

export default function MachineryNav() {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showComparePopup, setShowComparePopup] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if on main machinery page (default to Tractors as active)
    const isMainPage = pathname === '/v2/machinery';

    const handleMouseEnter = (categoryName: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpenDropdown(categoryName);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 150);
    };

    const handleDropdownMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleDropdownMouseLeave = () => {
        setOpenDropdown(null);
    };

    const isCategoryActive = (category: typeof categories[0]) => {
        if (isMainPage && category.name === 'Tractors') return true;
        return pathname.startsWith(category.path);
    };

    return (
        <>
            <nav className="bg-white dark:bg-[#1a231a] border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-[60]">
                <div className="mx-auto max-w-[1280px] px-6">
                    <div className="flex items-center gap-2 py-3">
                        {/* Category Dropdowns */}
                        <div className="flex items-center gap-1 flex-1">
                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="relative shrink-0"
                                    onMouseEnter={() => handleMouseEnter(category.name)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <button
                                        onClick={() => setOpenDropdown(openDropdown === category.name ? null : category.name)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${isCategoryActive(category)
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{category.icon}</span>
                                        <span className="hidden md:inline">{category.name}</span>
                                        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${openDropdown === category.name ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openDropdown === category.name && (
                                        <div
                                            className="absolute top-full left-0 pt-2 z-[9999]"
                                            onMouseEnter={handleDropdownMouseEnter}
                                            onMouseLeave={handleDropdownMouseLeave}
                                        >
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
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {item.name.includes('New') && 'Get on-road price'}
                                                                {item.name.includes('Buy') && 'Browse available listings'}
                                                                {item.name.includes('Sell') && 'List your equipment'}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Compare Button - Opens Popup */}
                        <div className="shrink-0 ml-2">
                            <button
                                onClick={() => setShowComparePopup(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                            >
                                <span className="material-symbols-outlined">compare_arrows</span>
                                <span className="hidden sm:inline">Compare Tool</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Compare Popup Modal */}
            {showComparePopup && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowComparePopup(false)}
                    />

                    {/* Popup Content */}
                    <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Compare Models</h2>
                                <p className="text-sm text-gray-500 mt-1">Select up to 3 machines to compare technical specifications, fuel efficiency, and maintenance costs.</p>
                            </div>
                            <button
                                onClick={() => setShowComparePopup(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>

                        {/* Selection Bar */}
                        <div className="p-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-500">Selected for comparison:</span>
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map((idx) => (
                                            <div
                                                key={idx}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedItems[idx]
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                    }`}
                                            >
                                                {selectedItems[idx] ? (
                                                    <span className="material-symbols-outlined text-lg">check</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    disabled={selectedItems.length < 2}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${selectedItems.length >= 2
                                            ? 'bg-primary text-white hover:bg-primary-dark'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">compare_arrows</span>
                                    Launch Comparison Tool
                                </button>
                            </div>
                        </div>

                        {/* Quick Select Options */}
                        <div className="px-6 pb-6">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Select Popular Models</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 1, name: 'Mahindra Yuvo 575 DI', category: 'Tractor', image: '🚜' },
                                    { id: 2, name: 'John Deere 5050E', category: 'Tractor', image: '🚜' },
                                    { id: 3, name: 'Swaraj 744 FE', category: 'Tractor', image: '🚜' },
                                    { id: 4, name: 'JCB 3DX', category: 'JCB', image: '🏗️' },
                                    { id: 5, name: 'Kubota Harvester', category: 'Harvester', image: '🌾' },
                                    { id: 6, name: 'DJI Agras T40', category: 'Drone', image: '🚁' },
                                ].map((item) => {
                                    const isSelected = selectedItems.includes(item.id);
                                    const isDisabled = !isSelected && selectedItems.length >= 3;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedItems(prev => prev.filter(i => i !== item.id));
                                                } else if (!isDisabled) {
                                                    setSelectedItems(prev => [...prev, item.id]);
                                                }
                                            }}
                                            disabled={isDisabled}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : isDisabled
                                                        ? 'border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.image}</span>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.category}</p>
                                                </div>
                                                {isSelected && (
                                                    <span className="ml-auto material-symbols-outlined text-primary">check_circle</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <button
                                onClick={() => setSelectedItems([])}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Clear Selection
                            </button>
                            <Link
                                href="/v2/machinery/compare"
                                onClick={() => setShowComparePopup(false)}
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                View Full Comparison Page →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
