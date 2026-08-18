'use client';

import { useState } from 'react';
import type { Listing } from './listingTypes';
import { CATEGORY_META, formatDistance, formatPrice } from './listingFormat';
import { Z } from '@/lib/z-layers';

interface ListingDetailModalProps {
    listing: Listing | null;
    onClose: () => void;
    onEdit?: (listing: Listing) => void;
    onDelete?: (listing: Listing) => void;
}

/** Full view of one ad, with the seller's number so a buyer can actually call. */
export default function ListingDetailModal({ listing, onClose, onEdit, onDelete }: ListingDetailModalProps) {
    const [imageIndex, setImageIndex] = useState(0);
    const [copied, setCopied] = useState(false);

    if (!listing) return null;

    const meta = CATEGORY_META[listing.category] ?? CATEGORY_META.other;
    const price = formatPrice(listing);
    const distance = formatDistance(listing.distanceKm);

    const share = () => {
        const url = typeof window !== 'undefined'
            ? `${window.location.origin}${window.location.pathname}?listing=${listing.id}`
            : '';
        if (typeof navigator !== 'undefined' && navigator.share) {
            void navigator.share({ title: listing.title, url }).catch(() => { });
            return;
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            void navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => { });
        }
    };

    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4" style={{ zIndex: Z.MODAL }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1a231a] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                {/* Photos */}
                <div className="relative bg-gray-100 dark:bg-gray-800 shrink-0">
                    {listing.images.length > 0 ? (
                        <div className="relative aspect-[4/3]">
                            <img src={listing.images[imageIndex]} alt={listing.title} className="w-full h-full object-cover" />
                            {listing.images.length > 1 && (
                                <>
                                    <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between px-2 pointer-events-none">
                                        {imageIndex > 0 ? (
                                            <button
                                                onClick={() => setImageIndex(i => i - 1)}
                                                aria-label="Previous photo"
                                                className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                                            </button>
                                        ) : <div />}
                                        {imageIndex < listing.images.length - 1 ? (
                                            <button
                                                onClick={() => setImageIndex(i => i + 1)}
                                                aria-label="Next photo"
                                                className="pointer-events-auto w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                                            </button>
                                        ) : <div />}
                                    </div>
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/45 text-white text-xs font-medium">
                                        {imageIndex + 1}/{listing.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-[4/3] flex items-center justify-center text-6xl" aria-hidden>{meta.emoji}</div>
                    )}

                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Details */}
                <div className="flex-1 overflow-y-auto p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#22c33d]/10 text-[#1f8c30] dark:text-[#6abf62] text-[11px] font-bold">
                        <span aria-hidden>{meta.emoji}</span>
                        {meta.label}
                        <span className="text-gray-400 mx-0.5">·</span>
                        {listing.mode === 'rent' ? 'For rent' : 'For sale'}
                    </span>

                    <h2 className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white break-words">{listing.title}</h2>

                    <p className="mt-1 text-lg">
                        {price.amount && (
                            <span className="font-extrabold text-[#1f8c30] dark:text-[#6abf62]">{price.amount} </span>
                        )}
                        {price.suffix && <span className="text-sm text-gray-500">{price.suffix}</span>}
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#22c33d]">home</span>
                            {listing.location}
                            {listing.district && `, ${listing.district}`}
                        </p>
                        {distance && (
                            <p className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-red-500">location_on</span>
                                {distance}
                            </p>
                        )}
                        {(listing.brand || listing.model) && (
                            <p className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base text-gray-400">sell</span>
                                {[listing.brand, listing.model].filter(Boolean).join(' ')}
                            </p>
                        )}
                    </div>

                    {listing.description && (
                        <div className="mt-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Details</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line break-words leading-relaxed">
                                {listing.description}
                            </p>
                        </div>
                    )}

                    {listing.status !== 'active' && (
                        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <span className="material-symbols-outlined text-amber-600">info</span>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                This listing is marked <strong>{listing.status}</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2">
                    {listing.isOwn ? (
                        <>
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(listing)}
                                    className="flex-1 py-3 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(listing)}
                                    className="flex-1 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Delete
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            {listing.contactPhone ? (
                                <a
                                    href={`tel:${listing.contactPhone}`}
                                    className="flex-1 py-3 rounded-xl bg-[#22c33d] text-white text-sm font-bold hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-lg">call</span>
                                    Call seller
                                </a>
                            ) : (
                                <div className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-sm font-semibold text-center">
                                    No contact number given
                                </div>
                            )}
                            <button
                                onClick={share}
                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-lg">{copied ? 'check' : 'share'}</span>
                                {copied ? 'Copied' : 'Share'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
