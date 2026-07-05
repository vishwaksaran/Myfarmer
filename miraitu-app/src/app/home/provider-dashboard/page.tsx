'use client';

import { useState, useEffect } from 'react';
import { useAuth, type UserProfile } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import MiraituLoader from '@/components/v2/MiraituLoader';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';
import { getCategoryConfig } from '@/lib/provider-config';
import { fetchProviderAnalytics, type ProviderAnalytics } from '@/app/actions/provider';

import HomeScreen from '@/components/provider/screens/HomeScreen';
import BookingsScreen from '@/components/provider/screens/BookingsScreen';
import WalletScreen from '@/components/provider/screens/WalletScreen';
import ProfileScreen from '@/components/provider/screens/ProfileScreen';
import NotificationsScreen from '@/components/provider/screens/NotificationsScreen';
import ReviewsScreen from '@/components/provider/screens/ReviewsScreen';
import LocationsScreen from '@/components/provider/screens/LocationsScreen';
import ProfileEditor from '@/components/provider/ProfileEditor';
import ServiceManager from '@/components/provider/ServiceManager';
import AnalyticsPanel from '@/components/provider/AnalyticsPanel';

const PROVIDER_ROLES = ['service_provider', 'dealer'];

function SubScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <button onClick={onBack} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
        </div>
    );
}

export default function ProviderDashboardPage() {
    const { user, loading: authLoading, fetchProfile } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useProviderTab();
    const pt = useProviderT();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [analytics, setAnalytics] = useState<ProviderAnalytics | null>(null);

    useEffect(() => {
        if (user && !user.isGuest) {
            fetchProfile().then(p => setProfile(p));
            fetchProviderAnalytics().then(r => setAnalytics(r.data));
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !user) router.push('/user-login');
    }, [authLoading, user, router]);

    // Only providers & dealers use this workspace
    useEffect(() => {
        if (!authLoading && user && profile && !PROVIDER_ROLES.includes(profile.role)) {
            router.push('/home/dashboard');
        }
    }, [authLoading, user, profile, router]);

    if (authLoading || !user) return <MiraituLoader />;

    const cat = getCategoryConfig(profile?.service_types);
    const refreshProfile = () => fetchProfile().then(p => setProfile(p));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />
            <main className="py-5 pb-28">
                <div className="mx-auto max-w-[720px] px-4 md:px-6">
                    {tab === 'home' && <HomeScreen />}
                    {tab === 'bookings' && <BookingsScreen />}
                    {tab === 'wallet' && <WalletScreen />}
                    {tab === 'profile' && <ProfileScreen />}
                    {tab === 'notifications' && <NotificationsScreen />}
                    {tab === 'reviews' && <ReviewsScreen />}
                    {tab === 'locations' && <LocationsScreen />}

                    {tab === 'profile-settings' && (
                        <>
                            <SubScreenHeader title={pt('profileSettings')} onBack={() => setTab('profile')} />
                            {profile
                                ? <ProfileEditor profile={profile} onSaved={refreshProfile} />
                                : <div className="flex justify-center py-16"><MiraituLoader fullScreen={false} /></div>}
                        </>
                    )}

                    {tab === 'services' && (
                        <>
                            <SubScreenHeader title={pt('myServices')} onBack={() => setTab('profile')} />
                            <ServiceManager serviceTypes={profile?.service_types || []} onCategoriesChange={refreshProfile} />
                        </>
                    )}

                    {tab === 'analytics' && (
                        <>
                            <SubScreenHeader title={pt('insights')} onBack={() => setTab('profile')} />
                            {analytics
                                ? <AnalyticsPanel analytics={analytics} config={cat} />
                                : <div className="flex justify-center py-16"><MiraituLoader fullScreen={false} /></div>}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
