'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import MiraituLoader from '@/components/v2/MiraituLoader';
import {
    fetchDashboardStats,
    fetchTopProducts,
    fetchOrderStatusBreakdown,
    fetchRevenueByPeriod,
} from '@/app/actions/vendor-analytics';

interface TopProduct {
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
}

const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#6366f1',
    shipped: '#06b6d4',
    delivered: '#22c55e',
    cancelled: '#ef4444',
    refunded: '#9ca3af',
};

export default function VendorAnalyticsPage() {
    const { shop } = useVendorAuth();
    const [period, setPeriod] = useState(30);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, pendingOrders: 0, revenue: 0 });
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
    const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number }>>([]);

    const loadData = useCallback(async () => {
        if (!shop) return;
        setLoading(true);

        const [statsRes, topRes, breakdownRes, revenueRes] = await Promise.all([
            fetchDashboardStats(shop.id),
            fetchTopProducts(shop.id),
            fetchOrderStatusBreakdown(shop.id),
            fetchRevenueByPeriod(shop.id, period),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (topRes.data) setTopProducts(topRes.data as TopProduct[]);
        if (breakdownRes.data) setStatusBreakdown(breakdownRes.data as Record<string, number>);
        if (revenueRes.data) setRevenueData(revenueRes.data as Array<{ date: string; revenue: number }>);

        setLoading(false);
    }, [shop, period]);

    useEffect(() => { loadData(); }, [loadData]);

    const totalOrders = Object.values(statusBreakdown).reduce((s, v) => s + v, 0);
    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.revenue)) : 0;
    const avgOrderValue = totalOrders > 0 ? stats.revenue / totalOrders : 0;
    const totalUnitsSold = topProducts.reduce((s, p) => s + p.unitsSold, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <MiraituLoader fullScreen={false} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your store&apos;s performance</p>
                </div>
                <div className="flex gap-2">
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setPeriod(d)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${period === d ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                            {d}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: 'currency_rupee', gradient: 'from-green-500 to-emerald-600' },
                    { label: 'Total Orders', value: totalOrders.toString(), icon: 'receipt_long', gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Units Sold', value: totalUnitsSold.toString(), icon: 'shopping_bag', gradient: 'from-amber-500 to-amber-600' },
                    { label: 'Avg. Order Value', value: `₹${avgOrderValue.toFixed(0)}`, icon: 'trending_up', gradient: 'from-indigo-500 to-indigo-600' },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`size-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white text-xl">{card.icon}</span>
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{card.value}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h2>
                    {revenueData.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
                                <p className="text-sm">No revenue data in this period</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-end gap-1 h-48">
                            {revenueData.map((d, i) => {
                                const height = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{d.revenue.toFixed(0)}
                                        </div>
                                        <div
                                            className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg min-h-[4px] transition-all hover:from-green-600 hover:to-emerald-500"
                                            style={{ height: `${Math.max(height, 2)}%` }}
                                        />
                                        <span className="text-[8px] text-gray-400 -rotate-45 origin-top-left mt-1">
                                            {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Breakdown</h2>
                    {totalOrders === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-4xl mb-2">donut_large</span>
                                <p className="text-sm">No orders yet</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Visual ring */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative size-32">
                                    <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                                        {(() => {
                                            let offset = 0;
                                            return Object.entries(statusBreakdown).map(([status, count]) => {
                                                const pct = (count / totalOrders) * 100;
                                                const dash = `${pct} ${100 - pct}`;
                                                const el = (
                                                    <circle key={status} cx="18" cy="18" r="14" fill="none"
                                                        stroke={STATUS_COLORS[status] || '#9ca3af'} strokeWidth="4"
                                                        strokeDasharray={dash} strokeDashoffset={`-${offset}`} />
                                                );
                                                offset += pct;
                                                return el;
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xl font-black text-gray-900">{totalOrders}</p>
                                            <p className="text-[10px] text-gray-400 font-semibold">Orders</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            {Object.entries(statusBreakdown).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] || '#9ca3af' }} />
                                        <span className="text-xs font-semibold text-gray-600 capitalize">{status}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
                {topProducts.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-400">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                            <p className="text-sm">No sales data yet</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topProducts.map((product, idx) => (
                            <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={`size-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{product.name}</p>
                                    <p className="text-xs text-gray-400">{product.unitsSold} units sold</p>
                                </div>
                                <p className="font-bold text-green-600 text-sm">₹{product.revenue.toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
