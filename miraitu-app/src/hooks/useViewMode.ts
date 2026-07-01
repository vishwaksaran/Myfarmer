'use client';

import { useSyncExternalStore, useCallback } from 'react';

/**
 * Lightweight view-mode toggle for service providers.
 *
 * A provider can flip between their provider workspace ("provider") and the
 * regular farmer/consumer experience ("farmer"). The choice is persisted in
 * localStorage and shared across components (BottomNav, dashboard, home banner)
 * via a custom event, so switching updates every subscriber instantly.
 */

export type ViewMode = 'provider' | 'farmer';

const KEY = 'miraitu_view_mode';
const EVENT = 'miraitu-viewmode-change';

function getSnapshot(): ViewMode {
    if (typeof window === 'undefined') return 'provider';
    return (localStorage.getItem(KEY) as ViewMode) || 'provider';
}

function getServerSnapshot(): ViewMode {
    return 'provider';
}

function subscribe(callback: () => void): () => void {
    window.addEventListener(EVENT, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
    const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setMode = useCallback((next: ViewMode) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(KEY, next);
        window.dispatchEvent(new Event(EVENT));
    }, []);

    return [mode, setMode];
}
