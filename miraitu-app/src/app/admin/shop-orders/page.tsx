'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
    fetchAdminShopOrders,
    updateAdminShopOrder,
    type AdminShopOrderRecord,
    type ShopOrderStatus,
} from '@/app/actions/shop-orders';

const ORDER_STATUS_OPTIONS: { value: ShopOrderStatus; label: string }[] = [
    { value: 'created', label: 'Created' },
    { value: 'paid', label: 'Paid' },
    { value: 'packed', label: 'Packed' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_FILTERS = [
    { value: '', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'payment_pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
];

function OrderStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        created: 'bg-gray-100 text-gray-700',
        paid: 'bg-emerald-100 text-emerald-700',
        packed: 'bg-sky-100 text-sky-700',
        dispatched: 'bg-indigo-100 text-indigo-700',
        in_transit: 'bg-cyan-100 text-cyan-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        payment_failed: 'bg-amber-100 text-amber-700',
        refunded: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status.replaceAll('_', ' ')}
        </span>
    );
}

function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        payment_pending: 'bg-amber-100 text-amber-700',
        paid: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        refunded: 'bg-purple-100 text-purple-700',
    };

    return (
        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status.replaceAll('_', ' ')}
        </span>
    );
}

export default function AdminShopOrdersPage() {
    const [orders, setOrders] = useState<AdminShopOrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [transportDrafts, setTransportDrafts] = useState<Record<string, {
        transporterName: string;
        trackingId: string;
        trackingUrl: string;
        adminNotes: string;
    }>>({});

    const loadOrders = async () => {
        setLoading(true);
        setError('');
        const result = await fetchAdminShopOrders();
        if (result.error) {
            setError(result.error);
        }
        setOrders(result.data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (paymentFilter && order.payment_status !== paymentFilter) {
                return false;
            }
            if (statusFilter && order.order_status !== statusFilter) {
                return false;
            }
            if (!searchQuery.trim()) {
                return true;
            }

            const q = searchQuery.toLowerCase();
            return (
                order.order_number.toLowerCase().includes(q) ||
                order.customer_name.toLowerCase().includes(q) ||
                order.customer_phone.toLowerCase().includes(q) ||
                (order.tracking_id || '').toLowerCase().includes(q)
            );
        });
    }, [orders, paymentFilter, statusFilter, searchQuery]);

    const handleStatusChange = async (orderId: string, nextStatus: ShopOrderStatus) => {
        setUpdatingOrderId(orderId);
        const result = await updateAdminShopOrder({ orderId, orderStatus: nextStatus });
        if (!result.success) {
            setError(result.error || 'Failed to update order status.');
        }
        await loadOrders();
        setUpdatingOrderId(null);
    };

    const toggleExpand = (order: AdminShopOrderRecord) => {
        if (expandedOrderId === order.id) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(order.id);
        setTransportDrafts((prev) => ({
            ...prev,
            [order.id]: {
                transporterName: order.transporter_name || '',
                trackingId: order.tracking_id || '',
                trackingUrl: order.tracking_url || '',
                adminNotes: order.admin_notes || '',
            },
        }));
    };

    const saveTransportDetails = async (orderId: string) => {
        const draft = transportDrafts[orderId];
        if (!draft) return;

        setUpdatingOrderId(orderId);
        const result = await updateAdminShopOrder({
            orderId,
            transporterName: draft.transporterName,
            trackingId: draft.trackingId,
            trackingUrl: draft.trackingUrl,
            adminNotes: draft.adminNotes,
        });

        if (!result.success) {
            setError(result.error || 'Failed to update transport details.');
        }

        await loadOrders();
        setUpdatingOrderId(null);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Shop Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Track paid orders, manage transportation, and update delivery status.</p>
                </div>
                <button
                    onClick={loadOrders}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Refresh
                </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[220px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search order number, customer, tracking..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                    />
                </div>
                <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    {PAYMENT_FILTERS.map((filter) => (
                        <option key={filter.value} value={filter.value}>{filter.label}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    <option value="">All Order Status</option>
                    {ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
                    <p className="text-gray-500 font-medium">No shop orders found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Order Status</th>
                                    <th className="px-4 py-3">Tracking</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <Fragment key={order.id}>
                                        <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900">#{order.order_number}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                                <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                                {order.customer_email && <p className="text-xs text-gray-400">{order.customer_email}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                                                <p className="text-xs text-gray-500">{order.items.length} item(s)</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <PaymentStatusBadge status={order.payment_status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-2">
                                                    <OrderStatusBadge status={order.order_status} />
                                                    <select
                                                        value={order.order_status}
                                                        disabled={updatingOrderId === order.id}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value as ShopOrderStatus)}
                                                        className="block px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-green-500"
                                                    >
                                                        {ORDER_STATUS_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.tracking_id ? (
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-xs">{order.tracking_id}</p>
                                                        {order.transporter_name && <p className="text-[11px] text-gray-500">{order.transporter_name}</p>}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400">Not assigned</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleExpand(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-base">
                                                        {expandedOrderId === order.id ? 'expand_less' : 'edit'}
                                                    </span>
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>

                                        {expandedOrderId === order.id && (
                                            <tr className="bg-gray-50/70 border-b border-gray-100">
                                                <td colSpan={7} className="px-4 py-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transporter Name</label>
                                                            <input
                                                                type="text"
                                                                value={transportDrafts[order.id]?.transporterName || ''}
                                                                onChange={(e) => setTransportDrafts((prev) => ({
                                                                    ...prev,
                                                                    [order.id]: {
                                                                        ...(prev[order.id] || { transporterName: '', trackingId: '', trackingUrl: '', adminNotes: '' }),
                                                                        transporterName: e.target.value,
                                                                    },
                                                                }))}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                                                                placeholder="Delhivery / Blue Dart / local transport"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracking ID</label>
                                                            <input
                                                                type="text"
                                                                value={transportDrafts[order.id]?.trackingId || ''}
                                                                onChange={(e) => setTransportDrafts((prev) => ({
                                                                    ...prev,
                                                                    [order.id]: {
                                                                        ...(prev[order.id] || { transporterName: '', trackingId: '', trackingUrl: '', adminNotes: '' }),
                                                                        trackingId: e.target.value,
                                                                    },
                                                                }))}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                                                                placeholder="Tracking number"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tracking URL</label>
                                                            <input
                                                                type="text"
                                                                value={transportDrafts[order.id]?.trackingUrl || ''}
                                                                onChange={(e) => setTransportDrafts((prev) => ({
                                                                    ...prev,
                                                                    [order.id]: {
                                                                        ...(prev[order.id] || { transporterName: '', trackingId: '', trackingUrl: '', adminNotes: '' }),
                                                                        trackingUrl: e.target.value,
                                                                    },
                                                                }))}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Notes</label>
                                                            <textarea
                                                                value={transportDrafts[order.id]?.adminNotes || ''}
                                                                onChange={(e) => setTransportDrafts((prev) => ({
                                                                    ...prev,
                                                                    [order.id]: {
                                                                        ...(prev[order.id] || { transporterName: '', trackingId: '', trackingUrl: '', adminNotes: '' }),
                                                                        adminNotes: e.target.value,
                                                                    },
                                                                }))}
                                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-green-500 min-h-20"
                                                                placeholder="Dispatch notes / handling instructions"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => setExpandedOrderId(null)}
                                                            className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveTransportDetails(order.id)}
                                                            disabled={updatingOrderId === order.id}
                                                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {updatingOrderId === order.id ? 'Saving...' : 'Save Updates'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
