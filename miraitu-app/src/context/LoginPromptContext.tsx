'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LoginPromptContextType {
    showLoginPrompt: () => void;
    isLoginPromptOpen: boolean;
    closeLoginPrompt: () => void;
    dismissLoginPrompt: () => void;
    isDismissed: boolean;
    /** Call this before performing a protected action. Returns true if user is logged in. */
    requireLogin: () => boolean;
}

const LoginPromptContext = createContext<LoginPromptContextType | undefined>(undefined);

export function LoginPromptProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const showLoginPrompt = useCallback(() => {
        if (!isDismissed) {
            setIsLoginPromptOpen(true);
        }
    }, [isDismissed]);

    const closeLoginPrompt = useCallback(() => {
        setIsLoginPromptOpen(false);
    }, []);

    const dismissLoginPrompt = useCallback(() => {
        setIsLoginPromptOpen(false);
        setIsDismissed(true);
    }, []);

    const requireLogin = useCallback(() => {
        if (user) return true;
        if (!isDismissed) {
            setIsLoginPromptOpen(true);
        }
        return false;
    }, [user, isDismissed]);

    return (
        <LoginPromptContext.Provider value={{ showLoginPrompt, isLoginPromptOpen, closeLoginPrompt, dismissLoginPrompt, isDismissed, requireLogin }}>
            {children}
        </LoginPromptContext.Provider>
    );
}

export function useLoginPrompt() {
    const context = useContext(LoginPromptContext);
    if (context === undefined) {
        throw new Error('useLoginPrompt must be used within a LoginPromptProvider');
    }
    return context;
}
