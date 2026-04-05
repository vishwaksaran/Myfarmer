'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

export default function FPOBanner() {
    const { t } = useLanguage();

    return (
        <>
            {/* FPO Banner */}
            <section className="px-4 md:px-6 py-6">
                <div className="mx-auto max-w-[1400px]">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-8 md:p-10 shadow-2xl">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-green-300/30 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-200/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            {/* Icon */}
                            <div className="shrink-0">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                    <span className="material-symbols-outlined text-white text-5xl md:text-6xl">groups_3</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-[10px]">verified</span>
                                        {t('fpo.govRecognized')}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2">
                                    {t('fpo.title')}
                                </h2>
                                <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                                    {t('fpo.desc')}
                                </p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        {t('fpo.freeRegistration')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        {t('fpo.expertGuidance')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        {t('fpo.govSubsidies')}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="shrink-0">
                                <Link
                                    href="/home/services/fpo"
                                    className="group flex items-center gap-3 bg-white text-[#1a5c2e] font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">info</span>
                                    {t('fpo.knowMore')}
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
