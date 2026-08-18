'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import type { ServiceUnit } from '@/lib/service-catalog';
import { useUserScopedState } from '@/lib/user-scoped-storage';

/** Base key — the signed-in user's id is appended, so carts never cross accounts. */
const STORAGE_KEY = 'miraitu_service_cart';

const EMPTY: ServiceCartLine[] = [];

export interface ServiceCartLine {
    /** Composite key: `${category}:${itemId}` — unique per cart. */
    key: string;
    category: string;
    itemId: string;
    name: string;
    price: number;
    unit: ServiceUnit;
    image: string;
    quantity: number;
    answers: Record<string, string>;
}

interface ServiceBookingCartType {
    lines: ServiceCartLine[];
    addLine: (line: Omit<ServiceCartLine, 'key'>) => void;
    updateQuantity: (key: string, quantity: number) => void;
    removeLine: (key: string) => void;
    clear: () => void;
    totalItems: number;
    subtotal: number;
    ready: boolean;
}

const Ctx = createContext<ServiceBookingCartType | undefined>(undefined);

export function ServiceBookingCartProvider({ children }: { children: ReactNode }) {
    // Per-user storage: signing out no longer leaves the previous account's
    // items sitting in the cart for whoever browses next.
    const [lines, setLines, ready, resetLines] = useUserScopedState<ServiceCartLine[]>(STORAGE_KEY, EMPTY);

    const addLine = useCallback((line: Omit<ServiceCartLine, 'key'>) => {
        const key = `${line.category}:${line.itemId}`;
        setLines(prev => {
            const existing = prev.find(l => l.key === key);
            if (existing) {
                return prev.map(l => l.key === key
                    ? { ...l, quantity: l.quantity + line.quantity, answers: line.answers }
                    : l);
            }
            return [...prev, { ...line, key }];
        });
    }, [setLines]);

    const updateQuantity = useCallback((key: string, quantity: number) => {
        setLines(prev => quantity <= 0
            ? prev.filter(l => l.key !== key)
            : prev.map(l => l.key === key ? { ...l, quantity } : l));
    }, [setLines]);

    const removeLine = useCallback((key: string) => {
        setLines(prev => prev.filter(l => l.key !== key));
    }, [setLines]);

    const clear = useCallback(() => resetLines([]), [resetLines]);

    const totalItems = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

    return (
        <Ctx.Provider value={{ lines, addLine, updateQuantity, removeLine, clear, totalItems, subtotal, ready }}>
            {children}
        </Ctx.Provider>
    );
}

export function useServiceCart() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useServiceCart must be used within a ServiceBookingCartProvider');
    return ctx;
}

/**
 * Item count for callers that render outside the provider — the shared Header
 * appears on every page, but this cart is only mounted under /home/services.
 * Returns 0 rather than throwing there.
 */
export function useServiceCartCount(): number {
    return useContext(Ctx)?.totalItems ?? 0;
}
