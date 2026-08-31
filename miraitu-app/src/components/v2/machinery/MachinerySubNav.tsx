'use client';

import Link from 'next/link';
import { MACHINERY_NEW_ENABLED, MACHINERY_RENT_ENABLED } from '@/lib/feature-flags';

// Category display names mapping
const categoryLabels: Record<string, string> = {
    tractors: 'Tractors',
    jcb: 'JCB',
    'small-machineries': 'Small Machineries',
    implements: 'Implements',
    harvesters: 'Harvesters',
    drones: 'Agri Drones',
};

interface MachinerySubNavProps {
    category: string; // e.g., 'tractors', 'jcb', 'drones'
    currentAction: 'new' | 'buy' | 'sell' | 'rent';
}

export default function MachinerySubNav({ category, currentAction }: MachinerySubNavProps) {
    const categoryLabel = categoryLabels[category] || category;
    const basePath = `/home/machinery/${category}`;

    // Selling is not a tab any more — it is the floating "Post an Ad" button,
    // which posts to the Buy & Sell marketplace rather than to this section's
    // own sell form. The /sell routes still work by direct URL.
    //
    // New and Rent stay behind their feature flags, so the strip can never
    // offer an action the rest of the section has hidden.
    const navItems = ([
        {
            key: 'new' as const,
            label: `New ${categoryLabel}`,
            shortLabel: 'New',
            href: `${basePath}/new`,
            icon: 'add_circle',
            color: 'bg-blue-500',
            hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
            activeRing: 'ring-blue-500',
            activeBg: 'bg-blue-50 dark:bg-blue-900/30',
            activeText: 'text-blue-700 dark:text-blue-300',
        },
        {
            key: 'buy' as const,
            label: `Buy Used ${categoryLabel}`,
            shortLabel: 'Buy Used',
            href: `${basePath}/buy`,
            icon: 'shopping_cart',
            color: 'bg-emerald-500',
            hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
            activeRing: 'ring-emerald-500',
            activeBg: 'bg-emerald-50 dark:bg-emerald-900/30',
            activeText: 'text-emerald-700 dark:text-emerald-300',
        },
        {
            key: 'rent' as const,
            label: `Rent ${categoryLabel}`,
            shortLabel: 'Rent',
            href: `${basePath}/rent`,
            icon: 'handshake',
            color: 'bg-primary',
            hoverBg: 'hover:bg-primary/10 dark:hover:bg-primary/20',
            activeRing: 'ring-primary',
            activeBg: 'bg-primary/10 dark:bg-primary/20',
            activeText: 'text-primary dark:text-primary',
        },
    ]).filter(item => {
        if (item.key === 'new') return MACHINERY_NEW_ENABLED;
        if (item.key === 'rent') return MACHINERY_RENT_ENABLED;
        return true;
    });

    return (
        <div className="mb-6">
            {/* Back to Machinery Link */}
            <div className="flex items-center gap-2 mb-4">
                <Link
                    href="/home/machinery"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    All Machinery
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{categoryLabel}</span>
            </div>

            {/* Navigation Tabs. With New and Rent flagged off only Buy Used is
                left, and a strip of one tab is a label pretending to be a
                choice — the heading below it already says where you are. */}
            {navItems.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/60 rounded-2xl overflow-x-auto">
                {navItems.map((item) => {
                    const isActive = item.key === currentAction;

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`
                                flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 min-w-0
                                ${isActive
                                    ? `${item.activeBg} ${item.activeText} ring-2 ${item.activeRing} shadow-sm`
                                    : `text-gray-500 dark:text-gray-400 ${item.hoverBg} hover:text-gray-700 dark:hover:text-gray-200`
                                }
                            `}
                        >
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${isActive ? item.color : 'bg-gray-300 dark:bg-gray-600'} flex items-center justify-center shrink-0 transition-colors duration-200`}>
                                <span className="material-symbols-outlined text-white text-sm sm:text-base">
                                    {item.icon}
                                </span>
                            </div>
                            <span className="hidden sm:inline">{item.label}</span>
                            <span className="sm:hidden text-xs">{item.shortLabel}</span>
                        </Link>
                    );
                })}
            </div>
            )}
        </div>
    );
}
