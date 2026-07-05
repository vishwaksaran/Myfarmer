'use client';

import { useState, useEffect, useCallback } from 'react';
import BookingCard from '@/components/provider/BookingCard';
import { useProviderT } from '@/i18n/providerTranslations';
import {
    fetchProviderBookings,
    acceptBooking,
    rejectBooking,
    startJob,
    completeJob,
    type ProviderBooking,
} from '@/app/actions/provider';

export default function BookingsScreen() {
    const pt = useProviderT();
    const filters = [
        { value: 'all', label: pt('all') },
        { value: 'assigned', label: pt('new') },
        { value: 'accepted', label: pt('accepted') },
        { value: 'in_progress', label: pt('inProgress') },
        { value: 'completed', label: pt('completed') },
    ];
    const [bookings, setBookings] = useState<ProviderBooking[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey(k => k + 1);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchProviderBookings(filter);
        setBookings(res.data);
        setLoading(false);
    }, [filter]);

    useEffect(() => { load(); }, [load, refreshKey]);

    const handleAccept = async (id: string, amount?: number) => { await acceptBooking(id, amount); refresh(); };
    const handleReject = async (id: string, reason?: string) => { await rejectBooking(id, reason); refresh(); };
    const handleStart = async (id: string) => { await startJob(id); refresh(); };
    const handleComplete = async (id: string) => { await completeJob(id); refresh(); };

    return (
        <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{pt('bookingsTitle')}</h1>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-4">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            filter === f.value
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-[#1a231a] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">…</p>
            ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700">event_busy</span>
                    <p className="text-sm font-bold text-gray-500 mt-2">{pt('noBookingsFound')}</p>
                    <p className="text-xs text-gray-400">{pt('newJobRequestsHint')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(b => (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onStartJob={handleStart}
                            onComplete={handleComplete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
