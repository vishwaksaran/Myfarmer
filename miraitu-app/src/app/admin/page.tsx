'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { fetchAllBookings, fetchAllUsers, type BookingRecord, type UserRecord } from '@/app/actions/bookings';
import { fetchAdminShopOrders, type AdminShopOrderRecord } from '@/app/actions/shop-orders';

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [shopOrders, setShopOrders] = useState<AdminShopOrderRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [b, u, s] = await Promise.all([fetchAllBookings(), fetchAllUsers(), fetchAdminShopOrders()]);
            setBookings(b.data);
            setUsers(u.data);
            setShopOrders(s.data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <MiraituLoader fullScreen={false} />
            </div>
        );
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const todayCount = bookings.filter(b => {
        const d = new Date(b.created_at);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;
    const paidShopOrders = shopOrders.filter(o => o.payment_status === 'paid').length;

    const moduleBreakdown = bookings.reduce((acc, b) => {
        acc[b.module] = (acc[b.module] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const stats = [
        { label: 'Total Bookings', value: bookings.length, icon: 'assignment', color: 'bg-blue-500', href: '/admin/bookings' },
        { label: 'Pending', value: pendingCount, icon: 'pending_actions', color: 'bg-amber-500', href: '/admin/bookings?status=pending' },
        { label: 'Today', value: todayCount, icon: 'today', color: 'bg-green-500', href: '/admin/bookings?filter=today' },
        { label: 'Total Users', value: users.length, icon: 'group', color: 'bg-purple-500', href: '/admin/users' },
        { label: 'Paid Shop Orders', value: paidShopOrders, icon: 'payments', color: 'bg-emerald-500', href: '/admin/shop-orders' },
    ];

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        onClick={() => router.push(stat.href)}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.color} size-10 rounded-xl flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white text-xl">{stat.icon}</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 text-lg">arrow_forward</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Module Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Bookings by Module</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(moduleBreakdown).map(([module, count]) => (
                        <div key={module} className="p-4 rounded-xl bg-gray-50 text-center">
                            <p className="text-xl font-black text-gray-900">{count}</p>
                            <p className="text-xs font-bold text-gray-500 capitalize mt-1">{module}</p>
                        </div>
                    ))}
                    {Object.keys(moduleBreakdown).length === 0 && (
                        <p className="text-sm text-gray-400 col-span-full">No bookings yet</p>
                    )}
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
                {bookings.length === 0 ? (
                    <p className="text-sm text-gray-400">No bookings yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="pb-3 pr-4">Name</th>
                                    <th className="pb-3 pr-4">Module</th>
                                    <th className="pb-3 pr-4">Category</th>
                                    <th className="pb-3 pr-4">Phone</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.slice(0, 10).map((b) => (
                                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="py-3 pr-4 font-semibold text-gray-900">{b.full_name}</td>
                                        <td className="py-3 pr-4 capitalize">{b.module}</td>
                                        <td className="py-3 pr-4 capitalize">{b.category}</td>
                                        <td className="py-3 pr-4 text-gray-500">{b.phone}</td>
                                        <td className="py-3 pr-4">
                                            <StatusBadge status={b.status} />
                                        </td>
                                        <td className="py-3 text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700',
        contacted: 'bg-blue-100 text-blue-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
}
