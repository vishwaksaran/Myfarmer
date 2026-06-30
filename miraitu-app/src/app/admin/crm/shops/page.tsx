'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchShops, createShop, updateShop, deleteShop } from '@/app/actions/vendor-shops';
import MiraituLoader from '@/components/v2/MiraituLoader';

interface ShopRow {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    status: string;
    created_at: string;
}

export default function CrmShopsPage() {
    const [shops, setShops] = useState<ShopRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editShop, setEditShop] = useState<ShopRow | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchShops();
        if (!result.error) setShops(result.data as ShopRow[]);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (shopId: string) => {
        if (!confirm('Delete this shop? This will also delete all associated vendor credentials.')) return;
        setActionLoading(shopId);
        const result = await deleteShop(shopId);
        if (result.error) alert(result.error);
        else load();
        setActionLoading(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Shops</h1>
                    <p className="text-sm text-gray-500 mt-1">{shops.length} shop{shops.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">add_business</span>
                    Add Shop
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MiraituLoader fullScreen={false} />
                </div>
            ) : shops.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">storefront</span>
                    <p className="text-sm font-medium">No shops yet</p>
                    <p className="text-xs mt-1">Create your first shop to start onboarding vendors</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shops.map((shop) => (
                        <div key={shop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {shop.logo_url ? (
                                        <img src={shop.logo_url} alt={shop.name} className="size-12 rounded-xl object-cover" />
                                    ) : (
                                        <div className="size-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-2xl">storefront</span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900">{shop.name}</h3>
                                        <p className="text-xs text-gray-400 font-mono">/{shop.slug}</p>
                                    </div>
                                </div>
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                    shop.status === 'active'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {shop.status}
                                </span>
                            </div>

                            {shop.description && (
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{shop.description}</p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                {shop.contact_email && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">mail</span>
                                        {shop.contact_email}
                                    </span>
                                )}
                                {shop.contact_phone && (
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        {shop.contact_phone}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 border-t border-gray-100 pt-3">
                                <button
                                    onClick={() => setEditShop(shop)}
                                    className="flex-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(shop.id)}
                                    disabled={actionLoading === shop.id}
                                    className="py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <ShopFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSaved={() => { setShowCreateModal(false); load(); }}
                />
            )}

            {/* Edit Modal */}
            {editShop && (
                <ShopFormModal
                    shop={editShop}
                    onClose={() => setEditShop(null)}
                    onSaved={() => { setEditShop(null); load(); }}
                />
            )}
        </div>
    );
}

function ShopFormModal({
    shop,
    onClose,
    onSaved,
}: {
    shop?: ShopRow;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!shop;
    const [name, setName] = useState(shop?.name || '');
    const [slug, setSlug] = useState(shop?.slug || '');
    const [description, setDescription] = useState(shop?.description || '');
    const [logoUrl, setLogoUrl] = useState(shop?.logo_url || '');
    const [contactPhone, setContactPhone] = useState(shop?.contact_phone || '');
    const [contactEmail, setContactEmail] = useState(shop?.contact_email || '');
    const [status, setStatus] = useState(shop?.status || 'active');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setName(value);
        if (!isEdit) {
            setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const data = {
            name, slug, description: description || null,
            logo_url: logoUrl || null, contact_phone: contactPhone || null,
            contact_email: contactEmail || null, status,
        };

        let result;
        if (isEdit) {
            result = await updateShop(shop!.id, data);
        } else {
            result = await createShop(data);
        }

        if (result.error) {
            setError(result.error);
            setSubmitting(false);
            return;
        }

        onSaved();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{isEdit ? 'Edit Shop' : 'Create New Shop'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Shop Name *</label>
                        <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required
                            placeholder="e.g., Ralos" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Slug * <span className="normal-case text-gray-400">(URL path)</span></label>
                        <input type="text" value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            required readOnly={isEdit}
                            placeholder="e.g., ralos"
                            className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none font-mono ${isEdit ? 'bg-gray-50 text-gray-500' : 'focus:border-green-500'}`} />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this shop sell?" rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 resize-none" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Logo URL</label>
                        <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                            <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                        </div>
                    </div>

                    {isEdit && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={submitting || !name || !slug}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : (isEdit ? 'Save Changes' : 'Create Shop')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
