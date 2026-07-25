'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useServiceCart } from '@/context/ServiceBookingCart';
import { useAuth } from '@/context/AuthContext';
import { useAppLocation } from '@/context/LocationContext';
import { serviceUnitLabel, getServiceCategory } from '@/lib/service-catalog';
import { createServiceCatalogBooking } from '@/app/actions/service-catalog-bookings';
import { normalizeIndianPhone } from '@/lib/phone';
import { useLanguage } from '@/i18n/LanguageContext';
import { translateCatalog } from '@/i18n/serviceCatalogContent';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

// Stored value stays English (goes to the booking); tKey drives the display label.
const TIME_SLOTS = [
    { value: 'Morning (8 AM – 11 AM)', tKey: 'cart.slotMorning' },
    { value: 'Late Morning (11 AM – 2 PM)', tKey: 'cart.slotLateMorning' },
    { value: 'Afternoon (2 PM – 5 PM)', tKey: 'cart.slotAfternoon' },
    { value: 'Evening (5 PM – 8 PM)', tKey: 'cart.slotEvening' },
];

export default function ServiceCartPage() {
    const { lines, updateQuantity, removeLine, clear, subtotal, totalItems, ready } = useServiceCart();
    const { user } = useAuth();
    const { location: appLocation, loading: appLocating, requestLocation } = useAppLocation();
    const { t, lang } = useLanguage();
    // Translate stored catalog content (item name, unit, saved answers) on render.
    const tc = (s?: string) => translateCatalog(lang, s);

    // GST is charged at 18% on the items subtotal; the grand total includes it.
    const GST_RATE = 0.18;
    const gst = Math.round(subtotal * GST_RATE);
    const grandTotal = subtotal + gst;

    // Render a line's saved answers as readable "Question: value" pairs by
    // looking up each answer's question label from the service catalog.
    const answerSummary = (line: (typeof lines)[number]) => {
        const questions = getServiceCategory(line.category)?.questions ?? [];
        return Object.entries(line.answers)
            .filter(([, v]) => v)
            .map(([id, v]) => {
                const label = questions.find(q => q.id === id)?.label;
                return label ? `${tc(label)}: ${tc(v)}` : tc(v);
            })
            .join(' · ');
    };

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        location: '',
        date: '',
        time: '',
    });
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    // Prefill name / phone from the signed-in user
    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                full_name: f.full_name || user.displayName || '',
                phone: f.phone || (user.phone ? normalizeIndianPhone(user.phone) : ''),
            }));
        }
    }, [user]);

    // Prefill the service location from the app-wide detected location.
    useEffect(() => {
        if (appLocation) {
            setForm(f => (f.location ? f : { ...f, location: appLocation.address }));
            if (appLocation.lat || appLocation.lng) setCoords({ lat: appLocation.lat, lng: appLocation.lng });
        }
    }, [appLocation]);

    const detectLocation = async () => {
        const loc = await requestLocation();
        if (loc) {
            setForm(f => ({ ...f, location: loc.address }));
            setCoords({ lat: loc.lat, lng: loc.lng });
        } else {
            setError(t('cart.locationError'));
        }
    };

    const handleCreate = async () => {
        setError('');
        setSubmitting(true);
        try {
            const res = await createServiceCatalogBooking({
                category: lines[0]?.category ?? 'services',
                full_name: form.full_name,
                phone: form.phone,
                location: form.location,
                date: form.date,
                time: form.time,
                total: grandTotal,
                items: lines.map(l => ({
                    category: l.category,
                    itemId: l.itemId,
                    name: l.name,
                    price: l.price,
                    unit: l.unit,
                    quantity: l.quantity,
                    answers: l.answers,
                })),
                user_latitude: coords?.lat,
                user_longitude: coords?.lng,
            });
            if (res.success) {
                clear();
                setDone(true);
            } else {
                setError(res.error || t('cart.bookingFailed'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Avoid hydration flash while the persisted cart loads
    if (!ready) return null;

    if (done) {
        return (
            <div className="px-4 md:px-6 py-16">
                <div className="mx-auto max-w-md text-center bg-white dark:bg-[#1a231a] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
                        <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('cart.bookingCreated')}</h1>
                    <p className="text-gray-500 mb-6">{t('cart.bookingCreatedDesc')}</p>
                    <Link href="/home/services" className="inline-block w-full py-3 rounded-xl bg-primary text-white font-bold">{t('catalog.backToServices')}</Link>
                </div>
            </div>
        );
    }

    if (totalItems === 0) {
        return (
            <div className="px-4 md:px-6 py-16">
                <div className="mx-auto max-w-md text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">shopping_cart</span>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('cart.empty')}</h1>
                    <p className="text-gray-500 mb-6">{t('cart.emptyDesc')}</p>
                    <Link href="/home/services" className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold">{t('cart.browseServices')}</Link>
                </div>
            </div>
        );
    }

    const canSubmit = form.full_name.trim() && form.phone.replace(/\D/g, '').length === 10 &&
        form.location.trim() && form.date && form.time && !submitting;

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[760px]">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/home/services" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cart.myCart')}</h1>
                    <button onClick={clear} className="ml-auto text-sm text-red-500 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">delete</span> {t('cart.clear')}
                    </button>
                </div>

                {/* Line items */}
                <div className="space-y-3 mb-6">
                    {lines.map((l) => (
                        <div key={l.key} className="bg-white dark:bg-[#1a231a] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex gap-3">
                            <img src={l.image} alt={tc(l.name)} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100 dark:bg-gray-800" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{tc(l.name)}</h3>
                                    <button onClick={() => removeLine(l.key)} className="text-gray-400 hover:text-red-500">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                                <p className="text-primary font-black text-sm mt-0.5">{inr(l.price)}<span className="text-xs font-medium text-gray-400">{tc(serviceUnitLabel[l.unit])}</span></p>
                                {answerSummary(l) && (
                                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                                        {answerSummary(l)}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <button onClick={() => updateQuantity(l.key, l.quantity - 1)} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-base">remove</span>
                                    </button>
                                    <span className="w-6 text-center font-bold text-sm">{l.quantity}</span>
                                    <button onClick={() => updateQuantity(l.key, l.quantity + 1)} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-base">add</span>
                                    </button>
                                    <span className="ml-auto text-sm font-bold text-gray-700 dark:text-gray-200">{inr(l.price * l.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Date / Time / Location */}
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 mb-4 overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('cart.date')}</span>
                            </div>
                            <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} />
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                                <span className="material-symbols-outlined text-lg">schedule</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('cart.time')}</span>
                            </div>
                            <select value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={`${inputCls} appearance-none`}>
                                <option value="">{t('cart.select')}</option>
                                {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{t(s.tKey)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('cart.location')}</span>
                            </div>
                            <button onClick={detectLocation} disabled={appLocating} className="text-xs font-semibold text-primary flex items-center gap-1 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">{appLocating ? 'sync' : 'my_location'}</span>
                                {appLocating ? t('cart.locating') : t('cart.useMyLocation')}
                            </button>
                        </div>
                        <textarea value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} rows={2} placeholder={t('cart.addressPlaceholder')} className={inputCls} />
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">{t('cart.yourDetails')}</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label={t('cart.name')}><input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder={t('cart.namePlaceholder')} className={inputCls} /></Field>
                        <Field label={t('cart.phone')}><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: normalizeIndianPhone(e.target.value) })} maxLength={14} placeholder={t('cart.phonePlaceholder')} className={inputCls} /></Field>
                    </div>
                </div>

                {/* Bill summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">{t('cart.billSummary')}</h2>
                    <div className="space-y-1.5 text-sm">
                        {lines.map(l => (
                            <div key={l.key} className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span className="truncate pr-2">{tc(l.name)} × {l.quantity}</span>
                                <span className="font-medium shrink-0">{inr(l.price * l.quantity)}</span>
                            </div>
                        ))}
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between text-gray-600 dark:text-gray-300">
                            <span>{t('cart.subtotal')}</span><span className="font-medium">{inr(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>{t('cart.gst')}</span><span className="font-medium">{inr(gst)}</span></div>
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between font-black text-gray-900 dark:text-white text-base">
                            <span>{t('cart.totalAmount')}</span><span className="text-primary">{inr(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-red-500 mb-3">
                    {t('cart.disclaimer')}
                </p>

                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

                <button
                    onClick={handleCreate}
                    disabled={!canSubmit}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    {submitting ? t('cart.creating') : `${t('cart.createBooking')} · ${inr(grandTotal)}`}
                </button>
            </div>
        </div>
    );
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            {children}
        </div>
    );
}
