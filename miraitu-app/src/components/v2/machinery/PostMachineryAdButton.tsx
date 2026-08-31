'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useSyncExternalStore } from 'react';
import { Z } from '@/lib/z-layers';

/** Store subscription for a value that is fixed for the life of the document. */
const neverChanges = () => () => { };

interface PostMachineryAdButtonProps {
    /** Route segment — 'tractors', 'jcb', 'drones', … */
    category: string;
    /** Shown on the pill. Defaults to "Post an Ad". */
    label?: string;
}

/**
 * The "post one of these" action on a machinery listings page.
 *
 * Opens this section's own sell form — the category-specific one, with the
 * brand list, spec labels and units tailored to tractors or drones or
 * implements. The generic Buy & Sell form cannot ask for engine hours or tank
 * capacity, so machinery keeps its own; both write to `marketplace_listings`,
 * so the ad still lands in the same marketplace.
 *
 * Portaled to <body>: these pages render inside `<main class="relative z-10">`,
 * whose stacking context would otherwise bury the pill under the app-wide
 * WhatsApp / Talk-to-Expert stack. It sits bottom-right on phones (above the
 * bottom nav, opposite that stack) and bottom-left from md up (where the stack
 * moves to the right).
 */
export default function PostMachineryAdButton({ category, label = 'Post an Ad' }: PostMachineryAdButtonProps) {
    const canPortal = useSyncExternalStore(neverChanges, () => true, () => false);
    if (!canPortal) return null;

    return createPortal(
        <Link
            href={`/home/machinery/${category}/sell`}
            style={{ zIndex: Z.FLOATING }}
            className="fixed right-4 bottom-24 md:right-auto md:left-8 md:bottom-8 inline-flex items-center gap-1.5 pl-4 pr-5 py-3.5 rounded-full bg-[#22c33d] text-white text-sm font-bold shadow-lg shadow-[#22c33d]/30 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 transition-all"
        >
            <span className="material-symbols-outlined text-xl">add</span>
            {label}
        </Link>,
        document.body
    );
}
