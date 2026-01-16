'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * UserLoginPage - Login page with Google SSO
 */
export default function UserLoginPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user && !loading) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            setIsSigningIn(true);
            setError(null);
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(err);
        } finally {
            setIsSigningIn(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-[var(--miraitu-background-light)] font-display">
            {/* Responsive Background */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
                    style={{ backgroundImage: 'url("/miraitu-hero-mobile.png")' }}
                />
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
                    style={{ backgroundImage: 'url("/miraitu-hero-desktop.png")' }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-[var(--miraitu-primary-green)]/10">
                    <Link href="/" className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                        <div className="w-8 h-8 flex items-center justify-center bg-[var(--miraitu-primary-green)] rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl">agriculture</span>
                        </div>
                        <h2 className="text-[#0f1a11] text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                    </Link>
                </header>

                {/* Login Card */}
                <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                    <div className="max-w-md w-full animate-panel-entrance">
                        {/* Card */}
                        <div className="skeuo-card rounded-xl overflow-hidden p-8 md:p-10 relative">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--miraitu-lime-green)]/10 rounded-full blur-3xl -mr-10 -mt-10" />

                            {/* Header */}
                            <div className="text-center mb-8 animate-logo-entrance">
                                <h1 className="text-[#0f1a11] text-3xl md:text-4xl font-black leading-tight tracking-[-0.02em] mb-2">
                                    Welcome Back
                                </h1>
                                <p className="text-[#53935d] text-base font-medium">
                                    Sign in to access your Miraitu dashboard
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Google Sign In Button */}
                            <div className="space-y-4 animate-button-entrance">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={isSigningIn}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-[#0f1a11] hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {isSigningIn ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <>
                                            <GoogleIcon />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-sm text-gray-400 font-medium">or</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                {/* Phone Login Option (placeholder) */}
                                <button
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-[var(--miraitu-background-light)] border-2 border-[var(--miraitu-primary-green)]/20 rounded-xl font-bold text-[#0f1a11] hover:bg-[var(--miraitu-primary-green)]/5 hover:border-[var(--miraitu-primary-green)]/40 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[var(--miraitu-primary-green)]">smartphone</span>
                                    <span>Continue with Phone</span>
                                </button>
                            </div>

                            {/* Create Account Link */}
                            <p className="text-center mt-8 text-sm text-[#53935d] font-medium animate-footer-entrance">
                                Don't have an account?{' '}
                                <Link href="/user-register" className="text-[var(--miraitu-primary-green)] font-bold hover:underline">
                                    Create one here
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex justify-center gap-6 text-xs text-[#53935d]/70 font-medium animate-footer-entrance">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                <span>Secure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">eco</span>
                                <span>Eco-Certified</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

/**
 * Google Icon SVG
 */
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
            <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] animate-spin">
                    progress_activity
                </span>
                <p className="text-[#53935d] font-medium">Loading...</p>
            </div>
        </div>
    );
}
