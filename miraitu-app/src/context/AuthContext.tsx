'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Normalized user interface that maps Supabase user properties
 * to the field names used throughout the app (displayName, photoURL, etc.)
 */
export interface MiraituUser {
    id: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    phone: string | null;
    isGuest: boolean;
    uid: string; // alias for id, for backward compatibility
}

interface AuthContextType {
    user: MiraituUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
    verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
    loginAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert Supabase user to normalized MiraituUser
 */
function toMiraituUser(supabaseUser: SupabaseUser): MiraituUser {
    const meta = supabaseUser.user_metadata || {};
    return {
        id: supabaseUser.id,
        uid: supabaseUser.id,
        displayName: meta.full_name || meta.name || meta.display_name || null,
        email: supabaseUser.email || null,
        photoURL: meta.avatar_url || meta.picture || null,
        phone: supabaseUser.phone || null,
        isGuest: false,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<MiraituUser | null>(null);
    const [loading, setLoading] = useState(true);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sign out handler
    const handleSignOut = useCallback(async () => {
        try {
            if (user?.isGuest) {
                setUser(null);
            } else {
                await supabase.auth.signOut();
                setUser(null);
            }
        } catch (error) {
            console.error('Error signing out:', error);
            setUser(null);
        }
    }, [user]);

    // Reset the inactivity timer
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        if (user) {
            inactivityTimerRef.current = setTimeout(() => {
                console.log('[Miraitu] Auto-logout due to inactivity');
                handleSignOut();
            }, INACTIVITY_TIMEOUT_MS);
        }
    }, [user, handleSignOut]);

    // Set up inactivity detection when user is logged in
    useEffect(() => {
        if (!user) {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
            return;
        }

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        const onActivity = () => resetInactivityTimer();

        resetInactivityTimer();

        events.forEach(event => {
            window.addEventListener(event, onActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, onActivity);
            });
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [user, resetInactivityTimer]);

    // Supabase auth state listener
    useEffect(() => {
        // Check current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(toMiraituUser(session.user));
            }
            setLoading(false);
        });

        // Listen for auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                if (session?.user) {
                    setUser(toMiraituUser(session.user));
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Google OAuth Sign-In
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });
            if (error) throw error;
            // Browser will redirect — loading stays true until redirect completes
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setLoading(false);
            throw error;
        }
    };

    // Phone OTP — send code
    const signInWithPhone = async (phone: string): Promise<{ error: string | null }> => {
        try {
            const { error } = await supabase.auth.signInWithOtp({ phone });
            if (error) {
                return { error: error.message };
            }
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send OTP';
            return { error: message };
        }
    };

    // Phone OTP — verify code
    const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            });
            if (error) {
                return { error: error.message };
            }
            if (data?.user) {
                setUser(toMiraituUser(data.user));
            }
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to verify OTP';
            return { error: message };
        }
    };

    // Guest login (local only, no Supabase session)
    const loginAsGuest = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const guestUser: MiraituUser = {
            id: 'guest-123',
            uid: 'guest-123',
            displayName: 'Guest Farmer',
            email: 'guest@miraitu.com',
            photoURL: null,
            phone: null,
            isGuest: true,
        };

        setUser(guestUser);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            signInWithPhone,
            verifyOtp,
            loginAsGuest,
            signOut: handleSignOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
