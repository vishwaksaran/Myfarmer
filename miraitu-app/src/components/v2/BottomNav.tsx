'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { label: 'Home', icon: 'home', path: '/home' },
    { label: 'Services', icon: 'home_repair_service', path: '/home/services' },
    { label: 'Sell', icon: 'add', path: '/home/become-seller', isCenterAction: true },
    { label: 'Shop', icon: 'shopping_bag', path: '/home/shop' },
    { label: 'Community', icon: 'groups', path: '/home/community' },
];

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/home') return pathname === '/home';
        return pathname.startsWith(path);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="relative mx-2 mb-1 rounded-2xl bg-white dark:bg-[#1e2a1c] border border-gray-200 dark:border-white/10 shadow-[0_-2px_12px_rgba(0,0,0,0.1)]">
                <div className="flex items-end justify-around px-1 pt-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                    {navItems.map((item) => {
                        const active = isActive(item.path);

                        if (item.isCenterAction) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.path}
                                    className="relative -mt-4 flex flex-col items-center group"
                                >
                                    {/* Main FAB button */}
                                    <div className="relative flex items-center justify-center size-12 rounded-full bg-gradient-to-b from-[#34a832] to-[#2c5926] shadow-[0_3px_0_#1b3817,_0_6px_12px_rgba(44,89,38,0.35)] group-active:shadow-[0_1px_0_#1b3817,_0_3px_6px_rgba(44,89,38,0.25)] group-active:translate-y-[2px] transition-all">
                                        <span className="material-symbols-outlined text-white text-xl font-bold">add</span>
                                    </div>
                                    <span className="text-[10px] font-bold mt-1 text-[#2c5926] dark:text-[#6abf62]">{item.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                className="flex flex-col items-center gap-0.5 py-0.5 px-3 group"
                            >
                                <div className={`flex items-center justify-center size-7 rounded-lg transition-all duration-200 ${active
                                    ? 'bg-primary/10'
                                    : ''
                                    }`}>
                                    <span
                                        className={`material-symbols-outlined text-xl transition-colors ${active
                                            ? 'text-[#2c5926] dark:text-[#6abf62]'
                                            : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                                    >
                                        {item.icon}
                                    </span>
                                </div>
                                <span className={`text-[11px] transition-colors ${active
                                    ? 'text-[#2c5926] dark:text-[#6abf62] font-bold'
                                    : 'text-gray-600 dark:text-gray-400 font-semibold'
                                    }`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
