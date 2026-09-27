'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Z } from '@/lib/z-layers';
import RequirementForm from './RequirementForm';

/**
 * The requirement form as an overlay, for the floating button on mobile.
 *
 * Portaled to `document.body` and stacked at Z.MODAL for one reason: page
 * content sits inside `<main class="relative z-10">`, which traps any
 * z-index declared inside it, and the bottom nav and the floating action
 * stack both sit at z-50. A modal rendered in place would open *underneath*
 * them — see the note in lib/z-layers.
 */
export default function RequirementModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    // A modal this tall must not scroll the page behind it, and Escape
    // should close it like every other overlay in the app.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    // No mounted flag needed: the modal only opens from a click, and this
    // keeps it inert during server rendering without an effect just to say so.
    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="fixed inset-0 flex items-end sm:items-center justify-center"
            style={{ zIndex: Z.MODAL }}
            role="dialog"
            aria-modal="true"
            aria-label="Post your requirement"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
                className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-[#1a231a] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-lush-green flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-xl">campaign</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                Post Your Requirement
                            </h2>
                            <p className="text-xs text-gray-500">
                                Tell us what you need and we will find it
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="p-1.5 -mr-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <RequirementForm onDone={onClose} />
            </div>
        </div>,
        document.body,
    );
}
