'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    fetchSellerApplications,
    approveSeller,
    rejectSeller,
    resetSellerPassword,
    revealSellerPassword,
    setSellerLoginStatus,
    type SellerApplication,
} from '@/app/actions/admin-sellers';
import MiraituLoader from '@/components/v2/MiraituLoader';

/**
 * Seller applications, and the logins that come out of approving them.
 *
 * The four-step registration form has been writing to `sellers` all along,
 * but nothing read those rows back — an applicant saw a dashboard, admin saw
 * nothing, and no one could be verified. This is that missing half: who
 * applied, approve or reject them, and hand over the username and password
 * that turns the dashboard from a mock-up into a working account.
 */

const TYPE_LABEL: Record<string, string> = {
    'farmer-seller': 'Farmer',
    dealer: 'Dealer',
    'service-provider': 'Service Provider',
};

const STATUS_STYLE: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
};

/** The credential handed over once, for admin to pass on to the seller. */
interface IssuedLogin {
    sellerName: string;
    username: string;
    password?: string;
}

export default function AdminSellersPage() {
    const [rows, setRows] = useState<SellerApplication[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState('pending');
    const [typeFilter, setTypeFilter] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 25;

    const [expanded, setExpanded] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [issued, setIssued] = useState<IssuedLogin | null>(null);
    const [rejecting, setRejecting] = useState<SellerApplication | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [revealed, setRevealed] = useState<Record<string, string>>({});

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    const load = useCallback(() => {
        let cancelled = false;
        fetchSellerApplications({
            status: statusFilter,
            sellerType: typeFilter,
            search: debouncedSearch,
            page,
            pageSize,
        })
            .then(res => {
                if (cancelled) return;
                setRows(res.data);
                setCounts(res.counts);
                setTotal(res.total);
                setError(res.error);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setError('Failed to load seller applications.');
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [statusFilter, typeFilter, debouncedSearch, page]);

    useEffect(() => load(), [load]);

    const refresh = () => { setLoading(true); load(); };

    const handleApprove = async (row: SellerApplication) => {
        setBusyId(row.id);
        const res = await approveSeller(row.id);
        setBusyId(null);
        if (!res.success) { setError(res.error ?? 'Could not approve.'); return; }
        setIssued({ sellerName: row.fullName, username: res.username ?? '', password: res.tempPassword });
        refresh();
    };

    const handleReject = async () => {
        if (!rejecting) return;
        setBusyId(rejecting.id);
        const res = await rejectSeller(rejecting.id, rejectNote);
        setBusyId(null);
        setRejecting(null);
        setRejectNote('');
        if (!res.success) { setError(res.error ?? 'Could not reject.'); return; }
        refresh();
    };

    const handleReset = async (row: SellerApplication) => {
        setBusyId(row.id);
        const res = await resetSellerPassword(row.id);
        setBusyId(null);
        if (!res.success) { setError(res.error ?? 'Could not reset.'); return; }
        setIssued({ sellerName: row.fullName, username: res.username ?? '', password: res.tempPassword });
        refresh();
    };

    const handleReveal = async (row: SellerApplication) => {
        setBusyId(row.id);
        const res = await revealSellerPassword(row.id);
        setBusyId(null);
        if (!res.success || !res.password) { setError(res.error ?? 'Could not read that password.'); return; }
        setRevealed(prev => ({ ...prev, [row.id]: res.password as string }));
    };

    const handleToggleLogin = async (row: SellerApplication) => {
        const next = row.credential?.status === 'active' ? 'deactivated' : 'active';
        setBusyId(row.id);
        const res = await setSellerLoginStatus(row.id, next);
        setBusyId(null);
        if (!res.success) { setError(res.error ?? 'Could not change that login.'); return; }
        refresh();
    };

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const chips: { key: string; label: string; n: number | null }[] = [
        { key: 'pending', label: 'Pending', n: counts.pending },
        { key: 'approved', label: 'Approved', n: counts.approved },
        { key: 'rejected', label: 'Rejected', n: counts.rejected },
        { key: '', label: 'All', n: null },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Seller Applications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Verify farmers, dealers and service providers, and issue their logins
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5 flex-wrap">
                    {chips.map(c => (
                        <button
                            key={c.key || 'all'}
                            onClick={() => { setLoading(true); setStatusFilter(c.key); setPage(1); }}
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${statusFilter === c.key
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {c.label}{c.n !== null ? ` (${c.n})` : ''}
                        </button>
                    ))}
                </div>
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, phone, business or place"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white min-w-[240px] flex-1 max-w-sm"
                />
                <select
                    value={typeFilter}
                    onChange={e => { setLoading(true); setTypeFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                >
                    <option value="">All Types</option>
                    <option value="farmer-seller">Farmer</option>
                    <option value="dealer">Dealer</option>
                    <option value="service-provider">Service Provider</option>
                </select>
            </div>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="font-bold">Dismiss</button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><MiraituLoader fullScreen={false} /></div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p className="text-sm font-medium">
                            No {statusFilter || ''} applications{debouncedSearch ? ` matching “${debouncedSearch}”` : ''}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {rows.map(row => {
                            const isOpen = expanded === row.id;
                            const busy = busyId === row.id;
                            return (
                                <div key={row.id} className="px-5 py-4">
                                    <div className="flex items-start gap-4 flex-wrap">
                                        <div className="size-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-xl">agriculture</span>
                                        </div>

                                        <div className="flex-1 min-w-[220px]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-gray-900">{row.fullName}</p>
                                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border ${STATUS_STYLE[row.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                    {row.status}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-100 text-gray-600">
                                                    {TYPE_LABEL[row.sellerType] ?? row.sellerType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {row.phone ?? 'no phone'}
                                                {row.businessName ? ` · ${row.businessName}` : ''}
                                                {row.location ? ` · ${row.location}` : ''}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Applied {new Date(row.createdAt).toLocaleString()}
                                                {row.reviewedAt ? ` · reviewed ${new Date(row.reviewedAt).toLocaleDateString()}` : ''}
                                            </p>
                                            {row.reviewNote && (
                                                <p className="text-xs text-red-600 italic mt-1 px-2 py-1 bg-red-50 rounded-lg">
                                                    Rejected: {row.reviewNote}
                                                </p>
                                            )}

                                            {/* The login, once one exists. */}
                                            {row.credential && (
                                                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                                                    <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono font-semibold">
                                                        {row.credential.username}
                                                    </span>
                                                    <span className={row.credential.status === 'active' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                                                        {row.credential.status}
                                                    </span>
                                                    {row.credential.isTempPassword && (
                                                        <span className="text-amber-600 font-semibold">temp password</span>
                                                    )}
                                                    <span className="text-gray-400">
                                                        {row.credential.loginCount > 0
                                                            ? `${row.credential.loginCount} sign-in${row.credential.loginCount === 1 ? '' : 's'}`
                                                            : 'never signed in'}
                                                    </span>
                                                    {revealed[row.id] && (
                                                        <span className="px-2 py-1 rounded-lg bg-gray-900 text-white font-mono">
                                                            {revealed[row.id]}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {row.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleApprove(row)}
                                                    disabled={busy}
                                                    className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Approve &amp; issue login
                                                </button>
                                            )}
                                            {row.status !== 'rejected' && (
                                                <button
                                                    onClick={() => { setRejecting(row); setRejectNote(''); }}
                                                    disabled={busy}
                                                    className="px-3 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            {row.credential && (
                                                <>
                                                    <button
                                                        onClick={() => handleReveal(row)}
                                                        disabled={busy}
                                                        className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Show password
                                                    </button>
                                                    <button
                                                        onClick={() => handleReset(row)}
                                                        disabled={busy}
                                                        className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Reset password
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleLogin(row)}
                                                        disabled={busy}
                                                        className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        {row.credential.status === 'active' ? 'Disable login' : 'Enable login'}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : row.id)}
                                                className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                                            >
                                                {isOpen ? 'Hide' : 'Details'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Everything the four steps collected. */}
                                    {isOpen && (
                                        <div className="mt-4 ml-14 grid gap-4 md:grid-cols-2">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Application answers
                                                </p>
                                                <dl className="space-y-1.5">
                                                    {Object.entries(row.formData).length === 0 && (
                                                        <p className="text-xs text-gray-400">Nothing recorded.</p>
                                                    )}
                                                    {Object.entries(row.formData).map(([k, v]) => (
                                                        <div key={k} className="flex gap-2 text-xs">
                                                            <dt className="text-gray-500 min-w-[110px] capitalize">
                                                                {k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ')}
                                                            </dt>
                                                            <dd className="text-gray-900 font-medium break-all">
                                                                {v === null || v === undefined || v === '' ? '—' : String(v)}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                                                    Uploaded photos ({row.images.length})
                                                </p>
                                                {row.images.length === 0 ? (
                                                    <p className="text-xs text-gray-400">None uploaded.</p>
                                                ) : (
                                                    <div className="flex gap-2 flex-wrap">
                                                        {row.images.map(src => (
                                                            <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={src}
                                                                    alt="Seller upload"
                                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80"
                                                                />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} total</p>
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
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Credentials are shown once — admin reads them out to the seller. */}
            {issued && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIssued(null)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-2xl">key</span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900">Login ready</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Pass these to {issued.sellerName}. They sign in at{' '}
                                <span className="font-mono text-gray-700">/seller-login</span>.
                            </p>
                        </div>
                        <div className="space-y-2 mb-5">
                            <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200">
                                <p className="text-[11px] text-gray-500 font-bold uppercase">Username</p>
                                <p className="font-mono font-bold text-gray-900">{issued.username}</p>
                            </div>
                            {issued.password && (
                                <div className="px-3 py-2.5 rounded-xl bg-gray-900">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase">Temporary password</p>
                                    <p className="font-mono font-bold text-white">{issued.password}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setIssued(null)}
                            className="w-full py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Rejecting asks for a reason, which the seller's dashboard shows. */}
            {rejecting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setRejecting(null)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Reject this application?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {rejecting.fullName} will not be able to sign in, and any login they
                            already have is turned off.
                        </p>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Reason (shown to them)
                        </label>
                        <textarea
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                            rows={3}
                            placeholder="e.g. KYC document was unreadable"
                            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-green-500 resize-none mb-4"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRejecting(null)}
                                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
