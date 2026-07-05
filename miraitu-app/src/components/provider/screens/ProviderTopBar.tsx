'use client';

import { useAuth } from '@/context/AuthContext';
import { useProviderT } from '@/i18n/providerTranslations';

/**
 * App-style greeting for the provider Home screen. The notification bell and
 * view-switch live in the global Header, so we don't repeat them here.
 */
export default function ProviderTopBar() {
    const { user } = useAuth();
    const pt = useProviderT();
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    return (
        <div className="flex items-center gap-3 min-w-0 mb-5">
            <div className="size-11 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                {user?.photoURL
                    ? <img src={user.photoURL} alt="" className="size-full object-cover" />
                    : <span className="material-symbols-outlined text-primary">person</span>}
            </div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white truncate">
                {pt('hello')}, {firstName} !!
            </h1>
        </div>
    );
}
