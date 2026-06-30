'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchActivityLog } from '@/app/actions/vendor-activity';
import MiraituLoader from '@/components/v2/MiraituLoader';

interface ActivityRow {
    id: string;
    action: string;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
    vendor_credentials: { username: string; display_name: string } | null;
    shops: { name: string; slug: string } | null;
}

export default function ActivityLogPage() {
    const [logs, setLogs] = useState<ActivityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const pageSize = 30;

    const load = useCallback(async () => {
        setLoading(true);
        const result = await fetchActivityLog({ page, pageSize, action: actionFilter });
        if (!result.error) {
            setLogs(result.data as unknown as ActivityRow[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, [page, actionFilter]);

    useEffect(() => { load(); }, [load]);

    const actionTypes = [
        'credential_created', 'credential_deactivated', 'credential_reactivated', 'credential_deleted',
        'vendor_login', 'vendor_login_failed', 'vendor_logout',
        'username_changed', 'password_changed', 'password_reset',
        'product_created', 'product_updated', 'product_deleted',
        'order_created', 'order_status_changed',
    ];

    const actionIcons: Record<string, { icon: string; color: string }> = {
        credential_created: { icon: 'person_add', color: 'text-green-600 bg-green-50' },
        credential_deactivated: { icon: 'block', color: 'text-red-600 bg-red-50' },
        credential_reactivated: { icon: 'check_circle', color: 'text-green-600 bg-green-50' },
        credential_deleted: { icon: 'delete', color: 'text-red-600 bg-red-50' },
        vendor_login: { icon: 'login', color: 'text-blue-600 bg-blue-50' },
        vendor_login_failed: { icon: 'error', color: 'text-red-600 bg-red-50' },
        vendor_logout: { icon: 'logout', color: 'text-gray-600 bg-gray-50' },
        username_changed: { icon: 'edit', color: 'text-amber-600 bg-amber-50' },
        password_changed: { icon: 'key', color: 'text-amber-600 bg-amber-50' },
        password_reset: { icon: 'lock_reset', color: 'text-amber-600 bg-amber-50' },
    };

    const handleCsvExport = () => {
        const header = 'Time,Action,Vendor,Shop,Details,IP\n';
        const rows = logs.map(l =>
            `"${new Date(l.created_at).toLocaleString()}","${l.action}","${l.vendor_credentials?.username || 'N/A'}","${l.shops?.name || 'N/A'}","${JSON.stringify(l.details).replace(/"/g, '""')}","${l.ip_address || ''}"`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Activity Log</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} event{total !== 1 ? 's' : ''} recorded</p>
                </div>
                <button
                    onClick={handleCsvExport}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Export CSV
                </button>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 bg-white"
                >
                    <option value="">All Actions</option>
                    {actionTypes.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <MiraituLoader fullScreen={false} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2">history</span>
                        <p className="text-sm font-medium">No activity yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map((log) => {
                            const ai = actionIcons[log.action] || { icon: 'info', color: 'text-gray-600 bg-gray-50' };
                            return (
                                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50">
                                    <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ai.color}`}>
                                        <span className="material-symbols-outlined text-xl">{ai.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {log.action.replace(/_/g, ' ')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            {log.vendor_credentials && (
                                                <span className="text-xs text-gray-500">
                                                    @{log.vendor_credentials.username}
                                                </span>
                                            )}
                                            {log.shops && (
                                                <span className="text-xs text-gray-400">
                                                    • {log.shops.name}
                                                </span>
                                            )}
                                            {log.ip_address && (
                                                <span className="text-xs text-gray-400">
                                                    • IP: {log.ip_address}
                                                </span>
                                            )}
                                        </div>
                                        {Object.keys(log.details || {}).length > 0 && (
                                            <pre className="mt-1 text-[10px] text-gray-400 font-mono truncate max-w-md">
                                                {JSON.stringify(log.details)}
                                            </pre>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
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
        </div>
    );
}
