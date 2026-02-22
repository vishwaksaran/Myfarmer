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
}

const moduleIcons: Record<string, string> = {
    services: 'handyman',
    land: 'landscape',
    borewell: 'water_pump',
    fencing: 'fence',
    cctv: 'videocam',
    protection: 'shield',
};

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        if (!user || user.isGuest) { setLoadingData(false); return; }

        const { data, error } = await supabase
            .from('service_bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) setBookings(data as Booking[]);
        setLoadingData(false);
    }, [user]);

    useEffect(() => {
        if (user) loadOrders();
    }, [user, loadOrders]);

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
        contacted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const filtered = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-8">
                <div className="mx-auto max-w-[1000px] px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span>&gt;</span>
                        <span className="text-primary font-semibold">My Orders</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Orders</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Track all your service bookings</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">Filter:</span>
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary/30">
                                <option value="all">All ({bookings.length})</option>
                                <option value="pending">Pending ({bookings.filter(b => b.status === 'pending').length})</option>
                                <option value="contacted">Contacted ({bookings.filter(b => b.status === 'contacted').length})</option>
                                <option value="confirmed">Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</option>
                                <option value="completed">Completed ({bookings.filter(b => b.status === 'completed').length})</option>
                                <option value="cancelled">Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
                            </select>
                        </div>
                    </div>

                    {loadingData ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">shopping_bag</span>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {filterStatus === 'all' ? 'Start by booking a service from our catalog' : 'Try changing the filter to see more orders'}
                            </p>
                            {filterStatus === 'all' && (
                                <Link href="/home/services" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                    <span className="material-symbols-outlined text-lg">explore</span>
                                    Browse Services
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map(b => {
                                const isExpanded = expandedId === b.id;
                                const extraEntries = Object.entries(b.extra_data || {}).filter(([, v]) => v !== null && v !== '' && v !== undefined);
                                return (
                                    <div key={b.id}
                                        className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all">
                                        {/* Main Row */}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : b.id)}
                                            className="w-full p-5 flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-xl">
                                                        {moduleIcons[b.module] || 'build'}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white capitalize">{b.category.replace(/-/g, ' ')}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs">calendar_today</span>
                                                            {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                                            {b.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {b.status}
                                                </span>
                                                <span className={`material-symbols-outlined text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </div>
                                        </button>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Name</p>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.full_name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.phone}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.location}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Module</p>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{b.module}</p>
                                                        </div>
                                                        {b.preferred_date && (
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Preferred Date</p>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                    {new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Booking ID</p>
                                                            <p className="text-xs font-mono text-gray-500">{b.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {extraEntries.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Additional Details</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {extraEntries.map(([key, val]) => (
                                                                <div key={key} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                                                                    <p className="text-[10px] uppercase text-gray-400 font-bold">{key.replace(/_/g, ' ')}</p>
                                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{String(val)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Timeline */}
                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        {['pending', 'contacted', 'confirmed', 'completed'].map((step, i) => {
                                                            const steps = ['pending', 'contacted', 'confirmed', 'completed'];
                                                            const currentIdx = steps.indexOf(b.status);
                                                            const active = i <= currentIdx && b.status !== 'cancelled';
                                                            return (
                                                                <div key={step} className="flex items-center gap-2 flex-1">
                                                                    <div className={`size-3 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                                    <span className={`text-[10px] uppercase font-bold ${active ? 'text-primary' : 'text-gray-400'}`}>{step}</span>
                                                                    {i < 3 && <div className={`flex-1 h-0.5 ${active && i < currentIdx ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {b.status === 'cancelled' && (
                                                        <p className="mt-2 text-xs text-red-500 font-semibold">This booking was cancelled</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
