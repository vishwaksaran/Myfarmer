'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useViewMode } from '@/hooks/useViewMode';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';

interface NavItem {
    label: string;
    tKey: string;
    icon: string;
    path: string;
    isCenterAction?: boolean;
    tab?: string;
}

// The Shop slot is temporarily occupied by Community. To restore Shop, swap the
// entry back to: { label: 'Shop', tKey: 'bottomNav.shop', icon: 'shopping_bag', path: '/home/shop' }
const baseNavItems: NavItem[] = [
    { label: 'Home', tKey: 'bottomNav.home', icon: 'home', path: '/home' },
    { label: 'Services', tKey: 'bottomNav.services', icon: 'home_repair_service', path: '/home/services' },
    { label: 'Sell', tKey: 'bottomNav.sell', icon: 'add', path: '/home/become-seller', isCenterAction: true },
    { label: 'Community', tKey: 'nav.community', icon: 'groups', path: '/home/community' },
    { label: 'Dashboard', tKey: 'bottomNav.dashboard', icon: 'dashboard', path: '/home/dashboard' },
];

// Provider-mode bottom nav — stays inside the provider dashboard (screens are
// switched via the useProviderTab store). Marketplace home is only reachable
// via "Switch to Farmer".
const providerNavItems: NavItem[] = [
    { label: 'Home', tKey: 'home', icon: 'home', path: '/home/provider-dashboard', tab: 'home' },
    { label: 'Booking', tKey: 'booking', icon: 'calendar_month', path: '/home/provider-dashboard', tab: 'bookings' },
    { label: 'Wallet', tKey: 'wallet', icon: 'account_balance_wallet', path: '/home/provider-dashboard', tab: 'wallet' },
    { label: 'Profile', tKey: 'profile', icon: 'person', path: '/home/provider-dashboard', tab: 'profile' },
];

// Sub-screens that should highlight a given bottom-nav item as active
const PROVIDER_TAB_GROUPS: Record<string, string[]> = {
    home: ['home', 'notifications'],
    bookings: ['bookings'],
    wallet: ['wallet'],
    profile: ['profile', 'profile-settings', 'reviews', 'locations', 'services', 'analytics'],
};

// Roles that use the provider dashboard experience
const PROVIDER_ROLES = ['service_provider', 'dealer'];

export default function BottomNav() {
    const pathname = usePathname();
    const { user, fetchProfile } = useAuth();
    const { t } = useLanguage();
    const [viewMode] = useViewMode();
    const [providerTab, setProviderTab] = useProviderTab();
    const pt = useProviderT();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchProfile().then(p => setUserRole(p?.role || null));
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // Provider chrome only applies WHILE on the provider dashboard. Everywhere
    // else (marketplace home, login, product pages) the regular nav is shown.
    const onProviderDashboard = pathname.startsWith('/home/provider-dashboard');
    const isProviderView = onProviderDashboard && !!userRole && PROVIDER_ROLES.includes(userRole) && viewMode === 'provider';
    const navItems = isProviderView ? providerNavItems : baseNavItems;

    const isActive = (item: NavItem) => {
        if (item.tab) {
            if (!pathname.startsWith('/home/provider-dashboard')) return false;
            const group = PROVIDER_TAB_GROUPS[item.tab] || [item.tab];
            return group.includes(providerTab);
        }
        if (item.path === '/home') return pathname === '/home' || pathname === '/';
        return pathname.startsWith(item.path);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" data-bottom-nav data-no-auth>
            <div className="relative mx-2 mb-1 rounded-2xl bg-white dark:bg-[#1e2a1c] border border-gray-200 dark:border-white/10 shadow-[0_-2px_12px_rgba(0,0,0,0.1)]">
                <div className="flex items-end justify-around px-1 pt-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                    {navItems.map((item) => {
                        const active = isActive(item);

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
                                    <span className="text-[10px] font-bold mt-1 text-[#2c5926] dark:text-[#6abf62]">{t(item.tKey)}</span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                onClick={() => { if (item.tab) setProviderTab(item.tab); }}
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
                                    {isProviderView ? pt(item.tKey) : t(item.tKey)}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
