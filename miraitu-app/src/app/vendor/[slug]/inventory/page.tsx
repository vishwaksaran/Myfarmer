'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { fetchInventory, updateStock } from '@/app/actions/vendor-inventory';

interface InventoryItem {
    productId: string;
    productName: string;
    variantId: string | null;
    variantName: string | null;
    sku: string | null;
    price: number | null;
    stock: number;
    threshold: number;
    isLowStock: boolean;
    unit: string | null;
}

export default function VendorInventoryPage() {
    const { shop } = useVendorAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editQty, setEditQty] = useState('');
    const [saving, setSaving] = useState(false);

    const loadInventory = useCallback(async () => {
        if (!shop) return;
        setLoading(true);
        const result = await fetchInventory({ shopId: shop.id, lowStockOnly });
        if (!result.error) {
            setItems(result.data as InventoryItem[]);
        }
        setLoading(false);
    }, [shop, lowStockOnly]);

    useEffect(() => { loadInventory(); }, [loadInventory]);

    const totalItems = items.length;
    const lowStockCount = items.filter(i => i.isLowStock && i.stock > 0).length;
    const outOfStockCount = items.filter(i => i.stock === 0).length;

    const getItemKey = (item: InventoryItem) => item.variantId ? `${item.productId}_${item.variantId}` : item.productId;

    const startEdit = (item: InventoryItem) => {
        setEditingId(getItemKey(item));
        setEditQty(item.stock.toString());
    };

    const saveStock = async (item: InventoryItem) => {
        setSaving(true);
        const newQty = parseInt(editQty) || 0;
        await updateStock(item.productId, item.variantId, newQty);
        setEditingId(null);
        setSaving(false);
        loadInventory();
    };

    const getStockColor = (item: InventoryItem) => {
        if (item.stock === 0) return 'text-red-600 bg-red-50';
        if (item.isLowStock) return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    const getStockBorder = (item: InventoryItem) => {
        if (item.stock === 0) return 'border-l-4 border-l-red-400';
        if (item.isLowStock) return 'border-l-4 border-l-amber-400';
        return '';
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">Inventory</h1>
                <p className="text-sm text-gray-500 mt-1">Monitor stock levels and manage supply</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">inventory_2</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{totalItems}</p>
                            <p className="text-xs font-semibold text-gray-500">Total Items</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">warning</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-amber-600">{lowStockCount}</p>
                            <p className="text-xs font-semibold text-gray-500">Low Stock</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">remove_shopping_cart</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-red-600">{outOfStockCount}</p>
                            <p className="text-xs font-semibold text-gray-500">Out of Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-6">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                        type="checkbox"
                        checked={lowStockOnly}
                        onChange={e => setLowStockOnly(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show low stock only</span>
                </label>
            </div>

            {/* Inventory Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="size-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-amber-500">warehouse</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {lowStockOnly ? 'No low stock items' : 'No inventory items'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {lowStockOnly ? 'All items are well stocked!' : 'Add products to start tracking inventory'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Variant</th>
                                    <th className="text-left px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">SKU</th>
                                    <th className="text-right px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                                    <th className="text-center px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                                    <th className="text-center px-5 py-3 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((item) => {
                                    const key = getItemKey(item);
                                    const isEditing = editingId === key;
                                    return (
                                        <tr key={key} className={`hover:bg-gray-50/50 transition-colors ${getStockBorder(item)}`}>
                                            <td className="px-5 py-4 font-semibold text-gray-900">{item.productName}</td>
                                            <td className="px-5 py-4 text-gray-500">{item.variantName || '—'}</td>
                                            <td className="px-5 py-4 text-gray-400 font-mono text-xs">{item.sku || '—'}</td>
                                            <td className="px-5 py-4 text-right font-bold text-gray-900">
                                                {item.price ? `₹${item.price}` : '—'}
                                                {item.unit && <span className="text-gray-400 font-normal">/{item.unit}</span>}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="number" min="0" value={editQty}
                                                            onChange={e => setEditQty(e.target.value)}
                                                            className="w-20 px-2 py-1 border border-green-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-green-500/20"
                                                            autoFocus
                                                            onKeyDown={e => { if (e.key === 'Enter') saveStock(item); if (e.key === 'Escape') setEditingId(null); }}
                                                        />
                                                        <button onClick={() => saveStock(item)} disabled={saving}
                                                            className="p-1 hover:bg-green-50 rounded">
                                                            <span className="material-symbols-outlined text-green-600 text-lg">check</span>
                                                        </button>
                                                        <button onClick={() => setEditingId(null)} className="p-1 hover:bg-gray-100 rounded">
                                                            <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className={`text-sm font-bold px-3 py-1 rounded-full ${getStockColor(item)} hover:opacity-80 transition-opacity cursor-pointer`}
                                                        title="Click to edit"
                                                    >
                                                        {item.stock}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {item.stock === 0 ? (
                                                    <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                                                ) : item.isLowStock ? (
                                                    <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">In Stock</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-[10px] text-gray-400">≤{item.threshold}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
