'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import supabase from '@/lib/supabase';
import MiraituLoader from '@/components/v2/MiraituLoader';

/**
 * Check if user has completed onboarding by querying their profile.
 * Returns the redirect path: '/onboarding' for new users, '/' for existing.
 */
async function getRedirectPath(userId: string): Promise<string> {
    try {
        // Small delay to let the DB trigger (handle_new_user) finish
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .single();

        console.log('[Auth Callback] Profile check:', { data, error: error?.message });

        if (error || !data) {
            // Profile doesn't exist yet or query failed → send to onboarding
            return '/onboarding';
        }

        return data.onboarding_completed ? '/' : '/onboarding';
    } catch (err) {
        console.error('[Auth Callback] Profile check error:', err);
        // On any error, default to onboarding (safer than skipping it)
        return '/onboarding';
    }
}

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const handleCallback = async () => {
            try {
                // PKCE flow: exchange the authorization code for a session
                const code = searchParams.get('code');
                if (code) {
                    console.log('[Auth Callback] PKCE code detected, exchanging...');
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        console.error('[Auth Callback] Code exchange error:', error.message);
                        router.replace('/user-login?error=session_failed');
                        return;
                    }

                    if (data.session) {
                        const path = await getRedirectPath(data.session.user.id);
                        console.log('[Auth Callback] Redirecting to:', path);
                        router.replace(path);
                        return;
                    }
                }

                // Fallback: check existing session (implicit flow / already authenticated)
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[Auth Callback] Session error:', error.message);
                    router.replace('/user-login?error=session_failed');
                    return;
                }

                if (data.session) {
                    const path = await getRedirectPath(data.session.user.id);
                    console.log('[Auth Callback] Redirecting to:', path);
                    router.replace(path);
                } else {
                    // No session yet — listen for the auth state change
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        async (event, session) => {
                            if (event === 'SIGNED_IN' && session) {
                                subscription.unsubscribe();
                                const path = await getRedirectPath(session.user.id);
                                console.log('[Auth Callback] Auth change redirect to:', path);
                                router.replace(path);
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
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
            <div className="flex flex-col items-center gap-4">
                <MiraituLoader fullScreen={false} label="Signing you in…" />
                <p className="text-gray-400 text-sm">Please wait while we complete authentication</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<MiraituLoader />}>
            <AuthCallbackContent />
        </Suspense>
    );
}
