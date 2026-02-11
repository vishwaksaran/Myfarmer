'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function ToolboxSection() {
    const { t } = useLanguage();

    return (
        <section className="px-6 py-16 bg-primary/5">
            <div className="mx-auto max-w-[1280px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Calculator Form */}
                    <div className="skeuo-card rounded-[2rem] p-8 md:p-12 border-4 border-white dark:border-[#2c5926]/20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black mb-4">{t('toolbox.title')}</h2>
                            <p className="text-gray-500">{t('toolbox.subtitle')}</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold block mb-2 text-gray-600">{t('toolbox.landArea')}</label>
                                <div className="skeuo-inset flex items-center bg-white dark:bg-[#121811] rounded-xl px-4 py-3">
                                    <input
                                        className="w-full border-none bg-transparent focus:ring-0 font-bold"
                                        placeholder={t('toolbox.enterAcreage')}
                                        type="number"
                                    />
                                    <span className="text-gray-400 font-bold">AC</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold block mb-2 text-gray-600">{t('toolbox.cropType')}</label>
                                    <select className="skeuo-inset w-full border-none bg-white dark:bg-[#121811] rounded-xl px-4 py-3 font-bold focus:ring-0">
                                        <option>Wheat</option>
                                        <option>Soybean</option>
                                        <option>Sugarcane</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold block mb-2 text-gray-600">{t('toolbox.testingPref')}</label>
                                    <select className="skeuo-inset w-full border-none bg-white dark:bg-[#121811] rounded-xl px-4 py-3 font-bold focus:ring-0">
                                        <option>{t('toolbox.homePickup')}</option>
                                        <option>{t('toolbox.selfSubmit')}</option>
                                    </select>
                                </div>
                            </div>
                            <button className="vibrant-gradient rounded-xl py-5 text-white font-black text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all w-full">
                                {t('toolbox.calculateBook')}
                            </button>
                        </div>
                    </div>

                    {/* Consultation Info */}
                    <div className="space-y-8">
                        <div>
                            <span className="text-primary font-black uppercase tracking-widest text-sm mb-4 inline-block">
                                {t('toolbox.proServices')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                                {t('toolbox.consultTitle')} <span className="text-primary">{t('toolbox.yieldMax')}</span>
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {t('toolbox.consultDesc')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">microbiology</span>
                                </div>
                                <div>
                                    <h5 className="font-bold">{t('toolbox.soilAnalysis')}</h5>
                                    <p className="text-sm text-gray-500">{t('toolbox.soilAnalysisDesc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">monitoring</span>
                                </div>
                                <div>
                                    <h5 className="font-bold">{t('toolbox.yieldPrediction')}</h5>
                                    <p className="text-sm text-gray-500">{t('toolbox.yieldPredictionDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
