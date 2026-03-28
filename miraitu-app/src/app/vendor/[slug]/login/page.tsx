'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function VendorLoginPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [shopInfo, setShopInfo] = useState<{
        name: string;
        logoUrl: string | null;
    } | null>(null);
    const [shopLoading, setShopLoading] = useState(true);
    const [shopNotFound, setShopNotFound] = useState(false);

    // Fetch shop info for branding
    useEffect(() => {
        async function loadShop() {
            try {
                // Check if already logged in
                const sessionRes = await fetch('/api/vendor/auth/session');
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    if (sessionData.authenticated && sessionData.shop?.slug === slug) {
                        router.replace(`/vendor/${slug}/dashboard`);
                        return;
                    }
                }
            } catch { /* ignore session check errors */ }

            try {
                // We'll fetch shop info via a lightweight API or directly
                // For now, we show the slug as the shop name until we build a shop info endpoint
                const res = await fetch(`/api/vendor/shop-info?slug=${encodeURIComponent(slug)}`);
                if (res.ok) {
                    const data = await res.json();
                    setShopInfo({ name: data.name, logoUrl: data.logoUrl });
                } else if (res.status === 404) {
                    setShopNotFound(true);
                } else {
                    // Fallback: use slug as name
                    setShopInfo({ name: slug.charAt(0).toUpperCase() + slug.slice(1), logoUrl: null });
                }
            } catch {
                setShopInfo({ name: slug.charAt(0).toUpperCase() + slug.slice(1), logoUrl: null });
            }
            setShopLoading(false);
        }
        loadShop();
    }, [slug, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/vendor/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), password, shopSlug: slug }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed. Please try again.');
                setSubmitting(false);
                return;
            }

            // Redirect based on temp password status
            if (data.vendor?.isTempPassword) {
                window.location.href = `/vendor/${slug}/settings?force=password`;
            } else {
                window.location.href = `/vendor/${slug}/dashboard`;
            }
        } catch (err) {
            console.error('[vendor-login] Error:', err);
            setError('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    if (shopLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <span className="material-symbols-outlined text-5xl text-green-600 animate-spin">progress_activity</span>
            </div>
        );
    }

    if (shopNotFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="text-center max-w-md">
                    <div className="size-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-red-500">storefront</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Shop Not Found</h1>
                    <p className="text-gray-500 text-sm">
                        The shop <strong className="text-gray-900">&ldquo;{slug}&rdquo;</strong> doesn&apos;t exist or has been deactivated.
                        Contact the administrator for assistance.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Shop Branding */}
                <div className="text-center mb-8">
                    {shopInfo?.logoUrl ? (
                        <img
                            src={shopInfo.logoUrl}
                            alt={shopInfo.name}
                            className="size-16 rounded-2xl object-cover mx-auto mb-4 shadow-sm border border-gray-100"
                        />
                    ) : (
                        <div className="size-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="material-symbols-outlined text-3xl text-white">storefront</span>
                        </div>
                    )}
                    <h1 className="text-2xl font-black text-gray-900">{shopInfo?.name || 'Vendor Portal'}</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage your store</p>
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

                        {/* Username */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Username
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                    autoFocus
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
                            disabled={submitting || !username || !password}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                            {submitting ? (
                                <>
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">login</span>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Credentials provided by your administrator.
                    Contact them if you need access.
                </p>
            </div>
        </div>
    );
}
