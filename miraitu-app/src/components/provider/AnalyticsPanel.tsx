'use client';

import type { ProviderAnalytics } from '@/app/actions/provider';
import type { ProviderCategoryConfig } from '@/lib/provider-config';

interface AnalyticsPanelProps {
    analytics: ProviderAnalytics;
    config: ProviderCategoryConfig;
}

export default function AnalyticsPanel({ analytics, config }: AnalyticsPanelProps) {
    const { status_counts } = analytics;

    const topStats = [
        { label: 'Total Inquiries', value: analytics.total_inquiries, icon: 'inbox', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20' },
        { label: `${config.contactNoun} Contacted`, value: analytics.unique_customers, icon: 'group', color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20' },
        { label: 'Repeat Customers', value: analytics.repeat_customers, icon: 'repeat', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20' },
        { label: 'Engagement Rate', value: `${analytics.engagement_rate}%`, icon: 'trending_up', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' },
    ];

    const statusStats = [
        { label: config.newLabel, value: status_counts.assigned, color: 'text-blue-600' },
        { label: 'Accepted', value: status_counts.accepted, color: 'text-amber-600' },
        { label: 'In Progress', value: status_counts.in_progress, color: 'text-indigo-600' },
        { label: 'Completed', value: status_counts.completed, color: 'text-green-600' },
        { label: 'Pending', value: status_counts.pending, color: 'text-gray-500' },
        { label: 'Cancelled', value: status_counts.cancelled, color: 'text-red-500' },
    ];

    const maxBookings = Math.max(1, ...analytics.monthly_trend.map(m => m.bookings));
    const maxEarnings = Math.max(1, ...analytics.monthly_trend.map(m => m.earnings));

    return (
        <div className="space-y-6">
            {/* Headline stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topStats.map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className={`size-10 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
                            <span className="material-symbols-outlined text-lg">{s.icon}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Booking status breakdown */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">donut_small</span>
                    {config.jobNounPlural} by status
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {statusStats.map(s => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] font-bold text-gray-500 mt-1 leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly trend — bookings + earnings, last 6 months */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">bar_chart</span>
                        Last 6 months
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary inline-block" />{config.jobNounPlural}</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500 inline-block" />Earnings</span>
                    </div>
                </div>
                <div className="flex items-end justify-between gap-2 h-40">
                    {analytics.monthly_trend.map(m => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div className="flex items-end gap-1 h-full w-full justify-center">
                                <div
                                    className="w-1/3 max-w-[16px] bg-primary/80 rounded-t-md transition-all"
                                    style={{ height: `${(m.bookings / maxBookings) * 100}%` }}
                                    title={`${m.bookings} ${config.jobNounPlural.toLowerCase()}`}
                                />
                                <div
                                    className="w-1/3 max-w-[16px] bg-green-500/80 rounded-t-md transition-all"
                                    style={{ height: `${(m.earnings / maxEarnings) * 100}%` }}
                                    title={`₹${m.earnings.toLocaleString('en-IN')}`}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">{m.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                    ₹{analytics.this_month_earnings.toLocaleString('en-IN')} earned this month
                </p>
            </div>
        </div>
    );
}
