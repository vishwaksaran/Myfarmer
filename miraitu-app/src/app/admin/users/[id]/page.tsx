'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    fetchUserById,
    fetchUserBookings,
    updateBookingStatus,
    fetchProviderEarningsById,
    type UserRecord,
    type BookingRecord,
    type ProviderEarningsSummary,
} from '@/app/actions/bookings';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<UserRecord | null>(null);
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [providerEarnings, setProviderEarnings] = useState<ProviderEarningsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'activity' | 'provider'>('overview');

    useEffect(() => {
        async function load() {
            const [userRes, bookingsRes] = await Promise.all([
                fetchUserById(userId),
                fetchUserBookings(userId),
            ]);
            setUser(userRes.data);
            setBookings(bookingsRes.data);

            // If user is a service provider, also fetch their earnings
            if (userRes.data?.role === 'service_provider' || userRes.data?.role === 'service-provider') {
                const earningsRes = await fetchProviderEarningsById(userId);
                setProviderEarnings(earningsRes.data);
            }

            setLoading(false);
        }
        load();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-4xl text-purple-600 animate-spin">progress_activity</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">person_off</span>
                <p className="text-gray-500 font-medium mb-4">User not found</p>
                <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    // ─── Compute stats ───────────────────────────────────────────────
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const moduleBreakdown = bookings.reduce((acc, b) => {
        acc[b.module] = (acc[b.module] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = bookings.reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const firstBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;
    const lastBooking = bookings.length > 0 ? bookings[0] : null;

    // Day-of-week activity (for timeline)
    const dayActivity = bookings.reduce((acc, b) => {
        const day = new Date(b.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Monthly activity
    const monthActivity = bookings.reduce((acc, b) => {
        const month = new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const joinedDate = new Date(user.created_at);
    const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        await updateBookingStatus(bookingId, newStatus);
        // Refresh bookings
        const res = await fetchUserBookings(userId);
        setBookings(res.data);
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700',
        contacted: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-100 text-red-700',
    };

    const moduleIcons: Record<string, string> = {
        services: 'home_repair_service',
        land: 'landscape',
        borewell: 'water_pump',
        fencing: 'fence',
        cctv: 'videocam',
        protection: 'shield',
        machinery: 'agriculture',
        livestock: 'pets',
        veterinary: 'vaccines',
    };

    return (
        <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/admin" className="hover:text-green-600 transition-colors">Dashboard</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href="/admin/users" className="hover:text-green-600 transition-colors">Users</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-gray-900 font-semibold">{user.full_name || 'User'}</span>
            </div>

            {/* User Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Avatar */}
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || 'User'} className="size-20 rounded-2xl object-cover border-4 border-gray-100 shadow-sm" />
                    ) : (
                        <div className="size-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-white text-3xl">person</span>
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-gray-900">{user.full_name || 'Unnamed User'}</h1>
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                user.role === 'dealer' ? 'bg-blue-100 text-blue-700' :
                                (user.role === 'service-provider' || user.role === 'service_provider') ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                                {user.role || 'farmer'}
                            </span>
                            {(user.role === 'service_provider' || user.role === 'service-provider') && user.availability_status && (
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                    user.availability_status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                    user.availability_status === 'busy' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {user.availability_status}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {user.phone && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">phone</span>
                                    {user.phone}
                                </span>
                            )}
                            {user.whatsapp_number && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <span className="material-symbols-outlined text-sm">chat</span>
                                    WA: {user.whatsapp_number}
                                </span>
                            )}
                            {user.farm_location && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    {user.farm_location}
                                </span>
                            )}
                            {user.district && (
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    {[user.district, user.state].filter(Boolean).join(', ')}
                                    {user.pincode && <span className="ml-1 text-gray-400">({user.pincode})</span>}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Joined {joinedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                <span className="text-gray-400 ml-1">({daysSinceJoined} days ago)</span>
                            </span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">ID: {user.id}</p>
                        {/* Interests & Onboarding Status */}
                        {(user.interests && user.interests.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {user.interests.map((interest: string) => (
                                    <span key={interest} className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold capitalize">
                                        {interest.replace(/_/g, ' ')}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            {user.onboarding_completed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                    Onboarded
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-bold">
                                    <span className="material-symbols-outlined text-[10px]">pending</span>
                                    Not Onboarded
                                </span>
                            )}
                            {user.farm_size && (
                                <span className="text-[10px] text-gray-400 font-medium">Farm: {user.farm_size.replace(/-/g, ' ')}</span>
                            )}
                            {user.experience_years && (
                                <span className="text-[10px] text-gray-400 font-medium">Exp: {user.experience_years.replace(/-/g, ' ')}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {[
                    { label: 'Total Bookings', value: totalBookings, icon: 'assignment', color: 'bg-blue-500' },
                    { label: 'Pending', value: pendingBookings, icon: 'pending_actions', color: 'bg-amber-500' },
                    { label: 'Confirmed', value: confirmedBookings, icon: 'check_circle', color: 'bg-green-500' },
                    { label: 'Completed', value: completedBookings, icon: 'task_alt', color: 'bg-gray-500' },
                    { label: 'Cancelled', value: cancelledBookings, icon: 'cancel', color: 'bg-red-500' },
                    { label: 'Days Active', value: daysSinceJoined, icon: 'timer', color: 'bg-purple-500' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className={`${stat.color} size-9 rounded-xl flex items-center justify-center mb-2`}>
                            <span className="material-symbols-outlined text-white text-lg">{stat.icon}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-[10px] font-semibold text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                {(['overview', 'bookings', 'activity', ...((user.role === 'service_provider' || user.role === 'service-provider') ? ['provider'] as const : [])] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                            activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'provider' ? '🔧 Provider' : tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}

            {/* ── Overview Tab ──────────────────────────────────── */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bookings by Module */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-green-600">category</span>
                            Bookings by Module
                        </h3>
                        {Object.keys(moduleBreakdown).length === 0 ? (
                            <p className="text-sm text-gray-400">No bookings yet</p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(moduleBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([module, count]) => {
                                        const pct = Math.round((count / totalBookings) * 100);
                                        return (
                                            <div key={module}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="flex items-center gap-2 text-sm font-semibold capitalize text-gray-700">
                                                        <span className="material-symbols-outlined text-base text-gray-400">{moduleIcons[module] || 'widgets'}</span>
                                                        {module}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">{count} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Bookings by Category */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-blue-600">label</span>
                            Bookings by Category
                        </h3>
                        {Object.keys(categoryBreakdown).length === 0 ? (
                            <p className="text-sm text-gray-400">No bookings yet</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(categoryBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([cat, count]) => (
                                        <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold capitalize">
                                            {cat}
                                            <span className="bg-blue-200 text-blue-800 rounded-full px-1.5 py-0.5 text-[10px] font-black">{count}</span>
                                        </span>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Timeline Quick Info */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-purple-600">schedule</span>
                            Timeline
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Joined</span>
                                <span className="text-sm font-bold text-gray-900">{joinedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">First Booking</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {firstBooking ? new Date(firstBooking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Latest Booking</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {lastBooking ? new Date(lastBooking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">Last Updated</span>
                                <span className="text-sm font-bold text-gray-900">{new Date(user.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Day-of-Week Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-amber-600">bar_chart</span>
                            Day-of-Week Activity
                        </h3>
                        {Object.keys(dayActivity).length === 0 ? (
                            <p className="text-sm text-gray-400">No activity yet</p>
                        ) : (
                            <div className="flex items-end gap-2 h-32">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const count = dayActivity[day] || 0;
                                    const maxCount = Math.max(...Object.values(dayActivity), 1);
                                    const heightPct = Math.max((count / maxCount) * 100, 4);
                                    return (
                                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold text-gray-900">{count}</span>
                                            <div
                                                className={`w-full rounded-lg transition-all ${count > 0 ? 'bg-gradient-to-t from-green-500 to-green-400' : 'bg-gray-100'}`}
                                                style={{ height: `${heightPct}%` }}
                                            />
                                            <span className="text-[10px] font-semibold text-gray-500">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Bookings Tab ─────────────────────────────────── */}
            {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {bookings.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">assignment</span>
                            <p className="text-gray-500 font-medium">No bookings from this user</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3">Module</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3">Preferred Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2 capitalize font-semibold text-gray-800">
                                                    <span className="material-symbols-outlined text-base text-gray-400">{moduleIcons[b.module] || 'widgets'}</span>
                                                    {b.module}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-gray-600">{b.category}</td>
                                            <td className="px-4 py-3 text-gray-500">{b.phone}</td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{b.location}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('en-IN') : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-semibold outline-none focus:border-green-500 bg-white cursor-pointer"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} total
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Activity Tab ─────────────────────────────────── */}
            {activeTab === 'activity' && (
                <div className="space-y-6">
                    {/* Monthly Activity */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-green-600">trending_up</span>
                            Monthly Booking Trend
                        </h3>
                        {Object.keys(monthActivity).length === 0 ? (
                            <p className="text-sm text-gray-400">No activity yet</p>
                        ) : (
                            <div className="flex items-end gap-3 h-40 overflow-x-auto pb-2">
                                {Object.entries(monthActivity).map(([month, count]) => {
                                    const maxCount = Math.max(...Object.values(monthActivity), 1);
                                    const heightPct = Math.max((count / maxCount) * 100, 8);
                                    return (
                                        <div key={month} className="flex flex-col items-center gap-1 min-w-[60px]">
                                            <span className="text-xs font-bold text-gray-900">{count}</span>
                                            <div
                                                className="w-10 rounded-lg bg-gradient-to-t from-green-500 to-emerald-400 transition-all"
                                                style={{ height: `${heightPct}%` }}
                                            />
                                            <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">{month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-blue-600">timeline</span>
                            Recent Activity Timeline
                        </h3>
                        {bookings.length === 0 ? (
                            <p className="text-sm text-gray-400">No activity yet</p>
                        ) : (
                            <div className="space-y-0">
                                {bookings.slice(0, 15).map((b, i) => (
                                    <div key={b.id} className="flex gap-4">
                                        {/* Timeline line */}
                                        <div className="flex flex-col items-center">
                                            <div className={`size-3 rounded-full shrink-0 mt-1.5 ${
                                                b.status === 'completed' ? 'bg-green-500' :
                                                b.status === 'cancelled' ? 'bg-red-400' :
                                                b.status === 'pending' ? 'bg-amber-400' :
                                                'bg-blue-400'
                                            }`} />
                                            {i < Math.min(bookings.length, 15) - 1 && (
                                                <div className="w-px flex-1 bg-gray-200 my-1" />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className="pb-5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-gray-900 capitalize">{b.module}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs font-semibold text-gray-500 capitalize">{b.category}</span>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {' '}at{' '}
                                                {new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                {b.location && <span> — {b.location}</span>}
                                            </p>
                                            {b.admin_notes && (
                                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">sticky_note_2</span>
                                                    {b.admin_notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {bookings.length > 15 && (
                                    <p className="text-xs text-gray-400 pl-7">+ {bookings.length - 15} more bookings...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Provider Details Tab ─────────────────────────── */}
            {activeTab === 'provider' && (user.role === 'service_provider' || user.role === 'service-provider') && (
                <div className="space-y-6">
                    {/* Provider Profile Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Service Types */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-amber-600">build</span>
                                Service Types
                            </h3>
                            {user.service_types && user.service_types.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.service_types.map(st => (
                                        <span key={st} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold capitalize border border-amber-200">
                                            <span className="material-symbols-outlined text-base">{moduleIcons[st] || 'handyman'}</span>
                                            {st.replace(/-/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No service types registered</p>
                            )}
                        </div>

                        {/* Availability & Status */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-green-600">toggle_on</span>
                                Availability & Status
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                        user.availability_status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                        user.availability_status === 'busy' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        <span className={`size-2 rounded-full ${
                                            user.availability_status === 'available' ? 'bg-emerald-500' :
                                            user.availability_status === 'busy' ? 'bg-orange-500' :
                                            'bg-gray-400'
                                        }`} />
                                        {user.availability_status || 'unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">WhatsApp</span>
                                    <span className="text-sm font-semibold text-gray-900">{user.whatsapp_number || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Phone</span>
                                    <span className="text-sm font-semibold text-gray-900">{user.phone || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between py-2.5">
                                    <span className="text-sm text-gray-500">Registered</span>
                                    <span className="text-sm font-semibold text-gray-900">{joinedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bio & Address */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-blue-600">info</span>
                                Bio & Address
                            </h3>
                            <div className="space-y-4">
                                {user.bio && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
                                        <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-sm text-gray-700">
                                        {[user.address, user.district, user.state, user.pincode].filter(Boolean).join(', ') || '—'}
                                    </p>
                                </div>
                                {user.farm_location && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Farm / Service Location</p>
                                        <p className="text-sm text-gray-700">{user.farm_location}</p>
                                    </div>
                                )}
                                {(user.latitude || user.longitude) && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coordinates</p>
                                        <p className="text-sm text-gray-700 font-mono">{user.latitude}, {user.longitude}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Earnings Summary */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-green-600">payments</span>
                                Earnings Summary
                            </h3>
                            {providerEarnings ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                                            <p className="text-2xl font-black text-green-700">₹{providerEarnings.net_earnings.toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] font-bold text-green-600 mt-0.5">Net Earnings</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                            <p className="text-2xl font-black text-blue-700">{providerEarnings.completed_jobs}</p>
                                            <p className="text-[10px] font-bold text-blue-600 mt-0.5">Completed Jobs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Total Earned</span>
                                        <span className="text-sm font-bold text-gray-900">₹{providerEarnings.total_earned.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Commission Paid</span>
                                        <span className="text-sm font-bold text-red-600">₹{providerEarnings.total_commission.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Active Jobs</span>
                                        <span className="text-sm font-bold text-amber-600">{providerEarnings.active_jobs}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">This Month (Jobs / Earnings)</span>
                                        <span className="text-sm font-bold text-gray-900">{providerEarnings.this_month_jobs} / ₹{providerEarnings.this_month_earnings.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-gray-500">This Week (Jobs / Earnings)</span>
                                        <span className="text-sm font-bold text-gray-900">{providerEarnings.this_week_jobs} / ₹{providerEarnings.this_week_earnings.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No earnings data available yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
