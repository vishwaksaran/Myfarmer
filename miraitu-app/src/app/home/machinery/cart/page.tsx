'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMachineryCart } from '@/context/MachineryBookingCart';
import { useAuth } from '@/context/AuthContext';
import { unitLabel } from '@/lib/machinery-rental-catalog';
import { createRentalBooking } from '@/app/actions/rental-bookings';
import { normalizeIndianPhone } from '@/lib/phone';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function MachineryCartPage() {
    const { lines, updateQuantity, removeLine, clear, subtotal, totalItems, ready } = useMachineryCart();
    const { user } = useAuth();
    const submission = useSubmissionCopy('booking');
    const router = useRouter();

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        location: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
    });
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);
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

    const detectLocation = () => {
        if (!('geolocation' in navigator)) { setError('Location is not supported on this device'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`);
                    const data = await res.json();
                    setForm(f => ({ ...f, location: data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
                } catch {
                    setForm(f => ({ ...f, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
                }
                setLocating(false);
            },
            () => { setError('Could not access your location. Enter it manually.'); setLocating(false); },
            // maximumAge was 5 minutes, which happily returned a stale fix from
            // wherever the device was last located. Always take a fresh one.
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
    };

    const handleCreate = async () => {
        setError('');
        const res = await (async () => {
            setSubmitting(true);
            try {
                return await createRentalBooking({
                    category: lines[0]?.category ?? 'machinery',
                    full_name: form.full_name,
                    phone: form.phone,
                    location: form.location,
                    start_date: form.start_date,
                    start_time: form.start_time,
                    end_date: form.end_date,
                    end_time: form.end_time,
                    total: subtotal,
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
            } finally {
                setSubmitting(false);
            }
        })();

        if (res.success) {
            clear();
            setDone(true);
        } else {
            setError(res.error || 'Failed to create booking');
        }
    };

    // Avoid hydration flash while the persisted cart loads
    if (!ready) return null;

    if (done) {
        return (
            <div className="px-4 md:px-6 py-16">
                <div className="mx-auto max-w-md text-center bg-white dark:bg-[#1a231a] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${SUBMISSION_ACCENT.circle} mb-4`}>
                        <span className={`material-symbols-outlined ${SUBMISSION_ACCENT.icon} text-4xl`}>{SUBMISSION_ICON}</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{submission.heading}</h1>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                    <p className="text-gray-500 mb-6">{submission.message}</p>
                    <div className="flex flex-col gap-2">
                        <Link href="/home/machinery/bookings" className="w-full py-3 rounded-xl bg-primary text-white font-bold">View My Bookings</Link>
                        <Link href="/home/machinery" className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-600 dark:text-gray-300">Back to Machinery</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (totalItems === 0) {
        return (
            <div className="px-4 md:px-6 py-16">
                <div className="mx-auto max-w-md text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">shopping_cart</span>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-6">Browse machinery rentals and add items to create a booking.</p>
                    <Link href="/home/machinery" className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold">Browse Machinery</Link>
                </div>
            </div>
        );
    }

    const canSubmit = form.full_name.trim() && form.phone.replace(/\D/g, '').length === 10 &&
        form.location.trim() && form.start_date && form.start_time && form.end_date && form.end_time && !submitting;

    return (
        <div className="px-4 md:px-6 pb-16">
            <div className="mx-auto max-w-[760px]">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/home/machinery" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Cart</h1>
                    <button onClick={clear} className="ml-auto text-sm text-red-500 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">delete</span> Clear
                    </button>
                </div>

                {/* Line items */}
                <div className="space-y-3 mb-6">
                    {lines.map((l) => (
                        <div key={l.key} className="bg-white dark:bg-[#1a231a] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex gap-3">
                            <img src={l.image} alt={l.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{l.name}</h3>
                                    <button onClick={() => removeLine(l.key)} className="text-gray-400 hover:text-red-500">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                                <p className="text-primary font-black text-sm mt-0.5">{inr(l.price)}<span className="text-xs font-medium text-gray-400">{unitLabel[l.unit]}</span></p>
                                {Object.keys(l.answers).length > 0 && (
                                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                                        {Object.entries(l.answers).filter(([, v]) => v).map(([, v]) => v).join(' · ')}
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

                {/* Service schedule + location */}
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">Service schedule</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Start date"><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputCls} /></Field>
                        <Field label="Start time"><input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className={inputCls} /></Field>
                        <Field label="End date"><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputCls} /></Field>
                        <Field label="End time"><input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className={inputCls} /></Field>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Service location</label>
                            <button onClick={detectLocation} disabled={locating} className="text-xs font-semibold text-primary flex items-center gap-1 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">{locating ? 'sync' : 'my_location'}</span>
                                {locating ? 'Locating…' : 'Use my location'}
                            </button>
                        </div>
                        <textarea value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} rows={2} placeholder="Enter the work site address" className={inputCls} />
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">Your details</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Name"><input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your name" className={inputCls} /></Field>
                        <Field label="Phone"><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: normalizeIndianPhone(e.target.value) })} maxLength={14} placeholder="10-digit number" className={inputCls} /></Field>
                    </div>
                </div>

                {/* Bill summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-3">Bill summary</h2>
                    <div className="space-y-1.5 text-sm">
                        {lines.map(l => (
                            <div key={l.key} className="flex justify-between text-gray-600 dark:text-gray-300">
                                <span className="truncate pr-2">{l.name} × {l.quantity}</span>
                                <span className="font-medium shrink-0">{inr(l.price * l.quantity)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax</span><span className="font-medium">₹0</span></div>
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 flex justify-between font-black text-gray-900 dark:text-white text-base">
                            <span>Total Amount</span><span className="text-primary">{inr(subtotal)}</span>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-red-500 mb-3">
                    *Once you create the booking, our team will reach out to confirm. You can cancel it anytime from My Bookings.
                </p>

                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

                <button
                    onClick={handleCreate}
                    disabled={!canSubmit}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    {submitting ? 'Creating…' : `Create Booking · ${inr(subtotal)}`}
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
