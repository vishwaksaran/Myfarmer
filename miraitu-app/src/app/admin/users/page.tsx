'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllUsers, deleteUser, updateUserProfile, type UserRecord } from '@/app/actions/bookings';
import { downloadCSV } from '@/lib/csv-export';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
    const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
    const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: '', farm_location: '', district: '', state: '', pincode: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        async function load() {
            const result = await fetchAllUsers();
            setUsers(result.data);
            setLoading(false);
        }
        load();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = !searchQuery || [u.full_name, u.phone, u.farm_location, u.role]
            .filter(Boolean)
            .some(f => f!.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

    const handleExportCSV = () => {
        const rows = filteredUsers.map(u => ({
            'ID': u.id,
            'Full Name': u.full_name || '',
            'Phone': u.phone || '',
            'Role': u.role || '',
            'Farm Location': u.farm_location || '',
            'District': u.district || '',
            'State': u.state || '',
            'Pincode': u.pincode || '',
            'Interests': (u.interests || []).join(', '),
            'Farm Size': u.farm_size || '',
            'Experience': u.experience_years || '',
            'Onboarded': u.onboarding_completed ? 'Yes' : 'No',
            'Avatar URL': u.avatar_url || '',
            'Joined': new Date(u.created_at).toLocaleString(),
            'Last Updated': new Date(u.updated_at).toLocaleString(),
        }));
        downloadCSV(rows, `users${roleFilter ? `_${roleFilter}` : ''}_${new Date().toISOString().slice(0, 10)}`);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        const result = await deleteUser(deleteTarget.id);
        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
            showToast(`User "${deleteTarget.full_name || 'Unnamed'}" deleted`);
        } else {
            showToast(result.error || 'Failed to delete user', 'error');
        }
        setDeleteTarget(null);
        setActionLoading(false);
    };

    const openEdit = (u: UserRecord) => {
        setEditTarget(u);
        setEditForm({
            full_name: u.full_name || '',
            phone: u.phone || '',
            role: u.role || 'farmer',
            farm_location: u.farm_location || '',
            district: u.district || '',
            state: u.state || '',
            pincode: u.pincode || '',
        });
    };

    const handleEdit = async () => {
        if (!editTarget) return;
        setActionLoading(true);
        const result = await updateUserProfile(editTarget.id, {
            full_name: editForm.full_name || null,
            phone: editForm.phone || null,
            role: editForm.role,
            farm_location: editForm.farm_location || null,
        });
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...editForm } : u));
            showToast(`User "${editForm.full_name || 'Unnamed'}" updated`);
        } else {
            showToast(result.error || 'Failed to update user', 'error');
        }
        setEditTarget(null);
        setActionLoading(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">Users</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export Users CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Search by name, phone, location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-purple-500"
                >
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
            </div>

            {/* User Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined text-4xl text-purple-600 animate-spin">progress_activity</span>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">person_off</span>
                    <p className="text-gray-500 font-medium">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Interests</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Joined</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-green-50/50 cursor-pointer transition-colors" onClick={() => window.location.href = `/admin/users/${u.id}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img
                                                        src={u.avatar_url}
                                                        alt={u.full_name || 'User'}
                                                        className="size-9 rounded-full object-cover border-2 border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="size-9 rounded-full bg-purple-100 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-purple-600 text-sm">person</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{u.full_name || 'Unnamed User'}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono">{u.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                u.role === 'dealer' ? 'bg-blue-100 text-blue-700' :
                                                (u.role === 'service-provider' || u.role === 'service_provider') ? 'bg-amber-100 text-amber-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {(u.role === 'service_provider' || u.role === 'service-provider') && u.availability_status && (
                                                    <span className={`size-2 rounded-full ${
                                                        u.availability_status === 'available' ? 'bg-emerald-500' :
                                                        u.availability_status === 'busy' ? 'bg-orange-500' :
                                                        'bg-gray-400'
                                                    }`} />
                                                )}
                                                {u.role || 'farmer'}
                                            </span>
                                            {(u.role === 'service_provider' || u.role === 'service-provider') && u.service_types && u.service_types.length > 0 && (
                                                <p className="text-[10px] text-gray-400 mt-0.5">{u.service_types.length} service{u.service_types.length !== 1 ? 's' : ''}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                                            {u.farm_location || u.district || u.state ? (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-800 truncate">{u.farm_location || '—'}</p>
                                                    {(u.district || u.state) && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                                            {[u.district, u.state].filter(Boolean).join(', ')}
                                                            {u.pincode && <span className="ml-1">({u.pincode})</span>}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.interests && u.interests.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                                    {u.interests.slice(0, 3).map((interest: string) => (
                                                        <span key={interest} className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-bold capitalize">
                                                            {interest.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                    {u.interests.length > 3 && (
                                                        <span className="text-[9px] text-gray-400 font-bold">+{u.interests.length - 3}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.onboarding_completed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">
                                                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                                                    Onboarded
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-bold">
                                                    <span className="material-symbols-outlined text-[10px]">pending</span>
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/admin/users/${u.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                        Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* ── Toast Notification ───────────────────────── */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <span className="material-symbols-outlined text-lg">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {toast.message}
                </div>
            )}

            {/* ── Delete Confirmation Modal ────────────────── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !actionLoading && setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">Are you sure you want to delete:</p>
                        <div className="bg-gray-50 rounded-xl p-3 mb-5">
                            <p className="font-bold text-gray-900">{deleteTarget.full_name || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500">{deleteTarget.phone || 'No phone'} · {deleteTarget.role || 'farmer'}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-1">{deleteTarget.id}</p>
                        </div>
                        <p className="text-xs text-red-600 mb-4 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">info</span>
                            This will delete the user's profile, all their bookings, and their auth account.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                        Delete User
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit User Modal ──────────────────────────── */}
            {editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !actionLoading && setEditTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-2xl">edit</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
                                <p className="text-xs font-mono text-gray-400">{editTarget.id.slice(0, 12)}...</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-5">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. +917448410198"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="dealer">Dealer</option>
                                    <option value="service_provider">Service Provider</option>
                                    <option value="livestock_farmer">Livestock Farmer</option>
                                    <option value="buyer">Buyer / Trader</option>
                                    <option value="student">Agri Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Village / Town / City</label>
                                <input
                                    type="text"
                                    value={editForm.farm_location}
                                    onChange={e => setEditForm(f => ({ ...f, farm_location: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Enter location"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">District</label>
                                    <input
                                        type="text"
                                        value={editForm.district}
                                        onChange={e => setEditForm(f => ({ ...f, district: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                        placeholder="District"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
                                    <input
                                        type="text"
                                        value={editForm.state}
                                        onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                        placeholder="State"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Pincode</label>
                                <input
                                    type="text"
                                    value={editForm.pincode}
                                    onChange={e => setEditForm(f => ({ ...f, pincode: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                    placeholder="e.g. 422001"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditTarget(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">save</span>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
