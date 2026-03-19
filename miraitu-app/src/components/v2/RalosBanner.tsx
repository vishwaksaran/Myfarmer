'use client';

import { useEffect, useState } from 'react';

const slides = [
    {
        headline: 'Moringa Powder',
        sub: 'Rich in Vitamins A, C & Iron',
        emoji: '🌿',
        color: '#22863a',
    },
    {
        headline: 'Amla Powder',
        sub: 'Nature\'s Vitamin C Powerhouse',
        emoji: '🫐',
        color: '#7c3d8e',
    },
    {
        headline: 'Herbal Tea – Vedic Kada',
        sub: 'Ashwagandha · Shatavari · Yashtimadhu',
        emoji: '🍵',
        color: '#b45309',
    },
];

export default function RalosBanner() {
    const [active, setActive] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setActive(prev => (prev + 1) % slides.length);
                setAnimating(false);
            }, 300);
        }, 3200);
        return () => clearInterval(t);
    }, []);

    const slide = slides[active];

    return (
        <div
            className="relative overflow-hidden rounded-2xl mb-6 select-none"
            style={{
                background: 'linear-gradient(135deg, #1a0f00 0%, #2d1a00 40%, #1a1a00 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
        >
            {/* Animated sun-ray background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'conic-gradient(from 0deg at 85% 50%, transparent 0deg, rgba(251,146,60,0.06) 20deg, transparent 40deg, rgba(251,146,60,0.04) 60deg, transparent 80deg)',
                    animation: 'ralos-spin 18s linear infinite',
                }}
            />

            {/* Leaf texture top-left */}
            <div className="absolute -top-4 -left-4 text-7xl opacity-10 pointer-events-none select-none"
                style={{ filter: 'sepia(1) hue-rotate(60deg)' }}>
                🌿
            </div>

            <div className="relative z-10 p-5 md:p-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full px-3 py-1 mb-4">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-amber-400 text-xs font-bold tracking-wide uppercase">Featured Brand</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                    {/* Left – Brand + Slide */}
                    <div className="flex-1 min-w-0">
                        {/* RaloS Logo */}
                        <div className="flex items-center gap-0 mb-1">
                            <span
                                className="font-black text-white tracking-tight"
                                style={{ fontSize: '2rem', fontFamily: 'system-ui, sans-serif', letterSpacing: '-0.02em' }}
                            >
                                Ral
                            </span>
                            {/* Sun burst icon */}
                            <span
                                className="inline-flex items-center justify-center mx-0.5"
                                style={{
                                    fontSize: '1.8rem',
                                    animation: 'ralos-pulse 2s ease-in-out infinite',
                                    filter: 'drop-shadow(0 0 8px rgba(251,146,60,0.8))',
                                }}
                            >
                                ☀️
                            </span>
                            <span
                                className="font-black text-white tracking-tight"
                                style={{ fontSize: '2rem', fontFamily: 'system-ui, sans-serif' }}
                            >
                                S
                            </span>
                            <span className="text-white/50 text-xs ml-1 mt-1 self-start">™</span>
                        </div>

                        <p className="text-amber-200/70 text-xs font-medium mb-4">
                            100% Natural · No Chemicals · Sun-Dried Goodness
                        </p>

                        {/* Animated slide product */}
                        <div
                            className="transition-all duration-300"
                            style={{
                                opacity: animating ? 0 : 1,
                                transform: animating ? 'translateX(-12px)' : 'translateX(0)',
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="flex items-center justify-center w-8 h-8 rounded-full text-lg"
                                    style={{ background: `${slide.color}33`, border: `1.5px solid ${slide.color}66` }}
                                >
                                    {slide.emoji}
                                </span>
                                <div>
                                    <p className="text-white font-bold text-sm leading-tight">{slide.headline}</p>
                                    <p className="text-white/50 text-xs">{slide.sub}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dot indicators */}
                        <div className="flex gap-1.5 mt-3">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    className="rounded-full transition-all duration-300"
                                    style={{
                                        width: i === active ? '20px' : '6px',
                                        height: '6px',
                                        background: i === active ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                                    }}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right – 3 floating product circles */}
                    <div className="flex flex-col gap-2 items-center shrink-0">
                        {slides.map((s, i) => (
                            <div
                                key={i}
                                onClick={() => setActive(i)}
                                className="cursor-pointer transition-all duration-300"
                                style={{
                                    transform: i === active ? 'scale(1.15)' : 'scale(0.9)',
                                    opacity: i === active ? 1 : 0.5,
                                    animation: i === active ? 'ralos-float 3s ease-in-out infinite' : 'none',
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                    style={{
                                        background: `radial-gradient(circle at 35% 35%, ${s.color}55, ${s.color}22)`,
                                        border: `2px solid ${s.color}${i === active ? 'cc' : '44'}`,
                                        boxShadow: i === active ? `0 0 16px ${s.color}66` : 'none',
                                    }}
                                >
                                    {s.emoji}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Discount badge + CTA */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 rounded-lg px-2.5 py-1">
                        <span className="text-green-400 text-xs font-black">15% OFF</span>
                        <span className="text-green-400/60 text-xs">Flat Discount</span>
                    </div>
                    <div className="text-white/30 text-xs">on all RaloS products</div>
                </div>
            </div>

            {/* Keyframes injected via style tag */}
            <style>{`
                @keyframes ralos-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes ralos-pulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(251,146,60,0.7)); }
                    50%       { transform: scale(1.15); filter: drop-shadow(0 0 14px rgba(251,146,60,1)); }
                }
                @keyframes ralos-float {
                    0%, 100% { transform: scale(1.15) translateY(0px); }
                    50%       { transform: scale(1.15) translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
