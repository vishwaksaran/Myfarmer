'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';
import ProviderTopBar from './ProviderTopBar';
import BookingCard from '@/components/provider/BookingCard';
import FeaturedVideosSection from '@/components/v2/FeaturedVideosSection';
import {
    fetchProviderBookings,
    fetchProviderEarnings,
    acceptBooking,
    rejectBooking,
    startJob,
    completeJob,
    type ProviderBooking,
    type ProviderEarnings,
} from '@/app/actions/provider';

function isToday(iso: string | null): boolean {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}

export default function HomeScreen() {
    const [, setTab] = useProviderTab();
    const pt = useProviderT();
    const [bookings, setBookings] = useState<ProviderBooking[]>([]);
    const [earnings, setEarnings] = useState<ProviderEarnings | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey(k => k + 1);

    const load = useCallback(async () => {
        setLoading(true);
        const [b, e] = await Promise.all([fetchProviderBookings('all'), fetchProviderEarnings()]);
        setBookings(b.data);
        setEarnings(e.data);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load, refreshKey]);

    const newBookings = bookings.filter(b => b.status === 'assigned');
    const activeBookings = bookings.filter(b => ['accepted', 'in_progress'].includes(b.status));
    const todaysServices = bookings.filter(
        b => isToday(b.preferred_date) || (b.status === 'completed' && isToday(b.completed_at)),
    ).length;

    const stats = [
        { label: pt('todaysServices'), value: String(todaysServices), icon: 'deployed_code' },
        { label: pt('totalBookings'), value: String(bookings.length), icon: 'receipt_long' },
        { label: pt('totalEarnings'), value: `₹${(earnings?.net_earnings || 0).toLocaleString('en-IN')}`, icon: 'savings' },
    ];

    const handleAccept = async (id: string, amount?: number) => { await acceptBooking(id, amount); refresh(); };
    const handleReject = async (id: string, reason?: string) => { await rejectBooking(id, reason); refresh(); };
    const handleStart = async (id: string) => { await startJob(id); refresh(); };
    const handleComplete = async (id: string) => { await completeJob(id); refresh(); };

    return (
        <div>
            <ProviderTopBar />

            {/* Wallet balance card */}
            <button
                onClick={() => setTab('wallet')}
                className="w-full flex items-center justify-between gap-3 rounded-full bg-primary px-5 py-3.5 text-white shadow-md hover:brightness-105 transition-all mb-5"
            >
                <span className="flex items-center gap-2 font-bold">
                    <span className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                    </span>
                    {pt('walletBalance')}
                </span>
                <span className="text-lg font-black">₹{(earnings?.net_earnings || 0).toLocaleString('en-IN')}</span>
            </button>

            {/* 3 stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {stats.map(s => (
                    <div key={s.label} className="bg-gray-50 dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                        <div className="size-10 mx-auto rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-1.5">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-200 text-xl">{s.icon}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 leading-tight">{s.label}</p>
                        <p className="text-lg font-black text-primary mt-0.5">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Action Needed */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-gray-900 dark:text-white">{pt('actionNeeded')}</h2>
                {newBookings.length > 0 && (
                    <button onClick={() => setTab('bookings')} className="text-sm font-bold text-primary">{pt('viewAll')}</button>
                )}
            </div>
            {loading ? (
                <p className="text-sm text-gray-400 mb-6">…</p>
            ) : newBookings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 mb-6">{pt('noActions')}</p>
            ) : (
                <div className="space-y-3 mb-6">
                    {newBookings.slice(0, 3).map(b => (
                        <BookingCard key={b.id} booking={b} onAccept={handleAccept} onReject={handleReject} />
                    ))}
                </div>
            )}

            {/* Work Schedule */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-black text-gray-900 dark:text-white">{pt('workSchedule')}</h2>
                {activeBookings.length > 0 && (
                    <button onClick={() => setTab('bookings')} className="text-sm font-bold text-primary">{pt('viewAll')}</button>
                )}
            </div>
            {activeBookings.length === 0 ? (
                <div className="text-center py-8 mb-6">
                    <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700">event_busy</span>
                    <p className="text-sm font-bold text-gray-500 mt-2">{pt('noBookingsNow')}</p>
                    <p className="text-xs text-gray-400">{pt('newJobRequestsHint')}</p>
                </div>
            ) : (
                <div className="space-y-3 mb-6">
                    {activeBookings.slice(0, 3).map(b => (
                        <BookingCard key={b.id} booking={b} onStartJob={handleStart} onComplete={handleComplete} />
                    ))}
                </div>
            )}

            {/* Latest Videos */}
            <div className="-mx-4 md:-mx-6">
                <FeaturedVideosSection />
            </div>
        </div>
    );
}
