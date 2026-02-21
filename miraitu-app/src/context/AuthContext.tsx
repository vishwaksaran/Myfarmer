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

export interface UserProfile {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    farm_location: string | null;
    role: string;
}

interface AuthContextType {
    user: MiraituUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithPhone: (phone: string) => Promise<{ error: string | null }>;
    verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
    loginAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<UserProfile | null>;
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
    uploadAvatar: (file: File) => Promise<{ url: string | null; error: string | null }>;
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
            // Pre-check: verify Google provider is available by testing the auth endpoint
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const checkUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`;
            try {
                const checkResp = await fetch(checkUrl, { method: 'HEAD', redirect: 'manual' });
                // If the provider isn't enabled Supabase returns 400
                if (checkResp.status === 400) {
                    setLoading(false);
                    throw new Error('Google sign-in is not yet configured. Please use Phone OTP or Guest login.');
                }
            } catch (preCheckError: unknown) {
                // If the pre-check itself failed with our custom message, rethrow
                if (preCheckError instanceof Error && preCheckError.message.includes('not yet configured')) {
                    throw preCheckError;
                }
                // Network errors on pre-check are ok — let the main flow handle it
            }

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

    // Fetch user profile from Supabase profiles table
    const fetchProfile = async (): Promise<UserProfile | null> => {
        if (!user || user.isGuest) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, phone, avatar_url, farm_location, role')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as UserProfile;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    };

    // Update user profile in Supabase profiles table
    const updateProfile = async (data: Partial<UserProfile>): Promise<{ error: string | null }> => {
        if (!user || user.isGuest) return { error: 'Not authenticated' };
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, ...data, updated_at: new Date().toISOString() });
            if (error) return { error: error.message };
            // Update local user state
            if (data.full_name !== undefined) {
                setUser(prev => prev ? { ...prev, displayName: data.full_name || prev.displayName } : prev);
            }
            if (data.avatar_url !== undefined) {
                setUser(prev => prev ? { ...prev, photoURL: data.avatar_url || prev.photoURL } : prev);
            }
            if (data.phone !== undefined) {
                setUser(prev => prev ? { ...prev, phone: data.phone || prev.phone } : prev);
            }
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update profile';
            return { error: message };
        }
    };

    // Upload avatar image to Supabase Storage
    const uploadAvatar = async (file: File): Promise<{ url: string | null; error: string | null }> => {
        if (!user || user.isGuest) return { url: null, error: 'Not authenticated' };
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `avatars/${user.id}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('seller-images')
                .upload(filePath, file, { upsert: true });
            if (uploadError) return { url: null, error: uploadError.message };
            const { data: { publicUrl } } = supabase.storage
                .from('seller-images')
                .getPublicUrl(filePath);
            // Update the profile with the new avatar URL
            await updateProfile({ avatar_url: publicUrl });
            return { url: publicUrl, error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to upload avatar';
            return { url: null, error: message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            signInWithPhone,
            verifyOtp,
            loginAsGuest,
            signOut: handleSignOut,
            fetchProfile,
            updateProfile,
            uploadAvatar,
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
