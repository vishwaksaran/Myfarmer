'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

/**
 * DashboardPage - Protected page shown after login
 */
export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/user-login');
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--miraitu-background-light)]">
                <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] animate-spin">
                    progress_activity
                </span>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-[var(--miraitu-background-light)] font-display">
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-[var(--miraitu-primary-green)]/10">
                <div className="flex items-center gap-3 text-[var(--miraitu-primary-green)]">
                    <MiraituLogo size={40} />
                    <h2 className="text-[#0f1a11] text-xl font-extrabold leading-tight tracking-[-0.015em]">Miraitu</h2>
                </div>

                <div className="flex items-center gap-4">
                    {user.photoURL && (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            className="w-9 h-9 rounded-full border-2 border-[var(--miraitu-primary-green)]"
                        />
                    )}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--miraitu-primary-green)] hover:bg-[var(--miraitu-primary-green)]/5 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Welcome Card */}
                    <div className="skeuo-card rounded-xl p-8 mb-8 animate-panel-entrance">
                        <h1 className="text-2xl md:text-3xl font-black text-[#0f1a11] mb-2">
                            Welcome, {user.displayName || 'Farmer'}! 🌾
                        </h1>
                        <p className="text-[#53935d] font-medium">
                            Your dashboard is being set up. Check back soon for more features!
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-button-entrance">
                        <div className="skeuo-card rounded-xl p-6 text-center">
                            <span className="material-symbols-outlined text-4xl text-[var(--miraitu-primary-green)] mb-2">grass</span>
                            <p className="text-2xl font-black text-[#0f1a11]">0</p>
                            <p className="text-sm font-medium text-[#53935d]">Active Crops</p>
                        </div>
                        <div className="skeuo-card rounded-xl p-6 text-center">
                            <span className="material-symbols-outlined text-4xl text-[var(--miraitu-warm-orange)] mb-2">cloudy</span>
                            <p className="text-2xl font-black text-[#0f1a11]">--°C</p>
                            <p className="text-sm font-medium text-[#53935d]">Weather</p>
                        </div>
                        <div className="skeuo-card rounded-xl p-6 text-center">
                            <span className="material-symbols-outlined text-4xl text-[var(--miraitu-harvest-gold)] mb-2">notifications</span>
                            <p className="text-2xl font-black text-[#0f1a11]">0</p>
                            <p className="text-sm font-medium text-[#53935d]">Alerts</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
