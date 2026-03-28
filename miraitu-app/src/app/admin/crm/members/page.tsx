'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    fetchVendors,
    fetchShopsForDropdown,
    createVendor,
    resetPassword,
    deactivateVendor,
    reactivateVendor,
    deleteVendor,
    decryptVendorPassword,
    updateVendor,
} from '@/app/actions/vendor-members';

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
    shops: { id: string; slug: string; name: string; logo_url: string | null };
}

interface Shop {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    status: string;
}

export default function CrmMembersPage() {
    const [vendors, setVendors] = useState<VendorRow[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const pageSize = 20;

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<VendorRow | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState<{ id: string; username: string; password?: string } | null>(null);
    const [showCreatedModal, setShowCreatedModal] = useState<{
        username: string;
        tempPassword: string;
        shopName: string;
        loginUrl: string;
    } | null>(null);

    // Actions state
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadVendors = useCallback(async () => {
        setLoading(true);
        const result = await fetchVendors({ page, pageSize, search, status: statusFilter });
        if (!result.error) {
            setVendors(result.data as unknown as VendorRow[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, [page, search, statusFilter]);

    useEffect(() => {
        loadVendors();
    }, [loadVendors]);

    useEffect(() => {
        fetchShopsForDropdown().then((result) => {
            if (!result.error) setShops(result.data as Shop[]);
        });
    }, []);

    const handleReset = async (vendorId: string) => {
        if (!confirm('Reset this vendor\'s password? They will be logged out immediately.')) return;
        setActionLoading(vendorId);
        const result = await resetPassword(vendorId);
        if (result.error) {
            alert(result.error);
        } else if (result.data) {
            alert(`New temp password: ${result.data.newPassword}`);
            loadVendors();
        }
        setActionLoading(null);
    };

    const handleDeactivate = async (vendorId: string) => {
        if (!confirm('Deactivate this vendor? They will be kicked out immediately.')) return;
        setActionLoading(vendorId);
        const result = await deactivateVendor(vendorId);
        if (result.error) alert(result.error);
        else loadVendors();
        setActionLoading(null);
    };

    const handleReactivate = async (vendorId: string) => {
        setActionLoading(vendorId);
        const result = await reactivateVendor(vendorId);
        if (result.error) alert(result.error);
        else loadVendors();
        setActionLoading(null);
    };

    const handleDelete = async (vendorId: string) => {
        if (!confirm('Permanently delete this vendor? This cannot be undone.')) return;
        setActionLoading(vendorId);
        const result = await deleteVendor(vendorId);
        if (result.error) alert(result.error);
        else loadVendors();
        setActionLoading(null);
    };

    const handleViewPassword = async (vendorId: string, username: string) => {
        setShowPasswordModal({ id: vendorId, username, password: undefined });
        const result = await decryptVendorPassword(vendorId);
        if (result.error) {
            setShowPasswordModal({ id: vendorId, username, password: '⚠️ Decryption failed' });
        } else {
            setShowPasswordModal({ id: vendorId, username, password: result.password || '' });
        }
    };

    const handleCsvExport = () => {
        const header = 'Shop,Username,Display Name,Email,Status,Temp Password,Last Login,Login Count,Created\n';
        const rows = vendors.map(v =>
            `"${v.shops.name}","${v.username}","${v.display_name}","${v.email || ''}","${v.status}","${v.is_temp_password}","${v.last_login || 'Never'}","${v.login_count}","${new Date(v.created_at).toLocaleDateString()}"`
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
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Vendor Members</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} vendor{total !== 1 ? 's' : ''} total</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCsvExport}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        CSV
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by username, name, or email..."
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="material-symbols-outlined text-4xl text-green-600 animate-spin">progress_activity</span>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">badge</span>
                        <p className="text-sm font-medium">No vendors found</p>
                        <p className="text-xs mt-1">Create your first vendor to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-5 py-3">Shop</th>
                                    <th className="px-5 py-3">Username</th>
                                    <th className="px-5 py-3">Password</th>
                                    <th className="px-5 py-3">Display Name</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Temp?</th>
                                    <th className="px-5 py-3">Last Login</th>
                                    <th className="px-5 py-3">Logins</th>
                                    <th className="px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((v) => (
                                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                {v.shops.logo_url ? (
                                                    <img src={v.shops.logo_url} alt="" className="size-6 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="size-6 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-green-600 text-xs">storefront</span>
                                                    </div>
                                                )}
                                                <span className="font-semibold text-gray-900">{v.shops.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-mono text-xs text-gray-700">{v.username}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => handleViewPassword(v.id, v.username)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View password"
                                            >
                                                <span className="material-symbols-outlined text-gray-500 text-lg">visibility</span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-3 font-semibold text-gray-900">{v.display_name}</td>
                                        <td className="px-5 py-3 text-gray-500">{v.email || '—'}</td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={v.status} />
                                        </td>
                                        <td className="px-5 py-3">
                                            {v.is_temp_password ? (
                                                <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-md">Yes</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-500">
                                            {v.last_login ? new Date(v.last_login).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-5 py-3 text-center font-semibold text-gray-700">{v.login_count}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setShowEditModal(v)}
                                                    disabled={actionLoading === v.id}
                                                    className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleReset(v.id)}
                                                    disabled={actionLoading === v.id}
                                                    className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600"
                                                    title="Reset password"
                                                >
                                                    <span className="material-symbols-outlined text-lg">lock_reset</span>
                                                </button>
                                                {v.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleDeactivate(v.id)}
                                                        disabled={actionLoading === v.id}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                                                        title="Deactivate"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">block</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleReactivate(v.id)}
                                                        disabled={actionLoading === v.id}
                                                        className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                                                        title="Reactivate"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    disabled={actionLoading === v.id}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            Page {page} of {totalPages} ({total} total)
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Vendor Modal */}
            {showCreateModal && (
                <CreateVendorModal
                    shops={shops}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(result) => {
                        setShowCreateModal(false);
                        setShowCreatedModal(result);
                        loadVendors();
                    }}
                />
            )}

            {/* Edit Vendor Modal */}
            {showEditModal && (
                <EditVendorModal
                    vendor={showEditModal}
                    onClose={() => setShowEditModal(null)}
                    onUpdated={() => {
                        setShowEditModal(null);
                        loadVendors();
                    }}
                />
            )}

            {/* Password View Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPasswordModal(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Password for @{showPasswordModal.username}</h3>
                        <p className="text-xs text-gray-500 mb-4">This is the current decrypted password.</p>
                        {showPasswordModal.password === undefined ? (
                            <div className="flex items-center justify-center py-4">
                                <span className="material-symbols-outlined text-2xl text-green-600 animate-spin">progress_activity</span>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-4 font-mono text-lg text-center select-all font-bold text-gray-900">
                                {showPasswordModal.password}
                            </div>
                        )}
                        <button
                            onClick={() => setShowPasswordModal(null)}
                            className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Created Success Modal */}
            {showCreatedModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreatedModal(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="size-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Vendor Created!</h3>
                        <p className="text-xs text-gray-500 text-center mb-4">Share these credentials with the vendor.</p>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shop</span>
                                <span className="font-bold text-gray-900">{showCreatedModal.shopName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Username</span>
                                <span className="font-mono font-bold text-gray-900">{showCreatedModal.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Temp Password</span>
                                <span className="font-mono font-bold text-green-700 select-all">{showCreatedModal.tempPassword}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Login URL</span>
                                <span className="font-mono text-xs text-blue-600 select-all">{showCreatedModal.loginUrl}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreatedModal(null)}
                            className="w-full mt-4 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ──────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        active: 'bg-green-50 text-green-700 border-green-100',
        deactivated: 'bg-red-50 text-red-700 border-red-100',
        suspended: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return (
        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
}

function CreateVendorModal({
    shops,
    onClose,
    onCreated,
}: {
    shops: Shop[];
    onClose: () => void;
    onCreated: (result: { username: string; tempPassword: string; shopName: string; loginUrl: string }) => void;
}) {
    const [shopId, setShopId] = useState('');
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const result = await createVendor({ shopId, username: username.trim(), displayName: displayName.trim(), email: email.trim() || undefined });

        if (result.error) {
            setError(result.error);
            setSubmitting(false);
            return;
        }

        if (result.data) {
            onCreated({
                username: result.data.username,
                tempPassword: result.data.tempPassword,
                shopName: result.data.shopName,
                loginUrl: result.data.loginUrl,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Vendor</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Shop *</label>
                        <select
                            value={shopId}
                            onChange={(e) => setShopId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                        >
                            <option value="">Select a shop...</option>
                            {shops.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Username *</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            placeholder="e.g., ralos_admin"
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Display Name *</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g., Ralos Admin"
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vendor@example.com (optional)"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !shopId || !username || !displayName}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            ) : (
                                'Create Vendor'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditVendorModal({
    vendor,
    onClose,
    onUpdated,
}: {
    vendor: VendorRow;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [displayName, setDisplayName] = useState(vendor.display_name);
    const [email, setEmail] = useState(vendor.email || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const result = await updateVendor(vendor.id, { displayName, email });

        if (result.error) {
            setError(result.error);
            setSubmitting(false);
            return;
        }

        onUpdated();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Vendor — @{vendor.username}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
