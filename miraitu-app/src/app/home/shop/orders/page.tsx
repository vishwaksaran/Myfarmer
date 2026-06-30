'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { useAuth } from '@/context/AuthContext';
import { fetchUserShopOrders, type ShopOrderRecord } from '@/app/actions/shop-orders';

function StatusPill({ label, color }: { label: string; color: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple' }) {
    const map: Record<string, string> = {
        green: 'bg-green-100 text-green-700',
        amber: 'bg-amber-100 text-amber-700',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
        gray: 'bg-gray-100 text-gray-700',
        purple: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${map[color]}`}>
            {label}
        </span>
    );
}

function paymentColor(status: string): 'green' | 'amber' | 'red' | 'purple' {
    if (status === 'paid') return 'green';
    if (status === 'payment_pending') return 'amber';
    if (status === 'failed') return 'red';
    return 'purple';
}

function orderColor(status: string): 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple' {
    if (status === 'delivered') return 'green';
    if (status === 'paid' || status === 'packed') return 'blue';
    if (status === 'dispatched' || status === 'in_transit') return 'amber';
    if (status === 'cancelled' || status === 'payment_failed') return 'red';
    if (status === 'refunded') return 'purple';
    return 'gray';
}

export default function MyOrdersPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [orders, setOrders] = useState<ShopOrderRecord[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/user-login?redirect=/home/shop/orders');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;

        let active = true;
        setPageLoading(true);
        fetchUserShopOrders().then((result) => {
            if (!active) return;
            if (result.error) {
                setError(result.error);
            }
            setOrders(result.data);
            setPageLoading(false);
        });

        return () => {
            active = false;
        };
    }, [user]);

    if (loading || !user) {
        return (
            <MiraituLoader />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-6 md:py-8">
                <div className="mx-auto max-w-[1100px] px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">My Orders</h1>
                            <p className="text-sm text-gray-500 mt-1">Track payments, shipping, and delivery updates.</p>
                        </div>
                        <Link href="/home/shop" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Continue Shopping
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {pageLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-100 dark:border-gray-800 text-center">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">No orders yet</h3>
                            <p className="text-sm text-gray-500 mb-5">Your successful orders will appear here.</p>
                            <Link href="/home/shop/all" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110">
                                Start Shopping
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">Order #{order.order_number}</p>
                                                <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                <p className="text-sm font-bold text-primary mt-2">₹{order.total.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <StatusPill label={`Payment: ${order.payment_status.replaceAll('_', ' ')}`} color={paymentColor(order.payment_status)} />
                                                <StatusPill label={`Order: ${order.order_status.replaceAll('_', ' ')}`} color={orderColor(order.order_status)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 md:p-5">
                                        <div className="space-y-2 mb-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700 dark:text-gray-300">{item.product_name} × {item.quantity}</span>
                                                    <span className="font-semibold text-gray-900 dark:text-white">₹{Number(item.line_total).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.tracking_id && (
                                            <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Tracking</p>
                                                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                                    {order.transporter_name ? `${order.transporter_name} • ` : ''}{order.tracking_id}
                                                </p>
                                                {order.tracking_url && (
                                                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 dark:text-blue-300 underline mt-1 inline-block">
                                                        Track shipment
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                                        >
                                            {expandedOrderId === order.id ? 'Hide Timeline' : 'View Timeline'}
                                            <span className="material-symbols-outlined text-base">
                                                {expandedOrderId === order.id ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>

                                        {expandedOrderId === order.id && (
                                            <div className="mt-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                                                {order.events.length === 0 ? (
                                                    <p className="text-xs text-gray-500">No timeline updates yet.</p>
                                                ) : (
                                                    order.events.map((event) => (
                                                        <div key={event.id} className="flex items-start gap-2.5">
                                                            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.message}</p>
                                                                <p className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
