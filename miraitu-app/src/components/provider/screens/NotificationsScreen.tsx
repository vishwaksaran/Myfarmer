'use client';

import { useState, useEffect } from 'react';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';
import NotificationsPanel from '@/components/provider/NotificationsPanel';
import { fetchProviderNotifications, type ProviderNotification } from '@/app/actions/provider';

export default function NotificationsScreen() {
    const [, setTab] = useProviderTab();
    const pt = useProviderT();
    const [items, setItems] = useState<ProviderNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProviderNotifications().then(res => { setItems(res.data); setLoading(false); });
    }, []);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setTab('home')} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{pt('notificationsTitle')}</h1>
            </div>
            {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">…</p>
            ) : (
                <NotificationsPanel notifications={items} />
            )}
        </div>
    );
}
