'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type CartContextType = {
    quantities: Record<number, number>;
    addItem: (id: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const addItem = (id: number) => {
        setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeItem = (id: number) => {
        setQuantities(prev => {
            const newQty = (prev[id] || 0) - 1;
            if (newQty <= 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: newQty };
        });
    };

    const clearCart = () => {
        setQuantities({});
    };

    const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);

    return (
        <CartContext.Provider value={{ quantities, addItem, removeItem, clearCart, totalItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
