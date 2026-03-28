'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { VendorAuthProvider, useVendorAuth } from '@/context/VendorAuthContext';

function VendorLayoutInner({ children }: { children: React.ReactNode }) {
    const { vendor, shop, loading, authenticated, logout } = useVendorAuth();
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const slug = params.slug as string;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!authenticated || !vendor) {
            router.replace(`/vendor/${slug}/login`);
            return;
        }

        // Force password change on temp password
        if (vendor.isTempPassword && !pathname.endsWith('/settings')) {
            router.replace(`/vendor/${slug}/settings?force=password`);
        }
    }, [loading, authenticated, vendor, slug, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="material-symbols-outlined text-5xl text-green-600 animate-spin">progress_activity</span>
            </div>
        );
    }

    if (!authenticated || !vendor) return null;

    const navItems = [
        { href: `/vendor/${slug}/dashboard`, icon: 'dashboard', label: 'Dashboard' },
        { href: `/vendor/${slug}/products`, icon: 'inventory_2', label: 'Products' },
        { href: `/vendor/${slug}/orders`, icon: 'receipt_long', label: 'Orders' },
        { href: `/vendor/${slug}/inventory`, icon: 'warehouse', label: 'Inventory' },
        { href: `/vendor/${slug}/analytics`, icon: 'analytics', label: 'Analytics' },
        { href: `/vendor/${slug}/settings`, icon: 'settings', label: 'Settings' },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Shop Branding */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                    {shop?.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} className="size-9 rounded-xl object-cover" />
                    ) : (
                        <div className="size-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-lg">storefront</span>
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-base font-black text-gray-900 truncate">{shop?.name || slug}</h1>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Vendor Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                                isActive(item.href)
                                    ? 'bg-green-50 text-green-700 border border-green-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-xl ${isActive(item.href) ? 'text-green-600' : ''}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Info + Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-700 text-sm">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{vendor.displayName}</p>
                            <p className="text-[10px] text-gray-500 truncate">@{vendor.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex-1" />
                    {vendor.isTempPassword && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mr-3">
                            <span className="material-symbols-outlined text-amber-600 text-sm">warning</span>
                            <span className="text-xs font-bold text-amber-700">Change your temporary password</span>
                        </div>
                    )}
                    <div className="text-xs text-gray-400">
                        {shop?.name}
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <VendorAuthProvider>
            <VendorLayoutInner>{children}</VendorLayoutInner>
        </VendorAuthProvider>
    );
}
