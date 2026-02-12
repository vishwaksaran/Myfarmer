'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function WaterEnergySection() {
    const { t } = useLanguage();

    const categories = [
        {
            id: 'borewell',
            icon: 'water_drop',
            tTitle: 'water.borewell',
            tDesc: 'water.borewellDesc',
            features: ['water.depthCalc', 'water.expertConsult', 'water.qualityTesting'],
            link: '/v2/borewell',
            gradient: 'from-blue-500 to-cyan-600',
            bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
            iconBg: 'bg-blue-500',
            statValue: '200+',
            statLabel: 'Borewells Drilled',
        },
        {
            id: 'cctv',
            icon: 'videocam',
            tTitle: 'water.cctv',
            tDesc: 'water.cctvDesc',
            features: ['water.solarPowered', 'water.nightVision', 'water.mobileMon'],
            link: '/v2/cctv',
            gradient: 'from-orange-500 to-red-600',
            bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
            iconBg: 'bg-orange-500',
            statValue: '1000+',
            statLabel: 'Cameras Installed',
        },
    ];

    return (
        <section className="px-4 md:px-6 py-14 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 agri-grid-bg opacity-30"></div>

            <div className="mx-auto max-w-[1400px] relative z-10">
                {/* Section Header */}
                <div className="mb-10 text-center animate-fade-in-up">
                    <span className="inline-flex items-center gap-1.5 mb-4 rounded-full bg-accent/15 px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                        <span className="material-symbols-outlined text-sm">stars</span>
                        {t('water.badge')}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#121811] dark:text-white mb-3">
                        {t('water.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                        {t('water.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`skeuo-card-hover rounded-[2rem] overflow-hidden border border-white/50 dark:border-white/5 opacity-0 animate-fade-in-up stagger-${index + 2}`}
                        >
                            <div className={`${category.bgColor} p-8`}>
                                <div className="flex items-start justify-between mb-5">
                                    <div className={`inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br ${category.gradient} text-white shadow-lg`}>
                                        <span className="material-symbols-outlined text-2xl">{category.icon}</span>
                                    </div>
                                    {/* Stat badge */}
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-gray-800 dark:text-white">{category.statValue}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{category.statLabel}</p>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black mb-2">{t(category.tTitle)}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t(category.tDesc)}</p>
                            </div>

                            <div className="p-8 pt-6">
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {category.features.map((featureKey, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary"
                                        >
                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                            {t(featureKey)}
                                        </span>
                                    ))}
                                </div>

                                <a href={category.link}>
                                    <button className="glossy-button w-full rounded-xl py-4 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 group hover:brightness-110 transition-all">
                                        {t('water.exploreServices')}
                                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
