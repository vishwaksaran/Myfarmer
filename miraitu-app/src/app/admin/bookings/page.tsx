'use client';

import { Fragment, Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { fetchAllBookings, updateBookingStatus, deleteBooking, setLeasePublished, type BookingRecord } from '@/app/actions/bookings';
import { downloadCSV } from '@/lib/csv-export';

const MODULE_OPTIONS = [
    { value: '', label: 'All Modules' },
    { value: 'services', label: 'Services' },
    { value: 'land', label: 'Land' },
    { value: 'borewell', label: 'Borewell' },
    { value: 'fencing', label: 'Fencing' },
    { value: 'cctv', label: 'CCTV' },
    { value: 'protection', label: 'Protection' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <MiraituLoader fullScreen={false} />
            </div>
        }>
            <AdminBookingsContent />
        </Suspense>
    );
}

function AdminBookingsContent() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || '';
    const initialFilter = searchParams.get('filter') || '';

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [moduleFilter, setModuleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [todayOnly, setTodayOnly] = useState(initialFilter === 'today');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BookingRecord | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const loadBookings = useCallback(async () => {
        setLoading(true);
        const result = await fetchAllBookings({
            module: moduleFilter || undefined,
            status: statusFilter || undefined,
        });
        setBookings(result.data);
        setLoading(false);
    }, [moduleFilter, statusFilter]);

    useEffect(() => { loadBookings(); }, [loadBookings]);

    const filteredBookings = bookings.filter(b => {
        if (todayOnly) {
            const d = new Date(b.created_at);
            if (d.toDateString() !== new Date().toDateString()) return false;
        }
        if (categoryFilter && b.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            b.full_name.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.location.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q)
        );
    });

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        const result = await updateBookingStatus(id, newStatus);
        if (result.success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
            showToast(`Status updated to "${newStatus}"`);
        } else {
            showToast(result.error || 'Failed to update status — the value may not be allowed by the database', 'error');
        }
        setUpdatingId(null);
    };

    const handleTogglePublish = async (booking: BookingRecord) => {
        const isPublished = (booking.extra_data as Record<string, unknown>)?.published === true;
        setPublishingId(booking.id);
        const result = await setLeasePublished(booking.id, !isPublished);
        if (result.success) {
            setBookings(prev => prev.map(b =>
                b.id === booking.id
                    ? { ...b, extra_data: { ...(b.extra_data as Record<string, unknown>), published: !isPublished } }
                    : b
            ));
            showToast(isPublished ? 'Listing unpublished — removed from Browse tab' : 'Listing published — now visible in Browse tab');
        } else {
            showToast(result.error || 'Failed to update listing', 'error');
        }
        setPublishingId(null);
    };

    const handleExportCSV = () => {
        const rows = filteredBookings.map(b => ({
            'ID': b.id,
            'Name': b.full_name,
            'Phone': b.phone,
            'Location': b.location,
            'Module': b.module,
            'Category': b.category,
            'Status': b.status,
            'Preferred Date': b.preferred_date || '',
            'Extra Data': JSON.stringify(b.extra_data),
            'Admin Notes': b.admin_notes || '',
            'Submitted On': new Date(b.created_at).toLocaleString(),
        }));
        const filename = `bookings${moduleFilter ? `_${moduleFilter}` : ''}${statusFilter ? `_${statusFilter}` : ''}_${new Date().toISOString().slice(0, 10)}`;
        downloadCSV(rows, filename);
    };

    const handleDeleteBooking = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        const result = await deleteBooking(deleteTarget.id);
        if (result.success) {
            setBookings(prev => prev.filter(b => b.id !== deleteTarget.id));
            showToast(`Booking from "${deleteTarget.full_name}" deleted`);
        } else {
            showToast(result.error || 'Failed to delete booking', 'error');
        }
        setDeleteTarget(null);
        setActionLoading(false);
    };

    // Group by category for the module-specific CSV export
    const categories = [...new Set(filteredBookings.map(b => b.category))];

    const handleExportCategory = (category: string) => {
        const rows = filteredBookings
            .filter(b => b.category === category)
            .map(b => ({
                'ID': b.id,
                'Name': b.full_name,
                'Phone': b.phone,
                'Location': b.location,
                'Module': b.module,
                'Category': b.category,
                'Status': b.status,
                'Preferred Date': b.preferred_date || '',
                'Extra Data': JSON.stringify(b.extra_data),
                'Admin Notes': b.admin_notes || '',
                'Submitted On': new Date(b.created_at).toLocaleString(),
            }));
        downloadCSV(rows, `bookings_${category}_${new Date().toISOString().slice(0, 10)}`);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">Bookings</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export All CSV
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors"
                    />
                </div>
                <select
                    value={moduleFilter}
                    onChange={(e) => setModuleFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    {MODULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                    onClick={() => setTodayOnly(!todayOnly)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors border ${todayOnly
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">today</span>
                    Today
                </button>
            </div>

            {/* Category filter chips */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider self-center mr-1">Filter:</span>
                    {categoryFilter && (
                        <button
                            onClick={() => setCategoryFilter('')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Clear
                        </button>
                    )}
                    {categories.map(cat => {
                        const count = bookings.filter(b => b.category.toLowerCase() === cat.toLowerCase()).length;
                        const isActive = categoryFilter.toLowerCase() === cat.toLowerCase();
                        return (
                            <div key={cat} className="flex items-center gap-0">
                                <button
                                    onClick={() => setCategoryFilter(isActive ? '' : cat)}
                                    className={`px-3 py-1.5 rounded-l-lg text-xs font-semibold capitalize transition-colors border ${
                                        isActive
                                            ? 'bg-green-600 text-white border-green-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                                    }`}
                                >
                                    {cat} ({count})
                                </button>
                                <button
                                    onClick={() => handleExportCategory(cat)}
                                    title={`Export ${cat} as CSV`}
                                    className="px-2 py-1.5 bg-white border border-l-0 border-gray-200 rounded-r-lg text-gray-400 hover:text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <MiraituLoader fullScreen={false} />
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inbox</span>
                    <p className="text-gray-500 font-medium">No bookings found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                            <thead>
                                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Module</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((b) => (
                                    <Fragment key={b.id}>
                                        <tr
                                            key={b.id}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                                            onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{b.full_name}</div>
                                                {b.auth_provider && (
                                                    <span className={`inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${b.auth_provider === 'google'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : b.auth_provider === 'phone'
                                                                ? 'bg-green-50 text-green-600'
                                                                : 'bg-gray-50 text-gray-500'
                                                        }`}>
                                                        {b.auth_provider === 'google' ? 'Google SSO' : b.auth_provider === 'phone' ? 'Phone OTP' : b.auth_provider}
                                                    </span>
                                                )}
                                                {!b.auth_provider && !b.user_id && (
                                                    <span className="inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 text-[9px] font-bold">Guest</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <a href={`tel:${b.phone}`} className="hover:text-green-600">{b.phone}</a>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{b.location}</td>
                                            <td className="px-4 py-3 capitalize">{b.module}</td>
                                            <td className="px-4 py-3 capitalize">{b.category}</td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => { e.stopPropagation(); handleStatusChange(b.id, e.target.value); }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={updatingId === b.id}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border-0 outline-none cursor-pointer ${b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            b.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                                b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                    b.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                                                        'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {STATUS_OPTIONS.filter(o => o.value).map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                <div>{new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                <div className="text-[10px] text-gray-400">{new Date(b.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-gray-400 text-lg">
                                                        {expandedId === b.id ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }}
                                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Delete booking"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedId === b.id && (
                                            <tr key={`${b.id}-detail`} className="bg-gray-50/80">
                                                <td colSpan={8} className="px-4 py-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                                        {b.user_email && (
                                                            <div>
                                                                <p className="font-bold text-gray-500 uppercase mb-1">User Email</p>
                                                                <p className="text-gray-900 text-[11px]">{b.user_email}</p>
                                                            </div>
                                                        )}
                                                        {b.user_display_name && b.user_display_name !== b.full_name && (
                                                            <div>
                                                                <p className="font-bold text-gray-500 uppercase mb-1">Account Name</p>
                                                                <p className="text-gray-900">{b.user_display_name}</p>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-gray-500 uppercase mb-1">Preferred Date</p>
                                                            <p className="text-gray-900">{b.preferred_date || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-500 uppercase mb-1">User ID</p>
                                                            <p className="text-gray-900 font-mono text-[10px]">{b.user_id || 'Guest'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-500 uppercase mb-1">Admin Notes</p>
                                                            <p className="text-gray-900">{b.admin_notes || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-500 uppercase mb-1">Updated</p>
                                                            <p className="text-gray-900">{new Date(b.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</p>
                                                        </div>
                                                    </div>
                                                    {/* Publish toggle — only for land/lease listings */}
                                                    {b.module === 'land' && b.category === 'lease' && (
                                                        <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                            <span className="material-symbols-outlined text-emerald-600 text-xl">public</span>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-emerald-800">Public Listing Visibility</p>
                                                                <p className="text-[11px] text-emerald-600">
                                                                    {(b.extra_data as Record<string, unknown>)?.published === true
                                                                        ? 'Currently LIVE — visible in the Browse tab for all users'
                                                                        : 'Currently HIDDEN — not visible in Browse tab'}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleTogglePublish(b)}
                                                                disabled={publishingId === b.id}
                                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                                                    (b.extra_data as Record<string, unknown>)?.published === true
                                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                                } disabled:opacity-50`}
                                                            >
                                                                {publishingId === b.id
                                                                    ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                                    : <span className="material-symbols-outlined text-sm">
                                                                        {(b.extra_data as Record<string, unknown>)?.published === true ? 'visibility_off' : 'visibility'}
                                                                      </span>
                                                                }
                                                                {(b.extra_data as Record<string, unknown>)?.published === true ? 'Unpublish' : 'Publish to Browse Tab'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {Object.keys(b.extra_data).length > 0 && (
                                                        <div className="mt-4">
                                                            <p className="font-bold text-gray-500 uppercase text-[10px] mb-2">Extra Details</p>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {Object.entries(b.extra_data).filter(([key]) => key !== 'published').map(([key, val]) => (
                                                                    <div key={key} className="bg-white rounded-lg p-2.5 border border-gray-100">
                                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                                                                        <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                                                            {Array.isArray(val) ? `${val.length} item(s)` : String(val) || '—'}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                        Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    <span className="material-symbols-outlined text-lg">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    {toast.message}
                </div>
            )}

            {/* Delete Booking Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !actionLoading && setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-red-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Booking</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 mb-5">
                            <p className="font-bold text-gray-900">{deleteTarget.full_name}</p>
                            <p className="text-xs text-gray-500 capitalize">{deleteTarget.module} · {deleteTarget.category} · {deleteTarget.status}</p>
                            <p className="text-xs text-gray-500">{deleteTarget.phone} · {deleteTarget.location}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-1">{deleteTarget.id}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBooking}
                                disabled={actionLoading}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                        Delete
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
