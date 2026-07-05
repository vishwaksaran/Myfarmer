'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useViewMode } from '@/hooks/useViewMode';
import { useProviderT } from '@/i18n/providerTranslations';
import supabase from '@/lib/supabase';
import { fetchProviderEarnings } from '@/app/actions/provider';
import { fetchMyReviews } from '@/app/actions/provider-reviews';

interface RowProps { icon: string; label: string; onClick: () => void; }
function Row({ icon, label, onClick }: RowProps) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-primary/5 transition-colors text-left">
            <span className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
            </span>
            <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</span>
            <span className="material-symbols-outlined text-gray-300">chevron_right</span>
        </button>
    );
}

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const [, setTab] = useProviderTab();
    const [, setViewMode] = useViewMode();
    const pt = useProviderT();
    const router = useRouter();

    const [rating, setRating] = useState({ average: 0, count: 0 });
    const [servicesDelivered, setServicesDelivered] = useState(0);
    const [memberSince, setMemberSince] = useState<string | null>(null);

    useEffect(() => {
        fetchMyReviews().then(r => setRating(r.summary));
        fetchProviderEarnings().then(e => setServicesDelivered(e.data?.completed_jobs || 0));
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.created_at) setMemberSince(data.user.created_at);
        });
    }, []);

    const memberSinceLabel = memberSince
        ? new Date(memberSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    return (
        <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white text-center mb-4">{pt('profileTitle')}</h1>

            {/* Header card */}
            <div className="bg-white dark:bg-[#1a231a] rounded-3xl border border-gray-100 dark:border-gray-800 p-5 mb-6 text-center">
                <div className="size-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center mb-3">
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="" className="size-full object-cover" />
                        : <span className="material-symbols-outlined text-gray-400 text-4xl">person</span>}
                </div>
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">{user?.displayName || 'Provider'}</h2>
                    <span className="inline-flex items-center gap-0.5 text-sm font-bold text-gray-700 dark:text-gray-200">
                        <span className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {rating.average.toFixed(1)} ({rating.count})
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{pt('memberSince')} {memberSinceLabel}</p>
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{pt('servicesDelivered')} :</span>
                        <span className="text-sm font-black text-primary">{servicesDelivered} {servicesDelivered !== 1 ? pt('servicesWord') : pt('serviceWord')}</span>
                    </div>
                </div>
            </div>

            {/* General */}
            <p className="text-primary text-sm font-black mb-2 ml-1">{pt('general')}</p>
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mb-6">
                <Row icon="person" label={pt('profileSettings')} onClick={() => setTab('profile-settings')} />
                <Row icon="handyman" label={pt('myServices')} onClick={() => setTab('services')} />
                <Row icon="insights" label={pt('insights')} onClick={() => setTab('analytics')} />
                <Row icon="location_on" label={pt('manageLocations')} onClick={() => setTab('locations')} />
                <Row icon="reviews" label={pt('myReviews')} onClick={() => setTab('reviews')} />
            </div>

            {/* App Details */}
            <p className="text-primary text-sm font-black mb-2 ml-1">{pt('appDetails')}</p>
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mb-6">
                <Row icon="translate" label={pt('changeLanguage')} onClick={() => router.push('/language-selection')} />
                <Row icon="description" label={pt('terms')} onClick={() => router.push('/home/terms-of-service')} />
                <Row icon="shield" label={pt('privacy')} onClick={() => router.push('/home/privacy-policy')} />
            </div>

            {/* Actions */}
            <div className="space-y-2">
                <button
                    onClick={() => { setViewMode('farmer'); router.push('/home'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold hover:bg-green-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">swap_horiz</span>
                    {pt('switchToFarmer')}
                </button>
                <button
                    onClick={async () => { await signOut(); router.push('/'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    {pt('signOut')}
                </button>
            </div>
        </div>
    );
}
