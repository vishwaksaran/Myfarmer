'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MiraituLogo from '@/components/MiraituLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, fetchProfile } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/admin-login');
            return;
        }

        // Check admin role from profiles table
        fetchProfile().then(profile => {
            if (profile?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                router.push('/home?error=unauthorized');
            }
        });
    }, [user, loading, router, fetchProfile]);

    if (loading || isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <span className="material-symbols-outlined text-5xl text-green-600 animate-spin">progress_activity</span>
            </div>
        );
    }

    if (!user || !isAdmin) return null;

    const navItems = [
        { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { href: '/admin/bookings', icon: 'assignment', label: 'Bookings' },
        { href: '/admin/users', icon: 'group', label: 'Users' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                    <MiraituLogo size={36} />
                    <div>
                        <h1 className="text-lg font-black text-gray-900">Miraitu</h1>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-700 text-sm">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'Admin'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex-1" />
                    <Link href="/home" className="text-sm font-semibold text-gray-500 hover:text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to App
                    </Link>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
