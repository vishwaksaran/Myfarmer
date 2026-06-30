'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { normalizeIndianPhone } from '@/lib/phone';

const leftServices = [
    {
        icon: 'eco',
        tTitle: 'toolboxSection.cropHealthTitle',
        tDesc: 'toolboxSection.cropHealthDesc',
        color: 'from-orange-500 to-amber-500',
        bgLight: 'bg-orange-50 dark:bg-orange-900/10',
        link: '/home/crops',
    },
    {
        icon: 'microbiology',
        tTitle: 'toolboxSection.soilAnalysisTitle',
        tDesc: 'toolboxSection.soilAnalysisDesc',
        color: 'from-green-500 to-emerald-500',
        bgLight: 'bg-green-50 dark:bg-green-900/10',
        link: '/home/services/soil-testing',
    },
];

const rightServices = [
    {
        icon: 'water_drop',
        tTitle: 'toolboxSection.fieldIrrigationTitle',
        tDesc: 'toolboxSection.fieldIrrigationDesc',
        color: 'from-cyan-500 to-teal-500',
        bgLight: 'bg-cyan-50 dark:bg-cyan-900/10',
        link: '/home/borewell',
    },
    {
        icon: 'shield',
        tTitle: 'toolboxSection.yieldProtectionTitle',
        tDesc: 'toolboxSection.yieldProtectionDesc',
        color: 'from-indigo-500 to-purple-500',
        bgLight: 'bg-indigo-50 dark:bg-indigo-900/10',
        link: '/home/toolbox',
    },
];

export default function ToolboxSection() {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [village, setVillage] = useState('');
    const [sampleType, setSampleType] = useState('General');
    const [collection, setCollection] = useState('Home Pick-up');
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = t('toolboxSection.nameRequired');
        if (!phone.trim()) newErrors.phone = t('toolboxSection.phoneRequired');
        else if (!/^\d{10}$/.test(phone.trim())) newErrors.phone = t('toolboxSection.phoneInvalid');
        if (!village.trim()) newErrors.village = t('toolboxSection.villageRequired');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setName('');
                setPhone('');
                setVillage('');
                setSampleType('General');
                setCollection('Home Pick-up');
            }, 4000);
        }
    };

    const ServiceCard = ({ service, index, side }: { service: typeof leftServices[0]; index: number; side: 'left' | 'right' }) => (
        <a
            href={service.link}
            className={`group block opacity-0 animate-fade-in-${side === 'left' ? 'left' : 'right'}`}
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
        >
            <div className="skeuo-card-hover rounded-2xl p-5 h-full flex flex-col items-start gap-4 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-white text-xl">{service.icon}</span>
                </div>
                <div>
                    <h4 className="font-black text-sm mb-1.5 group-hover:text-primary transition-colors">{t(service.tTitle)}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{t(service.tDesc)}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{t('toolboxSection.learnMore')}</span>
                    <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
            </div>
        </a>
    );

    return (
        <section className="px-4 md:px-6 py-14 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]"></div>

            {/* Section Header */}
            <div className="mx-auto max-w-[1400px] relative z-10 mb-10 text-center">
                <span className="inline-flex items-center gap-1.5 mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <span className="material-symbols-outlined text-xs">science</span>
                    {t('toolboxSection.badge')}
                </span>
                <h2 className="text-3xl md:text-4xl font-black">
                    {t('toolboxSection.title')} <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">{t('toolboxSection.titleHighlight')}</span>
                </h2>
                <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">{t('toolboxSection.subtitle')}</p>
            </div>

            <div className="mx-auto max-w-[1400px] relative z-10">
                {/* Mobile: 2x2 grid of all service cards + form below */}
                {/* Desktop: left-center-right layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Left Service Cards - hidden on mobile, shown on desktop */}
                    <div className="hidden lg:grid lg:col-span-3 grid-cols-1 gap-5">
                        {leftServices.map((service, index) => (
                            <ServiceCard key={service.tTitle} service={service} index={index} side="left" />
                        ))}
                    </div>

                    {/* Mobile: All 4 cards in 2x2 grid */}
                    <div className="lg:hidden grid grid-cols-2 gap-3">
                        {[...leftServices, ...rightServices].map((service, index) => (
                            <ServiceCard key={service.tTitle} service={service} index={index} side={index < 2 ? "left" : "right"} />
                        ))}
                    </div>

                    {/* Center - Booking Form */}
                    <div className="lg:col-span-6">
                        <div className="skeuo-card rounded-[2rem] p-8 md:p-10 border-2 border-white/80 dark:border-[#2c5926]/20 relative overflow-hidden h-full animate-fade-in-up">
                            {/* Top accent */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-green-400 to-accent"></div>

                            {/* Success Overlay */}
                            {submitted && (
                                <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-20 flex flex-col items-center justify-center rounded-[2rem] animate-fade-in-up">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center mb-5 shadow-xl shadow-primary/30 animate-bounce">
                                        <span className="material-symbols-outlined text-white text-4xl">check</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('toolboxSection.bookingConfirmed')}</h3>
                                    <p className="text-gray-500 text-sm text-center max-w-sm">{t('toolboxSection.bookingConfirmedDesc')}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        {t('toolboxSection.confirmationSent')}
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-green-400 mb-3 shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-white text-2xl">science</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black mb-1">{t('toolboxSection.bookSoilTest')}</h3>
                                <p className="text-gray-500 text-xs">{t('toolboxSection.bookSoilTestDesc')}</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {/* Name & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{t('toolboxSection.fullName')}</label>
                                        <div className={`skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3 flex items-center gap-2 transition-all ${errors.name ? 'ring-2 ring-red-400' : ''}`}>
                                            <span className="material-symbols-outlined text-primary/40 text-lg">person</span>
                                            <input
                                                className="w-full border-none bg-transparent focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                                placeholder={t('toolboxSection.yourName')}
                                                type="text"
                                                value={name}
                                                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                                            />
                                        </div>
                                        {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{t('toolboxSection.phoneNumber')}</label>
                                        <div className={`skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3 flex items-center gap-2 transition-all ${errors.phone ? 'ring-2 ring-red-400' : ''}`}>
                                            <span className="material-symbols-outlined text-primary/40 text-lg">call</span>
                                            <input
                                                className="w-full border-none bg-transparent focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                                placeholder={t('toolboxSection.tenDigit')}
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => { setPhone(normalizeIndianPhone(e.target.value)); setErrors(prev => ({ ...prev, phone: '' })); }}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Village */}
                                <div>
                                    <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{t('toolboxSection.villageLocation')}</label>
                                    <div className={`skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3 flex items-center gap-2 transition-all ${errors.village ? 'ring-2 ring-red-400' : ''}`}>
                                        <span className="material-symbols-outlined text-primary/40 text-lg">location_on</span>
                                        <input
                                            className="w-full border-none bg-transparent focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                            placeholder={t('toolboxSection.enterVillage')}
                                            type="text"
                                            value={village}
                                            onChange={(e) => { setVillage(e.target.value); setErrors(prev => ({ ...prev, village: '' })); }}
                                        />
                                    </div>
                                    {errors.village && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.village}</p>}
                                </div>

                                {/* Selects */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{t('toolboxSection.testType')}</label>
                                        <select
                                            className="skeuo-inset w-full border-none bg-white dark:bg-[#121811] rounded-xl px-4 py-3 font-bold text-sm text-gray-800 dark:text-gray-200 focus:ring-0 cursor-pointer"
                                            value={sampleType}
                                            onChange={(e) => setSampleType(e.target.value)}
                                        >
                                            <option>{t('toolboxSection.general')}</option>
                                            <option>{t('toolboxSection.npkAnalysis')}</option>
                                            <option>{t('toolboxSection.phEcTesting')}</option>
                                            <option>{t('toolboxSection.microNutrients')}</option>
                                            <option>{t('toolboxSection.completePackage')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">{t('toolboxSection.collectionMethod')}</label>
                                        <select
                                            className="skeuo-inset w-full border-none bg-white dark:bg-[#121811] rounded-xl px-4 py-3 font-bold text-sm text-gray-800 dark:text-gray-200 focus:ring-0 cursor-pointer"
                                            value={collection}
                                            onChange={(e) => setCollection(e.target.value)}
                                        >
                                            <option>{t('toolboxSection.homePickup')}</option>
                                            <option>{t('toolboxSection.selfDropLab')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    className="glossy-button w-full rounded-2xl py-4 mt-2 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 group active:scale-[0.98] transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">science</span>
                                    {t('toolboxSection.bookSoilTestBtn')}
                                </button>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-xs">verified</span>
                                    {t('toolboxSection.certifiedLabs')}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-xs">schedule</span>
                                    {t('toolboxSection.reportsTime')}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-primary text-xs">local_shipping</span>
                                    {t('toolboxSection.freePickup')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Service Cards - hidden on mobile, shown on desktop */}
                    <div className="hidden lg:grid lg:col-span-3 grid-cols-1 gap-5">
                        {rightServices.map((service, index) => (
                            <ServiceCard key={service.tTitle} service={service} index={index} side="right" />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
