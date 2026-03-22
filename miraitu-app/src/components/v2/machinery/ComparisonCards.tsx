'use client';

import Link from 'next/link';
import type { TractorComparison } from '@/lib/machinery-db';
import { getTractorImageUrl } from '@/lib/tractor-images';

interface ComparisonCardsProps {
    comparisons: TractorComparison[];
    title?: string;
}

function formatPrice(price: number): string {
    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)}L`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

export default function ComparisonCards({ comparisons, title = 'Popular Tractor Comparisons' }: ComparisonCardsProps) {
    if (!comparisons.length) return null;

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                <Link
                    href="/home/machinery/tractors/compare"
                    className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
                >
                    Compare All →
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {comparisons.map((comp) => {
                    const a = comp.model_a;
                    const b = comp.model_b;
                    if (!a || !b) return null;

                    return (
                        <Link
                            key={comp.id}
                            href={`/home/machinery/tractors/compare?a=${a.slug}&b=${b.slug}`}
                            className="flex-shrink-0 w-[300px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                        >
                            {/* VS Header */}
                            <div className="flex items-center relative">
                                {/* Model A */}
                                <div className="flex-1 p-3 text-center">
                                    <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src={getTractorImageUrl(a.image_url, a.brand, a.model_name, a.slug)} alt={a.model_name} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1.5 truncate">{a.brand}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{a.model_name}</p>
                                </div>

                                {/* VS Badge */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold">VS</span>
                                    </div>
                                </div>

                                {/* Model B */}
                                <div className="flex-1 p-3 text-center">
                                    <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src={getTractorImageUrl(b.image_url, b.brand, b.model_name, b.slug)} alt={b.model_name} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1.5 truncate">{b.brand}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{b.model_name}</p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 grid grid-cols-3 text-center gap-1">
                                <div>
                                    <p className="text-[10px] text-gray-400">HP</p>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{a.hp} vs {b.hp}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400">Price</p>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatPrice(a.base_price)} vs {formatPrice(b.base_price)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-emerald-600">Compare</p>
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
