'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';

const STEPS = [
    { icon: 'app_registration', number: '01', titleKey: 'fpo.step1Title', descKey: 'fpo.step1Desc' },
    { icon: 'description', number: '02', titleKey: 'fpo.step2Title', descKey: 'fpo.step2Desc' },
    { icon: 'verified_user', number: '03', titleKey: 'fpo.step3Title', descKey: 'fpo.step3Desc' },
    { icon: 'payments', number: '04', titleKey: 'fpo.step4Title', descKey: 'fpo.step4Desc' },
];

const BENEFITS = [
    { icon: 'storefront', key: 'fpo.benefit1' },
    { icon: 'ecotone', key: 'fpo.benefit2' },
    { icon: 'account_balance', key: 'fpo.benefit3' },
];

export default function FPOPage() {
    const { t } = useLanguage();
    const formRef = useRef<HTMLDivElement>(null);

    // Form state (moved from FPOBanner modal)
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        location: '',
        aadhar: '',
        pan: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = t('fpo.nameRequired');
        if (!form.phone.trim()) newErrors.phone = t('fpo.phoneRequired');
        else if (!/^\d{10}$/.test(form.phone.trim())) newErrors.phone = t('fpo.phoneInvalid');
        if (!form.location.trim()) newErrors.location = t('fpo.locationRequired');
        if (!form.aadhar.trim()) newErrors.aadhar = t('fpo.aadharRequired');
        else if (!/^\d{12}$/.test(form.aadhar.trim())) newErrors.aadhar = t('fpo.aadharInvalid');
        if (form.pan.trim() && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan.trim().toUpperCase())) {
            newErrors.pan = t('fpo.panInvalid');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setForm({ name: '', phone: '', location: '', aadhar: '', pan: '' });
                setErrors({});
            }, 4000);
        }
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Background Image */}
            <section className="relative overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center">
                {/* Background Image */}
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIlt_0k-sv2EGmJASXWROTAOCdBy16_dJOAl-ReUnzhMxdMIqbm1tXxdWRQ9DQOw4iNPK1Wfpb5mwSbyW-LXemrTEYxkIKmQSlrmZwbIxfPpvW1bqgjBO8JM5ZE4ItCz1URETgefB_4x49rLDF73MXhV3QGn3HtTy8dYC0JrVd8Mcgobqdbe2CeERyzFemnYrEUGJrMyQD2YhXuiPZTQJ8ZtZPNNnRWNpecSXg1-YPnH-QyUIGG6ZO5rodeN8omMTCl8v0k9epKMPE"
                    alt="Smiling Indian farmer couple standing confidently in their vibrant sun-drenched field"
                    fill
                    className="object-cover object-[center_20%]"
                    priority
                    quality={85}
                    sizes="100vw"
                />
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#f8f9f7] via-[#f8f9f7]/60 to-transparent dark:from-[#161d15] dark:via-[#161d15]/60 dark:to-transparent"></div>

                <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-green-800/80 text-green-100 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                            {t('fpo.govRecognized')}
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-4 sm:mb-6">
                            Empowering Farmers through <span className="text-green-700 dark:text-green-400">FPO</span>
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-lg">
                            Joining a Farmer Producer Organization (FPO) bridges the gap between the field and the market, ensuring collective strength and sustainable prosperity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={scrollToForm}
                                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                {t('fpo.bookService')}
                                <span className="material-symbols-outlined text-lg sm:text-xl">arrow_forward</span>
                            </button>
                            <Link
                                href="#what-is-fpo"
                                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all text-center text-sm sm:text-base"
                            >
                                {t('fpo.knowMore')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is FPO Section */}
            <section id="what-is-fpo" className="py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-12 bg-white dark:bg-[#1a231a]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-16 items-center">
                    {/* Image */}
                    <div className="relative order-2 md:order-1">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl"></div>
                        <div className="relative z-10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi9B5HgUjhdDGEOMVfECvnbwU_pfrep8h04KFTAU2F48nQ-OZ4GgkyJ7Wrk51kv7PhjfYisz9F5Sm1yDA3an1FYMB6WygH_D9Hb9xvysqCbqGxxce1KgPZd_sWUxN1JYbBQVK07AtAmjYx9pholSfJicSQiKTyELTJlEhnyJSyIKCiMaB_hdQnUtHFe-94A_z7hgZAB87Sox_FGQ0iWPCCHULgtwJsolMI5vS8BYSEyO3OLbSJ9o-E2V83hmVuZWTt1oUxkpuFhyyh"
                                alt="Traditional farming tools and harvested crops on rustic wooden surface"
                                width={640}
                                height={640}
                                className="w-full h-[280px] sm:h-[340px] md:h-[420px] lg:aspect-square object-cover"
                                quality={85}
                            />
                            {/* Overlay quote */}
                            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg max-w-[200px] sm:max-w-[220px]">
                                <p className="font-bold text-green-700 dark:text-green-400 italic text-sm sm:text-base leading-snug">&ldquo;Together we grow, together we thrive.&rdquo;</p>
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="order-1 md:order-2">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">What is an FPO?</h2>
                        <div className="space-y-4 sm:space-y-5 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                            <p>
                                A <span className="text-green-700 dark:text-green-400 font-semibold">Farmer Producer Organization (FPO)</span> is a collective of primary producers, namely farmers, who come together to improve their bargaining power and access to resources.
                            </p>
                            <p>
                                By pooling resources, members benefit from economies of scale in sourcing inputs, accessing modern technology, and marketing their produce directly to bulk buyers, bypassing exploitative intermediaries.
                            </p>
                            <ul className="space-y-3 sm:space-y-4 pt-2">
                                {BENEFITS.map((b) => (
                                    <li key={b.key} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-green-600 mt-0.5 text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        <span>{t(b.key)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step-by-Step Process */}
            <section className="py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-12 bg-[#f8f9f7] dark:bg-[#161d15]">
                <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 sm:mb-4">Step-by-Step Document Processing</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base px-2">
                        Our transparent digital workflow ensures every farmer receives their rightful benefits without administrative hurdles.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
                    {STEPS.map((step) => (
                        <div
                            key={step.number}
                            className="group relative p-5 sm:p-7 bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                                <span className="material-symbols-outlined text-xl sm:text-2xl">{step.icon}</span>
                            </div>
                            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 text-4xl sm:text-5xl font-black text-gray-100 dark:text-gray-800 leading-none select-none">{step.number}</div>
                            <h3 className="text-base sm:text-lg font-bold text-green-800 dark:text-green-300 mb-2">{t(step.titleKey)}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(step.descKey)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Consultation Form Section */}
            <section ref={formRef} className="py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-12 bg-white dark:bg-[#1a231a]">
                <div className="max-w-lg mx-auto">
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        {/* Success Overlay */}
                        {submitted && (
                            <div className="absolute inset-0 z-20 bg-white dark:bg-gray-900 flex flex-col items-center justify-center rounded-2xl sm:rounded-[2rem] p-6 sm:p-8">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center mb-4 sm:mb-5 shadow-xl shadow-green-600/30 animate-bounce">
                                    <span className="material-symbols-outlined text-white text-3xl sm:text-4xl">check</span>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">{t('fpo.consultationBooked')}</h3>
                                <p className="text-gray-500 text-sm text-center max-w-xs">{t('fpo.consultationDesc')}</p>
                            </div>
                        )}

                        {/* Form Header */}
                        <div className="relative bg-gradient-to-r from-[#1a5c2e] to-[#2d9649] px-5 sm:px-8 py-5 sm:py-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-2xl">groups_3</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">{t('fpo.consultation')}</h3>
                                    <p className="text-white/80 text-xs">{t('fpo.fillForm')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    {t('fpo.fullName')} <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.name ? 'border-red-400' : 'border-transparent focus-within:border-green-500'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder={t('fpo.enterFullName')}
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    {t('fpo.phoneNumber')} <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.phone ? 'border-red-400' : 'border-transparent focus-within:border-green-500'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">call</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder={t('fpo.tenDigitMobile')}
                                        type="tel"
                                        maxLength={10}
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.phone}</p>}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    {t('fpo.locationVillage')} <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.location ? 'border-red-400' : 'border-transparent focus-within:border-green-500'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder={t('fpo.districtVillagePin')}
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                    />
                                </div>
                                {errors.location && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.location}</p>}
                            </div>

                            {/* Aadhar */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    {t('fpo.aadharNumber')} <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.aadhar ? 'border-red-400' : 'border-transparent focus-within:border-green-500'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">badge</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder={t('fpo.twelveDigitAadhar')}
                                        type="text"
                                        maxLength={12}
                                        value={form.aadhar}
                                        onChange={(e) => updateField('aadhar', e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                {errors.aadhar && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.aadhar}</p>}
                            </div>

                            {/* PAN (optional) */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    {t('fpo.panCard')} <span className="text-gray-400 normal-case">({t('fpo.optional')})</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.pan ? 'border-red-400' : 'border-transparent focus-within:border-green-500'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">credit_card</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 uppercase"
                                        placeholder="e.g. ABCDE1234F"
                                        type="text"
                                        maxLength={10}
                                        value={form.pan}
                                        onChange={(e) => updateField('pan', e.target.value.toUpperCase())}
                                    />
                                </div>
                                {errors.pan && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.pan}</p>}
                            </div>

                            <p className="text-[10px] text-gray-400 ml-1">
                                <span className="text-red-500">*</span> {t('fpo.mandatoryFields')}
                            </p>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a5c2e] to-[#2d9649] text-white font-black text-base tracking-wide flex items-center justify-center gap-2 group hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-green-800/20"
                            >
                                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">calendar_month</span>
                                {t('fpo.bookConsultation')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12">
                <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1a5c2e] to-[#2d9649] overflow-hidden relative">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent)]"></div>
                    </div>
                    <div className="relative z-10 py-10 sm:py-14 px-5 sm:px-8 text-center flex flex-col items-center">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4">Ready to scale your harvest?</h2>
                        <p className="text-green-100/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl px-2">
                            Join 50,000+ farmers across the region who are already experiencing the power of collective growth.
                        </p>
                        <button
                            onClick={scrollToForm}
                            className="px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg bg-white text-green-800 hover:bg-green-50 active:scale-95 transition-all shadow-xl flex items-center gap-2 sm:gap-3"
                        >
                            {t('fpo.bookService')}
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
