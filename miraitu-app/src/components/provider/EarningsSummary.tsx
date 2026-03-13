'use client';

import type { ProviderEarnings } from '@/app/actions/provider';

interface EarningsSummaryProps {
    earnings: ProviderEarnings;
}

export default function EarningsSummary({ earnings }: EarningsSummaryProps) {
    const cards = [
        {
            label: 'This Week',
            value: earnings.this_week_earnings,
            jobs: earnings.this_week_jobs,
            icon: 'date_range',
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
        },
        {
            label: 'This Month',
            value: earnings.this_month_earnings,
            jobs: earnings.this_month_jobs,
            icon: 'calendar_month',
            color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
        },
        {
            label: 'Total Earned',
            value: earnings.net_earnings,
            jobs: earnings.completed_jobs,
            icon: 'account_balance_wallet',
            color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Earnings Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`size-11 rounded-xl ${card.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-xl">{card.icon}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-500">{card.label}</p>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            ₹{card.value.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{card.jobs} job{card.jobs !== 1 ? 's' : ''} completed</p>
                    </div>
                ))}
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">receipt_long</span>
                    Breakdown
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Total Billed</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            ₹{earnings.total_earned.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Platform Fee (10%)</span>
                        <span className="text-sm font-bold text-red-500">
                            -₹{earnings.total_commission.toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Net Earnings</span>
                        <span className="text-lg font-black text-green-600">
                            ₹{earnings.net_earnings.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Job Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
                    <p className="text-3xl font-black text-primary">{earnings.active_jobs}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Active Jobs</p>
                </div>
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
                    <p className="text-3xl font-black text-green-600">{earnings.completed_jobs}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">Completed Jobs</p>
                </div>
            </div>
        </div>
    );
}
