'use client';

import { useState } from 'react';
import type { ProviderBooking } from '@/app/actions/provider';

interface BookingCardProps {
    booking: ProviderBooking;
    onAccept?: (bookingId: string, amount?: number) => Promise<void>;
    onReject?: (bookingId: string, reason?: string) => Promise<void>;
    onStartJob?: (bookingId: string) => Promise<void>;
    onComplete?: (bookingId: string) => Promise<void>;
}

const moduleIcons: Record<string, string> = {
    services: 'home_repair_service',
    machinery: 'agriculture',
    land: 'landscape',
    borewell: 'water_drop',
    fencing: 'fence',
    cctv: 'videocam',
    protection: 'shield',
    veterinary: 'vaccines',
    livestock: 'pets',
    crops: 'grass',
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    assigned: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'New Request' },
    accepted: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Accepted' },
    in_progress: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completed' },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pending' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Cancelled' },
};

/** Mask phone: show only last 4 digits */
function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return 'XXXXXX';
    return 'XXXXXX' + phone.slice(-4);
}

export default function BookingCard({ booking, onAccept, onReject, onStartJob, onComplete }: BookingCardProps) {
    const [loading, setLoading] = useState(false);
    const [amountInput, setAmountInput] = useState(booking.amount ? String(booking.amount) : '');
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showAcceptForm, setShowAcceptForm] = useState(false);

    const status = statusConfig[booking.status] || statusConfig.pending;
    const icon = moduleIcons[booking.module] || 'build';

    const handleAction = async (action: () => Promise<void>) => {
        setLoading(true);
        try {
            await action();
        } finally {
            setLoading(false);
            setShowRejectForm(false);
            setShowAcceptForm(false);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Card Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white capitalize">
                            {booking.category.replace(/-/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{booking.module}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${status.bg} ${status.text}`}>
                        {status.label}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(booking.created_at)}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
                {/* Customer Info (masked) */}
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-500 text-sm">person</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{booking.full_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{maskPhone(booking.phone)}</p>
                    </div>
                    {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                        <a
                            href={`tel:${booking.phone}`}
                            className="size-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-green-600 text-sm">call</span>
                        </a>
                    )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-gray-400 text-base">location_on</span>
                    <span className="text-gray-600 dark:text-gray-300">{booking.location}</span>
                </div>

                {/* Preferred Date */}
                {booking.preferred_date && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-gray-400 text-base">calendar_month</span>
                        <span className="text-gray-600 dark:text-gray-300">
                            {new Date(booking.preferred_date).toLocaleDateString('en-IN', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </span>
                    </div>
                )}

                {/* Amount (if set) */}
                {booking.amount > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-base">currency_rupee</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                            ₹{booking.amount.toLocaleString('en-IN')}
                        </span>
                        {booking.commission > 0 && (
                            <span className="text-xs text-gray-400 ml-1">
                                (Platform fee: ₹{booking.commission.toLocaleString('en-IN')})
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Accept Form */}
            {showAcceptForm && (
                <div className="px-4 pb-2 space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Quote Amount (₹)</label>
                    <input
                        type="number"
                        value={amountInput}
                        onChange={e => setAmountInput(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2.5 text-sm font-bold rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/40 outline-none"
                    />
                </div>
            )}

            {/* Reject Form */}
            {showRejectForm && (
                <div className="px-4 pb-2 space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Reason (optional)</label>
                    <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="e.g. Not available this day"
                        className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-400/40 outline-none"
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 pt-2 flex gap-2">
                {booking.status === 'assigned' && !showAcceptForm && !showRejectForm && (
                    <>
                        <button
                            onClick={() => setShowAcceptForm(true)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-base">check_circle</span>Accept
                        </button>
                        <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-base">cancel</span>Decline
                        </button>
                    </>
                )}

                {showAcceptForm && (
                    <>
                        <button
                            onClick={() => onAccept && handleAction(() => onAccept(booking.id, amountInput ? Number(amountInput) : undefined))}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">check</span>}
                            Confirm
                        </button>
                        <button onClick={() => setShowAcceptForm(false)} className="px-4 py-3 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    </>
                )}

                {showRejectForm && (
                    <>
                        <button
                            onClick={() => onReject && handleAction(() => onReject(booking.id, rejectReason || undefined))}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">close</span>}
                            Decline
                        </button>
                        <button onClick={() => setShowRejectForm(false)} className="px-4 py-3 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                    </>
                )}

                {booking.status === 'accepted' && (
                    <button
                        onClick={() => onStartJob && handleAction(() => onStartJob(booking.id))}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">play_arrow</span>}
                        Start Job
                    </button>
                )}

                {booking.status === 'in_progress' && (
                    <button
                        onClick={() => onComplete && handleAction(() => onComplete(booking.id))}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-base">task_alt</span>}
                        Mark Complete
                    </button>
                )}

                {booking.status === 'completed' && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 font-bold text-sm">
                        <span className="material-symbols-outlined text-base">verified</span>
                        Job Completed
                    </div>
                )}
            </div>
        </div>
    );
}
