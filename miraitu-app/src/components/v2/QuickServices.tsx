'use client';

import { useLanguage } from '@/i18n/LanguageContext';

const services = [
    { icon: 'psychiatry', tTitle: 'qs.farmServices', tDesc: 'qs.farmServicesDesc', tBtn: 'qs.bookNow', link: '#' },
    { icon: 'groups', tTitle: 'qs.bookLabour', tDesc: 'qs.bookLabourDesc', tBtn: 'qs.findLabour', link: '#' },
    { icon: 'storefront', tTitle: 'qs.buySell', tDesc: 'qs.buySellDesc', tBtn: 'qs.goToMarket', link: '#' },
    { icon: 'calculate', tTitle: 'qs.agriCalc', tDesc: 'qs.agriCalcDesc', tBtn: 'qs.openTools', link: '#' },
    { icon: 'water_drop', tTitle: 'qs.borewellBooking', tDesc: 'qs.borewellDesc', tBtn: 'qs.requestSurvey', link: '/v2/borewell' },
    { icon: 'water', tTitle: 'qs.pondLayout', tDesc: 'qs.pondDesc', tBtn: 'qs.getQuote', link: '/v2/protection' },
    { icon: 'solar_power', tTitle: 'qs.solarSetup', tDesc: 'qs.solarDesc', tBtn: 'qs.calculate', link: '/v2/cctv' },
];

export default function QuickServices() {
    const { t } = useLanguage();

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tight text-[#121811] dark:text-white mb-2">
                        {t('qs.title')}
                    </h2>
                    <p className="text-gray-500 font-medium">
                        {t('qs.subtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <a key={index} href={service.link}>
                            <div className="skeuo-card service-card-hover rounded-3xl p-8 border border-white/50 dark:border-white/5 transition-all duration-300 flex flex-col items-center text-center h-full cursor-pointer">
                                <div className="tactile-icon w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl text-lush-green font-bold">
                                        {service.icon}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black mb-3">{t(service.tTitle)}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-grow">{t(service.tDesc)}</p>
                                <button className="glossy-button w-full rounded-xl py-3 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                                    {t(service.tBtn)}
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
