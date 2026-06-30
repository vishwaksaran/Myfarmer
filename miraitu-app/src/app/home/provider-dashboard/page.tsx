'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLoader from '@/components/v2/MiraituLoader';
import BookingCard from '@/components/provider/BookingCard';
import EarningsSummary from '@/components/provider/EarningsSummary';
import AvailabilityToggle from '@/components/provider/AvailabilityToggle';
import {
    fetchProviderBookings,
    fetchProviderEarnings,
    acceptBooking,
    rejectBooking,
    startJob,
    completeJob,
    updateProviderAvailability,
} from '@/app/actions/provider';
import type { ProviderBooking, ProviderEarnings } from '@/app/actions/provider';
import type { UserProfile } from '@/context/AuthContext';

type TabId = 'overview' | 'bookings' | 'earnings' | 'profile';

const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'list_alt' },
    { id: 'earnings', label: 'Earnings', icon: 'account_balance_wallet' },
    { id: 'profile', label: 'Profile', icon: 'person' },
];

const bookingFilters = [
    { value: 'all', label: 'All' },
    { value: 'assigned', label: 'New' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

export default function ProviderDashboardPage() {
    const { user, loading: authLoading, fetchProfile } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [bookings, setBookings] = useState<ProviderBooking[]>([]);
    const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [loadingData, setLoadingData] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => setRefreshKey(k => k + 1);

    const loadData = useCallback(async () => {
        if (!user || user.isGuest) { setLoadingData(false); return; }
        setLoadingData(true);

        const [bookingsRes, earningsRes] = await Promise.all([
            fetchProviderBookings(bookingFilter),
            fetchProviderEarnings(),
        ]);

        setBookings(bookingsRes.data);
        setEarnings(earningsRes.data);
        setLoadingData(false);
    }, [user, bookingFilter, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (user && !user.isGuest) loadData();
    }, [user, loadData]);

    // Refresh profile on mount
    useEffect(() => {
        if (user && !user.isGuest) {
            fetchProfile().then(p => setProfile(p));
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect non-authenticated users
    useEffect(() => {
        if (!authLoading && !user) router.push('/user-login');
    }, [authLoading, user, router]);

    // Redirect if not a service provider
    useEffect(() => {
        if (!authLoading && user && profile && profile.role !== 'service_provider') {
            router.push('/home/dashboard');
        }
    }, [authLoading, user, profile, router]);

    // Booking action handlers
    const handleAccept = async (bookingId: string, amount?: number) => {
        await acceptBooking(bookingId, amount);
        refresh();
    };
    const handleReject = async (bookingId: string, reason?: string) => {
        await rejectBooking(bookingId, reason);
        refresh();
    };
    const handleStartJob = async (bookingId: string) => {
        await startJob(bookingId);
        refresh();
    };
    const handleComplete = async (bookingId: string) => {
        await completeJob(bookingId);
        refresh();
    };
    const handleAvailabilityChange = async (status: 'available' | 'busy' | 'offline') => {
        await updateProviderAvailability(status);
    };

    if (authLoading || !user) {
        return (
            <MiraituLoader />
        );
    }

    const newBookings = bookings.filter(b => b.status === 'assigned');
    const activeBookings = bookings.filter(b => ['accepted', 'in_progress'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'completed');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-6 md:py-8">
                <div className="mx-auto max-w-[1100px] px-4 md:px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span>&gt;</span>
                        <span className="text-primary font-semibold">Provider Dashboard</span>
                    </nav>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Welcome, {user.displayName?.split(' ')[0] || 'Provider'}!
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">engineering</span>
                                Service Provider Dashboard
                                {profile?.service_types && profile.service_types.length > 0 && (
                                    <span className="text-primary font-semibold">
                                        • {profile.service_types.join(', ')}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="w-full md:w-64">
                            <AvailabilityToggle
                                initialStatus={(profile?.availability_status as 'available' | 'busy' | 'offline') || 'available'}
                                onStatusChange={handleAvailabilityChange}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loadingData ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <>
                            {/* ─── Overview Tab ─── */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                                            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2">
                                                <span className="material-symbols-outlined text-blue-600 text-lg">notifications_active</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{newBookings.length}</p>
                                            <p className="text-xs font-bold text-gray-500">New Requests</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                                            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-2">
                                                <span className="material-symbols-outlined text-amber-600 text-lg">pending_actions</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{activeBookings.length}</p>
                                            <p className="text-xs font-bold text-gray-500">Active Jobs</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                                            <div className="size-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-2">
                                                <span className="material-symbols-outlined text-green-600 text-lg">task_alt</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{completedBookings.length}</p>
                                            <p className="text-xs font-bold text-gray-500">Completed</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                                            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-2">
                                                <span className="material-symbols-outlined text-purple-600 text-lg">currency_rupee</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                ₹{(earnings?.this_month_earnings || 0).toLocaleString('en-IN')}
                                            </p>
                                            <p className="text-xs font-bold text-gray-500">This Month</p>
                                        </div>
                                    </div>

                                    {/* New Booking Requests */}
                                    {newBookings.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-500 text-xl">notifications_active</span>
                                                    New Requests
                                                    <span className="size-6 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center">
                                                        {newBookings.length}
                                                    </span>
                                                </h2>
                                                <button onClick={() => { setActiveTab('bookings'); setBookingFilter('assigned'); }}
                                                    className="text-sm text-primary font-bold hover:underline">View All →</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {newBookings.slice(0, 4).map(booking => (
                                                    <BookingCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        onAccept={handleAccept}
                                                        onReject={handleReject}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Jobs */}
                                    {activeBookings.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-amber-500 text-xl">engineering</span>
                                                    Active Jobs
                                                </h2>
                                                <button onClick={() => { setActiveTab('bookings'); setBookingFilter('accepted'); }}
                                                    className="text-sm text-primary font-bold hover:underline">View All →</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {activeBookings.slice(0, 4).map(booking => (
                                                    <BookingCard
                                                        key={booking.id}
                                                        booking={booking}
                                                        onStartJob={handleStartJob}
                                                        onComplete={handleComplete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {bookings.length === 0 && (
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inbox</span>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                                            <p className="text-sm text-gray-500 mb-4">
                                                When customers book your services, they&apos;ll appear here. Make sure you&apos;re set to &quot;Available&quot;.
                                            </p>
                                            <Link href="/home/services" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                                                <span className="material-symbols-outlined text-base">storefront</span>
                                                View Services
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── Bookings Tab ─── */}
                            {activeTab === 'bookings' && (
                                <div className="space-y-4">
                                    {/* Filters */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {bookingFilters.map(f => (
                                            <button
                                                key={f.value}
                                                onClick={() => setBookingFilter(f.value)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                    bookingFilter === f.value
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-100'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>

                                    {bookings.length === 0 ? (
                                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">filter_list_off</span>
                                            <p className="text-sm font-bold text-gray-500">No bookings found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try a different filter</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {bookings.map(booking => (
                                                <BookingCard
                                                    key={booking.id}
                                                    booking={booking}
                                                    onAccept={handleAccept}
                                                    onReject={handleReject}
                                                    onStartJob={handleStartJob}
                                                    onComplete={handleComplete}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── Earnings Tab ─── */}
                            {activeTab === 'earnings' && (
                                earnings ? (
                                    <EarningsSummary earnings={earnings} />
                                ) : (
                                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">account_balance_wallet</span>
                                        <p className="text-sm font-bold text-gray-500">No earnings data yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Complete jobs to start earning</p>
                                    </div>
                                )
                            )}

                            {/* ─── Profile Tab ─── */}
                            {activeTab === 'profile' && (
                                <div className="space-y-4">
                                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-3xl">engineering</span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                                    {profile?.full_name || user.displayName || 'Provider'}
                                                </h2>
                                                <p className="text-sm text-gray-500">{user.email || user.phone}</p>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-bold mt-1">
                                                    <span className="material-symbols-outlined text-xs">verified</span>
                                                    Service Provider
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {profile?.address && (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">location_on</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{profile.address}</p>
                                                        {(profile.district || profile.state) && (
                                                            <p className="text-xs text-gray-500">{[profile.district, profile.state].filter(Boolean).join(', ')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {profile?.whatsapp_number && (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">chat</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">WhatsApp</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{profile.whatsapp_number}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {profile?.service_types && profile.service_types.length > 0 && (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">category</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Service Categories</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {profile.service_types.map(st => (
                                                                <span key={st} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold capitalize">
                                                                    {st.replace(/-/g, ' ')}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {profile?.bio && (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg mt-0.5">description</span>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase">Bio</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Link href="/home/profile"
                                        className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">edit</span>
                                        Edit Profile
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
