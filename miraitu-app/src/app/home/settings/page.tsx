'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
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
    const { user, loading, fetchProfile, updateProfile, uploadAvatar, signOut } = useAuth();
    const { lang: selectedLang, setLang: setSelectedLang } = useLanguage();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [farmLocation, setFarmLocation] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Notification prefs (local only)
    const [notifyPrices, setNotifyPrices] = useState(true);
    const [notifyWeather, setNotifyWeather] = useState(true);
    const [notifyOrders, setNotifyOrders] = useState(true);
    const [notifyCommunity, setNotifyCommunity] = useState(false);

    // Load profile data
    const loadProfile = useCallback(async () => {
        if (!user) return;
        // Set defaults from user object
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
        if (user && !profileLoaded) {
            loadProfile();
        }
    }, [user, profileLoaded, loadProfile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/user-login');
        }
    }, [loading, user, router]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setSaveMessage(null);
        const result = await uploadAvatar(file);
        setUploading(false);
        if (result.error) {
            setSaveMessage({ type: 'error', text: `Avatar upload failed: ${result.error}` });
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
            setSaveMessage({ type: 'error', text: 'Guest users cannot save settings. Please sign up!' });
            setSaving(false);
            return;
        }

        const result = await updateProfile({
            full_name: fullName,
            phone: phone,
            farm_location: farmLocation,
        });

        setSaving(false);
        if (result.error) {
            setSaveMessage({ type: 'error', text: `Save failed: ${result.error}` });
        } else {
            setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
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
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your account and app preferences</p>
                    </div>

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
                        {/* Profile Section */}
                        <section className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">account_circle</span>
                                    Profile Settings
                                </h2>
                            </div>
                            <div className="p-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group">
                                        <div className="size-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl text-primary/40">person</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleAvatarClick}
                                            disabled={uploading}
                                            className="absolute -bottom-1 -right-1 size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-sm">photo_camera</span>
                                            )}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{fullName || 'Your Name'}</p>
                                        <p className="text-sm text-gray-500">{user.email || phone || 'No email'}</p>
                                        {user.isGuest && (
                                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                                Guest Account
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Farm Location</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={farmLocation}
                                                onChange={(e) => setFarmLocation(e.target.value)}
                                                placeholder="e.g. Ludhiana, Punjab"
                                                className="w-full px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none font-medium text-gray-900 dark:text-white pr-12"
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                                        </div>
                                    </div>
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

                        {/* Security Section */}
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
                                <button
                                    onClick={() => { signOut(); router.push('/home'); }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="font-bold text-sm">Log Out</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8 mb-8 flex justify-center">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full sm:w-80 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">save</span>
                                    Save Changes
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
