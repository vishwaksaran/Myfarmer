'use client';

import type { ProviderNotification } from '@/app/actions/provider';
import { useProviderT } from '@/i18n/providerTranslations';

interface NotificationsPanelProps {
    notifications: ProviderNotification[];
}

const TYPE_STYLES: Record<ProviderNotification['type'], string> = {
    new_request: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    status_update: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
    payment: 'text-green-600 bg-green-100 dark:bg-green-900/20',
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPanel({ notifications }: NotificationsPanelProps) {
    const pt = useProviderT();
    if (notifications.length === 0) {
        return (
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">notifications_off</span>
                <p className="text-sm font-bold text-gray-500">{pt('noNotifications')}</p>
                <p className="text-xs text-gray-400 mt-1">{pt('newJobRequestsHint')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
            {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-4">
                    <div className={`size-10 rounded-xl ${TYPE_STYLES[n.type]} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap shrink-0">{timeAgo(n.timestamp)}</span>
                </div>
            ))}
        </div>
    );
}
