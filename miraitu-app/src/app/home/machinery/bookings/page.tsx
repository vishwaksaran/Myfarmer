'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getRentalCategory, unitLabel } from '@/lib/machinery-rental-catalog';
import { fetchMyRentalBookings, cancelMyBooking, type MyRentalBooking } from '@/app/actions/rental-bookings';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const statusStyle: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function fmt(date: string | null, time: string | null) {
    if (!date) return '—';
    const d = new Date(`${date}T${time || '00:00'}`);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) });
}

export default function MyBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<MyRentalBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetchMyRentalBookings();
        setBookings(res.data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }
        load();
    }, [user, authLoading, load]);

    const handleCancel = async (id: string) => {
        setCancelling(id);
        const res = await cancelMyBooking(id);
        if (res.success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        }
        setCancelling(null);
        setConfirmId(null);
    };

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[760px]">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/home/machinery" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
                </div>

                {authLoading || loading ? (
                    <div className="py-16 text-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                    </div>
                ) : !user ? (
                    <div className="py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">lock</span>
                        <p className="text-gray-500 mb-5">Please sign in to view your bookings.</p>
                        <Link href="/user-login" className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold">Sign In</Link>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">receipt_long</span>
                        <p className="text-gray-500 mb-5">You have no bookings yet.</p>
                        <Link href="/home/machinery" className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold">Browse Machinery</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((b) => {
                            const cat = getRentalCategory(b.category);
                            const canCancel = b.status === 'pending' || b.status === 'confirmed';
                            return (
                                <div key={b.id} className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">{cat?.icon ?? 'agriculture'}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{cat?.title ?? b.category}</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status] ?? 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                                    </div>

                                    <div className="space-y-1.5 mb-3">
                                        {b.items.map((it, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                                <span className="truncate pr-2">{it.name} × {it.quantity}</span>
                                                <span className="font-medium shrink-0">{inr(it.price * it.quantity)}<span className="text-xs text-gray-400">{unitLabel[it.unit as keyof typeof unitLabel] ?? ''}</span></span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
                                        <div><span className="material-symbols-outlined text-sm align-middle">event</span> Start: {fmt(b.start_date, b.start_time)}</div>
                                        <div><span className="material-symbols-outlined text-sm align-middle">event_available</span> End: {fmt(b.end_date, b.end_time)}</div>
                                        <div className="col-span-2 truncate"><span className="material-symbols-outlined text-sm align-middle">location_on</span> {b.location}</div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="font-black text-primary">{inr(b.total)}</span>
                                        {canCancel && (
                                            confirmId === b.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Cancel?</span>
                                                    <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id} className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg disabled:opacity-50">
                                                        {cancelling === b.id ? '…' : 'Yes'}
                                                    </button>
                                                    <button onClick={() => setConfirmId(null)} className="text-xs font-semibold text-gray-500 px-2 py-1.5">No</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirmId(b.id)} className="text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900/50 px-4 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                                    Cancel booking
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
