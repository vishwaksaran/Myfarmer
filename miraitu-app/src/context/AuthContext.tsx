'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create a dummy user object conforming to Firebase User interface (partially)
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

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, loginAsGuest, signOut }}>
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
