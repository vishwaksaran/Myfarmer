'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { MachineryModel } from '@/lib/machinery-db';
import { getTractorImageUrl } from '@/lib/tractor-images';

interface TractorCardCarouselProps {
    title: string;
    tabs?: { label: string; key: string }[];
    models: Record<string, MachineryModel[]>;
    defaultTab?: string;
}

function formatPrice(price: number): string {
    if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} Lakh`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

function TractorCard({ model }: { model: MachineryModel }) {
    return (
        <Link
            href={`/home/machinery/tractors/${model.slug || model.id}`}
            className="flex-shrink-0 w-[200px] sm:w-[220px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
        >
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <img
                    src={getTractorImageUrl(model.image_url, model.brand, model.model_name, model.slug)}
                    alt={`${model.brand} ${model.model_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                />
                {model.is_popular && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Popular
                    </span>
                )}
                {model.drive_type === '4WD' && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        4WD
                    </span>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {model.brand} {model.model_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{model.specs}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(model.base_price)}
                    </span>
                    <span className="text-[10px] text-gray-400">{model.hp} HP</span>
                </div>
            </div>
        </Link>
    );
}

export default function TractorCardCarousel({ title, tabs, models, defaultTab }: TractorCardCarouselProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || (tabs?.[0]?.key ?? ''));
    const items = models[activeTab] || Object.values(models)[0] || [];

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>

            {tabs && tabs.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {items.map((model) => (
                    <TractorCard key={model.id} model={model} />
                ))}
                {items.length === 0 && (
                    <p className="text-sm text-gray-400 py-8">No tractors found in this category.</p>
                )}
            </div>
        </section>
    );
}
