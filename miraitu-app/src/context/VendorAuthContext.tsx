'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface VendorInfo {
    id: string;
    username: string;
    displayName: string;
    email: string | null;
    isTempPassword: boolean;
}

interface ShopInfo {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
}

interface VendorAuthContextType {
    vendor: VendorInfo | null;
    shop: ShopInfo | null;
    loading: boolean;
    authenticated: boolean;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
    const [vendor, setVendor] = useState<VendorInfo | null>(null);
    const [shop, setShop] = useState<ShopInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    const refreshSession = useCallback(async () => {
        try {
            const res = await fetch('/api/vendor/auth/session');
            const data = await res.json();

            if (data.authenticated) {
                setVendor(data.vendor);
                setShop(data.shop);
                setAuthenticated(true);
            } else {
                setVendor(null);
                setShop(null);
                setAuthenticated(false);
            }
        } catch {
            setVendor(null);
            setShop(null);
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSession();
    }, [refreshSession]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/vendor/auth/logout', { method: 'POST' });
        } catch { /* ignore */ }
        setVendor(null);
        setShop(null);
        setAuthenticated(false);
        // Redirect to login — use shop slug if available
        const slug = shop?.slug;
        if (slug) {
            window.location.href = `/vendor/${slug}/login`;
        } else {
            window.location.href = '/';
        }
    }, [shop]);

    return (
        <VendorAuthContext.Provider value={{
            vendor,
            shop,
            loading,
            authenticated,
            logout,
            refreshSession,
        }}>
            {children}
        </VendorAuthContext.Provider>
    );
}

export function useVendorAuth() {
    const context = useContext(VendorAuthContext);
    if (context === undefined) {
        throw new Error('useVendorAuth must be used within a VendorAuthProvider');
    }
    return context;
}
