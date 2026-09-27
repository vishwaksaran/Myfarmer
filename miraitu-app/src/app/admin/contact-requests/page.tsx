'use client';

import { useEffect, useState } from 'react';
import { fetchContactRequests, type ContactRequestRecord } from '@/app/actions/contact-requests';
import { updateRequirement } from '@/app/actions/admin-requirements';
import { REQUIREMENT_STATUSES, type RequirementStatus } from '@/lib/requirement-options';
import MiraituLoader from '@/components/v2/MiraituLoader';

/**
 * Everyone waiting on a call from Miraitu, from either direction.
 *
 * Two things land here. A buyer who tapped Contact Seller on an ad leaves
 * their number instead of seeing the seller's (ContactRequestModal), and a
 * buyer who used Post Your Requirement states what they want with no
 * particular ad in mind. Both amount to the same job — ring this person —
 * so they share one inbox. Splitting them across two screens would mean
 * checking two places to find out who is still waiting.
 */

/** 'machinery_rent' -> 'Machinery Rent'. */
const prettyType = (t: string) =>
    t.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

/** Turns a stored key like milkYield into a readable "Milk yield". */
const prettyKey = (k: string) =>
    k.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, c => c.toUpperCase());

const CONDITION_LABEL: Record<string, string> = {
    any: 'New or used',
    new: 'New only',
    used: 'Used only',
};

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
    const [counts, setCounts] = useState({ listing: 0, requirement: 0 });
    // '' shows both. Posted requirements and listing callbacks are the same
    // job — ring this person — so they share one inbox rather than two screens.
    const [sourceFilter, setSourceFilter] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<string | null>(null);
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
            source: sourceFilter,
        }).then(result => {
            if (cancelled) return;
            setRows(result.data);
            setTotal(result.total);
            setError(result.error);
            if (result.listingTypes.length) setListingTypes(result.listingTypes);
            setCounts(result.counts);
            setLoading(false);
        }).catch(() => {
            if (cancelled) return;
            setError('Failed to fetch contact requests.');
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [page, typeFilter, debouncedSearch, sourceFilter]);

    const changeStatus = async (id: string, status: RequirementStatus) => {
        setBusyId(id);
        const res = await updateRequirement(id, { status });
        setBusyId(null);
        if (!res.success) { setError(res.error ?? 'Could not update that requirement.'); return; }
        // Reflect it without a round trip; the next fetch confirms it.
        setRows(prev => prev.map(r => (
            r.id === id && r.requirement ? { ...r, requirement: { ...r.requirement, status } } : r
        )));
    };

    const handleCsvExport = () => {
        const header = 'Time,Source,Name,Phone,Message,Wants,Type,Location,Condition,Quantity,Budget,Needed By,Status,Details,Seller,Seller Phone,IP\n';
        const cell = (v: string | null) => '"' + (v ?? '').replace(/"/g, '""') + '"';
        const body = rows.map(r => [
            cell(new Date(r.createdAt).toLocaleString()),
            cell(r.source === 'requirement' ? 'Posted requirement' : 'From a listing'),
            cell(r.requesterName),
            cell(r.requesterPhone),
            cell(r.message),
            cell(r.listingTitle),
            cell(r.listingType ?? r.requirement?.category ?? null),
            cell(r.location),
            cell(r.requirement ? (CONDITION_LABEL[r.requirement.condition] ?? r.requirement.condition) : null),
            cell(r.requirement?.quantity ?? null),
            cell(r.requirement?.budget ?? null),
            cell(r.requirement?.neededBy ?? null),
            cell(r.requirement?.status ?? null),
            cell(r.requirement ? Object.entries(r.requirement.details).map(([k, v]) => prettyKey(k) + ': ' + v).join('; ') : null),
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
                        {total} request{total !== 1 ? 's' : ''} waiting on a call
                        {counts.requirement > 0 && ` · ${counts.requirement} posted requirement${counts.requirement !== 1 ? 's' : ''}`}
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

            <div className="mb-6 flex flex-wrap items-center gap-3">
                {/* Which side the request came from. */}
                <div className="flex gap-1.5">
                    {[
                        { key: '', label: 'All' },
                        { key: 'listing', label: `From a listing (${counts.listing})` },
                        { key: 'requirement', label: `Posted requirements (${counts.requirement})` },
                    ].map(c => (
                        <button
                            key={c.key || 'all'}
                            onClick={() => { setLoading(true); setSourceFilter(c.key); setPage(1); }}
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${sourceFilter === c.key
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
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
                    disabled={sourceFilter === 'requirement'}
                    title="Applies to requests that came from a listing"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white disabled:opacity-50"
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
                                    <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.source === 'requirement'
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-amber-600 bg-amber-50'}`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {r.source === 'requirement' ? 'campaign' : 'phone_callback'}
                                        </span>
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
                                            {r.requirement && (
                                                <>
                                                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-orange-100 text-orange-700">
                                                        Posted requirement
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600">
                                                        {r.requirement.category}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-600 mt-1">
                                            {r.source === 'requirement' ? 'Looking for ' : 'Wants a callback about '}
                                            <span className="font-semibold">
                                                {r.listingTitle || (r.source === 'requirement' ? 'something' : 'a listing')}
                                            </span>
                                            {r.location ? `, ${r.location}` : ''}
                                        </p>

                                        {/* Everything the buyer told us, laid out so admin can
                                            read the whole brief without opening anything. */}
                                        {r.requirement && (
                                            <p className="text-xs text-gray-600 mt-1">
                                                {[
                                                    CONDITION_LABEL[r.requirement.condition] ?? r.requirement.condition,
                                                    r.requirement.quantity && `Qty ${r.requirement.quantity}`,
                                                    r.requirement.budget && `Budget ${r.requirement.budget}`,
                                                    r.requirement.neededBy && `Needs it ${r.requirement.neededBy}`,
                                                ].filter(Boolean).join(' · ')}
                                            </p>
                                        )}

                                        {/* The category-specific answers — breed and milk
                                            yield for a cow, horsepower and hours run for a
                                            tractor. Labels come from the keys the form wrote. */}
                                        {r.requirement && Object.keys(r.requirement.details).length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {Object.entries(r.requirement.details).map(([k, v]) => (
                                                    <span key={k} className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-700">
                                                        <span className="text-gray-500">{prettyKey(k)}: </span>
                                                        <span className="font-semibold">{v}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {r.requirement && r.requirement.images.length > 0 && (
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {r.requirement.images.map(src => (
                                                    <button key={src} onClick={() => setLightbox(src)} aria-label="View photo">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={src} alt="Requirement reference"
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {r.message && (
                                            <p className="text-xs text-gray-600 italic mt-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg">
                                                &ldquo;{r.message}&rdquo;
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-gray-500">
                                            {/* The other half of the introduction — admin dials
                                                this, the buyer never sees it. A posted
                                                requirement has no seller yet; finding one is
                                                the job. */}
                                            {r.source === 'listing' ? (
                                                <span>
                                                    Seller: <span className="font-medium text-gray-700">{r.sellerName || 'Unknown'}</span>
                                                    {r.sellerPhone ? ` · ${r.sellerPhone}` : ' · no number on file'}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-gray-700">No seller yet — source this one</span>
                                            )}
                                            {r.requesterEmail && <span>• {r.requesterEmail}</span>}
                                            {r.ipAddress && <span>• IP: {r.ipAddress}</span>}
                                        </div>

                                        {r.requirement?.adminNote && (
                                            <p className="text-xs text-gray-600 italic mt-1.5">Note: {r.requirement.adminNote}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(r.createdAt).toLocaleString()}
                                        </span>
                                        {r.requirement && (
                                            <select
                                                value={r.requirement.status}
                                                disabled={busyId === r.id}
                                                onChange={e => changeStatus(r.id, e.target.value as RequirementStatus)}
                                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold bg-white disabled:opacity-50"
                                            >
                                                {REQUIREMENT_STATUSES.map(st => (
                                                    <option key={st.value} value={st.value}>{st.label}</option>
                                                ))}
                                            </select>
                                        )}
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

            {lightbox && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lightbox} alt="Requirement reference" className="max-h-[90vh] max-w-full rounded-xl" />
                </div>
            )}
        </div>
    );
}
