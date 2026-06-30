'use client';

import { useState, useEffect, useCallback } from 'react';
import { useVendorAuth } from '@/context/VendorAuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '@/app/actions/vendor-products';
import MiraituLoader from '@/components/v2/MiraituLoader';

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    compare_at_price: number | null;
    unit: string | null;
    tags: string[];
    images: string[];
    status: string;
    category_id: string | null;
    created_at: string;
    variantCount: number;
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

const UNIT_OPTIONS = ['kg', 'g', 'piece', 'pack', 'litre', 'ml', 'dozen', 'quintal', 'ton'];

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-50 text-green-700 border-green-200',
    archived: 'bg-orange-50 text-orange-700',
    out_of_stock: 'bg-red-50 text-red-700',
};

export default function VendorProductsPage() {
    const { vendor, shop } = useVendorAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formComparePrice, setFormComparePrice] = useState('');
    const [formUnit, setFormUnit] = useState('');
    const [formTags, setFormTags] = useState('');
    const [formStatus, setFormStatus] = useState('draft');

    const loadProducts = useCallback(async () => {
        if (!shop) return;
        setLoading(true);
        const result = await fetchProducts({ shopId: shop.id, page, search, status: statusFilter });
        if (!result.error) {
            setProducts(result.data as Product[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, [shop, page, search, statusFilter]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const resetForm = () => {
        setFormName(''); setFormDesc(''); setFormPrice('');
        setFormComparePrice(''); setFormUnit(''); setFormTags(''); setFormStatus('draft');
        setEditingProduct(null);
    };

    const openAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormDesc(product.description || '');
        setFormPrice(product.price?.toString() || '');
        setFormComparePrice(product.compare_at_price?.toString() || '');
        setFormUnit(product.unit || '');
        setFormTags((product.tags || []).join(', '));
        setFormStatus(product.status);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shop || !vendor) return;
        setSaving(true);

        const input = {
            name: formName.trim(),
            description: formDesc.trim() || undefined,
            price: formPrice ? parseFloat(formPrice) : undefined,
            compareAtPrice: formComparePrice ? parseFloat(formComparePrice) : undefined,
            unit: formUnit || undefined,
            tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
            status: formStatus,
        };

        if (editingProduct) {
            const result = await updateProduct(editingProduct.id, shop.id, input);
            if (result.error) { alert(result.error); setSaving(false); return; }
        } else {
            const result = await createProduct(shop.id, vendor.id, input);
            if (result.error) { alert(result.error); setSaving(false); return; }
        }

        setSaving(false);
        setShowModal(false);
        resetForm();
        loadProducts();
    };

    const handleDelete = async (productId: string) => {
        if (!shop) return;
        if (!confirm('Delete this product? This will also remove all variants.')) return;
        setDeleting(productId);
        const result = await deleteProduct(productId, shop.id);
        if (result.error) alert(result.error);
        else loadProducts();
        setDeleting(null);
    };

    const toggleStatus = async (product: Product) => {
        if (!shop) return;
        const newStatus = product.status === 'active' ? 'draft' : 'active';
        await updateProduct(product.id, shop.id, { status: newStatus });
        loadProducts();
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm text-sm"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all bg-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white min-w-[140px]"
                >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MiraituLoader fullScreen={false} />
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="size-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-green-500">inventory_2</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No products yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start building your catalog by adding your first product</p>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Add First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150 overflow-hidden group">
                            {/* Product Image Area */}
                            <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-5xl text-gray-300">image</span>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {product.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {product.compare_at_price && product.price && product.compare_at_price > product.price && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 truncate text-sm">{product.name}</h3>
                                {product.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                )}

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-baseline gap-1.5">
                                        {product.price ? (
                                            <>
                                                <span className="text-lg font-black text-gray-900">₹{product.price}</span>
                                                {product.unit && <span className="text-xs text-gray-400">/{product.unit}</span>}
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No price set</span>
                                        )}
                                    </div>
                                    {product.variantCount > 0 && (
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                            {product.variantCount} variant{product.variantCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {product.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                                    <button
                                        onClick={() => toggleStatus(product)}
                                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${product.status === 'active' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                    >
                                        {product.status === 'active' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={() => openEdit(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                        <span className="material-symbols-outlined text-gray-500 text-lg">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        disabled={deleting === product.id}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <span className={`material-symbols-outlined text-lg ${deleting === product.id ? 'text-gray-300 animate-spin' : 'text-red-400'}`}>
                                            {deleting === product.id ? 'progress_activity' : 'delete'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-500 px-3">Page {page} of {Math.ceil(total / 20)}</span>
                    <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                <span className="material-symbols-outlined text-gray-400">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Product Name *</label>
                                <input
                                    type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                                    placeholder="e.g. Organic Honey 500g"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                                <textarea
                                    value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3}
                                    placeholder="Tell customers about this product..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                                    <input
                                        type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Compare Price (₹)</label>
                                    <input
                                        type="number" step="0.01" value={formComparePrice} onChange={e => setFormComparePrice(e.target.value)}
                                        placeholder="Original"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Unit</label>
                                    <select
                                        value={formUnit} onChange={e => setFormUnit(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                                    >
                                        <option value="">Select unit</option>
                                        {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                                    <select
                                        value={formStatus} onChange={e => setFormStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tags</label>
                                <input
                                    type="text" value={formTags} onChange={e => setFormTags(e.target.value)}
                                    placeholder="organic, honey, natural (comma separated)"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving || !formName.trim()}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? (
                                        <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>Saving...</>
                                    ) : (
                                        <><span className="material-symbols-outlined text-lg">save</span>{editingProduct ? 'Update' : 'Create'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
