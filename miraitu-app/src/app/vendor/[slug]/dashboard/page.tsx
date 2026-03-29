'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { fetchDashboardStats, fetchRecentOrders } from '@/app/actions/vendor-analytics';

interface RecentOrder {
    id: string;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-indigo-50 text-indigo-700',
    shipped: 'bg-cyan-50 text-cyan-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
};

export default function VendorDashboard() {
    const { vendor, shop } = useVendorAuth();
    const slug = shop?.slug || '';
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, pendingOrders: 0, revenue: 0 });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

    const loadData = useCallback(async () => {
        if (!shop) return;
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
            fetchDashboardStats(shop.id),
            fetchRecentOrders(shop.id),
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (ordersRes.data) setRecentOrders(ordersRes.data as RecentOrder[]);
        setLoading(false);
    }, [shop]);

    useEffect(() => { loadData(); }, [loadData]);

    const statCards = [
        { label: 'Total Products', value: stats.totalProducts.toString(), icon: 'inventory_2', gradient: 'from-blue-500 to-blue-600' },
        { label: 'Active Orders', value: stats.activeOrders.toString(), icon: 'receipt_long', gradient: 'from-amber-500 to-amber-600' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'currency_rupee', gradient: 'from-green-500 to-emerald-600' },
        { label: 'Pending', value: stats.pendingOrders.toString(), icon: 'pending_actions', gradient: 'from-red-500 to-rose-600' },
    ];

    return (
        <div>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                    Welcome back, {vendor?.displayName || 'Vendor'} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Here&apos;s what&apos;s happening with <strong>{shop?.name}</strong> today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`bg-gradient-to-br ${stat.gradient} size-10 rounded-xl flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white text-xl">{stat.icon}</span>
                            </div>
                            {loading && <span className="material-symbols-outlined text-gray-300 text-sm animate-spin">progress_activity</span>}
                        </div>
                        <p className="text-2xl font-black text-gray-900">{loading ? '—' : stat.value}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: 'add_circle', label: 'Add Product', href: `/vendor/${slug}/products`, color: 'text-green-600 bg-green-50 hover:bg-green-100' },
                        { icon: 'local_shipping', label: 'View Orders', href: `/vendor/${slug}/orders`, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                        { icon: 'warehouse', label: 'Inventory', href: `/vendor/${slug}/inventory`, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                        { icon: 'analytics', label: 'Analytics', href: `/vendor/${slug}/analytics`, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                    ].map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
                        >
                            <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                            <span className="text-xs font-bold">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    {recentOrders.length > 0 && (
                        <Link href={`/vendor/${slug}/orders`} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                            View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="material-symbols-outlined text-3xl text-green-600 animate-spin">progress_activity</span>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                        <p className="text-sm font-medium">No orders yet</p>
                        <p className="text-xs mt-1">Orders will appear here once customers start buying</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-500 text-lg">receipt</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                                        <p className="text-xs text-gray-400 truncate">{order.customer_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">₹{parseFloat(String(order.total)).toFixed(0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
