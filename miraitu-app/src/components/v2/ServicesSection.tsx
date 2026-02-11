'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function ServicesSection() {
    const { t } = useLanguage();

    return (
        <section className="px-6 py-16">
            <div className="mx-auto max-w-[1280px]">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t('services.title')}</h2>
                        <p className="text-gray-500">{t('services.subtitle')}</p>
                    </div>
                    <button className="skeuo-button-3d flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-primary">
                        {t('services.viewAll')}
                        <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Featured Labor Provider */}
                    <div className="skeuo-card md:col-span-2 flex flex-col overflow-hidden rounded-3xl">
                        <div className="flex flex-1 flex-col p-8 lg:flex-row lg:items-center gap-8">
                            <div className="relative">
                                <div
                                    className="h-32 w-32 rounded-2xl bg-cover bg-center shadow-inner"
                                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuATgvrhKcwWAeFMtAmx0GiGt2CgRWWsxLceYGolQzgUi90X3Bp9FtTrn527TOwxNUKY4z_GXK6C12DkQb9WOa2u24GqNyr5-wGTP7JQGl2u3tkEIjoqPwBILvHjmUy0-P7IE8aCRDJ8iMtxY-nHzJ7VIHf5iZRPvCToaICZrKGSMNOT7xitqyjV1y7kMlSgP6MeBlk2KLHWx1zY4k7aiJStbatpizhFTy01EBjRvhd7APwZkJ3K9c5rTmzkAC-vwXPL6xQdO7VMKSKB')" }}
                                ></div>
                                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary border-4 border-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-xs">verified</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <h4 className="text-2xl font-bold">Rajesh Kumar</h4>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{t('services.topRated')}</span>
                                </div>
                                <p className="text-gray-500 font-medium">General Labor • Land Clearing • Harvest Help</p>
                                <div className="mt-4 flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('services.rate')}</p>
                                        <p className="text-lg font-bold text-primary">₹500/day</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('services.experience')}</p>
                                        <p className="text-lg font-bold">12 {t('services.years')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full bg-primary py-4 font-bold text-white hover:brightness-110 transition-all">
                            {t('services.hire')} Rajesh
                        </button>
                    </div>

                    {/* Tractor Mechanics */}
                    <div className="skeuo-card flex flex-col p-6 rounded-3xl">
                        <div className="mb-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-orange-600">engineering</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-green-600">{t('services.availableNow')}</span>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold mb-2">{t('services.tractorMechanics')}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {t('services.tractorMechanicsDesc')}
                            </p>
                        </div>
                        <button className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 font-bold text-primary hover:bg-primary/20 transition-colors">
                            {t('services.callService')}
                        </button>
                    </div>

                    {/* Cold Storage */}
                    <div className="skeuo-card flex flex-col p-6 rounded-3xl">
                        <div className="mb-auto">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-blue-600">ac_unit</span>
                            </div>
                            <h4 className="text-xl font-bold mb-2">{t('services.coldStorage')}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {t('services.coldStorageDesc')}
                            </p>
                            <div className="mt-4 skeuo-inset rounded-xl p-3 bg-blue-50/50">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span>{t('services.availableCapacity')}</span>
                                    <span>82%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-200">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                                </div>
                            </div>
                        </div>
                        <button className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 font-bold text-primary hover:bg-primary/20 transition-colors">
                            {t('services.checkRates')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
