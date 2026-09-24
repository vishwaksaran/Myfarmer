'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { submitContactRequest } from '@/app/actions/listing-contact';
import { Z } from '@/lib/z-layers';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

interface ContactRequestModalProps {
    /** service_bookings.id or marketplace_listings.id the request is about. */
    listingId: string;
    /** 'buy_sell' | 'land_sell' | 'land_lease' | 'land_rent' — where this came from. */
    listingType: string;
    listingTitle?: string;
    sellerName?: string;
    location?: string;
    /** 'Contact Seller' (Buy & Sell, land sell/buy) or 'Contact Owner' (lease/rent). */
    heading?: string;
    onClose: () => void;
    /** Prefills the note — Crops uses it to carry the basket the buyer built. */
    defaultMessage?: string;
    /** Bump this when opening from inside another modal already at Z.MODAL. */
    zIndex?: number;
}

/**
 * Replaces the old "here's the seller's number, call or WhatsApp them
 * directly" flow across Buy & Sell and Land.
 *
 * A buyer no longer sees the seller's phone number or address at all — they
 * leave their own name, number and an optional note, and the Miraitu team
 * connects the two sides by hand. See submitContactRequest for where this
 * lands (the same activity log admin already has for every other contact
 * tap), and why that was simpler than a new table plus a new admin screen.
 */
export default function ContactRequestModal({
    listingId,
    listingType,
    listingTitle,
    sellerName,
    location,
    heading,
    defaultMessage,
    onClose,
    zIndex,
}: ContactRequestModalProps) {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const tp = (s: string) => translatePage(lang, s);

    const [name, setName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState((user?.phone || '').replace(/\D/g, '').slice(-10));
    const [message, setMessage] = useState(defaultMessage ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = name.trim();
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (!cleanName) { setError(tp('Please enter your name')); return; }
        if (cleanPhone.length !== 10) { setError(tp('Enter a valid 10-digit phone number')); return; }

        setError('');
        setSubmitting(true);
        const res = await submitContactRequest({
            listingId,
            listingType,
            listingTitle,
            sellerName,
            location,
            requesterName: cleanName,
            requesterPhone: cleanPhone,
            message: message.trim(),
        });
        setSubmitting(false);

        if (res.success) {
            setSubmitted(true);
        } else {
            setError(res.error ? tp(res.error) : tp('Could not send your request. Please try again.'));
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: zIndex ?? Z.MODAL + 1 }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-sm bg-white dark:bg-[#1a231a] rounded-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label={tp('Close')}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                {submitted ? (
                    <div className="text-center py-2">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-green-600">check_circle</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{tp('Request sent!')}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {tp('The Miraitu team will connect you with the seller shortly about this listing.')}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-5 w-full py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                        >
                            {tp('Done')}
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 pr-6">
                            {heading || tp('Contact Seller')}
                        </h3>
                        {listingTitle && <p className="text-xs text-gray-500 mb-3 truncate">{listingTitle}</p>}
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            {tp('Share your details and the Miraitu team will connect you with the seller.')}
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    {tp('Your Name')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    {tp('Your Phone Number')}
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    placeholder="9876543210"
                                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    {tp('Message (optional)')}
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary resize-none"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">call</span>
                                )}
                                {tp('Request a Callback')}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
