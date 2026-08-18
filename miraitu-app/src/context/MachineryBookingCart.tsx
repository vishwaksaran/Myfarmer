'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import type { RentalUnit } from '@/lib/machinery-rental-catalog';
import { useUserScopedState } from '@/lib/user-scoped-storage';

/** Base key — the signed-in user's id is appended, so carts never cross accounts. */
const STORAGE_KEY = 'miraitu_machinery_cart';

const EMPTY: BookingCartLine[] = [];

export interface BookingCartLine {
    /** Composite key: `${category}:${itemId}` — unique per cart. */
    key: string;
    category: string;
    itemId: string;
    name: string;
    price: number;
    unit: RentalUnit;
    image: string;
    quantity: number;
    answers: Record<string, string>;
}

interface MachineryBookingCartType {
    lines: BookingCartLine[];
    addLine: (line: Omit<BookingCartLine, 'key'>) => void;
    updateQuantity: (key: string, quantity: number) => void;
    removeLine: (key: string) => void;
    clear: () => void;
    totalItems: number;
    subtotal: number;
    ready: boolean;
}

const Ctx = createContext<MachineryBookingCartType | undefined>(undefined);

export function MachineryBookingCartProvider({ children }: { children: ReactNode }) {
    // Per-user storage: signing out no longer leaves the previous account's
    // items sitting in the cart for whoever browses next.
    const [lines, setLines, ready, resetLines] = useUserScopedState<BookingCartLine[]>(STORAGE_KEY, EMPTY);

    const addLine = useCallback((line: Omit<BookingCartLine, 'key'>) => {
        const key = `${line.category}:${line.itemId}`;
        setLines(prev => {
            const existing = prev.find(l => l.key === key);
            if (existing) {
                // Same item re-added: bump quantity and refresh answers.
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

export function useMachineryCart() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useMachineryCart must be used within a MachineryBookingCartProvider');
    return ctx;
}

/**
 * Item count for callers that render outside the provider — the shared Header
 * appears on every page, but this cart is only mounted under /home/machinery.
 * Returns 0 rather than throwing there.
 */
export function useMachineryCartCount(): number {
    return useContext(Ctx)?.totalItems ?? 0;
}
