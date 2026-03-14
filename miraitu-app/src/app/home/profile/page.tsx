'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';

export default function ProfilePage() {
    const { user, loading, fetchProfile, updateProfile, uploadAvatar } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [farmLocation, setFarmLocation] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user) return;
        setFullName(user.displayName || '');
        setPhone(user.phone || '');
        setAvatarUrl(user.photoURL || '');

        if (!user.isGuest) {
            const profile = await fetchProfile();
            if (profile) {
                setFullName(profile.full_name || user.displayName || '');
                setPhone(profile.phone || user.phone || '');
                setFarmLocation(profile.farm_location || '');
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
            }
        }
        setProfileLoaded(true);
    }, [user, fetchProfile]);

    useEffect(() => {
        if (user && !profileLoaded) loadProfile();
    }, [user, profileLoaded, loadProfile]);

    useEffect(() => {
        if (!loading && !user) router.push('/user-login');
    }, [loading, user, router]);

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setSaveMessage(null);
        const result = await uploadAvatar(file);
        setUploading(false);
        if (result.error) {
            setSaveMessage({ type: 'error', text: `Upload failed: ${result.error}` });
        } else if (result.url) {
            setAvatarUrl(result.url);
            setSaveMessage({ type: 'success', text: 'Profile photo updated!' });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        if (user?.isGuest) {
            setSaveMessage({ type: 'error', text: 'Guest users cannot save profile. Please sign up!' });
            setSaving(false);
            return;
        }
        const result = await updateProfile({ full_name: fullName, phone, farm_location: farmLocation });
        setSaving(false);
        if (result.error) {
            setSaveMessage({ type: 'error', text: `Save failed: ${result.error}` });
        } else {
            setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-8">
                <div className="mx-auto max-w-[900px] px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                        <span>&gt;</span>
                        <span className="text-primary font-semibold">My Profile</span>
                    </nav>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">View and update your personal information</p>

                    {/* Save Message */}
                    {saveMessage && (
                        <div className={`mb-6 p-4 rounded-2xl font-semibold text-sm ${saveMessage.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}>
                            <span className="material-symbols-outlined text-sm mr-2 align-middle">
                                {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                            </span>
                            {saveMessage.text}
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Profile Card */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary/5 to-transparent">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">account_circle</span>
                                    Personal Information
                                </h2>
                            </div>
                            <div className="p-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="size-28 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20 shadow-lg">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <span className="material-symbols-outlined text-6xl text-primary/40">person</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleAvatarClick}
                                            disabled={uploading}
                                            className="absolute -bottom-1 -right-1 size-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            ) : (
                                                <span className="material-symbols-outlined text-base">photo_camera</span>
                                            )}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-xl">{fullName || 'Your Name'}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{user.email || phone || 'No email'}</p>
                                        {user.isGuest && (
                                            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                                Guest Account
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                        <input type="email" value={user.email || ''} disabled
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed" />
                                        <p className="text-xs text-gray-400 mt-1">Email is managed by your login provider</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Farm Location</label>
                                        <div className="relative">
                                            <input type="text" value={farmLocation} onChange={e => setFarmLocation(e.target.value)}
                                                placeholder="e.g. Ludhiana, Punjab"
                                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white pr-12" />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Account Info */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    Account Details
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">login</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Login Method</p>
                                            <p className="text-xs text-gray-500">{user.isGuest ? 'Guest Login' : user.email ? 'Google Account' : 'Phone OTP'}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-green-500">verified</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">badge</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">User ID</p>
                                            <p className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}...{user.id.slice(-4)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Links */}
                        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link href="/home/orders" className="flex items-center gap-3 p-5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all group">
                                <span className="material-symbols-outlined text-2xl text-primary">shopping_bag</span>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">My Orders</p>
                                    <p className="text-xs text-gray-500">View bookings</p>
                                </div>
                            </Link>
                            <Link href="/home/dashboard" className="flex items-center gap-3 p-5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all group">
                                <span className="material-symbols-outlined text-2xl text-primary">dashboard</span>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">Dashboard</p>
                                    <p className="text-xs text-gray-500">Overview</p>
                                </div>
                            </Link>
                            <Link href="/home/settings" className="flex items-center gap-3 p-5 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all group">
                                <span className="material-symbols-outlined text-2xl text-primary">settings</span>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary transition-colors">Settings</p>
                                    <p className="text-xs text-gray-500">App preferences</p>
                                </div>
                            </Link>
                        </section>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 mb-8 flex justify-center">
                        <button onClick={handleSave} disabled={saving}
                            className="w-full sm:w-80 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
