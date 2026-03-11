'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

/**
 * Auth Callback Page (Client-Side)
 *
 * Supabase OAuth (implicit flow) returns tokens in the URL hash fragment
 * (e.g. #access_token=...). Hash fragments are never sent to the server,
 * so this MUST be a client-side page.
 *
 * The browser Supabase client (with detectSessionInUrl: true) automatically
 * picks up the tokens from the hash and establishes the session.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const handleCallback = async () => {
            try {
                // The Supabase client with detectSessionInUrl: true
                // automatically detects tokens in the URL hash fragment
                // and exchanges them for a session.
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth Callback] Session error:', error.message);
                    router.replace('/user-login?error=session_failed');
                    return;
                }

                if (data.session) {
                    // Session established successfully — redirect to home
                    router.replace('/');
                } else {
                    // No session yet — listen for the auth state change
                    // (the client may still be processing the hash)
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
                            if (event === 'SIGNED_IN' && session) {
                                subscription.unsubscribe();
                                router.replace('/');
                            }
                        }
                    );

                    // Timeout: if no session after 10 seconds, redirect to login
                    setTimeout(() => {
                        subscription.unsubscribe();
                        router.replace('/user-login?error=auth_timeout');
                    }, 10000);
                }
            } catch (err) {
                console.error('[Auth Callback] Unexpected error:', err);
                router.replace('/user-login?error=auth_callback_failed');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
            <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-5xl text-[var(--miraitu-primary-green)] animate-spin">
                    progress_activity
                </span>
                <p className="text-[#53935d] font-semibold text-lg">Signing you in...</p>
                <p className="text-gray-400 text-sm">Please wait while we complete authentication</p>
            </div>
        </div>
    );
}
