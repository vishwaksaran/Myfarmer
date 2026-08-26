'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { usePrefillLocation } from '@/context/LocationContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';

// ─── Machinery catalogue ─────────────────────────────────────────────────────

const GREEN = 'from-green-500 to-emerald-600';
const GREEN_BG = 'from-green-100 to-emerald-100';

const machineryTypes = [
    {
        key: 'tractor',
        icon: 'agriculture',
        title: 'Tractors (45–60 HP)',
        description: 'Powerful tractors for plowing, tilling, and transport.',
        features: ['4WD Options', 'AC Cabin Available', 'Operators Included', 'Fuel Inclusive'],
        price: 'From ₹800/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
    {
        key: 'harvester',
        icon: 'grass',
        title: 'Combine Harvesters',
        description: 'Efficient harvesting for wheat, paddy, and soy.',
        features: ['Multi-crop Support', 'Track/Wheel Type', 'Grain Tank', 'Straw Management'],
        price: 'From ₹2,500/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
    {
        key: 'small_machines',
        icon: 'precision_manufacturing',
        title: 'Small Machines',
        description: 'Compact equipment for small plots and precision work.',
        features: ['Power Weeder', 'Thresher', 'Seed Drill', 'Easy Transport'],
        price: 'From ₹400/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
    {
        key: 'implements',
        icon: 'handyman',
        title: 'Farm Implements',
        description: 'Essential attachments for various farm operations.',
        features: ['Plough Attachment', 'Harrow', 'Rotavator', 'Disc Harrow'],
        price: 'From ₹350/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
    {
        key: 'spray_machine',
        icon: 'water_drop',
        title: 'Spray Machines',
        description: 'Precision spraying for pesticides and fertilizers.',
        features: ['3–5 Ltr Tank', 'Adjustable Nozzles', 'Backpack Design', 'Lightweight'],
        price: 'From ₹500/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
    {
        key: 'agri_drone',
        icon: 'flight',
        title: 'Agri Drones',
        description: 'Advanced drone technology for crop monitoring and spraying.',
        features: ['10L Tank Capacity', 'GPS Mapping', 'Real-time Monitoring', '25 min Flight Time'],
        price: 'From ₹1,500/hr',
        color: GREEN,
        bg: GREEN_BG,
    },
];

const hourlyRates: Record<string, number> = {
    tractor: 800,
    harvester: 2500,
    rotavator: 600,
    small_machines: 400,
    implements: 350,
    spray_machine: 500,
    agri_drone: 1500,
};

// ─── Booking Modal ───────────────────────────────────────────────────────────

interface ModalFormData {
    full_name: string;
    phone: string;
    location: string;
    machinery_type: string;
    preferred_date: string;
    preferred_time: string;
    duration_value: string;
    duration_type: string;
    extra_notes: string;
}

function BookingModal({
    machine,
    onClose,
}: {
    machine: (typeof machineryTypes)[0];
    onClose: () => void;
}) {
    const { submit, submitting } = useBookingSubmit();
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const submission = useSubmissionCopy('booking');
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [form, setForm] = useState<ModalFormData>({
        full_name: '',
        phone: '',
        location: '',
        machinery_type: machine.key,
        preferred_date: '',
        preferred_time: '',
        duration_value: '',
        duration_type: 'hours',
        extra_notes: '',
    });

    usePrefillLocation(form.location, (loc) => setForm(prev => ({ ...prev, location: loc })));

    // Trap focus inside modal
    const firstFocusRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        firstFocusRef.current?.focus();
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const estimatedCost = () => {
        const dur = parseFloat(form.duration_value) || 0;
        if (!dur) return null;
        const rate = hourlyRates[form.machinery_type] || 800;
        const multiplier = form.duration_type === 'days' ? 8 : 1;
        return (rate * dur * multiplier).toLocaleString('en-IN');
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.full_name.trim()) errs.full_name = tp('Name is required');
        if (!form.phone.trim()) errs.phone = tp('Phone is required');
        else if (form.phone.replace(/\D/g, '').length !== 10) errs.phone = tp('Enter a valid 10-digit number');
        if (!form.location.trim()) errs.location = tp('Location is required');
        if (!form.preferred_date) errs.preferred_date = tp('Please pick a preferred date');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await submit({
            module: 'services',
            category: 'rent-machinery',
            full_name: form.full_name,
            phone: form.phone,
            location: form.location,
            preferred_date: form.preferred_date,
            preferred_time: form.preferred_time || undefined,
            extra_data: {
                machinery_type: form.machinery_type,
                duration_value: form.duration_value,
                duration_type: form.duration_type,
                extra_notes: form.extra_notes,
                estimated_cost: estimatedCost(),
            },
        });

        if (result.success) {
            setShowSuccess(true);
        } else {
            setErrors({ submit: result.error || tp('Submission failed. Please try again.') });
        }
    };

    const field = (id: string) => `form.${id}` as keyof ModalFormData;

    // ── Success screen ──
    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                <div
                    className="bg-white dark:bg-[#141f14] rounded-3xl p-8 md:p-10 shadow-2xl max-w-sm w-full text-center"
                    style={{ animation: 'successPop 0.45s cubic-bezier(.22,1.2,.36,1) both' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Animated checkmark */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${SUBMISSION_ACCENT.circle} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-4xl ${SUBMISSION_ACCENT.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>{SUBMISSION_ICON}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">{submission.heading}</h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mb-6">
                        {submission.message}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
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
                <div className="bg-primary px-6 pt-6 pb-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-white text-lg">close</span>
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-2xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{machine.icon}</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{tp('Book Rental')}</p>
                            <h2 className="text-xl font-black text-white">{tp(machine.title)}</h2>
                        </div>
                    </div>
                    <p className="text-white/80 text-sm">{tp(machine.description)}</p>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-4" id="book-machinery-form">

                    {/* Full name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">person</span>
                                {tp('Full Name')}
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
                                {tp('Phone Number')}
                            </span>
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
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
                                {tp('Location')}
                            </span>
                        </label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder={tp('Village, District, State')}
                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.location ? 'border-red-400' : 'border-transparent focus:border-green-500'} outline-none transition-colors dark:text-white text-sm`}
                        />
                        {errors.location && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.location}</p>}
                    </div>

                    {/* Machinery type */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">agriculture</span>
                                {tp('Equipment Type')}
                            </span>
                        </label>
                        <select
                            value={form.machinery_type}
                            onChange={e => setForm({ ...form, machinery_type: e.target.value })}
                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm appearance-none"
                        >
                            {machineryTypes.map(m => (
                                <option key={m.key} value={m.key}>{tp(m.title)} ({m.price})</option>
                            ))}
                        </select>
                    </div>

                    {/* Preferred date */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">calendar_month</span>
                                {tp('Preferred Start Date')}
                            </span>
                        </label>
                        <input
                            type="date"
                            value={form.preferred_date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setForm({ ...form, preferred_date: e.target.value })}
                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.preferred_date ? 'border-red-400' : 'border-transparent focus:border-green-500'} outline-none transition-colors dark:text-white text-sm`}
                        />
                        {errors.preferred_date && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.preferred_date}</p>}
                    </div>

                    {/* Preferred time */}
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
                            <option value="">{tp('Select a time slot')}</option>
                            <option value="Morning (8 AM – 11 AM)">{tp('Morning (8 AM – 11 AM)')}</option>
                            <option value="Late Morning (11 AM – 2 PM)">{tp('Late Morning (11 AM – 2 PM)')}</option>
                            <option value="Afternoon (2 PM – 5 PM)">{tp('Afternoon (2 PM – 5 PM)')}</option>
                            <option value="Evening (5 PM – 8 PM)">{tp('Evening (5 PM – 8 PM)')}</option>
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">schedule</span>
                                {tp('Rental Duration')} <span className="font-normal text-gray-400">{tp('(optional)')}</span>
                            </span>
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                min="1"
                                value={form.duration_value}
                                onChange={e => setForm({ ...form, duration_value: e.target.value })}
                                placeholder={tp('e.g. 4')}
                                className="flex-1 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm"
                            />
                            <select
                                value={form.duration_type}
                                onChange={e => setForm({ ...form, duration_type: e.target.value })}
                                className="rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm appearance-none"
                            >
                                <option value="hours">{tp('Hours')}</option>
                                <option value="days">{tp('Days (8h)')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Live cost estimate */}
                    {cost && (
                        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{tp('Estimated Cost')}</span>
                            </div>
                            <span className="text-xl font-black text-green-600 dark:text-green-400">₹{cost}</span>
                        </div>
                    )}

                    {/* Extra notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">notes</span>
                                {tp('Additional Notes')} <span className="font-normal text-gray-400">{tp('(optional)')}</span>
                            </span>
                        </label>
                        <textarea
                            value={form.extra_notes}
                            onChange={e => setForm({ ...form, extra_notes: e.target.value })}
                            placeholder={tp('Mention field size, crop type, special requirements…')}
                            rows={3}
                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm resize-none"
                        />
                    </div>

                    {/* Server error */}
                    {errors.submit && (
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                        </div>
                    )}

                    {/* Submit */}
                    <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                    <button
                        type="submit"
                        disabled={submitting || !agreedToTerms}
                        className="w-full rounded-xl py-4 bg-primary text-white font-black text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                {tp('Submitting…')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RentMachineryPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [activeMachine, setActiveMachine] = useState<(typeof machineryTypes)[0] | null>(null);

    // Calculator state (kept on page)
    const [calcForm, setCalcForm] = useState({
        machinery_type: 'tractor',
        duration_value: '',
        duration_type: 'hours',
        start_date: '',
    });

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setHeaderVisible(y <= 80 || y < lastScrollY.current);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const calculateCost = () => {
        const duration = parseFloat(calcForm.duration_value) || 1;
        const rate = hourlyRates[calcForm.machinery_type] || 800;
        const multiplier = calcForm.duration_type === 'days' ? 8 : 1;
        return Math.max(0, rate * duration * multiplier).toLocaleString('en-IN');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">

            {/* ── Booking Modal ── */}
            {activeMachine && (
                <BookingModal
                    machine={activeMachine}
                    onClose={() => setActiveMachine(null)}
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
                        <span className="text-primary font-bold">{tp('Machinery Rentals')}</span>
                    </nav>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="relative px-4 md:px-6 py-12 md:py-16 bg-primary/5">
                <div className="mx-auto max-w-[1280px] text-center">
                    <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-2xl md:rounded-3xl bg-primary text-white mb-6 md:mb-8 shadow-lg md:shadow-2xl">
                        <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{tp('Farm Machinery Rentals')}</h1>
                    <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {tp('Modern equipment at affordable hourly rates. Book tractors, harvesters, drones, and more instantly.')}
                    </p>
                </div>
            </section>

            {/* ── Machinery Grid ── */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">{tp('Available Equipment')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 md:mb-12">{tp('Everything you need for efficient farm operations')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {machineryTypes.map((machine) => (
                            <div key={machine.key} className="rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-xl transition-all duration-300 group">
                                {/* Icon & Price */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="size-14 md:size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary/10 dark:bg-primary/20">
                                        <span className="material-symbols-outlined text-3xl md:text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{machine.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{tp('Starting from')}</p>
                                        <p className="text-xl md:text-2xl font-black text-primary">{machine.price}</p>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">{tp(machine.title)}</h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">{tp(machine.description)}</p>

                                {/* Features */}
                                <div className="grid grid-cols-1 gap-2.5 mb-8">
                                    {machine.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 dark:bg-primary/10">
                                            <span className="material-symbols-outlined text-sm text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">{tp(feature)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Book Now CTA */}
                                <button
                                    id={`book-now-${machine.key}`}
                                    onClick={() => setActiveMachine(machine)}
                                    className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-primary hover:bg-primary/90 text-white font-black text-base md:text-lg shadow-lg hover:shadow-xl group-hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
                                    {tp('Book Now')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Cost Estimator ── */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-b from-green-50/30 to-transparent dark:from-green-900/10">
                <div className="mx-auto max-w-[640px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">{tp('Estimate Your Cost')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{tp('Quick rental cost calculator before you book')}</p>

                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{tp('Rental Estimator')}</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Equipment Type')}</label>
                                <select
                                    value={calcForm.machinery_type}
                                    onChange={e => setCalcForm({ ...calcForm, machinery_type: e.target.value })}
                                    className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                >
                                    <option value="tractor">{tp('Tractor (₹800/hr)')}</option>
                                    <option value="harvester">{tp('Harvester (₹2,500/hr)')}</option>
                                    <option value="small_machines">{tp('Small Machines (₹400/hr)')}</option>
                                    <option value="implements">{tp('Farm Implements (₹350/hr)')}</option>
                                    <option value="spray_machine">{tp('Spray Machine (₹500/hr)')}</option>
                                    <option value="agri_drone">{tp('Agri Drone (₹1,500/hr)')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Start Date')}</label>
                                <input
                                    type="date"
                                    value={calcForm.start_date}
                                    onChange={e => setCalcForm({ ...calcForm, start_date: e.target.value })}
                                    className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Duration')}</label>
                                    <input
                                        type="number"
                                        value={calcForm.duration_value}
                                        onChange={e => setCalcForm({ ...calcForm, duration_value: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        placeholder={tp('e.g. 4')}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{tp('Unit')}</label>
                                    <select
                                        value={calcForm.duration_type}
                                        onChange={e => setCalcForm({ ...calcForm, duration_type: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                    >
                                        <option value="hours">{tp('Hours')}</option>
                                        <option value="days">{tp('Days (8h shift)')}</option>
                                    </select>
                                </div>
                            </div>
                            {calcForm.duration_value && (
                                <div className="mt-2 p-4 md:p-6 rounded-lg md:rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800">
                                    <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">{tp('Estimated Total')}</p>
                                    <p className="text-3xl md:text-4xl font-black text-green-600 dark:text-green-400">₹{calculateCost()}</p>
                                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-3">{tp('*Fuel & Operator charges may vary')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
