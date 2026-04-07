'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const SHOP_WISHLIST_STORAGE_KEY = 'miraitu_shop_wishlist_ids';
const SHOP_WISHLIST_UPDATED_EVENT = 'miraitu-shop-wishlist-updated';

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
    const [wishlistIds, setWishlistIds] = useState<Set<number>>(() => {
        if (typeof window === 'undefined') return new Set<number>();
        const saved = window.localStorage.getItem(SHOP_WISHLIST_STORAGE_KEY);
        return parseWishlist(saved);
    });

    const syncFromStorage = useCallback(() => {
        if (typeof window === 'undefined') return;
        const saved = window.localStorage.getItem(SHOP_WISHLIST_STORAGE_KEY);
        setWishlistIds(parseWishlist(saved));
    }, []);

    const persistWishlist = useCallback((next: Set<number>) => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem(
            SHOP_WISHLIST_STORAGE_KEY,
            JSON.stringify(Array.from(next))
        );
        window.dispatchEvent(new Event(SHOP_WISHLIST_UPDATED_EVENT));
    }, []);

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key && event.key !== SHOP_WISHLIST_STORAGE_KEY) return;
            syncFromStorage();
        };

        const handleWishlistUpdated = () => {
            syncFromStorage();
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener(SHOP_WISHLIST_UPDATED_EVENT, handleWishlistUpdated);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener(SHOP_WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
        };
    }, [syncFromStorage]);

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
            persistWishlist(next);
            return next;
        });
    }, [persistWishlist]);

    const clearWishlist = useCallback(() => {
        const empty = new Set<number>();
        setWishlistIds(empty);
        persistWishlist(empty);
    }, [persistWishlist]);

    const wishlistCount = wishlistIds.size;
    const wishlistIdList = useMemo(() => Array.from(wishlistIds), [wishlistIds]);

    return {
        isWishlisted,
        toggleWishlist,
        clearWishlist,
        wishlistCount,
        wishlistIdList,
    };
}
