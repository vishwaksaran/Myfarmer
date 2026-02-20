'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useRouter } from 'next/navigation';

const buySellOptions = [
    { label: 'Machinery', desc: 'Tractors, harvesters & farm equipment', icon: 'agriculture', link: '/home/machinery', color: 'from-green-500 to-emerald-600' },
    { label: 'Crops', desc: 'Rice, vegetables, spices & more', icon: 'eco', link: '/home/crops', color: 'from-green-500 to-emerald-600' },
    { label: 'Livestock', desc: 'Cattle, poultry, goats & sheep', icon: 'pets', link: '/home/livestock', color: 'from-green-500 to-emerald-600' },
    { label: 'Shop', desc: 'Seeds, fertilizers & farm supplies', icon: 'storefront', link: '/home/shop', color: 'from-green-500 to-emerald-600' },
];

const services = [
    { icon: 'psychiatry', tTitle: 'qs.farmServices', tDesc: 'qs.farmServicesDesc', tBtn: 'qs.bookNow', link: '/home/services' },
    { icon: 'groups', tTitle: 'qs.bookLabour', tDesc: 'qs.bookLabourDesc', tBtn: 'qs.findLabour', link: '/home/services/farm-labours' },
    { icon: 'storefront', tTitle: 'qs.buySell', tDesc: 'qs.buySellDesc', tBtn: 'qs.goToMarket', link: '/home/shop', isBuySell: true },
    { icon: 'calculate', tTitle: 'qs.agriCalc', tDesc: 'qs.agriCalcDesc', tBtn: 'qs.openTools', link: '/home/toolbox' },
    { icon: 'water_drop', tTitle: 'qs.borewellBooking', tDesc: 'qs.borewellDesc', tBtn: 'qs.requestSurvey', link: '/home/borewell' },
    { icon: 'solar_power', tTitle: 'qs.solarSetup', tDesc: 'qs.solarDesc', tBtn: 'qs.calculate', link: '/home/cctv' },
];

export default function QuickServices() {
    const { t } = useLanguage();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    return (
        <section className="px-4 md:px-6 py-14">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="animate-fade-in-left">
                        <span className="inline-flex items-center gap-1.5 mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <span className="material-symbols-outlined text-xs">grid_view</span>
                            Quick Access
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#121811] dark:text-white mb-2">
                            {t('qs.title')}
                        </h2>
                        <p className="text-gray-500 font-medium max-w-lg">
                            {t('qs.subtitle')}
                        </p>
                    </div>
                    <a href="/home/services">
                        <button className="skeuo-button-3d flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary hover:scale-105 transition-transform">
                            View All Services
                            <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                        </button>
                    </a>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`opacity-0 animate-fade-in-up stagger-${index + 1}`}
                            onClick={() => {
                                if (service.isBuySell) {
                                    setShowModal(true);
                                } else {
                                    router.push(service.link);
                                }
                            }}
                        >
                            <div className="skeuo-card-hover group rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/50 dark:border-white/5 flex flex-col h-full cursor-pointer relative overflow-hidden transition-all duration-300">
                                {/* Top accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4 mb-3 md:mb-4">
                                    {/* Uniform green themed icon */}
                                    <div className="bg-gradient-to-br from-primary to-green-500 size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300 shadow-md">
                                        <span className="material-symbols-outlined text-xl md:text-2xl text-white">
                                            {service.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm md:text-lg font-black mb-0.5 md:mb-1 group-hover:text-primary transition-colors">{t(service.tTitle)}</h3>
                                        <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed line-clamp-2">{t(service.tDesc)}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-3 md:pt-4 border-t border-black/5 dark:border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs md:text-sm font-bold text-primary">{t(service.tBtn)}</span>
                                        <span className="material-symbols-outlined text-primary text-base md:text-lg group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Buy & Sell Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>

                    {/* Modal */}
                    <div
                        className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                        data-no-auth
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-primary to-green-500 px-8 py-6 text-white">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-white text-xl">close</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-2xl">storefront</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Buy & Sell</h3>
                                    <p className="text-white/80 text-sm">Choose a marketplace category</p>
                                </div>
                            </div>
                        </div>

                        {/* Options Grid */}
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {buySellOptions.map((opt) => (
                                <div
                                    key={opt.label}
                                    className="group/card"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowModal(false);
                                        router.push(opt.link);
                                    }}
                                >
                                    <div className="skeuo-card-hover flex flex-col items-center text-center p-5 rounded-2xl cursor-pointer h-full transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-primary/30">
                                        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-3 shadow-lg group-hover/card:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-white text-2xl">{opt.icon}</span>
                                        </div>
                                        <h4 className="font-black text-sm mb-1 group-hover/card:text-primary transition-colors">{opt.label}</h4>
                                        <p className="text-[11px] text-gray-500 leading-snug">{opt.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
