'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import type { LivestockAd } from '@/app/actions/livestock';
import ContactRequestModal from '@/components/ContactRequestModal';
import { formatDistance, formatRupees } from '@/components/listings/listingFormat';
import { BOARDS, specLabel } from './boards';
import { Z } from '@/lib/z-layers';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

/** "₹55,000", "₹500 per bird", or "Price on request" when none was given. */
function priceLine(ad: LivestockAd, tp: (s: string) => string) {
    if (ad.price === null) return tp('Price on request');
    const unit = ad.priceUnit && ad.priceUnit !== 'Total' ? ` ${tp(ad.priceUnit)}` : '';
    return `${formatRupees(ad.price)}${unit}`;
}

/**
 * The grid of livestock ads, with everything a card leads to: the detail
 * sheet, the contact modal and the login gate in front of the seller's number.
 *
 * Shared by the five type pages (LivestockBoard) and the Buy tab on
 * /home/livestock, which mixes all five. Each card takes its emoji and its
 * detail line from the ad's own `type`, so one grid renders a mixed list
 * correctly without the caller saying which board it is.
 */
export default function LivestockAdGrid({ ads }: { ads: LivestockAd[] }) {
    const { lang } = useLanguage();
    const tp = (s: string) => translatePage(lang, s);
    const { user } = useAuth();

    /** The ad whose full detail sheet is open — a card tap, not a contact tap. */
    const [detailAd, setDetailAd] = useState<LivestockAd | null>(null);
    const [detailImage, setDetailImage] = useState(0);
    const [contactAd, setContactAd] = useState<LivestockAd | null>(null);
    const [pendingContact, setPendingContact] = useState<LivestockAd | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    /**
     * Signing in from the contact prompt continues where the buyer left off:
     * the ad they tapped opens the moment `user` arrives. Derived rather than
     * copied across in an effect, which would fire a second render for a
     * value already known during the first.
     */
    const openContact = contactAd ?? (user ? pendingContact : null);
    /** Both, or a dismissed modal would reopen on the next render. */
    const closeContact = () => { setContactAd(null); setPendingContact(null); };

    const openDetail = (ad: LivestockAd) => { setDetailAd(ad); setDetailImage(0); };

    const handleContactClick = (ad: LivestockAd) => {
        // The contact modal is the one overlay above the detail sheet; closing
        // the sheet first keeps a single dialog on screen rather than stacking
        // two, and dismissing contact returns the buyer to the grid.
        setDetailAd(null);
        if (user) {
            setContactAd(ad);
            return;
        }
        setPendingContact(ad);
        setShowLoginModal(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => {
                    const cfg = BOARDS[ad.type];
                    const chips = cfg.chips(ad.specs).filter(Boolean).slice(0, 4) as string[];
                    return (
                        // The whole card opens the ad; only the button inside was
                        // clickable before, so the photo, the title and the
                        // truncated description all led nowhere.
                        <div key={ad.id}
                            role="button"
                            tabIndex={0}
                            aria-label={tp('View listing')}
                            onClick={() => openDetail(ad)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(ad); }
                            }}
                            className="bg-white dark:bg-[#1a231a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
                                {ad.images[0] ? (
                                    <img src={ad.images[0]} alt={ad.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-6xl" aria-hidden>{cfg.emoji}</div>
                                )}
                                {ad.subcategory && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 dark:bg-gray-900/80 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                        {tp(ad.subcategory)}
                                    </div>
                                )}
                                {ad.images.length > 1 && (
                                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">photo_library</span>{ad.images.length}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-gray-900 dark:text-white">{ad.title}</h3>
                                {chips.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                        {chips.map((chip, i) => (
                                            <span key={chip} className="flex items-center gap-2">
                                                {i > 0 && <span aria-hidden>•</span>}
                                                {i === 0
                                                    ? <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{chip}</span>
                                                    : <span>{chip}</span>}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {ad.description && (
                                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{ad.description}</p>
                                )}
                                <div className="flex justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-lg font-bold text-primary">{priceLine(ad, tp)}</p>
                                    {ad.location && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 min-w-0">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            <span className="truncate">{ad.location.split(',')[0]}</span>
                                        </p>
                                    )}
                                </div>
                                {/* Distance sits on its own line: the place name
                                    above can already fill the row on a narrow card. */}
                                {formatDistance(ad.distanceKm, tp) && (
                                    <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm text-red-500">near_me</span>
                                        {formatDistance(ad.distanceKm, tp)}
                                    </p>
                                )}
                                <button
                                    onClick={e => { e.stopPropagation(); handleContactClick(ad); }}
                                    disabled={!ad.hasPhone}
                                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <span className="material-symbols-outlined text-lg">call</span>
                                    {ad.hasPhone ? tp('Contact Seller') : tp('No number given')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail sheet — the full ad behind a card: every photo, every spec
                the seller filled in, and the description unclipped. */}
            {detailAd && (
                <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: Z.MODAL }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailAd(null)} />

                    <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1a231a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        {/* Photos */}
                        <div className="relative bg-gray-100 dark:bg-gray-800 shrink-0">
                            {detailAd.images.length > 0 ? (
                                <div className="relative aspect-[4/3]">
                                    <img src={detailAd.images[detailImage]} alt={detailAd.title} className="w-full h-full object-cover" />
                                    {detailAd.images.length > 1 && (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                                                {detailImage > 0 ? (
                                                    <button onClick={() => setDetailImage(i => i - 1)} aria-label={tp('Previous photo')}
                                                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                                                    </button>
                                                ) : <div />}
                                                {detailImage < detailAd.images.length - 1 ? (
                                                    <button onClick={() => setDetailImage(i => i + 1)} aria-label={tp('Next photo')}
                                                        className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                                    </button>
                                                ) : <div />}
                                            </div>
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/45 text-white text-xs font-medium">
                                                {detailImage + 1}/{detailAd.images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-[4/3] grid place-items-center text-6xl" aria-hidden>{BOARDS[detailAd.type].emoji}</div>
                            )}
                            <button onClick={() => setDetailAd(null)} aria-label={tp('Close')}
                                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Details */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {detailAd.subcategory && (
                                <span className="inline-block px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-semibold">
                                    {tp(detailAd.subcategory)}
                                </span>
                            )}
                            <h2 className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white break-words">{detailAd.title}</h2>
                            <p className="mt-1 text-lg font-extrabold text-primary">{priceLine(detailAd, tp)}</p>

                            {detailAd.location && (
                                <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-base text-red-500">location_on</span>
                                    {[detailAd.location, detailAd.district, detailAd.state].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {formatDistance(detailAd.distanceKm, tp) && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-base text-red-500">near_me</span>
                                    {formatDistance(detailAd.distanceKm, tp)}
                                </p>
                            )}

                            {Object.keys(detailAd.specs).length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tp('Details')}</h3>
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {Object.entries(detailAd.specs).map(([key, value]) => (
                                            <div key={key}>
                                                <dt className="text-xs text-gray-500">{tp(specLabel(key))}</dt>
                                                <dd className="font-semibold text-gray-900 dark:text-white break-words">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}

                            {detailAd.description && (
                                <div className="mt-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{tp('Description')}</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line break-words leading-relaxed">
                                        {detailAd.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Same gate as the card's button — the number is never
                            shown until the buyer is signed in. */}
                        <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                            <button
                                onClick={() => handleContactClick(detailAd)}
                                disabled={!detailAd.hasPhone}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">call</span>
                                {detailAd.hasPhone ? tp('Contact Seller') : tp('No number given')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* The seller's number is never shown. The buyer leaves their own
                details and the Miraitu team connects the two sides by hand —
                the same flow Land and Buy & Sell already use. */}
            {openContact && (
                <ContactRequestModal
                    listingId={openContact.id}
                    listingType="livestock"
                    listingTitle={openContact.title}
                    location={openContact.location}
                    heading={tp('Contact Seller')}
                    zIndex={Z.MODAL}
                    onClose={closeContact}
                />
            )}

            <LoginModal isOpen={showLoginModal && !user} onClose={() => setShowLoginModal(false)} />
        </>
    );
}
