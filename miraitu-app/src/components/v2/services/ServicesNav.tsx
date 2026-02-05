'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
    {
        name: 'Harvester',
        icon: 'agriculture',
        path: '/v2/services/harvester',
    },
    {
        name: 'Drone Spray',
        icon: 'flight',
        path: '/v2/services/drone-spray',
    },
    {
        name: 'Farm Labours',
        icon: 'group',
        path: '/v2/services/farm-labours',
    },
    {
        name: 'Transportation',
        icon: 'local_shipping',
        path: '/v2/services/transportation',
        submenu: [
            { name: 'Truck', path: '/v2/services/transportation/truck', icon: 'local_shipping' },
            { name: 'Tempo', path: '/v2/services/transportation/tempo', icon: 'airport_shuttle' },
            { name: 'Tractor', path: '/v2/services/transportation/tractor', icon: 'agriculture' },
            { name: 'JCB', path: '/v2/services/transportation/jcb', icon: 'construction' },
        ],
    },
];

export default function ServicesNav() {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleDropdownClick = (categoryName: string) => {
        setOpenDropdown(openDropdown === categoryName ? null : categoryName);
    };

    return (
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

                    {/* Category Items */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                        {categories.map((category) => (
                            <div
                                key={category.name}
                                className="relative shrink-0"
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                {category.submenu ? (
                                    // Category with dropdown
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
                                ) : (
                                    // Regular category link
                                    <Link
                                        href={category.path}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${pathname.startsWith(category.path)
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{category.icon}</span>
                                        <span className="hidden md:inline">{category.name}</span>
                                    </Link>
                                )}

                                {/* Dropdown Menu for Transportation */}
                                {category.submenu && openDropdown === category.name && (
                                    <>
                                        <div className="absolute left-0 right-0 h-2 top-full" />
                                        <div className="absolute top-full left-0 pt-2 z-50">
                                            <div className="w-56 bg-white dark:bg-[#1c251b] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
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
                                                        <span className="font-medium">{item.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Book Service Button */}
                    <div className="shrink-0 ml-2">
                        <Link
                            href="/v2/services/book"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                            <span className="material-symbols-outlined">calendar_add_on</span>
                            <span className="hidden sm:inline">Book Service</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
