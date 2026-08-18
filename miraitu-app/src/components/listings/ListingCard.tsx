'use client';

import type { Listing } from './listingTypes';
import { CATEGORY_META, formatDistance, formatPrice } from './listingFormat';

interface ListingCardProps {
    listing: Listing;
    onOpen: (listing: Listing) => void;
    /** Shown on "My Ads" — omit on the public boards. */
    onEdit?: (listing: Listing) => void;
    onDelete?: (listing: Listing) => void;
    onToggleSold?: (listing: Listing) => void;
}

export default function ListingCard({ listing, onOpen, onEdit, onDelete, onToggleSold }: ListingCardProps) {
    const meta = CATEGORY_META[listing.category] ?? CATEGORY_META.other;
    const price = formatPrice(listing);
    const distance = formatDistance(listing.distanceKm);
    const owned = !!(onEdit || onDelete || onToggleSold);

    return (
        <article className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button onClick={() => onOpen(listing)} className="w-full flex gap-3 text-left p-2.5">
                {/* Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                    {listing.images[0] ? (
                        <img
                            src={listing.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-3xl" aria-hidden>{meta.emoji}</span>
                    )}
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                    <span className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#22c33d]/10 text-[#1f8c30] dark:text-[#6abf62] text-[11px] font-bold">
                            <span aria-hidden>{meta.emoji}</span>
                            {meta.label}
                        </span>
                        {listing.subcategory && (
                            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-semibold">
                                {listing.subcategory}
                            </span>
                        )}
                    </span>

                    <h3 className="mt-1 text-[15px] font-bold text-gray-900 dark:text-white truncate">
                        {listing.title}
                    </h3>

                    <p className="text-sm">
                        {price.amount && (
                            <span className="font-extrabold text-[#1f8c30] dark:text-[#6abf62]">{price.amount} </span>
                        )}
                        {price.suffix && <span className="text-gray-500">{price.suffix}</span>}
                    </p>

                    {distance && (
                        <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-red-500">location_on</span>
                            {distance}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <span className="material-symbols-outlined text-[13px] text-[#22c33d]">home</span>
                        <span className="truncate">{listing.location}</span>
                    </p>

                    {listing.status !== 'active' && (
                        <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                            {listing.status}
                        </span>
                    )}
                </div>
            </button>

            {/* Owner controls — only rendered where they were passed in */}
            {owned && (
                <div className="flex items-center gap-1 border-t border-gray-100 dark:border-gray-800 px-2 py-1.5">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(listing)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Edit
                        </button>
                    )}
                    {onToggleSold && (
                        <button
                            onClick={() => onToggleSold(listing)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">
                                {listing.status === 'active' ? 'check_circle' : 'restart_alt'}
                            </span>
                            {listing.status === 'active'
                                ? (listing.mode === 'rent' ? 'Mark rented' : 'Mark sold')
                                : 'Relist'}
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(listing)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Delete
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}
