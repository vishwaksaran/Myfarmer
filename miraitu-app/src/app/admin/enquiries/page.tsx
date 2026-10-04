'use client';

import { useEffect, useState } from 'react';
import {
    fetchContactMessages,
    updateContactMessage,
    type ContactMessageRecord,
} from '@/app/actions/contact-messages';
import { CONTACT_TOPICS, CONTACT_STATUSES, contactTopicLabel, type ContactStatus } from '@/lib/contact-options';
import MiraituLoader from '@/components/v2/MiraituLoader';

/**
 * Messages from the web Contact Us page — companies, partners, advertisers,
 * press and investors. Kept apart from Contact Requests (farmers waiting on a
 * phone call) because these are answered by email, usually by someone else.
 */

const STATUS_META: Record<ContactStatus, { label: string; chip: string }> = {
    new: { label: 'New', chip: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'In progress', chip: 'bg-amber-100 text-amber-700' },
    replied: { label: 'Replied', chip: 'bg-green-100 text-green-700' },
    closed: { label: 'Closed', chip: 'bg-gray-100 text-gray-600' },
};

const topicIcon = (topic: string) => CONTACT_TOPICS.find(t => t.value === topic)?.icon ?? 'chat';

export default function EnquiriesPage() {
    const [rows, setRows] = useState<ContactMessageRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [statusCounts, setStatusCounts] = useState<Record<ContactStatus, number>>({ new: 0, in_progress: 0, replied: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
    const pageSize = 25;

    useEffect(() => {
        const t = setTimeout(() => { setLoading(true); setDebouncedSearch(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        let cancelled = false;
        fetchContactMessages({
            page,
            pageSize,
            status: statusFilter,
            topic: topicFilter,
            search: debouncedSearch,
        }).then(result => {
            if (cancelled) return;
            setRows(result.data);
            setTotal(result.total);
            setStatusCounts(result.statusCounts);
            setError(result.error);
            setLoading(false);
        }).catch(() => {
            if (cancelled) return;
            setError('Failed to fetch enquiries.');
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [page, statusFilter, topicFilter, debouncedSearch]);

    const changeStatus = async (id: string, status: ContactStatus) => {
        setBusyId(id);
        const res = await updateContactMessage(id, { status });
        setBusyId(null);
        if (res.error) { setError(res.error); return; }
        // Adjust in place rather than refetching, so a message admin just
        // opened under the "New" filter does not vanish from under them.
        const prevStatus = rows.find(r => r.id === id)?.status;
        setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
        if (prevStatus && prevStatus !== status) {
            setStatusCounts(c => ({ ...c, [prevStatus]: Math.max(0, c[prevStatus] - 1), [status]: c[status] + 1 }));
        }
    };

    const saveNote = async (id: string) => {
        const note = noteDrafts[id];
        if (note === undefined) return;
        setBusyId(id);
        const res = await updateContactMessage(id, { adminNote: note });
        setBusyId(null);
        if (res.error) { setError(res.error); return; }
        setRows(prev => prev.map(r => (r.id === id ? { ...r, adminNote: note.trim() || null } : r)));
        setNoteDrafts(d => {
            const rest = { ...d };
            delete rest[id];
            return rest;
        });
    };

    // Opening a new message is the moment admin has seen it.
    const toggle = (r: ContactMessageRecord) => {
        const opening = expanded !== r.id;
        setExpanded(opening ? r.id : null);
        if (opening && r.status === 'new') changeStatus(r.id, 'in_progress');
    };

    const replyHref = (r: ContactMessageRecord) => {
        const subject = 'Re: ' + (r.subject || contactTopicLabel(r.topic)) + ' — Miraitu';
        const quoted = r.message.split('\n').map(l => '> ' + l).join('\n');
        const body = `Hi ${r.fullName},\n\nThank you for contacting Miraitu.\n\n\n\n---\n${quoted}`;
        return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCsvExport = () => {
        const header = 'Time,Name,Company,Email,Phone,Topic,Subject,Message,Status,Note,IP\n';
        const cell = (v: string | null) => '"' + (v ?? '').replace(/"/g, '""') + '"';
        const body = rows.map(r => [
            cell(new Date(r.createdAt).toLocaleString()),
            cell(r.fullName),
            cell(r.company),
            cell(r.email),
            cell(r.phone),
            cell(contactTopicLabel(r.topic)),
            cell(r.subject),
            cell(r.message),
            cell(STATUS_META[r.status].label),
            cell(r.adminNote),
            cell(r.ipAddress),
        ].join(',')).join('\n');
        const blob = new Blob([header + body], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / pageSize);
    const allCount = CONTACT_STATUSES.reduce((n, s) => n + statusCounts[s], 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Enquiries</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Messages from the website&apos;s Contact Us page
                        {statusCounts.new > 0 && ` · ${statusCounts.new} new`}
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
                <div className="flex gap-1.5 flex-wrap">
                    {[{ key: '', label: `All (${allCount})` },
                    ...CONTACT_STATUSES.map(s => ({ key: s, label: `${STATUS_META[s].label} (${statusCounts[s]})` }))].map(c => (
                        <button
                            key={c.key || 'all'}
                            onClick={() => { setLoading(true); setStatusFilter(c.key); setPage(1); }}
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${statusFilter === c.key
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
                    placeholder="Search name, email, company or message"
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white min-w-[240px] flex-1 max-w-sm"
                />
                <select
                    value={topicFilter}
                    onChange={(e) => { setLoading(true); setTopicFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                >
                    <option value="">All topics</option>
                    {CONTACT_TOPICS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
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
                        <span className="material-symbols-outlined text-4xl mb-2">mail</span>
                        <p className="text-sm font-medium">No enquiries yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {rows.map(r => {
                            const open = expanded === r.id;
                            const draft = noteDrafts[r.id];
                            return (
                                <div key={r.id} className={`px-5 py-4 ${r.status === 'new' ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600 bg-indigo-50">
                                            <span className="material-symbols-outlined text-xl">{topicIcon(r.topic)}</span>
                                        </div>

                                        <button type="button" onClick={() => toggle(r)} className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className={`text-sm text-gray-900 ${r.status === 'new' ? 'font-black' : 'font-bold'}`}>{r.fullName}</p>
                                                {r.company && <span className="text-sm font-semibold text-gray-600">· {r.company}</span>}
                                                <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                                                    {contactTopicLabel(r.topic)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${STATUS_META[r.status].chip}`}>
                                                    {STATUS_META[r.status].label}
                                                </span>
                                            </div>
                                            {r.subject && <p className="text-sm font-semibold text-gray-800 mt-1">{r.subject}</p>}
                                            <p className={`text-xs text-gray-600 mt-1 whitespace-pre-line ${open ? '' : 'line-clamp-2'}`}>
                                                {r.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-gray-500">
                                                <span>{r.email}</span>
                                                {r.phone && <span>• {r.phone}</span>}
                                                {r.userId && <span>• Signed-in user</span>}
                                                {open && r.ipAddress && <span>• IP: {r.ipAddress}</span>}
                                            </div>
                                            {!open && r.adminNote && (
                                                <p className="text-xs text-gray-600 italic mt-1.5">Note: {r.adminNote}</p>
                                            )}
                                        </button>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {new Date(r.createdAt).toLocaleString()}
                                            </span>
                                            <select
                                                value={r.status}
                                                disabled={busyId === r.id}
                                                onChange={e => changeStatus(r.id, e.target.value as ContactStatus)}
                                                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold bg-white disabled:opacity-50"
                                            >
                                                {CONTACT_STATUSES.map(s => (
                                                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-1.5">
                                                <a
                                                    href={replyHref(r)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">reply</span>
                                                    Reply
                                                </a>
                                                {r.phone && (
                                                    <a
                                                        href={`tel:${r.phone}`}
                                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">call</span>
                                                        Call
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {open && (
                                        <div className="mt-3 ml-14 flex flex-col sm:flex-row gap-2">
                                            <input
                                                value={draft ?? r.adminNote ?? ''}
                                                onChange={e => setNoteDrafts(d => ({ ...d, [r.id]: e.target.value }))}
                                                placeholder="Internal note (only admins see this)"
                                                maxLength={2000}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-green-500"
                                            />
                                            <button
                                                onClick={() => saveNote(r.id)}
                                                disabled={draft === undefined || busyId === r.id}
                                                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold disabled:opacity-40"
                                            >
                                                Save note
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
