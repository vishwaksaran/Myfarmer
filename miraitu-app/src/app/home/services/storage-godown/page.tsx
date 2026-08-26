'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { normalizeIndianPhone } from '@/lib/phone';
import { usePrefillLocation } from '@/context/LocationContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';

// ─── Storage types catalogue ───────────────────────────────────────────────
const storageServices = [
    {
        key: 'dry',
        icon: 'warehouse',
        title: 'Dry Storage Godowns',
        description: 'Secure, ventilated godowns for grains, pulses, and non-perishable crops.',
        features: ['Pest Control', 'Moisture Monitoring', '24/7 Security', 'Fire Safety'],
        price: '₹50/quintal/mo',
        rateLabel: '₹50 / qtl / month',
    },
    {
        key: 'cold',
        icon: 'ac_unit',
        title: 'Cold Storage Units',
        description: 'Temperature-controlled storage for fruits, vegetables, and perishables.',
        features: ['Temp. Control (2°C – 15°C)', 'Humidity Control', 'Backup Power', 'Hygiene Standards'],
        price: '₹150/quintal/mo',
        rateLabel: '₹150 / qtl / month',
    },
    {
        key: 'silo',
        icon: 'silo',
        title: 'Grain Silos',
        description: 'Modern cylindrical silos for large-scale bulk grain storage with aeration.',
        features: ['Bulk Capacity', 'Aeration System', 'Automated Weighing', 'Insect-Proof'],
        price: '₹80/quintal/mo',
        rateLabel: '₹80 / qtl / month',
    },
];

const rates: Record<string, number> = { dry: 50, cold: 150, silo: 80 };

// ─── Booking Modal ─────────────────────────────────────────────────────────
function BookingModal({
    storageType,
    onClose,
}: {
    storageType: (typeof storageServices)[0];
    onClose: () => void;
}) {
    const { submit, submitting } = useBookingSubmit();
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const submission = useSubmissionCopy('booking');
    const firstFocusRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        location: '',
        crop_type: '',
        quantity: '',
        duration: '',
        preferred_date: '',
        preferred_time: '',
        notes: '',
    });
    usePrefillLocation(form.location, (loc) => setForm(prev => ({ ...prev, location: loc })));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Trap focus and close on Escape
    useEffect(() => {
        firstFocusRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const estimatedCost = (): string | null => {
        const qty = parseFloat(form.quantity);
        const months = parseFloat(form.duration);
        if (!qty || !months) return null;
        const rate = rates[storageType.key] || 50;
        return (rate * qty * months).toLocaleString('en-IN');
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!form.full_name.trim()) errs.full_name = tp('Name is required');
        const digits = form.phone.replace(/\D/g, '');
        if (!digits) errs.phone = tp('Phone number is required');
        else if (digits.length !== 10) errs.phone = tp('Enter a valid 10-digit number');
        if (!form.location.trim()) errs.location = tp('Location is required');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const cost = estimatedCost();
        const result = await submit({
            module: 'services',
            category: 'storage-godown',
            full_name: form.full_name,
            phone: form.phone,
            location: form.location,
            preferred_date: form.preferred_date || undefined,
            preferred_time: form.preferred_time || undefined,
            extra_data: {
                storage_type: storageType.key,
                storage_title: storageType.title,
                crop_type: form.crop_type,
                quantity_quintals: form.quantity,
                duration_months: form.duration,
                notes: form.notes,
                estimated_cost: cost ? `₹${cost}` : undefined,
            },
        });
        if (result.success) setShowSuccess(true);
        else setErrors({ submit: result.error || tp('Submission failed. Please try again.') });
    };

    // ── Success screen ──
    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <div
                    className="bg-white dark:bg-[#141f14] rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center"
                    style={{ animation: 'successPop 0.45s cubic-bezier(.22,1.2,.36,1) both' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className={`w-20 h-20 mx-auto mb-5 rounded-full ${SUBMISSION_ACCENT.circle} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-4xl ${SUBMISSION_ACCENT.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{SUBMISSION_ICON}</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{submission.heading}</h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        {submission.message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:from-green-700 hover:to-emerald-700 transition-all active:scale-[0.98]"
                    >
                        {tp('Done')}
                    </button>
                </div>
                <style>{`@keyframes successPop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}`}</style>
            </div>
        );
    }

    const cost = estimatedCost();

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#141f14] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[95dvh]"
                style={{ animation: 'slideUp 0.35s cubic-bezier(.22,1.2,.36,1) both' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 pt-6 pb-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined text-white text-lg">close</span>
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-2xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{storageType.icon}</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{tp('Book Storage')}</p>
                            <h2 className="text-xl font-black text-white">{tp(storageType.title)}</h2>
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">{storageType.rateLabel} · {tp(storageType.description)}</p>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-4">

                    {/* Full name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">person</span>
                                {tp('Full Name')} <span className="text-red-400">*</span>
                            </span>
                        </label>
                        <input
                            ref={firstFocusRef}
                            type="text"
                            value={form.full_name}
                            onChange={e => setForm({ ...form, full_name: e.target.value })}
                            placeholder={tp('Enter your full name')}
                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.full_name ? 'border-red-400' : 'border-transparent focus:border-green-500'} outline-none transition-colors dark:text-white text-sm`}
                        />
                        {errors.full_name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.full_name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">phone</span>
                                {tp('Phone Number')} <span className="text-red-400">*</span>
                            </span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: normalizeIndianPhone(e.target.value) })}
                            placeholder="+91 XXXXX XXXXX"
                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.phone ? 'border-red-400' : 'border-transparent focus:border-green-500'} outline-none transition-colors dark:text-white text-sm`}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.phone}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">location_on</span>
                                {tp('Location')} <span className="text-red-400">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder={tp('Village, Taluk, District')}
                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.location ? 'border-red-400' : 'border-transparent focus:border-green-500'} outline-none transition-colors dark:text-white text-sm`}
                        />
                        {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.location}</p>}
                    </div>

                    {/* Crop type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">grass</span>
                                {tp('Crop / Produce')}
                            </span>
                        </label>
                        <input
                            type="text"
                            value={form.crop_type}
                            onChange={e => setForm({ ...form, crop_type: e.target.value })}
                            placeholder={tp('e.g. Wheat, Onion, Potato')}
                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                        />
                    </div>

                    {/* Quantity + Duration side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-gray-400">scale</span>
                                    {tp('Qty (Qtl)')}
                                </span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.quantity}
                                onChange={e => setForm({ ...form, quantity: e.target.value })}
                                placeholder={tp('e.g. 100')}
                                className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-gray-400">calendar_month</span>
                                    {tp('Months')}
                                </span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.duration}
                                onChange={e => setForm({ ...form, duration: e.target.value })}
                                placeholder={tp('e.g. 3')}
                                className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Preferred date + time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-gray-400">calendar_month</span>
                                    {tp('Preferred Date')}
                                </span>
                            </label>
                            <input
                                type="date"
                                value={form.preferred_date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setForm({ ...form, preferred_date: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-gray-400">schedule</span>
                                    {tp('Preferred Time')}
                                </span>
                            </label>
                            <select
                                value={form.preferred_time}
                                onChange={e => setForm({ ...form, preferred_time: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm appearance-none"
                            >
                                <option value="">{tp('Select slot')}</option>
                                <option value="Morning (8 AM – 11 AM)">{tp('Morning (8–11 AM)')}</option>
                                <option value="Late Morning (11 AM – 2 PM)">{tp('Late Morning (11–2)')}</option>
                                <option value="Afternoon (2 PM – 5 PM)">{tp('Afternoon (2–5 PM)')}</option>
                                <option value="Evening (5 PM – 8 PM)">{tp('Evening (5–8 PM)')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Live cost estimate */}
                    {cost && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <span className="material-symbols-outlined text-green-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                            <div>
                                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{tp('Estimated Cost')}</p>
                                <p className="text-xl font-black text-green-700 dark:text-green-300">₹{cost}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">notes</span>
                                {tp('Additional Notes')}
                            </span>
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder={tp('Special requirements, preferred location, etc.')}
                            rows={2}
                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm resize-none"
                        />
                    </div>

                    {/* Server error */}
                    {errors.submit && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 px-4 py-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                    <button
                        type="submit"
                        disabled={submitting || !agreedToTerms}
                        className="w-full rounded-xl py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                {tp('Submitting…')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warehouse</span>
                                {tp('Confirm Booking Request')}
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 pb-2">
                        <span className="material-symbols-outlined text-xs align-middle mr-0.5">lock</span>
                        {tp('Your details are safe with us')}
                    </p>
                </form>
            </div>
            <style>{`@keyframes slideUp{0%{transform:translateY(60px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function StoragePage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [activeStorage, setActiveStorage] = useState<(typeof storageServices)[0] | null>(null);

    // Calculator state (kept on page)
    const [calcForm, setCalcForm] = useState({ quantity: '', duration: '', storage_type: 'dry' });
    const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setHeaderVisible(y <= 80 || y < lastScrollY.current);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleCalculate = () => {
        const qty = parseFloat(calcForm.quantity) || 0;
        const months = parseFloat(calcForm.duration) || 1;
        const rate = rates[calcForm.storage_type] || 50;
        setEstimatedCost(Math.max(0, rate * qty * months).toLocaleString('en-IN'));
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">

            {/* ── Booking Modal ── */}
            {activeStorage && (
                <BookingModal
                    storageType={activeStorage}
                    onClose={() => setActiveStorage(null)}
                />
            )}

            {/* ── Header ── */}
            <header className="w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-3 md:py-4">
                    <nav className="flex items-center gap-1 text-xs md:text-sm">
                        <a href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">{tp('Home')}</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <a href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">{tp('Services')}</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <span className="text-primary font-bold">{tp('Storage & Godowns')}</span>
                    </nav>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="relative px-4 md:px-6 py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px] text-center">
                    <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-6 shadow-2xl">
                        <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>warehouse</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{tp('Agricultural Storage & Godowns')}</h1>
                    <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        {tp('Protect your harvest from spoilage, pests, and price fluctuations. Secure storage facilities near you.')}
                    </p>
                </div>
            </section>

            {/* ── Storage Cards ── */}
            <section className="px-4 md:px-6 py-12 md:py-16">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{tp('Storage Types')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 md:mb-12">{tp('Choose the storage solution that fits your crop and budget')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {storageServices.map((service) => (
                            <div key={service.key} className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 group flex flex-col">
                                {/* Icon & Price */}
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div className="size-14 md:size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20">
                                        <span className="material-symbols-outlined text-3xl md:text-4xl text-green-700 dark:text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>{service.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium mb-0.5">{tp('Starting from')}</p>
                                        <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">{service.price}</p>
                                    </div>
                                </div>

                                {/* Title & Desc */}
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">{tp(service.title)}</h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-5">{tp(service.description)}</p>

                                {/* Features */}
                                <div className="grid grid-cols-1 gap-2 mb-6 flex-1">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-green-50/60 dark:bg-green-900/20">
                                            <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">{tp(feature)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Book Space CTA — NOW WIRED UP */}
                                <button
                                    id={`book-space-${service.key}`}
                                    onClick={() => setActiveStorage(service)}
                                    className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-base md:text-lg shadow-lg hover:shadow-xl group-hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
                                    {tp('Book Space')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Cost Estimator ── */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-b from-green-50/30 to-transparent dark:from-green-900/10">
                <div className="mx-auto max-w-[640px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">{tp('Estimate Storage Cost')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{tp('Quick calculator before you book')}</p>

                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{tp('Storage Estimator')}</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Storage Type')}</label>
                                <select
                                    value={calcForm.storage_type}
                                    onChange={e => setCalcForm({ ...calcForm, storage_type: e.target.value })}
                                    className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm appearance-none"
                                >
                                    <option value="dry">{tp('Dry Godown (₹50/qtl/mo)')}</option>
                                    <option value="cold">{tp('Cold Storage (₹150/qtl/mo)')}</option>
                                    <option value="silo">{tp('Grain Silo (₹80/qtl/mo)')}</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Quantity (Qtl)')}</label>
                                    <input
                                        type="number"
                                        value={calcForm.quantity}
                                        onChange={e => setCalcForm({ ...calcForm, quantity: e.target.value })}
                                        placeholder={tp('e.g. 100')}
                                        min="1"
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Duration (Months)')}</label>
                                    <input
                                        type="number"
                                        value={calcForm.duration}
                                        onChange={e => setCalcForm({ ...calcForm, duration: e.target.value })}
                                        placeholder={tp('e.g. 3')}
                                        min="1"
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCalculate}
                                className="w-full rounded-xl py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                            >
                                {tp('Calculate Cost')}
                            </button>
                            {estimatedCost && (
                                <div className="mt-2 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800">
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">{tp('Estimated Total')}</p>
                                    <p className="text-4xl font-black text-green-600 dark:text-green-400">₹{estimatedCost}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">{tp('*Includes handling charges. Actual may vary.')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
