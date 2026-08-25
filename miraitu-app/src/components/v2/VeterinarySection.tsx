'use client';

import Link from 'next/link';
import { useState } from 'react';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { normalizeIndianPhone } from '@/lib/phone';
import { useLoginPrompt } from '@/context/LoginPromptContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { SUBMISSION_HEADING, SUBMISSION_MESSAGE } from '@/lib/service-availability';

const serviceKeys = [
    { tName: 'vet.treatment', icon: 'medical_services', tDesc: 'vet.treatmentDesc', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { tName: 'vet.vaccination', icon: 'vaccines', tDesc: 'vet.vaccinationDesc', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { tName: 'vet.ai', icon: 'science', tDesc: 'vet.aiDesc', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { tName: 'vet.deworming', icon: 'medication', tDesc: 'vet.dewormingDesc', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
];

export default function VeterinarySection() {
    const { t } = useLanguage();
    const { requireLogin } = useLoginPrompt();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        location: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleBookNow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!requireLogin()) return; // Enforce login

        const errs: Record<string, string> = {};
        if (!formData.name.trim()) errs.name = t('vet.nameRequired');
        const digits = formData.mobile.replace(/\D/g, '');
        if (!digits) errs.mobile = t('vet.mobileRequired');
        else if (digits.length !== 10) errs.mobile = t('vet.mobileInvalid');
        if (!formData.location.trim()) errs.location = t('vet.locationRequired');
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        setShowSuccess(true);
    };

    return (
        <section className="py-12 md:py-16 bg-white dark:bg-[#121811] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#2c5926 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-sm">health_and_safety</span>
                            {t('vet.badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            {t('vet.title')}
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            {t('vet.subtitle')}
                        </p>
                    </div>

                    <Link
                        href="/home/veterinary"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        {t('vet.viewAll')} <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {serviceKeys.map((service, index) => (
                        <div
                            onClick={() => setSelectedService(t(service.tName))}
                            key={index}
                            className="group relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a231a] hover:bg-white dark:hover:bg-[#222d21] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-3xl ${service.color}`}>
                                    {service.icon}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {t(service.tName)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t(service.tDesc)}
                            </p>

                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <span className="material-symbols-outlined text-sm text-gray-400">arrow_outward</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <button
                        onClick={() => setSelectedService(t('vet.treatment'))}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                        data-no-auth
                    >
                        {t('vet.bookService')} <span className="material-symbols-outlined">calendar_month</span>
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedService(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            data-no-auth
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        {!showSuccess ? (
                            <div className="p-8">
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1 block">{t('vet.bookAppointment')}</span>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedService}</h3>
                                    <p className="text-gray-500 text-sm">{t('vet.fillDetails')}</p>
                                </div>

                                <form onSubmit={handleBookNow} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">{t('vet.name')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors"
                                            placeholder={t('vet.enterName')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">{t('vet.mobileNumber')}</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.mobile}
                                            onChange={(e) => { setFormData({ ...formData, mobile: normalizeIndianPhone(e.target.value) }); setFormErrors(prev => { const { mobile, ...r } = prev; return r; }); }}
                                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${formErrors.mobile ? 'border-red-400' : 'border-transparent'} focus:border-green-500 outline-none transition-colors`}
                                            placeholder={t('vet.tenDigit')}
                                            maxLength={14}
                                        />
                                        {formErrors.mobile && <p className="text-red-500 text-xs mt-1">{formErrors.mobile}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">{t('vet.location')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors"
                                            placeholder={t('vet.villageDistrict')}
                                        />
                                    </div>

                                    <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                                    <button
                                        type="submit"
                                        disabled={!agreedToTerms}
                                        className={`w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all mt-4 ${!agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {t('vet.bookNow')}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-8 text-center py-12">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{SUBMISSION_HEADING}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {SUBMISSION_MESSAGE}
                                </p>
                                <button
                                    onClick={() => { setSelectedService(null); setShowSuccess(false); setFormData({ name: '', mobile: '', location: '' }); }}
                                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
                                >
                                    {t('vet.done')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
