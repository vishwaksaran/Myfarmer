'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useShopWishlist } from '@/lib/use-shop-wishlist';
import { useViewMode } from '@/hooks/useViewMode';
import { useProviderTab } from '@/hooks/useProviderTab';

const PROVIDER_ROLES = ['service_provider', 'dealer'];

/**
 * Self-contained auth section for the Header.
 * Manages its own mount state to guarantee identical server/client render
 * on the very first pass (skeleton), then switches to real UI after mount.
 */
export default function HeaderAuthSection() {
    const { user, loading: authLoading, signOut, fetchProfile } = useAuth();
    const { t } = useLanguage();
    const { wishlistCount } = useShopWishlist();
    const router = useRouter();
    const [viewMode, setViewMode] = useViewMode();
    const [, setProviderTab] = useProviderTab();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // This component's own mount flag — immune to parent HMR state leaks
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchProfile().then(p => setUserRole(p?.role || null));
        } else {
            setUserRole(null);
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const isProviderView = !!userRole && PROVIDER_ROLES.includes(userRole) && viewMode === 'provider';
    const openProviderTab = (tab: string) => {
        setProviderTab(tab);
        setIsProfileOpen(false);
        router.push('/home/provider-dashboard');
    };

    // Server render + first client render: both return the same skeleton
    if (!mounted || authLoading) {
        return (
            <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 animate-pulse shrink-0">
                <div className="size-8 rounded-full bg-gray-200" />
                <div className="hidden sm:block w-16 h-4 bg-gray-200 rounded" />
            </div>
        );
    }

    if (user) {
        return (
            <div className="relative shrink-0" ref={profileMenuRef}>
                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="relative flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                    <div className="relative">
                        {user.photoURL ? (
                            <>
                                <img src={user.photoURL} alt="User" className="size-8 rounded-full ring-2 ring-primary/30" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                                <div className="hidden size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/30">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </div>
                            </>
                        ) : (
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/30">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                        )}
                        {/* Verified badge — only for a real (non-guest) logged-in user */}
                        {!user.isGuest && (
                            <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                            </div>
                        )}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate text-gray-700 dark:text-gray-200">{user.displayName || 'User'}</span>
                    <span className={`material-symbols-outlined text-sm text-gray-400 hidden sm:inline transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <>
                        <div className="fixed inset-0 z-[80]" onClick={() => setIsProfileOpen(false)} />
                        <div className="fixed right-4 top-[72px] w-64 bg-white dark:bg-[#1e2a1c] rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-[90] animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* User Info */}
                            <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent border-b border-black/5 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    {user.photoURL ? (
                                        <>
                                            <img src={user.photoURL} alt="Profile" className="size-12 rounded-full ring-2 ring-primary/30 shadow-md" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
                                            <div className="hidden size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/30">
                                                <span className="material-symbols-outlined text-2xl">person</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/30">
                                            <span className="material-symbols-outlined text-2xl">person</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || ''}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Menu Items */}
                            {isProviderView ? (
                                <div className="p-2">
                                    <button onClick={() => openProviderTab('home')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">dashboard</span>
                                        Dashboard
                                    </button>
                                    <button onClick={() => openProviderTab('bookings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
                                        My Bookings
                                    </button>
                                    <button onClick={() => openProviderTab('wallet')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">account_balance_wallet</span>
                                        Wallet
                                    </button>
                                    <button onClick={() => openProviderTab('reviews')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">reviews</span>
                                        My Reviews
                                    </button>
                                    <button onClick={() => openProviderTab('locations')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">location_on</span>
                                        Manage Locations
                                    </button>
                                    <button onClick={() => openProviderTab('profile-settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors text-left">
                                        <span className="material-symbols-outlined text-lg text-primary">manage_accounts</span>
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => { setViewMode('farmer'); setIsProfileOpen(false); router.push('/home'); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left mt-1"
                                    >
                                        <span className="material-symbols-outlined text-lg">swap_horiz</span>
                                        Switch to Farmer view
                                    </button>
                                </div>
                            ) : (
                                <div className="p-2">
                                    <Link
                                        href="/home/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/home/orders"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary">shopping_bag</span>
                                        My Orders
                                    </Link>
                                    <Link
                                        href="/home/shop/wishlist"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}>favorite</span>
                                        <span className="flex-1">Wishlist</span>
                                        {wishlistCount > 0 && (
                                            <span className="inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-black">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/home/dashboard"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary">dashboard</span>
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/home/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-primary/5 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary">settings</span>
                                        Settings
                                    </Link>
                                </div>
                            )}
                            {/* Logout */}
                            <div className="p-2 border-t border-black/5 dark:border-white/10">
                                <button
                                    onClick={() => { setIsProfileOpen(false); signOut(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        // Desktop only — on mobile/tablet (< lg) the login lives inside the hamburger menu
        <Link href="/user-login" className="hidden lg:flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shrink-0">
            {t('header.login')}
        </Link>
    );
}
