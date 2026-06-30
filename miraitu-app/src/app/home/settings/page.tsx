'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { useLanguage } from '@/i18n/LanguageContext';
import { LangCode } from '@/i18n/translations';

const allLanguages = [
    { name: 'English', sub: 'ENGLISH', code: 'en' },
    { name: '\u0939\u093F\u0928\u094D\u0926\u0940', sub: 'HINDI', code: 'hi' },
    { name: '\u092E\u0930\u093E\u0920\u0940', sub: 'MARATHI', code: 'mr' },
    { name: '\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0', sub: 'GUJARATI', code: 'gu' },
    { name: '\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41', sub: 'TELUGU', code: 'te' },
    { name: '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD', sub: 'TAMIL', code: 'ta' },
    { name: '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1', sub: 'KANNADA', code: 'kn' },
    { name: '\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40', sub: 'PUNJABI', code: 'pa' },
    { name: '\u09AC\u09BE\u0982\u09B2\u09BE', sub: 'BENGALI', code: 'bn' },
    { name: '\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02', sub: 'MALAYALAM', code: 'ml' },
];

export default function SettingsPage() {
    const { user, loading, fetchProfile, signOut, deleteAccount } = useAuth();
    const { lang: selectedLang, setLang: setSelectedLang } = useLanguage();
    const router = useRouter();

    // Profile summary state
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Notification prefs (local only)
    const [notifyPrices, setNotifyPrices] = useState(true);
    const [notifyWeather, setNotifyWeather] = useState(true);
    const [notifyOrders, setNotifyOrders] = useState(true);
    const [notifyCommunity, setNotifyCommunity] = useState(false);

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Load profile data
    const loadProfile = useCallback(async () => {
        if (!user || user.isGuest) return;
        const profile = await fetchProfile();
        if (profile) setProfileData(profile);
        setProfileLoaded(true);
    }, [user, fetchProfile]);

    useEffect(() => {
        if (user && !profileLoaded) loadProfile();
    }, [user, profileLoaded, loadProfile]);

    useEffect(() => {
        if (!loading && !user) router.push('/user-login');
    }, [loading, user, router]);

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        setIsDeleting(true);
        setDeleteError(null);
        const result = await deleteAccount();
        if (result.error) {
            setDeleteError(result.error);
            setIsDeleting(false);
        } else {
            router.replace('/');
        }
    };

    if (loading || !user) {
        return (
            <MiraituLoader />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-8">
                <div className="mx-auto max-w-[900px] px-6">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your app preferences and account</p>
                    </div>

                    <div className="space-y-8">
                        {/* Profile Summary Card (compact, links to profile page) */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">account_circle</span>
                                    Profile
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-5">
                                    <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20 flex-shrink-0">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-primary/40">person</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{user.displayName || 'Your Name'}</p>
                                        <p className="text-sm text-gray-500 truncate">{user.email || user.phone || 'No email'}</p>
                                        {profileData?.role && (
                                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold capitalize">
                                                {profileData.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        href="/home/profile"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-colors flex-shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Language Section */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">translate</span>
                                    Language
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {allLanguages.map((lang) => {
                                        const isSelected = selectedLang === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => setSelectedLang(lang.code as LangCode)}
                                                className={`relative rounded-xl p-3 flex flex-col items-center justify-center border-2 transition-all ${isSelected
                                                    ? 'bg-primary/5 border-primary shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <p className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                                    {lang.name}
                                                </p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-0.5">
                                                    {lang.sub}
                                                </p>
                                                {isSelected && (
                                                    <div className="absolute top-1.5 right-1.5 size-5 bg-primary rounded-full flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-xs text-white">check</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Notification Section */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">notifications</span>
                                    Notifications
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { label: 'Mandi Price Alerts', desc: 'Get notified about price changes', value: notifyPrices, setter: setNotifyPrices, icon: 'trending_up' },
                                    { label: 'Weather Alerts', desc: 'Receive weather forecasts & warnings', value: notifyWeather, setter: setNotifyWeather, icon: 'cloud' },
                                    { label: 'Order Updates', desc: 'Track your orders and deliveries', value: notifyOrders, setter: setNotifyOrders, icon: 'local_shipping' },
                                    { label: 'Community Activity', desc: 'Likes, comments, and new posts', value: notifyCommunity, setter: setNotifyCommunity, icon: 'forum' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</p>
                                                <p className="text-xs text-gray-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => item.setter(!item.value)}
                                            className={`relative w-12 h-7 rounded-full transition-colors ${item.value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${item.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Account & Security Section */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">shield</span>
                                    Account & Security
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500">login</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">Login Method</p>
                                            <p className="text-xs text-gray-500">
                                                {user.isGuest ? 'Guest Login' : user.email ? 'Google Account' : 'Phone OTP'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-green-500 text-lg">verified</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-500">badge</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">User ID</p>
                                            <p className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}...{user.id.slice(-4)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                                <button
                                    onClick={() => { signOut(); router.push('/'); }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="font-bold text-sm">Log Out</span>
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={user.isGuest}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800/50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">delete_forever</span>
                                    <div className="text-left">
                                        <span className="font-bold text-sm block">Delete Account</span>
                                        <span className="text-xs text-red-400">Permanently remove your account and all data</span>
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
                    <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/50">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-red-700 dark:text-red-400">Delete Account?</h3>
                                    <p className="text-sm text-red-500 dark:text-red-400/70">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <p>Deleting your account will <strong>permanently</strong> remove:</p>
                                <ul className="space-y-1.5 ml-1">
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-base">close</span>
                                        Your profile and personal information
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-base">close</span>
                                        All your bookings and order history
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-base">close</span>
                                        Your uploaded photos and avatars
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-400 text-base">close</span>
                                        Access to all Miraitu services
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Type <span className="text-red-500 font-black">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                                    placeholder="Type DELETE"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-red-400 outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors"
                                    autoFocus
                                    disabled={isDeleting}
                                />
                            </div>

                            {deleteError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {deleteError}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(null); }}
                                disabled={isDeleting}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-300/30 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">delete_forever</span>
                                        Delete My Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
