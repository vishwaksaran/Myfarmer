'use client';

import { useEffect, useState } from 'react';

/**
 * MiraituLoader — a delightful, on-brand loading indicator.
 *
 * Instead of a plain spinner, it shows a sprouting-plant animation (🌱 → 🌿 → 🌾)
 * inside a spinning gradient ring, with the Miraitu wordmark and bouncing "seed"
 * dots. Language-independent and reusable.
 *
 * Usage:
 *   <MiraituLoader />                 // full-screen centered loading screen
 *   <MiraituLoader fullScreen={false} /> // inline (e.g. inside a card/section)
 */
const FRAMES = ['🌱', '🌿', '🌾'];

export default function MiraituLoader({
    fullScreen = true,
    label = 'Miraitu',
}: {
    fullScreen?: boolean;
    label?: string;
}) {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 500);
        return () => clearInterval(id);
    }, []);

    const content = (
        <div className="flex flex-col items-center gap-4">
            <div className="relative size-16">
                {/* Track */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
                {/* Spinning arc */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin" />
                {/* Sprouting plant */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span key={frame} className="text-2xl animate-in zoom-in-50 fade-in duration-300">
                        {FRAMES[frame]}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-wide text-primary">{label}</span>
                <span className="flex gap-1">
                    <span className="size-1.5 rounded-full bg-primary/80 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-primary/80 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-primary/80 animate-bounce [animation-delay:300ms]" />
                </span>
            </div>
        </div>
    );

    if (!fullScreen) return content;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0d110d]">
            {content}
        </div>
    );
}
