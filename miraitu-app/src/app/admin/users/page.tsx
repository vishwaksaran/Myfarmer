'use client';

import { useEffect, useState } from 'react';
import { fetchAllUsers, type UserRecord } from '@/app/actions/bookings';
import { downloadCSV } from '@/lib/csv-export';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

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
            'Avatar URL': u.avatar_url || '',
            'Joined': new Date(u.created_at).toLocaleString(),
            'Last Updated': new Date(u.updated_at).toLocaleString(),
        }));
        downloadCSV(rows, `users${roleFilter ? `_${roleFilter}` : ''}_${new Date().toISOString().slice(0, 10)}`);
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
                                    <th className="px-4 py-3">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
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
                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                u.role === 'dealer' ? 'bg-blue-100 text-blue-700' :
                                                u.role === 'service-provider' ? 'bg-amber-100 text-amber-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {u.role || 'farmer'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{u.farm_location || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                            {new Date(u.created_at).toLocaleDateString()}
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
        </div>
    );
}
