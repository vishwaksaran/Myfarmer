'use client';

import { useState } from 'react';
import WhatsAppButton from './WhatsAppButton';

export default function FloatingActionButtons() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 flex flex-col items-end gap-4">
            {/* Talk to Expert Button */}
            <div
                className="flex items-center gap-3"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
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
                    href="tel:917448410198"
                    className="group relative flex items-center justify-center h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_8px_25px_-5px_rgba(37,99,235,0.5)] active:scale-95 transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_-5px_rgba(37,99,235,0.6)]"
                    aria-label="Talk to Expert"
                >
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-60"></div>
                    {/* Shine overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 to-transparent pointer-events-none"></div>
                    <span className="material-symbols-outlined text-2xl lg:text-3xl relative z-10">support_agent</span>
                </a>
            </div>

            {/* WhatsApp Button */}
            <div>
                <WhatsAppButton size="lg" showLabel={false} />
            </div>
        </div>
    );
}
