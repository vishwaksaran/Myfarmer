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
    // Extended profile fields
    address: string | null;
    pincode: string | null;
    district: string | null;
    state: string | null;
    latitude: number | null;
    longitude: number | null;
    service_types: string[];
    availability_status: string;
    whatsapp_number: string | null;
    bio: string | null;
    // Onboarding fields
    interests: string[];
    onboarding_completed: boolean;
    farm_size: string | null;
    experience_years: string | null;
    preferred_language: string | null;
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
    checkOnboardingStatus: () => Promise<boolean>;
    deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert Supabase user to normalized MiraituUser
 */
function toMiraituUser(supabaseUser: SupabaseUser): MiraituUser {
    const meta = supabaseUser.user_metadata || {};
    // Filter out synthetic emails used for phone-only auth
    const isSyntheticEmail = supabaseUser.email?.endsWith('@phone.miraitu.app');
    return {
        id: supabaseUser.id,
        uid: supabaseUser.id,
        displayName: meta.full_name || meta.name || meta.display_name || null,
        email: isSyntheticEmail ? null : (supabaseUser.email || null),
        photoURL: meta.avatar_url || meta.picture || null,
        phone: supabaseUser.phone || meta.phone || null,
        isGuest: false,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Start with null to match server render (avoids hydration mismatch)
    const [user, setUser] = useState<MiraituUser | null>(null);
    const [loading, setLoading] = useState(true);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Restore cached user from sessionStorage after mount (client-only)
    useEffect(() => {
        try {
            const cached = sessionStorage.getItem('miraitu_user');
            if (cached) {
                setUser(JSON.parse(cached));
            }
        } catch { /* ignore */ }
    }, []);

    // Persist user to sessionStorage whenever it changes
    useEffect(() => {
        if (user) {
            try { sessionStorage.setItem('miraitu_user', JSON.stringify(user)); } catch { }
        } else {
            try { sessionStorage.removeItem('miraitu_user'); } catch { }
        }
    }, [user]);

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

    // Fetch profile avatar from profiles table and update user state
    const loadProfileAvatar = useCallback(async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('avatar_url, full_name, phone')
                .eq('id', userId)
                .single();
            if (data) {
                setUser(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        photoURL: data.avatar_url || prev.photoURL,
                        displayName: data.full_name || prev.displayName,
                        phone: data.phone || prev.phone,
                    };
                });
            }
        } catch (err) {
            console.error('Error loading profile avatar:', err);
        }
    }, []);

    // Supabase auth state listener
    useEffect(() => {
        // Check current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(prev => {
                    const mapped = toMiraituUser(session.user);
                    // Preserve DB avatar if we already loaded one from profiles table
                    if (prev?.photoURL && (prev.photoURL.includes('supabase') || prev.photoURL.includes('storage'))) {
                        mapped.photoURL = prev.photoURL;
                    }
                    return mapped;
                });
                // Load profile data (including custom avatar) from DB
                loadProfileAvatar(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                if (session?.user) {
                    setUser(prev => {
                        const mapped = toMiraituUser(session.user!);
                        // Preserve DB avatar if we already loaded one from profiles table
                        if (prev?.photoURL && (prev.photoURL.includes('supabase') || prev.photoURL.includes('storage'))) {
                            mapped.photoURL = prev.photoURL;
                        }
                        return mapped;
                    });
                    // Load profile data (including custom avatar) from DB
                    loadProfileAvatar(session.user.id);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [loadProfileAvatar]);

    // Google OAuth Sign-In
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
            // Browser will redirect to Google — loading stays true until redirect completes
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setLoading(false);
            throw error;
        }
    };

    // Phone OTP — send code via MSG91
    const signInWithPhone = async (phone: string): Promise<{ error: string | null }> => {
        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                return { error: data.error || 'Failed to send OTP' };
            }
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send OTP';
            return { error: message };
        }
    };

    // Phone OTP — verify code via MSG91 + create Supabase session
    const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp: token }),
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                return { error: data.error || 'Failed to verify OTP' };
            }
            // Set the Supabase session from the server response
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
            }
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to verify OTP';
            return { error: message };
        }
    };

    // Guest login (local only, no Supabase session)
    const loginAsGuest = async () => {
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

    // Check if user has completed onboarding
    const checkOnboardingStatus = async (): Promise<boolean> => {
        if (!user || user.isGuest) return true; // guests skip onboarding
        try {
            const { data } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', user.id)
                .single();
            return data?.onboarding_completed === true;
        } catch {
            return true; // fallback: don't block
        }
    };

    // Fetch user profile from Supabase profiles table
    const fetchProfile = async (): Promise<UserProfile | null> => {
        if (!user || user.isGuest) return null;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, phone, avatar_url, farm_location, role, address, pincode, district, state, latitude, longitude, service_types, availability_status, whatsapp_number, bio, interests, onboarding_completed, farm_size, experience_years, preferred_language')
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
            // Verify we have an active auth session (needed for storage RLS)
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { url: null, error: 'No active session. Please sign out and sign in again.' };

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload to dedicated avatars bucket (path must start with userId/)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });
            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                return { url: null, error: uploadError.message };
            }

            // Add cache-buster to avoid stale images
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

            // Update the profile with the new avatar URL
            const profileResult = await updateProfile({ avatar_url: cacheBustedUrl });
            if (profileResult.error) {
                console.error('Profile update error after avatar upload:', profileResult.error);
            }
            return { url: cacheBustedUrl, error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to upload avatar';
            return { url: null, error: message };
        }
    };

    // Delete user account (profiles row + auth user via server action)
    const deleteAccount = async (): Promise<{ error: string | null }> => {
        if (!user || user.isGuest) return { error: 'Not authenticated' };
        try {
            // 1. Delete profile data from profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);
            if (profileError) {
                console.error('Error deleting profile:', profileError);
                return { error: profileError.message };
            }

            // 2. Delete avatar from storage (ignore errors if no avatar)
            try {
                const { data: files } = await supabase.storage
                    .from('avatars')
                    .list(user.id);
                if (files && files.length > 0) {
                    await supabase.storage
                        .from('avatars')
                        .remove(files.map(f => `${user.id}/${f.name}`));
                }
            } catch { /* ignore storage cleanup errors */ }

            // 3. Call server action to delete auth user
            const { deleteAuthUser } = await import('@/app/actions/account');
            const result = await deleteAuthUser(user.id);
            if (result.error) {
                return { error: result.error };
            }

            // 4. Sign out locally
            await supabase.auth.signOut();
            setUser(null);
            sessionStorage.clear();
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete account';
            return { error: message };
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
            checkOnboardingStatus,
            deleteAccount,
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
