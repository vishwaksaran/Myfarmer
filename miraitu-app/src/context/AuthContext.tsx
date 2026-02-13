'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    loginAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sign out handler
    const handleSignOut = useCallback(async () => {
        try {
            // Check if it's a guest user
            if (user && (user as unknown as { uid: string }).uid === 'guest-123') {
                setUser(null);
            } else {
                await firebaseSignOut(auth);
            }
        } catch (error) {
            console.error('Error signing out:', error);
            // Force clear user state even on error
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

        // Start the timer
        resetInactivityTimer();

        // Listen for user activity
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

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const dummyUser = {
            uid: 'guest-123',
            displayName: 'Guest Farmer',
            email: 'guest@miraitu.com',
            photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO',
            emailVerified: true,
            isAnonymous: true,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => { },
            getIdToken: async () => 'dummy-token',
            getIdTokenResult: async () => ({
                token: 'dummy',
                signInProvider: 'custom',
                claims: {},
                authTime: Date.now(),
                issuedAtTime: Date.now(),
                expirationTime: Date.now(),
            }),
            reload: async () => { },
            toJSON: () => ({}),
            phoneNumber: null,
        } as unknown as User;

        setUser(dummyUser);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, loginAsGuest, signOut: handleSignOut }}>
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
