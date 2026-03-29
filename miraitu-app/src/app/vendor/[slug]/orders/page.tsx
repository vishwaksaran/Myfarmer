'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { fetchOrders, createOrder, updateOrderStatus, updatePaymentStatus } from '@/app/actions/vendor-orders';
import { fetchProducts } from '@/app/actions/vendor-products';

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    customer_address: string | null;
    status: string;
    total: number;
    notes: string | null;
    payment_method: string | null;
    payment_status: string;
    created_at: string;
    itemCount: number;
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    refunded: 'bg-gray-100 text-gray-600 border-gray-200',
};
const PAYMENT_COLORS: Record<string, string> = {
    unpaid: 'bg-red-50 text-red-600',
    paid: 'bg-green-50 text-green-600',
    partial: 'bg-amber-50 text-amber-600',
    refunded: 'bg-gray-100 text-gray-500',
};

export default function VendorOrdersPage() {
    const { shop } = useVendorAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Create order form
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddress, setCustAddress] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [orderItems, setOrderItems] = useState<Array<{
        productId: string; productName: string; quantity: number; unitPrice: number;
    }>>([]);
    const [productsList, setProductsList] = useState<Array<{ id: string; name: string; price: number | null }>>([]);

    const loadOrders = useCallback(async () => {
        if (!shop) return;
        setLoading(true);
        const result = await fetchOrders({ shopId: shop.id, page, search, status: statusFilter });
        if (!result.error) {
            setOrders(result.data as Order[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, [shop, page, search, statusFilter]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const loadProducts = async () => {
        if (!shop) return;
        const result = await fetchProducts({ shopId: shop.id, pageSize: 100, status: 'active' });
        if (!result.error) {
            setProductsList(result.data.map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: p.name as string,
                price: p.price as number | null,
            })));
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!shop) return;
        await updateOrderStatus(orderId, shop.id, newStatus);
        loadOrders();
    };

    const handlePaymentToggle = async (orderId: string, current: string) => {
        if (!shop) return;
        const next = current === 'paid' ? 'unpaid' : 'paid';
        await updatePaymentStatus(orderId, shop.id, next);
        loadOrders();
    };

    const addOrderItem = () => {
        setOrderItems([...orderItems, { productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeOrderItem = (idx: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== idx));
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop || orderItems.length === 0) return;
        setCreating(true);

        const items = orderItems.filter(i => i.productId).map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
        }));

        const result = await createOrder(shop.id, {
            customerName: custName,
            customerPhone: custPhone || undefined,
            customerAddress: custAddress || undefined,
            notes: orderNotes || undefined,
            items,
        });

        if (result.error) {
            alert(result.error);
        } else {
            setShowCreate(false);
            setCustName(''); setCustPhone(''); setCustAddress(''); setOrderNotes('');
            setOrderItems([]);
            loadOrders();
        }
        setCreating(false);
    };

    const orderTotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage customer orders</p>
                </div>
                <button
                    onClick={() => { setShowCreate(true); loadProducts(); }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm text-sm"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Create Order
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                    <input
                        type="text" placeholder="Search orders..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 bg-white"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setStatusFilter(''); setPage(1); }}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${!statusFilter ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        All
                    </button>
                    {ORDER_STATUSES.map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors capitalize ${statusFilter === s ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="size-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-blue-500">receipt_long</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Orders will appear here when customers start buying</p>
                    <button onClick={() => { setShowCreate(true); loadProducts(); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Create Manual Order
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Order</th>
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Customer</th>
                                    <th className="text-center px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Items</th>
                                    <th className="text-right px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Total</th>
                                    <th className="text-center px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-center px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Payment</th>
                                    <th className="text-right px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-gray-900">{order.order_number}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                            {order.customer_phone && <p className="text-xs text-gray-400">{order.customer_phone}</p>}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{order.itemCount}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-gray-900">₹{parseFloat(String(order.total)).toFixed(2)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                                className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border outline-none cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                                            >
                                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handlePaymentToggle(order.id, order.payment_status)}
                                                className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${PAYMENT_COLORS[order.payment_status] || 'bg-gray-100'}`}
                                            >
                                                {order.payment_status}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-5 py-4">
                                            {order.notes && (
                                                <span className="material-symbols-outlined text-gray-300 text-lg" title={order.notes}>sticky_note_2</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-500 px-3">Page {page}</span>
                    <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Create Order Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Create Manual Order</h2>
                            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <span className="material-symbols-outlined text-gray-400">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Customer Name *</label>
                                <input type="text" value={custName} onChange={e => setCustName(e.target.value)} required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                                    <input type="tel" value={custPhone} onChange={e => setCustPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Notes</label>
                                    <input type="text" value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Address</label>
                                <input type="text" value={custAddress} onChange={e => setCustAddress(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
                            </div>

                            {/* Order Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Items</label>
                                    <button type="button" onClick={addOrderItem} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span>Add Item
                                    </button>
                                </div>

                                {orderItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2 items-end">
                                        <select
                                            value={item.productId}
                                            onChange={e => {
                                                const prod = productsList.find(p => p.id === e.target.value);
                                                const updated = [...orderItems];
                                                updated[idx] = { productId: e.target.value, productName: prod?.name || '', quantity: 1, unitPrice: prod?.price || 0 };
                                                setOrderItems(updated);
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                                        >
                                            <option value="">Select product</option>
                                            {productsList.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
                                        </select>
                                        <input type="number" min="1" value={item.quantity}
                                            onChange={e => { const u = [...orderItems]; u[idx].quantity = parseInt(e.target.value) || 1; setOrderItems(u); }}
                                            className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center" />
                                        <button type="button" onClick={() => removeOrderItem(idx)} className="p-2 hover:bg-red-50 rounded-lg">
                                            <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                        </button>
                                    </div>
                                ))}

                                {orderItems.length > 0 && (
                                    <div className="text-right mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-sm text-gray-500">Total: </span>
                                        <span className="text-lg font-black text-gray-900">₹{orderTotal.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreate(false)}
                                    className="flex-1 py-2.5 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={creating || !custName || orderItems.length === 0}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                    {creating ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-lg">check</span>}
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
