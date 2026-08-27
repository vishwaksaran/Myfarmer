'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    fetchAdminListings,
    updateAdminListingStatus,
    deleteAdminListing,
    type AdminListingRow,
} from '@/app/actions/admin-listings';

/**
 * Admin → Listings.
 *
 * Everything a farmer posts for sale or hire lands in `marketplace_listings`:
 * the Buy & Sell board, the Rent board, and the machinery and livestock sell
 * forms. Until this page existed none of it was visible to admin — bookings
 * had a screen, listings did not.
 *
 * Deliberately read-mostly: status and delete are the only writes, because
 * editing someone else's ad behind their back is a different feature with
 * different consequences.
 */

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'livestock', label: 'Livestock' },
    { value: 'crops', label: 'Crops' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'expired', label: 'Expired' },
];

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    sold: 'bg-blue-100 text-blue-700',
    expired: 'bg-gray-200 text-gray-600',
};

const inr = (n: number | null) =>
    n === null || n === undefined ? '—' : '₹' + Number(n).toLocaleString('en-IN');

const when = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

/** The extras a seller filled in, minus the noise, for the expanded row. */
function specEntries(specs: Record<string, unknown> | null): [string, string][] {
    if (!specs) return [];
    return Object.entries(specs)
        .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => [k.replace(/_/g, ' '), String(v)]);
}

export default function AdminListingsPage() {
    const [rows, setRows] = useState<AdminListingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminListingRow | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchAdminListings({
            listing_type: typeFilter || undefined,
            status: statusFilter || undefined,
        });
        setRows(res.data);
        setError(res.error ?? '');
        setLoading(false);
    }, [typeFilter, statusFilter]);

    useEffect(() => {
        // Same shape as ListingsBoard: the first paint has to show a spinner,
        // and `load` is already memoised on the filters it reads.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const term = search.trim().toLowerCase();
    const visible = term
        ? rows.filter(r =>
            [r.title, r.location, r.district, r.state, r.seller_name, r.seller_phone, r.brand, r.model]
                .some(v => (v ?? '').toLowerCase().includes(term)))
        : rows;

    const changeStatus = async (row: AdminListingRow, status: string) => {
        const previous = row.status;
        // Optimistic: the dropdown should not sit on the old value while the
        // round trip happens, but it has to snap back if the write fails.
        setRows(rs => rs.map(r => (r.id === row.id ? { ...r, status } : r)));
        const res = await updateAdminListingStatus(row.id, status as 'active');
        if (!res.success) {
            setRows(rs => rs.map(r => (r.id === row.id ? { ...r, status: previous } : r)));
            setError(res.error ?? 'Could not update status');
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const res = await deleteAdminListing(deleteTarget.id);
        if (res.success) {
            setRows(rs => rs.filter(r => r.id !== deleteTarget.id));
        } else {
            setError(res.error ?? 'Could not delete listing');
        }
        setDeleteTarget(null);
    };

    const exportCsv = () => {
        const head = ['Title', 'Type', 'Category', 'Sub-category', 'Price', 'Seller', 'Phone', 'Location', 'District', 'State', 'Status', 'Posted'];
        const body = visible.map(r => [
            r.title, r.listing_type, r.category, r.subcategory, r.price, r.seller_name,
            r.seller_phone, r.location, r.district, r.state, r.status, r.created_at,
        ]);
        const csv = [head, ...body]
            .map(line => line.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `listings-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
                    <p className="text-sm text-gray-500">
                        Machinery, livestock and crops posted by farmers · {visible.length} shown
                    </p>
                </div>
                <button
                    onClick={exportCsv}
                    disabled={visible.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export CSV
                </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, seller, phone, place…"
                    className="flex-1 min-w-[220px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500"
                >
                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                    onClick={() => { void load(); }}
                    className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-bold">Listing</th>
                                <th className="px-4 py-3 font-bold">Type</th>
                                <th className="px-4 py-3 font-bold">Price</th>
                                <th className="px-4 py-3 font-bold">Seller</th>
                                <th className="px-4 py-3 font-bold">Location</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold">Posted</th>
                                <th className="px-4 py-3 font-bold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
                            ) : visible.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No listings match these filters.</td></tr>
                            ) : visible.map(r => (
                                <>
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {r.images?.[0] ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={r.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                                                        <span className="material-symbols-outlined text-gray-400 text-lg">image</span>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate max-w-[220px]">{r.title}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {[r.category, r.subcategory].filter(Boolean).join(' · ') || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 capitalize text-gray-600">{r.listing_type ?? '—'}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                                            {inr(r.price)}
                                            {r.price_unit && <span className="text-xs font-normal text-gray-400"> {r.price_unit}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900">{r.seller_name || '—'}</p>
                                            {r.seller_phone && (
                                                <a href={`tel:${r.seller_phone}`} className="text-xs text-green-600 hover:underline">{r.seller_phone}</a>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {[r.location, r.district, r.state].filter(Boolean).join(', ') || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={r.status ?? 'active'}
                                                onChange={(e) => { void changeStatus(r, e.target.value); }}
                                                className={`px-2 py-1 rounded-lg text-xs font-bold border-0 outline-none cursor-pointer ${STATUS_STYLES[r.status ?? 'active'] ?? 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {STATUS_OPTIONS.filter(o => o.value).map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{when(r.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                                    title="Details"
                                                >
                                                    <span className="material-symbols-outlined text-lg">
                                                        {expanded === r.id ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(r)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expanded === r.id && (
                                        <tr key={`${r.id}-detail`} className="bg-gray-50">
                                            <td colSpan={8} className="px-4 py-4">
                                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                                    <div>
                                                        <p className="font-bold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                                                        <p className="text-gray-700 whitespace-pre-wrap">{r.description || '—'}</p>
                                                        {(r.brand || r.model) && (
                                                            <p className="mt-2 text-gray-700">
                                                                <span className="font-semibold">Make:</span> {[r.brand, r.model].filter(Boolean).join(' ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-500 uppercase tracking-wide mb-1">Details</p>
                                                        {specEntries(r.specs).length === 0 ? (
                                                            <p className="text-gray-400">None recorded</p>
                                                        ) : (
                                                            <ul className="space-y-0.5">
                                                                {specEntries(r.specs).map(([k, v]) => (
                                                                    <li key={k} className="text-gray-700">
                                                                        <span className="capitalize font-semibold">{k}:</span> {v}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-500 uppercase tracking-wide mb-1">
                                                            Photos ({r.images?.length ?? 0})
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(r.images ?? []).map((src, i) => (
                                                                <a key={i} href={src} target="_blank" rel="noreferrer">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                                                                </a>
                                                            ))}
                                                            {(r.images?.length ?? 0) === 0 && <p className="text-gray-400">No photos</p>}
                                                        </div>
                                                        <p className="mt-2 text-gray-400">Board: {r.listing_mode ?? 'sale'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Delete this listing?</h2>
                        <p className="text-sm text-gray-500 mb-1">{deleteTarget.title}</p>
                        <p className="text-xs text-gray-400 mb-5">
                            {deleteTarget.seller_name || 'Unknown seller'} · {deleteTarget.status}
                        </p>
                        <p className="text-xs text-gray-500 mb-5">
                            This cannot be undone. To take an ad down without destroying it, set its status to Expired instead.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold"
                            >Cancel</button>
                            <button
                                onClick={() => { void confirmDelete(); }}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold"
                            >Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
