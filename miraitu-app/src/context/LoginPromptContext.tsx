'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LoginPromptContextType {
    showLoginPrompt: () => void;
    isLoginPromptOpen: boolean;
    closeLoginPrompt: () => void;
    /** Call this before performing a protected action. Returns true if user is logged in. */
    requireLogin: () => boolean;
}

const LoginPromptContext = createContext<LoginPromptContextType | undefined>(undefined);

export function LoginPromptProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    const showLoginPrompt = useCallback(() => {
        setIsLoginPromptOpen(true);
    }, []);

    const closeLoginPrompt = useCallback(() => {
        setIsLoginPromptOpen(false);
    }, []);

    const requireLogin = useCallback(() => {
        if (user) return true;
        setIsLoginPromptOpen(true);
        return false;
    }, [user]);

    return (
        <LoginPromptContext.Provider value={{ showLoginPrompt, isLoginPromptOpen, closeLoginPrompt, requireLogin }}>
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
