'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import supabase from '@/lib/supabase';

interface Booking {
    id: string;
    module: string;
    category: string;
    full_name: string;
    phone: string;
    location: string;
    preferred_date: string | null;
    status: string;
    created_at: string;
    extra_data: Record<string, unknown>;
    provider_id: string | null;
    assigned_at: string | null;
    accepted_at: string | null;
    amount: number | null;
    provider_profile?: { full_name: string | null }[] | { full_name: string | null } | null;
}

interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    recentBookings: Booking[];
}

export default function UserDashboardPage() {
    const { user, loading, fetchProfile } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        recentBookings: [],
    });
    const [profileData, setProfileData] = useState<{ full_name: string | null; farm_location: string | null; role: string; phone?: string | null } | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const loadDashboard = useCallback(async () => {
        if (!user || user.isGuest) { setLoadingData(false); return; }

        // Fetch profile
        const profile = await fetchProfile();
        if (profile) setProfileData(profile);

        // Fetch bookings for this user; include phone fallback for older/guest-created rows.
        const authPhoneDigits = (user.phone || '').replace(/\D/g, '');
        const profilePhoneDigits = (profile?.phone || '').replace(/\D/g, '');
        const filters = [`user_id.eq.${user.id}`];
        if (authPhoneDigits.length === 10) filters.push(`phone.eq.${authPhoneDigits}`);
        if (profilePhoneDigits.length === 10 && profilePhoneDigits !== authPhoneDigits) filters.push(`phone.eq.${profilePhoneDigits}`);

        const { data: bookings, error } = await supabase
            .from('service_bookings')
            .select('id, module, category, full_name, phone, location, preferred_date, status, created_at, extra_data, provider_id, assigned_at, accepted_at, amount')
            .or(filters.join(','))
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[dashboard] Failed to load bookings:', error);
        }

        if (!error && bookings) {
            const all = bookings as Booking[];
            setStats({
                totalBookings: all.length,
                pendingBookings: all.filter(b => ['pending', 'assigned', 'accepted', 'in_progress', 'contacted', 'confirmed'].includes(b.status)).length,
                completedBookings: all.filter(b => b.status === 'completed').length,
                recentBookings: all.slice(0, 5),
            });
        }
        setLoadingData(false);
    }, [user, fetchProfile]);

    useEffect(() => {
        if (user) loadDashboard();
    }, [user, loadDashboard]);

    useEffect(() => {
        if (!loading && !user) router.push('/user-login');
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const statusColor: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        accepted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusLabel: Record<string, string> = {
        pending: 'Pending',
        assigned: 'Provider Assigned',
        accepted: 'Accepted',
        in_progress: 'In Progress',
        contacted: 'Contacted',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-8">
                <div className="mx-auto max-w-[1100px] px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span>&gt;</span>
                        <span className="text-primary font-semibold">Dashboard</span>
                    </nav>

                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Welcome, {user.displayName?.split(' ')[0] || 'Farmer'}!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {profileData?.farm_location ? `📍 ${profileData.farm_location}` : 'Your farming dashboard'}
                        </p>
                    </div>

                    {loadingData ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalBookings}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-yellow-600 text-2xl">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Pending</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.pendingBookings}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Completed</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.completedBookings}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { icon: 'agriculture', label: 'Services', href: '/home/services', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' },
                                        { icon: 'storefront', label: 'Shop', href: '/home/shop', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' },
                                        { icon: 'landscape', label: 'Land', href: '/home/land', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20' },
                                        { icon: 'pets', label: 'Livestock', href: '/home/livestock', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20' },
                                    ].map(a => (
                                        <Link key={a.label} href={a.href}
                                            className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all group">
                                            <div className={`size-12 rounded-xl ${a.color} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                                            </div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">{a.label}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Bookings */}
                            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Recent Bookings
                                    </h2>
                                    <Link href="/home/orders" className="text-sm text-primary font-semibold hover:underline">View All →</Link>
                                </div>
                                {stats.recentBookings.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inbox</span>
                                        <p className="text-gray-500 font-medium">No bookings yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Book a service to see it here</p>
                                        <Link href="/home/services" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                                            Browse Services
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {stats.recentBookings.map(b => (
                                            <div key={b.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-primary text-lg">
                                                                {b.module === 'services' ? 'handyman' : b.module === 'land' ? 'landscape' : b.module === 'borewell' ? 'water_pump' : 'build'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white text-sm capitalize">{b.category.replace(/-/g, ' ')}</p>
                                                            <p className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {statusLabel[b.status] || b.status}
                                                    </span>
                                                </div>
                                                {/* Provider assignment info */}
                                                {b.provider_id && (
                                                    <div className="mt-2 ml-14 flex items-center gap-2 text-xs">
                                                        <span className="material-symbols-outlined text-green-500 text-sm">engineering</span>
                                                        <span className="text-gray-500">
                                                            Provider: <span className="font-bold text-gray-700 dark:text-gray-300">
                                                                {Array.isArray(b.provider_profile) ? b.provider_profile[0]?.full_name : b.provider_profile?.full_name || 'Assigned'}
                                                            </span>
                                                        </span>
                                                        {b.amount && (
                                                            <span className="text-gray-400">• ₹{b.amount.toLocaleString('en-IN')}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
