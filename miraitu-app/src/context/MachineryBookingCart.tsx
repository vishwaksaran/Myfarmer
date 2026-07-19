'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { RentalUnit } from '@/lib/machinery-rental-catalog';

const STORAGE_KEY = 'miraitu_machinery_cart';

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
    const [lines, setLines] = useState<BookingCartLine[]>([]);
    const [ready, setReady] = useState(false);

    // Load from localStorage once on mount (client-only, avoids hydration mismatch)
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setLines(JSON.parse(raw));
        } catch { /* ignore corrupt cart */ }
        setReady(true);
    }, []);

    // Persist whenever the cart changes (after initial load)
    useEffect(() => {
        if (!ready) return;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* quota */ }
    }, [lines, ready]);

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
    }, []);

    const updateQuantity = useCallback((key: string, quantity: number) => {
        setLines(prev => quantity <= 0
            ? prev.filter(l => l.key !== key)
            : prev.map(l => l.key === key ? { ...l, quantity } : l));
    }, []);

    const removeLine = useCallback((key: string) => {
        setLines(prev => prev.filter(l => l.key !== key));
    }, []);

    const clear = useCallback(() => setLines([]), []);

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
