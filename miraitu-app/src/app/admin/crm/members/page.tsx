'use client';

import { useEffect, useState, useCallback } from 'react';
import MiraituLoader from '@/components/v2/MiraituLoader';
import {
    fetchVendors,
    createVendor,
    resetPassword,
    deactivateVendor,
    reactivateVendor,
    deleteVendor,
    decryptVendorPassword,
    fetchCategoriesByType,
} from '@/app/actions/vendor-members';

interface CategoryItem { id: string; name: string; slug: string; icon: string; category_type: string }
interface VendorRow {
    id: string;
    username: string;
    display_name: string;
    email: string | null;
    status: string;
    is_temp_password: boolean;
    last_login: string | null;
    login_count: number;
    created_at: string;
    shops: { id: string; slug: string; name: string; logo_url: string | null } | null;
    categories?: CategoryItem[];
}

const CATEGORY_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    shop: { label: 'Shop', icon: 'storefront', color: 'text-blue-600 bg-blue-50' },
    machinery: { label: 'Machinery', icon: 'agriculture', color: 'text-orange-600 bg-orange-50' },
    service_provider: { label: 'Service Provider', icon: 'engineering', color: 'text-green-600 bg-green-50' },
};

export default function CrmMembersPage() {
    const [vendors, setVendors] = useState<VendorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const pageSize = 20;

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchVendors({ page, pageSize, search, status: statusFilter });
        if (!result.error) {
            setVendors(result.data as unknown as VendorRow[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, [page, search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleRevealPassword = async (vendorId: string) => {
        if (visiblePasswords[vendorId]) {
            setVisiblePasswords(prev => { const copy = { ...prev }; delete copy[vendorId]; return copy; });
            return;
        }
        const result = await decryptVendorPassword(vendorId);
        if (result.password) {
            setVisiblePasswords(prev => ({ ...prev, [vendorId]: result.password! }));
        }
    };

    const handleReset = async (vendorId: string) => {
        if (!confirm('Reset this vendor\'s password? They will be logged out immediately.')) return;
        setActionLoading(vendorId);
        const result = await resetPassword(vendorId);
        if (result.error) alert(result.error);
        else { alert(`New temp password: ${result.data?.newPassword}`); load(); }
        setActionLoading(null);
    };

    const handleToggleStatus = async (vendor: VendorRow) => {
        const action = vendor.status === 'active' ? 'deactivate' : 'reactivate';
        if (!confirm(`${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} ${vendor.username}?`)) return;
        setActionLoading(vendor.id);
        const result = action === 'deactivate' ? await deactivateVendor(vendor.id) : await reactivateVendor(vendor.id);
        if (result.error) alert(result.error);
        else load();
        setActionLoading(null);
    };

    const handleDelete = async (vendorId: string) => {
        if (!confirm('Permanently delete this vendor? This cannot be undone.')) return;
        setActionLoading(vendorId);
        const result = await deleteVendor(vendorId);
        if (result.error) alert(result.error);
        else load();
        setActionLoading(null);
    };

    const handleCsvExport = () => {
        const header = 'Username,Display Name,Email,Status,Shop,Slug,Categories,Last Login,Login Count\n';
        const rows = vendors.map(v =>
            `"${v.username}","${v.display_name}","${v.email || ''}","${v.status}","${v.shops?.name || ''}","${v.shops?.slug || ''}","${(v.categories || []).map(c => c.name).join('; ')}","${v.last_login || 'Never'}","${v.login_count}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Vendor Members</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} vendor{total !== 1 ? 's' : ''} total</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCsvExport}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">download</span>CSV
                    </button>
                    <button onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-lg">person_add</span>Add Vendor
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">search</span>
                    <input type="text" value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by username, name, or email..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <MiraituLoader fullScreen={false} />
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">people</span>
                        <p className="text-sm font-medium">No vendors found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="text-left p-4">Vendor</th>
                                <th className="text-left p-4">Categories</th>
                                <th className="text-left p-4">Password</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Last Login</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vendors.map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                                <span className="text-white text-sm font-bold">{v.display_name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{v.display_name}</p>
                                                <p className="text-xs text-gray-400">@{v.username} • <span className="font-mono">/{v.shops?.slug}</span></p>
                                                {v.email && <p className="text-[10px] text-gray-400">{v.email}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(v.categories || []).length === 0 ? (
                                                <span className="text-xs text-gray-400">None</span>
                                            ) : (
                                                (v.categories || []).map((cat: CategoryItem) => {
                                                    const typeInfo = CATEGORY_TYPE_LABELS[cat.category_type] || CATEGORY_TYPE_LABELS.shop;
                                                    return (
                                                        <span key={cat.id}
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${typeInfo.color}`}>
                                                            <span className="material-symbols-outlined text-xs">{cat.icon || typeInfo.icon}</span>
                                                            {cat.name}
                                                        </span>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => handleRevealPassword(v.id)}
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                                            <span className="material-symbols-outlined text-sm">
                                                {visiblePasswords[v.id] ? 'visibility_off' : 'visibility'}
                                            </span>
                                            {visiblePasswords[v.id] ? (
                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-[11px]">{visiblePasswords[v.id]}</code>
                                            ) : 'Reveal'}
                                        </button>
                                        {v.is_temp_password && (
                                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">TEMP</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${v.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">
                                        {v.last_login ? new Date(v.last_login).toLocaleString() : 'Never'}
                                        <p className="text-[10px] text-gray-400">{v.login_count} login{v.login_count !== 1 ? 's' : ''}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleReset(v.id)} disabled={actionLoading === v.id}
                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Reset password">
                                                <span className="material-symbols-outlined text-lg">lock_reset</span>
                                            </button>
                                            <button onClick={() => handleToggleStatus(v)} disabled={actionLoading === v.id}
                                                className={`p-2 rounded-lg ${v.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={v.status === 'active' ? 'Deactivate' : 'Reactivate'}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {v.status === 'active' ? 'block' : 'check_circle'}
                                                </span>
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} disabled={actionLoading === v.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateVendorWizard
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); load(); }}
                />
            )}
        </div>
    );
}

/* ── 3-Step Create Vendor Wizard ─────────────────────────────── */

type CatGroups = Record<string, CategoryItem[]>;

function CreateVendorWizard({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ tempPassword: string; loginUrl: string } | null>(null);

    // Step 1: Vendor Details
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [vendorSlug, setVendorSlug] = useState('');

    // Step 2 & 3: Categories
    const [categories, setCategories] = useState<CatGroups>({ shop: [], machinery: [], service_provider: [] });
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
    const [catLoading, setCatLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setCatLoading(true);
            const result = await fetchCategoriesByType();
            if (!result.error) setCategories(result.data as CatGroups);
            setCatLoading(false);
        })();
    }, []);

    const autoSlug = (value: string) => {
        setDisplayName(value);
        setVendorSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    };

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectedTypes = new Set(
        [...selectedCategoryIds].map(id => {
            for (const [type, cats] of Object.entries(categories)) {
                if (cats.some(c => c.id === id)) return type;
            }
            return '';
        }).filter(Boolean)
    );

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);

        const result = await createVendor({
            shopSlug: vendorSlug,
            shopName: displayName,
            username,
            displayName,
            email: email || undefined,
            categoryIds: [...selectedCategoryIds],
        });

        if (result.error) {
            setError(result.error);
            setSubmitting(false);
            return;
        }

        setSuccess({
            tempPassword: result.data!.tempPassword,
            loginUrl: result.data!.loginUrl,
        });
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Add New Vendor</h3>
                    {!success && (
                        <div className="flex items-center gap-2 mt-3">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {step > s ? '✓' : s}
                                    </div>
                                    <span className={`text-xs font-medium ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {s === 1 ? 'Details' : s === 2 ? 'Category Type' : 'Subcategories'}
                                    </span>
                                    {s < 3 && <div className={`w-6 h-0.5 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                            <span className="material-symbols-outlined text-lg">error</span>{error}
                        </div>
                    )}

                    {/* Success Screen */}
                    {success ? (
                        <div className="text-center py-4">
                            <div className="size-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Vendor Created!</h4>
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Username</span>
                                    <span className="text-sm font-mono font-bold">{username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Temp Password</span>
                                    <code className="text-sm font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{success.tempPassword}</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Login URL</span>
                                    <span className="text-xs font-mono text-blue-600">{success.loginUrl}</span>
                                </div>
                            </div>
                            <button onClick={onCreated}
                                className="w-full py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700">Done</button>
                        </div>
                    ) : step === 1 ? (
                        /* Step 1: Vendor Details */
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Display Name *</label>
                                <input type="text" value={displayName} onChange={(e) => autoSlug(e.target.value)} required
                                    placeholder="e.g., Ralos" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                    Vendor Slug <span className="normal-case text-gray-400">(URL: /vendor/{vendorSlug || '...'})</span>
                                </label>
                                <input type="text" value={vendorSlug}
                                    onChange={(e) => setVendorSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="ralos" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 font-mono" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Username *</label>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                                    placeholder="ralos" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email <span className="normal-case text-gray-400">(optional)</span></label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vendor@example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                                <button type="button" onClick={() => setStep(2)} disabled={!displayName || !vendorSlug || !username}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50">
                                    Next →
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        /* Step 2: Category Types */
                        <div>
                            <p className="text-sm text-gray-600 mb-4">Select which sections <strong>{displayName}</strong> operates in:</p>
                            <div className="space-y-3">
                                {Object.entries(CATEGORY_TYPE_LABELS).map(([type, info]) => {
                                    const cats = categories[type] || [];
                                    const selectedInType = cats.filter(c => selectedCategoryIds.has(c.id)).length;
                                    const isSelected = selectedInType > 0;
                                    return (
                                        <button key={type} type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    // Deselect all in this type
                                                    setSelectedCategoryIds(prev => {
                                                        const next = new Set(prev);
                                                        cats.forEach(c => next.delete(c.id));
                                                        return next;
                                                    });
                                                } else {
                                                    setStep(3); // Go to step 3 to pick subcategories
                                                }
                                            }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className={`size-12 rounded-xl flex items-center justify-center ${info.color}`}>
                                                <span className="material-symbols-outlined text-2xl">{info.icon}</span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold text-gray-900">{info.label}</p>
                                                <p className="text-xs text-gray-500">{cats.length} subcategories available</p>
                                            </div>
                                            {isSelected && (
                                                <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-lg">{selectedInType} selected</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 pt-5">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">← Back</button>
                                <button type="button" onClick={() => setStep(3)}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700">
                                    {selectedTypes.size > 0 ? 'Review Subcategories →' : 'Pick Subcategories →'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Step 3: Subcategories */
                        <div>
                            <p className="text-sm text-gray-600 mb-4">Pick specific subcategories for <strong>{displayName}</strong>:</p>

                            {catLoading ? (
                                <div className="flex justify-center py-10">
                                    <span className="material-symbols-outlined text-3xl text-green-600 animate-spin">progress_activity</span>
                                </div>
                            ) : (
                                <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2">
                                    {Object.entries(CATEGORY_TYPE_LABELS).map(([type, info]) => {
                                        const cats = categories[type] || [];
                                        if (cats.length === 0) return null;
                                        return (
                                            <div key={type}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`material-symbols-outlined text-sm ${info.color.split(' ')[0]}`}>{info.icon}</span>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{info.label}</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {cats.map(cat => {
                                                        const isOn = selectedCategoryIds.has(cat.id);
                                                        return (
                                                            <button key={cat.id} type="button"
                                                                onClick={() => toggleCategory(cat.id)}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${isOn ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                                                                <span className="material-symbols-outlined text-sm">{isOn ? 'check_box' : 'check_box_outline_blank'}</span>
                                                                {cat.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                                <strong>{selectedCategoryIds.size}</strong> subcategor{selectedCategoryIds.size === 1 ? 'y' : 'ies'} selected
                                across <strong>{selectedTypes.size}</strong> type{selectedTypes.size !== 1 ? 's' : ''}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setStep(2)}
                                    className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">← Back</button>
                                <button type="button" onClick={handleSubmit}
                                    disabled={submitting || selectedCategoryIds.size === 0}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting ? <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> : 'Create Vendor'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
