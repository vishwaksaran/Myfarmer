'use client';

import { useState, useEffect } from 'react';
import { useProviderTab } from '@/hooks/useProviderTab';
import { useProviderT } from '@/i18n/providerTranslations';
import { fetchMyReviews, type ProviderReview, type ReviewSummary } from '@/app/actions/provider-reviews';

function Stars({ rating }: { rating: number }) {
    return (
        <span className="inline-flex">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`material-symbols-outlined text-base ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`}
                    style={i <= Math.round(rating) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    star
                </span>
            ))}
        </span>
    );
}

export default function ReviewsScreen() {
    const [, setTab] = useProviderTab();
    const pt = useProviderT();
    const [reviews, setReviews] = useState<ProviderReview[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyReviews().then(res => { setReviews(res.reviews); setSummary(res.summary); setLoading(false); });
    }, []);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setTab('profile')} className="size-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{pt('myReviews')}</h1>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-4 flex items-center gap-4">
                <div className="text-center">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{summary.average.toFixed(1)}</p>
                    <Stars rating={summary.average} />
                </div>
                <div className="text-sm text-gray-500">
                    {pt('basedOn')} <span className="font-bold text-gray-900 dark:text-white">{summary.count}</span> {summary.count !== 1 ? pt('reviewsWord') : pt('reviewWord')}
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">…</p>
            ) : reviews.length === 0 ? (
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300">reviews</span>
                    <p className="text-sm font-bold text-gray-500 mt-2">{pt('noReviews')}</p>
                    <p className="text-xs text-gray-400">{pt('noReviewsHint')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{r.reviewer_name || 'Customer'}</p>
                                <Stars rating={r.rating} />
                            </div>
                            {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>}
                            <p className="text-[11px] text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
