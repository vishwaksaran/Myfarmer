'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { MachineryModel } from '@/lib/machinery-db';
import { fetchModelsByBudget } from '@/app/actions/tractors';
import { getTractorImageUrl } from '@/lib/tractor-images';

const BUDGETS = [
    { label: 'Below ₹3L', min: 0, max: 300000 },
    { label: '₹3-5L', min: 300000, max: 500000 },
    { label: '₹5-7L', min: 500000, max: 700000 },
    { label: '₹7-10L', min: 700000, max: 1000000 },
    { label: '₹10-15L', min: 1000000, max: 1500000 },
    { label: 'Above ₹15L', min: 1500000, max: 50000000 },
];

function formatPrice(price: number): string {
    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

export default function BudgetFilter() {
    const [activeIdx, setActiveIdx] = useState(2);
    const [models, setModels] = useState<MachineryModel[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const b = BUDGETS[activeIdx];
        fetchModelsByBudget(b.min, b.max).then((data) => {
            if (!cancelled) {
                setModels(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [activeIdx]);

    return (
        <section className="py-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Tractors by Budget
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {BUDGETS.map((b, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeIdx === i
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {b.label}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                {loading ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex-shrink-0 w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : models.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {models.map((m) => (
                            <Link
                                key={m.id}
                                href={`/home/machinery/tractors/${m.slug || m.id}`}
                                className="flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                    <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.brand} {m.model_name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.hp} HP • {m.drive_type || '2WD'}</p>
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatPrice(m.base_price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 py-4">No tractors found in this budget range.</p>
                )}
            </div>
        </section>
    );
}
