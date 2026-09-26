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

// The five things a farmer opens the app for. Services and Dashboard moved to
// the header menu when Rent, Buy & Sell and Reels took their place here —
// nothing was removed, only relocated.
//
// Buy & Sell sits in the centre slot because posting an ad is the action this
// nav most needs to invite; the slot renders as the raised green button.
const baseNavItems: NavItem[] = [
    { label: 'Home', tKey: 'bottomNav.home', icon: 'home', path: '/home' },
    { label: 'Rent', tKey: 'bottomNav.rent', icon: 'agriculture', path: '/home/rent' },
    { label: 'Buy & Sell', tKey: 'bottomNav.buySell', icon: 'storefront', path: '/home/buy-sell', isCenterAction: true },
    { label: 'Community', tKey: 'nav.community', icon: 'groups', path: '/home/community' },
    { label: 'Reels', tKey: 'bottomNav.reels', icon: 'movie', path: '/home/reels' },
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
                {/* Every slot is flex-1 + min-w-0 so five items divide the width evenly
                    and labels truncate instead of overflowing on 320px screens. */}
                <div className="flex items-end justify-between px-1 pt-1.5 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
                    {navItems.map((item) => {
                        const active = isActive(item);

                        if (item.isCenterAction) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.path}
                                    aria-current={active ? 'page' : undefined}
                                    className="flex-1 min-w-0 relative -mt-4 flex flex-col items-center group"
                                >
                                    {/*
                                      The raised circle says "this is the main action".
                                      It used to say that by being solid green always,
                                      which made Buy & Sell look like the selected tab on
                                      every page — the only thing that actually changed
                                      when it was selected was an icon fill, invisible in
                                      white on green.

                                      So the shape stays constant (it is an affordance,
                                      not a state) and the fill now carries the state:
                                      outlined while you are elsewhere, solid green with a
                                      halo when you are actually on Buy & Sell.
                                    */}
                                    <div
                                        className={`relative flex items-center justify-center size-12 shrink-0 rounded-full transition-all group-active:translate-y-[2px] ${active
                                            ? 'bg-gradient-to-b from-[#34a832] to-[#2c5926] ring-4 ring-[#34a832]/25 shadow-[0_3px_0_#1b3817,_0_6px_12px_rgba(44,89,38,0.35)] group-active:shadow-[0_1px_0_#1b3817,_0_3px_6px_rgba(44,89,38,0.25)]'
                                            : 'bg-white dark:bg-[#24331f] border-2 border-[#2c5926]/35 dark:border-[#6abf62]/40 shadow-[0_2px_6px_rgba(0,0,0,0.12)]'
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined text-xl ${active ? 'text-white' : 'text-[#2c5926] dark:text-[#6abf62]'}`}
                                            style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                                        >
                                            {item.icon}
                                        </span>
                                    </div>
                                    {/* Label follows the same rule as every other slot. */}
                                    <span className={`whitespace-nowrap text-[9px] min-[360px]:text-[10px] mt-1 transition-colors ${active
                                        ? 'text-[#2c5926] dark:text-[#6abf62] font-bold'
                                        : 'text-gray-600 dark:text-gray-400 font-semibold'
                                        }`}>
                                        {t(item.tKey)}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path}
                                onClick={() => { if (item.tab) setProviderTab(item.tab); }}
                                aria-current={active ? 'page' : undefined}
                                className="flex-1 min-w-0 flex flex-col items-center gap-0.5 py-0.5 px-0.5 group"
                            >
                                {/* One language across the whole bar: filled green means
                                    selected. The pill was faint enough that the centre
                                    button won the eye on every page. */}
                                <div className={`flex items-center justify-center size-7 shrink-0 rounded-lg transition-all duration-200 ${active
                                    ? 'bg-[#2c5926]/15 dark:bg-[#6abf62]/20 ring-1 ring-[#2c5926]/20 dark:ring-[#6abf62]/25'
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
                                <span className={`whitespace-nowrap text-[9px] min-[360px]:text-[10px] min-[400px]:text-[11px] leading-tight transition-colors ${active
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
