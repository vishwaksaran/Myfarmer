'use client';

import { useEffect, useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from '@/context/AuthContext';
import { fetchMachineryRentals, type MachineryRental } from '@/lib/machinery-listings';
import { logListingContact, type ContactChannel } from '@/app/actions/listing-contact';

/**
 * Machinery other farmers have put up for rent, shown inside the machinery
 * section.
 *
 * The rent pages listed only Miraitu's own catalogue, so a tractor posted on
 * the Rent board appeared on that board and nowhere else. This is the same
 * fold-in the buy pages already do for sale ads: one ad, visible wherever
 * someone is looking for that machine.
 *
 * These are not catalogue items — there is no stock, no price list and nothing
 * to add to the booking cart — so they get their owner's phone number instead,
 * the way every other peer listing in the app does.
 */
export default function PeerRentalStrip({
    pageCategory,
    heading = 'For rent from farmers',
}: {
    /** 'tractors', 'jcb', … Omit for every machinery rental. */
    pageCategory?: string;
    heading?: string;
}) {
    const { user } = useAuth();
    const isGuest = !user || user.isGuest;

    const [rentals, setRentals] = useState<MachineryRental[]>([]);
    const [contact, setContact] = useState<MachineryRental | null>(null);
    const [pending, setPending] = useState<MachineryRental | null>(null);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchMachineryRentals(pageCategory)
            .then(rows => { if (!cancelled) setRentals(rows); })
            .catch(() => { /* the catalogue above still stands on its own */ });
        return () => { cancelled = true; };
    }, [pageCategory]);

    // Signing in from the prompt opens the ad the farmer had tapped.
    const openContact = contact ?? (isGuest ? null : pending);
    const closeContact = () => { setContact(null); setPending(null); };

    // Nothing posted yet — no empty section, the catalogue is the page.
    if (rentals.length === 0) return null;

    const handleContact = (rental: MachineryRental) => {
        if (isGuest) {
            setPending(rental);
            setShowLogin(true);
            return;
        }
        setContact(rental);
    };

    const track = (rental: MachineryRental, channel: ContactChannel) => {
        void logListingContact({
            channel,
            listingId: rental.id,
            listingType: 'machinery-rent',
            listingTitle: rental.title,
            sellerPhone: rental.phone,
            location: rental.location,
        }).catch(() => { /* tracking must never block the call */ });
    };

    const price = (rental: MachineryRental) => {
        if (rental.price === null) return 'Price on request';
        const unit = rental.priceUnit ? ` ${rental.priceUnit}` : '';
        return `₹${rental.price.toLocaleString('en-IN')}${unit}`;
    };

    return (
        <section className="mt-10">
            <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">agriculture</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{heading}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                Posted on the Rent board — you deal with the owner directly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rentals.map(rental => (
                    <article key={rental.id} className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                        <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
                            {rental.images[0] ? (
                                <img src={rental.images[0]} alt={rental.title} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full grid place-items-center text-5xl" aria-hidden>🚜</div>
                            )}
                            {rental.subcategory && (
                                <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-900/80 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                    {rental.subcategory}
                                </span>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{rental.title}</h3>
                            {rental.brand && <p className="text-xs text-gray-500 mt-0.5">{rental.brand}</p>}
                            <p className="mt-2 text-lg font-bold text-primary">
                                {price(rental)}
                                {rental.negotiable && <span className="ml-1 text-xs font-semibold text-gray-500">negotiable</span>}
                            </p>
                            {rental.location && (
                                <p className="mt-1 text-xs text-gray-500 flex items-center gap-1 min-w-0">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    <span className="truncate">{rental.location}</span>
                                </p>
                            )}
                            <button
                                onClick={() => handleContact(rental)}
                                disabled={!rental.phone}
                                className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">call</span>
                                {rental.phone ? 'Contact Owner' : 'No number given'}
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {openContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeContact}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button onClick={closeContact} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl">call</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Contact Owner</h3>
                            <p className="text-gray-500 mb-4">{openContact.title}</p>
                            <div className="flex flex-col gap-3">
                                <a
                                    href={`tel:${openContact.phone}`}
                                    onClick={() => track(openContact, 'call')}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all"
                                >
                                    <span className="material-symbols-outlined">call</span>
                                    Call {openContact.phone}
                                </a>
                                <a
                                    href={`https://wa.me/${openContact.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => track(openContact, 'whatsapp')}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal isOpen={showLogin && isGuest} onClose={() => { setShowLogin(false); setPending(null); }} />
        </section>
    );
}
