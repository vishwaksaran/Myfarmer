'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Z } from '@/lib/z-layers';
import { useAuth } from '@/context/AuthContext';
import WhatsAppButton from './WhatsAppButton';
import RequirementModal from './requirements/RequirementModal';
import CropAssistant from './CropAssistant';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

export default function FloatingActionButtons() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isCropChatOpen, setIsCropChatOpen] = useState(false);
    const [showRequirement, setShowRequirement] = useState(false);
    // The prompt shows itself once per visit so a first-time buyer notices
    // the button at all, then stays out of the way.
    const [showRequirementHint, setShowRequirementHint] = useState(false);
    const [requirementTooltip, setRequirementTooltip] = useState(false);
    const { user } = useAuth();
    const { lang } = useLanguage();
    const pathname = usePathname();
    const hideWhatsAppOnThisPage = pathname?.startsWith('/home/community');
    const showCropAssistant = pathname?.startsWith('/home/crops') && !!user;
    // Reels is a full-screen player with its own controls down the right edge;
    // a floating button on top of it is in the way whichever side it sits on.
    const hideFloatingActions = pathname?.startsWith('/home/reels');

    // Listen for custom event to open crop assistant from other components
    const handleOpenCropChat = useCallback(() => {
        setIsCropChatOpen(true);
    }, []);

    useEffect(() => {
        window.addEventListener('open-crop-assistant', handleOpenCropChat);
        return () => window.removeEventListener('open-crop-assistant', handleOpenCropChat);
    }, [handleOpenCropChat]);

    useEffect(() => {
        if (hideFloatingActions) return;
        const t = setTimeout(() => setShowRequirementHint(true), 2500);
        const hide = setTimeout(() => setShowRequirementHint(false), 11000);
        return () => { clearTimeout(t); clearTimeout(hide); };
    }, [hideFloatingActions]);

    if (hideFloatingActions) return null;

    return (
        <>
            {/* Anchored bottom-LEFT on mobile: the Rent and Buy & Sell boards put
                their "Post an Ad" / "List for Rent" button at bottom-right, and the
                two used to sit on top of each other. Desktop keeps the right-hand
                position, where nothing competes for the corner. */}
            <div data-floating-actions className="fixed z-50 flex flex-col items-start md:items-end gap-4 bottom-24 md:bottom-6 left-4 md:left-auto md:right-4 lg:bottom-10 lg:right-10">
                {/* Crop Assistant Button — Only on crops pages */}
                {showCropAssistant && (
                    <button
                        onClick={() => setIsCropChatOpen(prev => !prev)}
                        className="group relative flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white active:scale-95 transition-all hover:-translate-y-1"
                        aria-label="Crop Assistant"
                    >
                        <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping opacity-60 pointer-events-none"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 to-transparent pointer-events-none"></div>
                        <span className="material-symbols-outlined text-2xl lg:text-3xl relative z-10">psychiatry</span>
                    </button>
                )}

                {/* Talk to Expert Button — Desktop only */}
                <div
                    className="hidden md:flex items-center gap-3"
                >
                    {/* Tooltip Label */}
                    <div
                        className={`
                            bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-bold
                            px-4 py-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700
                            whitespace-nowrap transition-all duration-300 origin-right
                            ${showTooltip ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 translate-x-2 pointer-events-none'}
                        `}
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-lg">headset_mic</span>
                            Talk to Expert
                        </span>
                    </div>

                    <a
                        href="tel:919380306475"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="group relative flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white active:scale-95 transition-all hover:-translate-y-1"
                        aria-label="Talk to Expert"
                    >
                        <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-60 pointer-events-none"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 to-transparent pointer-events-none"></div>
                        <span className="material-symbols-outlined text-2xl lg:text-3xl relative z-10">support_agent</span>
                    </a>
                </div>

                {/* Post Your Requirement — sits directly above WhatsApp, which
                    is the button farmers already reach for. Tapping it opens the
                    form rather than sending them off to search the boards. */}
                <div className="relative">
                    {/* Tooltip. Anchored to the button and given its own stacking
                        context above the stack, so it is never clipped by the
                        bottom nav the way an inline overlay would be. */}
                    {(showRequirementHint || requirementTooltip) && (
                        <div
                            className="absolute bottom-1/2 translate-y-1/2 left-16 md:left-auto md:right-16 w-max max-w-[220px] px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow-xl animate-fade-in-up"
                            style={{ zIndex: Z.FLOATING }}
                            role="status"
                        >
                            {translatePage(lang, 'Do you want to post your requirement?')}
                            <span className="absolute top-1/2 -translate-y-1/2 -left-1 md:left-auto md:-right-1 size-2 rotate-45 bg-gray-900" />
                        </div>
                    )}
                    <button
                        onClick={() => { setShowRequirement(true); setShowRequirementHint(false); }}
                        onMouseEnter={() => setRequirementTooltip(true)}
                        onMouseLeave={() => setRequirementTooltip(false)}
                        className="group relative flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white active:scale-95 transition-all hover:-translate-y-1"
                        aria-label={translatePage(lang, 'Post your requirement')}
                    >
                        <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping opacity-60 pointer-events-none"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 to-transparent pointer-events-none"></div>
                        <span className="material-symbols-outlined text-2xl lg:text-3xl relative z-10">campaign</span>
                    </button>
                </div>

                {/* WhatsApp Button */}
                {!hideWhatsAppOnThisPage && (
                    <div>
                        <WhatsAppButton size="lg" showLabel={false} />
                    </div>
                )}
            </div>

            {/* Portaled at Z.MODAL so it clears the bottom nav and this stack. */}
            <RequirementModal open={showRequirement} onClose={() => setShowRequirement(false)} />

            {/* Crop Assistant Chat Panel — rendered via portal */}
            {showCropAssistant && (
                <CropAssistant isOpen={isCropChatOpen} onClose={() => setIsCropChatOpen(false)} />
            )}
        </>
    );
}
