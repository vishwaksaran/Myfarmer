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
            bgColor: 'bg-blue-50',
        },
        {
            id: 'cctv',
            icon: 'videocam',
            tTitle: 'water.cctv',
            tDesc: 'water.cctvDesc',
            features: ['water.solarPowered', 'water.nightVision', 'water.mobileMon'],
            link: '/v2/cctv',
            gradient: 'from-orange-500 to-red-600',
            bgColor: 'bg-orange-50',
        },
    ];

    return (
        <section className="px-6 py-16">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 text-center">
                    <span className="inline-block mb-4 rounded-full bg-accent/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                        {t('water.badge')}
                    </span>
                    <h2 className="text-4xl font-black tracking-tight text-[#121811] dark:text-white mb-4">
                        {t('water.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
                        {t('water.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="skeuo-card rounded-[2rem] overflow-hidden border border-white/50 dark:border-white/5 group hover:shadow-2xl transition-all duration-300"
                        >
                            <div className={`${category.bgColor} p-8 pb-6`}>
                                <div className={`inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br ${category.gradient} text-white mb-4 shadow-lg`}>
                                    <span className="material-symbols-outlined text-3xl">{category.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-2">{t(category.tTitle)}</h3>
                                <p className="text-gray-600 leading-relaxed">{t(category.tDesc)}</p>
                            </div>

                            <div className="p-8 pt-6">
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {category.features.map((featureKey, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                                        >
                                            <span className="material-symbols-outlined text-xs">check</span>
                                            {t(featureKey)}
                                        </span>
                                    ))}
                                </div>

                                <a href={category.link}>
                                    <button className="glossy-button w-full rounded-xl py-4 text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 group-hover:brightness-110 transition-all">
                                        {t('water.exploreServices')}
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
