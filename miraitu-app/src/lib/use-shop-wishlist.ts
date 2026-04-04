'use client';

import { useCallback, useEffect, useState } from 'react';

const SHOP_WISHLIST_STORAGE_KEY = 'miraitu_shop_wishlist_ids';

function parseWishlist(raw: string | null): Set<number> {
    if (!raw) return new Set<number>();

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return new Set<number>();

        return new Set(
            parsed
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)
        );
    } catch {
        return new Set<number>();
    }
}

export function useShopWishlist() {
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set<number>());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = window.localStorage.getItem(SHOP_WISHLIST_STORAGE_KEY);
        setWishlistIds(parseWishlist(saved));
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded || typeof window === 'undefined') return;

        window.localStorage.setItem(
            SHOP_WISHLIST_STORAGE_KEY,
            JSON.stringify(Array.from(wishlistIds))
        );
    }, [wishlistIds, loaded]);

    const isWishlisted = useCallback(
        (productId: number) => wishlistIds.has(productId),
        [wishlistIds]
    );

    const toggleWishlist = useCallback((productId: number) => {
        setWishlistIds((prev) => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    }, []);

    return {
        isWishlisted,
        toggleWishlist,
    };
}
