'use client';

import { useSyncExternalStore, useCallback } from 'react';

/**
 * Shared "active provider dashboard tab" store.
 *
 * The provider bottom nav lives in a different component tree than the
 * dashboard, and Next.js <Link> hash navigation does NOT fire `hashchange`
 * (it uses history.pushState), so hash-based deep-linking is unreliable.
 * This tiny localStorage-backed store lets the bottom nav set the tab and the
 * dashboard react instantly, regardless of where each is rendered.
 */

const KEY = 'miraitu_provider_tab';
const EVENT = 'miraitu-provider-tab-change';

function getSnapshot(): string {
    if (typeof window === 'undefined') return 'home';
    return localStorage.getItem(KEY) || 'home';
}

function getServerSnapshot(): string {
    return 'home';
}

function subscribe(callback: () => void): () => void {
    window.addEventListener(EVENT, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}

export function useProviderTab(): [string, (tab: string) => void] {
    const tab = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setTab = useCallback((next: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(KEY, next);
        window.dispatchEvent(new Event(EVENT));
    }, []);

    return [tab, setTab];
}
