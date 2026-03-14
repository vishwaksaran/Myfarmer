'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import MiraituLogo from '@/components/MiraituLogo';

function AdminLoginForm() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If already logged in as admin, redirect
    useEffect(() => {
        if (!loading && user) {
            // Check if admin
            supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data?.role === 'admin') {
                        router.push(redirect);
                    }
                });
        }
    }, [user, loading, router, redirect]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Sign in with email + password via Supabase Auth
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                setError(authError.message === 'Invalid login credentials'
                    ? 'Invalid email or password'
                    : authError.message
                );
                setSubmitting(false);
                return;
            }

            if (!data.user) {
                setError('Login failed. Please try again.');
                setSubmitting(false);
                return;
            }

            // Verify admin role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (!profile || profile.role !== 'admin') {
                // Sign them out — they're not admin
                await supabase.auth.signOut();
                setError('Access denied. This login is for administrators only.');
                setSubmitting(false);
                return;
            }

            // Success — redirect to admin
            router.push(redirect);
        } catch {
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <MiraituLogo size={56} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage Miraitu</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Admin Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !email || !password}
                            className="w-full py-3 bg-[var(--miraitu-primary-green)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                    Sign in to Admin
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Only authorized administrators can access this panel.
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <span className="material-symbols-outlined text-5xl text-green-600 animate-spin">progress_activity</span>
                </div>
            }
        >
            <AdminLoginForm />
        </Suspense>
    );
}
