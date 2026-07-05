'use client';

import { useAuth } from '@/context/AuthContext';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';

/**
 * App-style top bar for the provider Home screen:
 * avatar + greeting on the left, notification bell + settings on the right.
 */
export default function ProviderTopBar() {
    const { user } = useAuth();
    const [, setTab] = useProviderTab();
    const pt = useProviderT();
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    return (
        <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 min-w-0">
                <div className="size-11 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="" className="size-full object-cover" />
                        : <span className="material-symbols-outlined text-primary">person</span>}
                </div>
                <h1 className="text-lg font-black text-gray-900 dark:text-white truncate">
                    {pt('hello')}, {firstName} !!
                </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => setTab('notifications')}
                    aria-label="Notifications"
                    className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
                <button
                    onClick={() => setTab('profile-settings')}
                    aria-label="Settings"
                    className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">manage_accounts</span>
                </button>
            </div>
        </div>
    );
}
