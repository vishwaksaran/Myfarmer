'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { FeaturedBrand } from '@/app/home/shop/categoryData';

interface Props {
    brand: FeaturedBrand;
}

export default function FeaturedBrandBanner({ brand }: Props) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const bannerRef = useRef<HTMLAnchorElement>(null);

    const { slides } = brand;

    // Intersection observer for entrance animation
    useEffect(() => {
        const el = bannerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        if (slides.length <= 1) return;
        const t = setInterval(() => {
            setDirection('next');
            setIsTransitioning(true);
            setTimeout(() => {
                setActive(prev => (prev + 1) % slides.length);
                setIsTransitioning(false);
            }, 350);
        }, 3600);
        return () => clearInterval(t);
    }, [slides.length]);

    const goTo = (i: number) => {
        if (i === active) return;
        setDirection(i > active ? 'next' : 'prev');
        setIsTransitioning(true);
        setTimeout(() => { setActive(i); setIsTransitioning(false); }, 350);
    };

    const slide = slides[active];

    return (
        <Link
            ref={bannerRef}
            href={brand.brandPagePath}
            className="block relative overflow-hidden rounded-2xl md:rounded-3xl mb-4 select-none cursor-pointer group"
            style={{
                background: 'linear-gradient(135deg, #0f1f13 0%, #132a17 30%, #1a3620 60%, #1e4028 100%)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}
        >
            {/* Animated aurora mesh background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
                    style={{
                        top: '-40%', right: '-20%',
                        background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, rgba(34,197,94,0.06) 40%, transparent 70%)',
                        animation: 'fb-aurora1 8s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full"
                    style={{
                        bottom: '-30%', left: '-15%',
                        background: 'radial-gradient(circle, rgba(250,204,21,0.10) 0%, rgba(234,179,8,0.05) 40%, transparent 70%)',
                        animation: 'fb-aurora2 10s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute w-[300px] h-[300px] rounded-full"
                    style={{
                        top: '20%', left: '40%',
                        background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 60%)',
                        animation: 'fb-aurora3 12s ease-in-out infinite',
                    }}
                />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.4) 30%, rgba(250,204,21,0.4) 50%, rgba(163,230,53,0.3) 70%, transparent 100%)',
                    animation: 'fb-shimmer 4s ease-in-out infinite',
                }}
            />

            <div className="relative z-10 p-5 md:p-7">
                {/* Featured Badge */}
                <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(250,204,21,0.15))',
                        border: '1px solid rgba(74,222,128,0.25)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <span style={{ fontSize: '10px', color: '#4ade80' }}>★</span>
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#4ade80' }}>Featured Brand</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                        {/* Logo */}
                        <div className="flex items-center gap-0 mb-1.5">
                            <span className="font-black text-white tracking-tight" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
                                {brand.logoText[0]}
                            </span>
                            <span
                                className="inline-flex items-center justify-center mx-0.5"
                                style={{
                                    fontSize: '2rem',
                                    animation: 'fb-glow 3s ease-in-out infinite',
                                    filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))',
                                }}
                            >
                                {brand.logoIcon}
                            </span>
                            <span className="font-black text-white tracking-tight" style={{ fontSize: '2.2rem' }}>
                                {brand.logoText[1]}
                            </span>
                            <span className="text-white/40 text-[10px] ml-1 mt-1.5 self-start font-medium">™</span>
                        </div>

                        <p className="text-sm md:text-xs font-medium mb-5" style={{ color: 'rgba(163,230,53,0.6)' }}>{brand.tagline}</p>

                        {/* Animated product slide */}
                        <div
                            style={{
                                opacity: isTransitioning ? 0 : 1,
                                transform: isTransitioning
                                    ? `translateX(${direction === 'next' ? '-20px' : '20px'})`
                                    : 'translateX(0)',
                                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <span
                                    className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${slide.color}33, ${slide.color}11)`,
                                        border: `1.5px solid ${slide.color}55`,
                                        boxShadow: `0 4px 12px ${slide.color}22`,
                                    }}
                                >
                                    {slide.emoji}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-white font-bold text-sm md:text-[15px] leading-tight truncate">{slide.headline}</p>
                                    <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,0.7)' }}>{slide.sub}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar indicators */}
                        {slides.length > 1 && (
                            <div className="flex gap-2 mt-4">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                                        className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
                                        style={{
                                            width: i === active ? '28px' : '12px',
                                            background: 'rgba(255,255,255,0.1)',
                                        }}
                                        aria-label={`Slide ${i + 1}`}
                                    >
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: i === active
                                                    ? 'linear-gradient(90deg, #38bdf8, #34d399)'
                                                    : 'transparent',
                                                transform: i === active ? 'scaleX(1)' : 'scaleX(0)',
                                                transformOrigin: 'left',
                                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right – product orbs with ring animation */}
                    <div className="flex flex-col gap-3 items-center shrink-0">
                        {slides.map((s, i) => (
                            <div
                                key={i}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                                className="cursor-pointer relative"
                                style={{
                                    transform: i === active ? 'scale(1.1)' : 'scale(0.85)',
                                    opacity: i === active ? 1 : 0.4,
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}
                            >
                                {/* Rotating ring for active */}
                                {i === active && (
                                    <div
                                        className="absolute -inset-1 rounded-full pointer-events-none"
                                        style={{
                                            border: '2px dashed transparent',
                                            borderTopColor: `${s.color}aa`,
                                            borderRightColor: `${s.color}44`,
                                            animation: 'fb-ring 3s linear infinite',
                                        }}
                                    />
                                )}
                                <div
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl relative"
                                    style={{
                                        background: `radial-gradient(circle at 30% 30%, ${s.color}44, ${s.color}11)`,
                                        border: `2px solid ${s.color}${i === active ? '88' : '22'}`,
                                        boxShadow: i === active
                                            ? `0 0 20px ${s.color}44, inset 0 0 12px ${s.color}11`
                                            : 'none',
                                        animation: i === active ? 'fb-float 3s ease-in-out infinite' : 'none',
                                    }}
                                >
                                    {s.emoji}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom row: discount + navigate hint */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.08))',
                                border: '1px solid rgba(52,211,153,0.3)',
                            }}
                        >
                            <span className="text-xs font-black" style={{ color: '#34d399' }}>{brand.discountLabel}</span>
                            <span className="text-xs" style={{ color: 'rgba(52,211,153,0.6)' }}>{brand.discountSub}</span>
                        </div>
                        <span className="text-white/25 text-xs">{brand.productCount} products</span>
                    </div>
                    <div
                        className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                        style={{ color: 'rgba(74,222,128,0.7)' }}
                    >
                        <span>View Brand</span>
                        <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fb-aurora1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%      { transform: translate(-30px, 20px) scale(1.1); }
                    66%      { transform: translate(20px, -10px) scale(0.95); }
                }
                @keyframes fb-aurora2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%      { transform: translate(40px, -20px) scale(1.15); }
                }
                @keyframes fb-aurora3 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    50%      { transform: translate(-20px, 15px) scale(1.2); opacity: 1; }
                }
                @keyframes fb-glow {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(251,191,36,0.6)); }
                    50%      { transform: scale(1.1); filter: drop-shadow(0 0 18px rgba(251,191,36,1)); }
                }
                @keyframes fb-float {
                    0%, 100% { transform: scale(1.1) translateY(0); }
                    50%      { transform: scale(1.1) translateY(-5px); }
                }
                @keyframes fb-ring {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes fb-shimmer {
                    0%, 100% { opacity: 0.4; }
                    50%      { opacity: 1; }
                }
            `}</style>
        </Link>
    );
}
