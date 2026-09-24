'use client';

import { useEffect, useState } from 'react';
import { fetchContactRequests, type ContactRequestRecord } from '@/app/actions/contact-requests';
import MiraituLoader from '@/components/v2/MiraituLoader';

/**
 * Everyone who asked to be called back about a listing.
 *
 * Buyers no longer see a seller's number anywhere in the app — they leave
 * their own details instead (ContactRequestModal) and the Miraitu team makes
 * the introduction. Those submissions used to be findable only by scrolling
 * the Activity Log past every vendor login and product edit; this is the same
 * data on its own screen, with both sides' numbers side by side so admin can
 * work the list top to bottom.
 */

/** 'machinery_rent' -> 'Machinery Rent'. */
const prettyType = (t: string) =>
    t.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const TYPE_STYLES: Record<string, string> = {
    livestock: 'bg-amber-50 text-amber-700',
    machinery_rent: 'bg-blue-50 text-blue-700',
    buy_sell: 'bg-purple-50 text-purple-700',
    land_sell: 'bg-green-50 text-green-700',
    land_lease: 'bg-teal-50 text-teal-700',
    land_rent: 'bg-teal-50 text-teal-700',
};

export default function ContactRequestsPage() {
    const [rows, setRows] = useState<ContactRequestRecord[]>([]);
    const [listingTypes, setListingTypes] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('');
    const [search, setSearch] = useState('');
    // Typing filters the list, but every keystroke should not hit the database.
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const pageSize = 30;

    useEffect(() => {
        const t = setTimeout(() => { setLoading(true); setDebouncedSearch(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    // State lands in the promise callback rather than the effect body, so a
    // refetch does not cascade an extra render before the rows arrive. The
    // filter handlers below raise the loader instead.
    useEffect(() => {
        let cancelled = false;
        fetchContactRequests({
            page,
            pageSize,
            listingType: typeFilter,
            search: debouncedSearch,
        }).then(result => {
            if (cancelled) return;
            setRows(result.data);
            setTotal(result.total);
            setError(result.error);
            if (result.listingTypes.length) setListingTypes(result.listingTypes);
            setLoading(false);
        }).catch(() => {
            if (cancelled) return;
            setError('Failed to fetch contact requests.');
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [page, typeFilter, debouncedSearch]);

    const handleCsvExport = () => {
        const header = 'Time,Name,Phone,Message,Listing,Type,Location,Seller,Seller Phone,IP\n';
        const cell = (v: string | null) => '"' + (v ?? '').replace(/"/g, '""') + '"';
        const body = rows.map(r => [
            cell(new Date(r.createdAt).toLocaleString()),
            cell(r.requesterName),
            cell(r.requesterPhone),
            cell(r.message),
            cell(r.listingTitle),
            cell(r.listingType),
            cell(r.location),
            cell(r.sellerName),
            cell(r.sellerPhone),
            cell(r.ipAddress),
        ].join(',')).join('\n');
        const blob = new Blob([header + body], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contact-requests-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Contact Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {total} callback request{total !== 1 ? 's' : ''} submitted
                    </p>
                </div>
                <button
                    onClick={handleCsvExport}
                    disabled={rows.length === 0}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export CSV
                </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, phone or listing"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white min-w-[240px] flex-1 max-w-sm"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => { setLoading(true); setTypeFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                >
                    <option value="">All Categories</option>
                    {listingTypes.map(t => (
                        <option key={t} value={t}>{prettyType(t)}</option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <MiraituLoader fullScreen={false} />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">phone_callback</span>
                        <p className="text-sm font-medium">No contact requests yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {rows.map(r => (
                            <div key={r.id} className="px-5 py-4 hover:bg-gray-50/50">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 bg-amber-50">
                                        <span className="material-symbols-outlined text-xl">phone_callback</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-gray-900">{r.requesterName}</p>
                                            {r.requesterPhone && (
                                                <a
                                                    href={`tel:${r.requesterPhone}`}
                                                    className="text-sm font-semibold text-green-700 hover:underline"
                                                >
                                                    {r.requesterPhone}
                                                </a>
                                            )}
                                            {r.listingType && (
                                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold ${TYPE_STYLES[r.listingType] || 'bg-gray-100 text-gray-600'}`}>
                                                    {prettyType(r.listingType)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-600 mt-1">
                                            Wants a callback about{' '}
                                            <span className="font-semibold">{r.listingTitle || 'a listing'}</span>
                                            {r.location ? `, ${r.location}` : ''}
                                        </p>

                                        {r.message && (
                                            <p className="text-xs text-gray-600 italic mt-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg">
                                                &ldquo;{r.message}&rdquo;
                                            </p>
                                        )}

                                        {/* The other half of the introduction — admin dials this,
                                            the buyer never sees it. */}
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-gray-500">
                                            <span>
                                                Seller: <span className="font-medium text-gray-700">{r.sellerName || 'Unknown'}</span>
                                                {r.sellerPhone ? ` · ${r.sellerPhone}` : ' · no number on file'}
                                            </span>
                                            {r.requesterEmail && <span>• {r.requesterEmail}</span>}
                                            {r.ipAddress && <span>• IP: {r.ipAddress}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(r.createdAt).toLocaleString()}
                                        </span>
                                        {r.requesterPhone && (
                                            <div className="flex gap-1.5">
                                                <a
                                                    href={`tel:${r.requesterPhone}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">call</span>
                                                    Call
                                                </a>
                                                <a
                                                    href={`https://wa.me/91${r.requesterPhone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:brightness-110 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">chat</span>
                                                    WhatsApp
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => { setLoading(true); setPage(p => Math.max(1, p - 1)); }}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => { setLoading(true); setPage(p => Math.min(totalPages, p + 1)); }}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
