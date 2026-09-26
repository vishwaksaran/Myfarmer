'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MiraituLogo from '@/components/MiraituLogo';

/**
 * The seller workspace sign-in.
 *
 * Farmers, dealers and service providers get a username and password from
 * Miraitu once their application is approved — they do not sign in with the
 * phone OTP a shopper uses. Keeping the two apart is what lets the dashboard
 * drop the storefront header: nobody lands here to browse.
 *
 * Deliberately plain: no search bar, no navigation, nothing to click but the
 * form and the way back to the public site.
 */
export default function SellerLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            setError('Enter your username and password.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/seller/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password }),
            });
            const json = await res.json();

            if (!res.ok || json.error) {
                setError(json.error || 'Could not sign you in.');
                setSubmitting(false);
                return;
            }

            // Each seller type has its own workspace.
            const type = String(json.sellerType || 'farmer-seller');
            const dest =
                type === 'dealer' ? '/home/become-seller/dashboard/dealer'
                    : type === 'service-provider' ? '/home/become-seller/dashboard/service-provider'
                        : '/home/become-seller/dashboard/farmer';
            router.push(dest);
        } catch {
            setError('Could not reach the server. Check your connection and try again.');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d120d] flex flex-col">
            {/* The only navigation a seller needs here. */}
            <header className="px-6 py-5">
                <Link href="/home" className="inline-flex items-center gap-2" aria-label="Miraitu home">
                    <MiraituLogo />
                </Link>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-7">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl">agriculture</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Seller Sign In</h1>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                            For farmers, dealers and service providers. Use the username and
                            password Miraitu gave you when your application was approved.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4"
                    >
                        <div>
                            <label htmlFor="seller-username" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Username
                            </label>
                            <input
                                id="seller-username"
                                type="text"
                                autoComplete="username"
                                autoCapitalize="none"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. ravi.kumar"
                                className="w-full px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label htmlFor="seller-password" className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="seller-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3.5 py-3 pr-11 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {submitting && (
                                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                            )}
                            Sign In
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-500">
                            Not registered yet?{' '}
                            <Link href="/home/become-seller" className="text-primary font-bold hover:underline">
                                Apply to sell
                            </Link>
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Lost your password? Miraitu can issue a new one. Applications are
                            reviewed by hand, so a login only works once yours is approved.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
