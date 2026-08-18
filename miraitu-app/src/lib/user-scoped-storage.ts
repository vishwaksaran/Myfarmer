'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '@/lib/supabase';

/**
 * localStorage state scoped to whoever is signed in.
 *
 * The booking carts used one global key, so a cart outlived the session that
 * created it: sign out, and the next person on that device — or the same person
 * browsing signed-out — saw the previous user's items still in the cart.
 *
 * Each account now gets its own bucket (`<key>:<user-id>`), with a separate
 * `<key>:guest` bucket for signed-out browsing. Signing out therefore reveals
 * the guest cart rather than leaking someone else's, and signing back in
 * restores exactly what that account had.
 */

const GUEST_SCOPE = 'guest';

function scopedKey(baseKey: string, scope: string) {
    return `${baseKey}:${scope}`;
}

function read<T>(baseKey: string, scope: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(scopedKey(baseKey, scope));
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback; // corrupt or unreadable — start clean
    }
}

/**
 * Returns `[value, setValue, ready]`, persisted per signed-in user.
 *
 * `ready` is false until the first read completes, so callers can avoid
 * writing an empty value over stored data during the initial render.
 */
export function useUserScopedState<T>(baseKey: string, initial: T) {
    const [scope, setScope] = useState<string>(GUEST_SCOPE);
    const [value, setValue] = useState<T>(initial);
    const [ready, setReady] = useState(false);
    /** Guards the persist effect from writing before the first read for a scope. */
    const loadedScopeRef = useRef<string | null>(null);

    // Resolve the current user, then follow sign-in / sign-out.
    useEffect(() => {
        let cancelled = false;

        supabase.auth.getUser().then(({ data }) => {
            if (!cancelled) setScope(data.user?.id ?? GUEST_SCOPE);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setScope(session?.user?.id ?? GUEST_SCOPE);
        });

        return () => { cancelled = true; subscription.unsubscribe(); };
    }, []);

    // Load this scope's bucket whenever the signed-in user changes. Switching
    // accounts swaps carts rather than carrying one across.
    useEffect(() => {
        const stored = read<T>(baseKey, scope, initial);
        loadedScopeRef.current = scope;
        setValue(stored);
        setReady(true);
        // `initial` is a literal at every call site; re-reading on a new array
        // identity would wipe the cart on every render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseKey, scope]);

    // Persist, but only once this scope's value has actually been loaded.
    useEffect(() => {
        if (!ready || loadedScopeRef.current !== scope) return;
        try {
            localStorage.setItem(scopedKey(baseKey, scope), JSON.stringify(value));
        } catch {
            /* quota exceeded — the in-memory cart still works */
        }
    }, [baseKey, scope, value, ready]);

    /** Clears this user's bucket, both in memory and on disk. */
    const reset = useCallback((next: T) => {
        setValue(next);
        try { localStorage.removeItem(scopedKey(baseKey, scope)); } catch { /* ignore */ }
    }, [baseKey, scope]);

    return [value, setValue, ready, reset] as const;
}
