'use client';

import { useState, useMemo } from 'react';
import type { ProviderContactsResult } from '@/app/actions/provider';
import type { ProviderCategoryConfig } from '@/lib/provider-config';

interface ContactHistoryProps {
    data: ProviderContactsResult;
    config: ProviderCategoryConfig;
}

const STATUS_COLORS: Record<string, string> = {
    assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
    accepted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
    in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30',
    pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30',
};

function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
        ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function ContactHistory({ data, config }: ContactHistoryProps) {
    const [filter, setFilter] = useState<'all' | 'repeat' | 'recent'>('all');
    // Snapshot "now" once at mount so the memo stays pure across re-renders.
    const [mountedAt] = useState(() => Date.now());

    const filtered = useMemo(() => {
        if (filter === 'repeat') return data.contacts.filter(c => c.is_repeat);
        if (filter === 'recent') {
            const weekAgo = mountedAt - 7 * 24 * 60 * 60 * 1000;
            return data.contacts.filter(c => new Date(c.created_at).getTime() >= weekAgo);
        }
        return data.contacts;
    }, [data.contacts, filter, mountedAt]);

    const filters: { value: typeof filter; label: string }[] = [
        { value: 'all', label: `All (${data.contacts.length})` },
        { value: 'repeat', label: 'Repeat' },
        { value: 'recent', label: 'Last 7 days' },
    ];

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{data.total_customers}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{config.contactNoun} contacted</p>
                </div>
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                    <p className="text-2xl font-black text-purple-600">{data.repeat_customers}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">Repeat customers</p>
                </div>
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{data.contacts.length}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">Total requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            filter === f.value
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:bg-gray-100'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">contacts</span>
                    <p className="text-sm font-bold text-gray-500">No customer contacts yet</p>
                    <p className="text-xs text-gray-400 mt-1">Requests from customers will appear here</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                    {filtered.map(c => (
                        <div key={c.booking_id} className="flex items-center gap-3 p-4">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-black text-primary">
                                    {c.full_name?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.full_name}</p>
                                    {c.is_repeat && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-[9px] font-black uppercase">
                                            Repeat ×{c.order_count}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 capitalize truncate">
                                    {c.service.replace(/[-_]/g, ' ')} · {formatDateTime(c.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${STATUS_COLORS[c.status] || STATUS_COLORS.pending}`}>
                                    {c.status.replace('_', ' ')}
                                </span>
                                <a href={`tel:${c.phone}`} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                                    <span className="material-symbols-outlined text-xs">call</span>
                                    {c.phone}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
