'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function ServicesSection() {
    const { t } = useLanguage();

    return (
        <section className="px-4 md:px-6 py-14">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="animate-fade-in-left">
                        <span className="inline-flex items-center gap-1.5 mb-3 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
                            <span className="material-symbols-outlined text-xs">handshake</span>
                            Professional Help
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t('services.title')}</h2>
                        <p className="text-gray-500 mt-1">{t('services.subtitle')}</p>
                    </div>
                    <a href="/home/services">
                        <button className="skeuo-button-3d flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-primary hover:scale-105 transition-transform">
                            {t('services.viewAll')}
                            <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                        </button>
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Featured Labor Provider - Large Card */}
                    <div className="md:col-span-6 skeuo-card-hover group rounded-3xl overflow-hidden relative">
                        {/* Top gradient accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-green-400 to-accent"></div>

                        <div className="flex flex-col h-full">
                            <div className="flex flex-1 flex-col p-8 lg:flex-row lg:items-center gap-6">
                                <div className="relative">
                                    <div
                                        className="h-28 w-28 lg:h-32 lg:w-32 rounded-2xl bg-cover bg-[center_top] shadow-lg group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: "url('/team/rajesh.jpeg')" }}
                                    ></div>
                                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-green-400 border-4 border-white flex items-center justify-center shadow-lg shadow-primary/40">
                                        <span className="material-symbols-outlined text-white text-xs font-black">verified</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <h4 className="text-2xl font-black">Rajesh Kumar</h4>
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700 uppercase tracking-wider">{t('services.topRated')}</span>
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm mb-4">General Labor • Land Clearing • Harvest Help</p>
                                    <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                                        <div className="text-center min-w-max">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('services.rate')}</p>
                                            <p className="text-lg lg:text-xl font-black text-primary">₹500<span className="text-xs lg:text-sm font-semibold text-gray-400">/day</span></p>
                                        </div>
                                        <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="text-center min-w-max">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('services.experience')}</p>
                                            <p className="text-lg lg:text-xl font-black">12 <span className="text-xs lg:text-sm font-semibold text-gray-400">{t('services.years')}</span></p>
                                        </div>
                                        <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                                        <div className="text-center min-w-max">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rating</p>
                                            <p className="text-lg lg:text-xl font-black text-accent">4.9★</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a href="/home/services/farm-labours" className="block">
                                <button className="w-full bg-gradient-to-r from-primary to-lush-green py-4 font-bold text-white hover:brightness-110 transition-all flex items-center justify-center gap-2 group/btn">
                                    <span className="material-symbols-outlined text-lg">person_add</span>
                                    {t('services.hire')} Rajesh
                                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Two stacked cards */}
                    <div className="md:col-span-6 grid grid-cols-2 gap-3 md:gap-6">
                        {/* Tractor Mechanics */}
                        <div className="skeuo-card-hover group flex flex-col p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="mb-auto">
                                <div className="flex items-center justify-between mb-3 md:mb-5">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-orange-600 text-lg md:text-xl">engineering</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-green-50 rounded-full px-2 md:px-3 py-0.5 md:py-1">
                                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[8px] md:text-[10px] font-bold text-green-600">{t('services.availableNow')}</span>
                                    </div>
                                </div>
                                <h4 className="text-sm md:text-lg font-black mb-1 md:mb-2 group-hover:text-primary transition-colors">{t('services.tractorMechanics')}</h4>
                                <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t('services.tractorMechanicsDesc')}
                                </p>
                            </div>
                            <a href="/home/services/mechanic" className="block">
                                <button className="mt-4 md:mt-6 w-full flex items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-primary/10 py-2.5 md:py-3 font-bold text-xs md:text-base text-primary hover:bg-primary/20 transition-all group/btn">
                                    {t('services.callService')}
                                    <span className="material-symbols-outlined text-xs md:text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </a>
                        </div>

                        {/* Cold Storage */}
                        <div className="skeuo-card-hover group flex flex-col p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="mb-auto">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-blue-600 text-lg md:text-xl">ac_unit</span>
                                </div>
                                <h4 className="text-sm md:text-lg font-black mb-1 md:mb-2 group-hover:text-primary transition-colors">{t('services.coldStorage')}</h4>
                                <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t('services.coldStorageDesc')}
                                </p>
                                <div className="mt-3 md:mt-4 skeuo-inset rounded-xl p-2 md:p-3">
                                    <div className="flex justify-between text-[10px] md:text-xs font-bold mb-1 md:mb-1.5">
                                        <span>{t('services.availableCapacity')}</span>
                                        <span className="text-blue-600">82%</span>
                                    </div>
                                    <div className="h-1.5 md:h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: '82%' }}></div>
                                    </div>
                                </div>
                            </div>
                            <a href="/home/services/storage-godown" className="block">
                                <button className="mt-4 md:mt-6 w-full flex items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-primary/10 py-2.5 md:py-3 font-bold text-xs md:text-base text-primary hover:bg-primary/20 transition-all group/btn">
                                    {t('services.checkRates')}
                                    <span className="material-symbols-outlined text-xs md:text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
