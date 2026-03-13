'use client';

import { useState } from 'react';

interface AvailabilityToggleProps {
    initialStatus: 'available' | 'busy' | 'offline';
    onStatusChange: (status: 'available' | 'busy' | 'offline') => Promise<void>;
}

const statusOptions: { value: 'available' | 'busy' | 'offline'; label: string; icon: string; color: string; bg: string }[] = [
    { value: 'available', label: 'Available', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-500' },
    { value: 'busy', label: 'Busy', icon: 'do_not_disturb_on', color: 'text-amber-600', bg: 'bg-amber-500' },
    { value: 'offline', label: 'Offline', icon: 'cancel', color: 'text-gray-500', bg: 'bg-gray-400' },
];

export default function AvailabilityToggle({ initialStatus, onStatusChange }: AvailabilityToggleProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const current = statusOptions.find(s => s.value === status) || statusOptions[0];

    const handleChange = async (newStatus: 'available' | 'busy' | 'offline') => {
        if (newStatus === status || loading) return;
        setLoading(true);
        try {
            await onStatusChange(newStatus);
            setStatus(newStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${current.bg} ${status === 'available' ? 'animate-pulse' : ''}`} />
                    <span className={`text-sm font-bold ${current.color}`}>{current.label}</span>
                </div>
                {loading && (
                    <span className="material-symbols-outlined text-gray-400 text-base animate-spin">progress_activity</span>
                )}
            </div>
            <div className="flex gap-2">
                {statusOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => handleChange(opt.value)}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            status === opt.value
                                ? `${opt.bg} text-white shadow-sm`
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } disabled:opacity-50`}
                    >
                        <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
