'use client';

import Link from 'next/link';
import { homeTopCategories as categories } from '@/lib/top-categories';
import { useLanguage } from '@/i18n/LanguageContext';

export default function TopCategories() {
    const { t } = useLanguage();

    return (
        <section className="px-4 md:px-6 pt-8 pb-4">
            <div className="mx-auto max-w-[1400px]">
                {/* Section header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#121811] dark:text-white">
                        {t('homeV2.topCategories')}
                    </h2>
                    <Link
                        href="/home/services"
                        className="text-sm md:text-base font-bold text-primary hover:underline"
                    >
                        {t('homeV2.viewAll')}
                    </Link>
                </div>

                {/* Category grid */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
                    {categories.map((cat) => (
                        <Link key={cat.label} href={cat.link} className="group flex flex-col">
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-green-500 shadow-sm">
                                {/* Icon fallback sits underneath the image */}
                                <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-white text-4xl">
                                    {cat.icon}
                                </span>
                                <img
                                    src={cat.image}
                                    alt={t(cat.tKey)}
                                    loading="lazy"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-2 text-center text-xs md:text-sm font-semibold text-[#121811] dark:text-white leading-tight group-hover:text-primary transition-colors">
                                {t(cat.tKey)}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
