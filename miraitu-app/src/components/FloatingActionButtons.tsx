'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import WhatsAppButton from './WhatsAppButton';
import CropAssistant from './CropAssistant';

export default function FloatingActionButtons() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isCropChatOpen, setIsCropChatOpen] = useState(false);
    const { user } = useAuth();
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

                {/* WhatsApp Button */}
                {!hideWhatsAppOnThisPage && (
                    <div>
                        <WhatsAppButton size="lg" showLabel={false} />
                    </div>
                )}
            </div>

            {/* Crop Assistant Chat Panel — rendered via portal */}
            {showCropAssistant && (
                <CropAssistant isOpen={isCropChatOpen} onClose={() => setIsCropChatOpen(false)} />
            )}
        </>
    );
}
