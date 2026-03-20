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
    const logoSrc = brand.logoImage || '/images/ralos/ralos-transparent.png';

    return (
        <Link
            ref={bannerRef}
            href={brand.brandPagePath}
            className="block relative overflow-hidden rounded-2xl md:rounded-3xl mb-4 select-none cursor-pointer group"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}
        >
            {/* HD nature background */}
            <div className="absolute inset-0 z-0">
                <img
                    alt=""
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=90&fit=crop&auto=format"
                />
                {/* Warm cream/amber overlay so black logo is crisp */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,250,240,0.93) 0%, rgba(255,245,225,0.88) 30%, rgba(255,240,210,0.72) 55%, rgba(250,235,195,0.5) 100%)',
                    }}
                />
            </div>

            {/* Subtle warm sun rays */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute"
                    style={{
                        top: '-30%',
                        right: '-10%',
                        width: '500px',
                        height: '500px',
                        background: 'conic-gradient(from 200deg, transparent 0deg, rgba(200,160,50,0.05) 15deg, transparent 30deg, rgba(180,140,30,0.04) 45deg, transparent 60deg)',
                        animation: 'fb-sunrays 20s linear infinite',
                    }}
                />
                {/* Warm glow */}
                <div
                    className="absolute rounded-full"
                    style={{
                        top: '-15%',
                        right: '5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(220,180,60,0.12) 0%, rgba(200,160,40,0.05) 40%, transparent 70%)',
                        animation: 'fb-pulse 4s ease-in-out infinite',
                    }}
                />
                {/* Floating leaf accents */}
                <div className="absolute text-2xl opacity-[0.12]" style={{ top: '15%', right: '12%', animation: 'fb-leaf1 6s ease-in-out infinite' }}>🍃</div>
                <div className="absolute text-lg opacity-[0.08]" style={{ top: '60%', right: '25%', animation: 'fb-leaf2 8s ease-in-out infinite' }}>🌿</div>
            </div>

            {/* Diagonal stripes */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(135deg, transparent, transparent 80px, rgba(180,140,50,0.025) 80px, rgba(180,140,50,0.025) 82px)',
                }}
            />

            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(180,140,50,0.35) 25%, rgba(45,90,39,0.3) 50%, rgba(180,140,50,0.2) 75%, transparent 100%)',
                    animation: 'fb-shimmer 3s ease-in-out infinite',
                }}
            />

            <div className="relative z-10 p-5 md:p-7">
                <div className="flex items-start justify-between gap-4">
                    {/* Left content */}
                    <div className="flex-1 min-w-0">
                        {/* Featured Badge */}
                        <div
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
                            style={{
                                background: 'linear-gradient(135deg, rgba(45,90,39,0.1), rgba(180,140,50,0.08))',
                                border: '1px solid rgba(45,90,39,0.25)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <span style={{ fontSize: '10px', color: '#2D5A27' }}>★</span>
                            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#2D5A27' }}>Featured Brand</span>
                        </div>

                        {/* Logo – ralos-transparent.png */}
                        <div className="mb-3">
                            <img
                                alt={brand.name}
                                className="h-14 md:h-20 w-auto object-contain"
                                src={logoSrc}
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))' }}
                            />
                        </div>

                        <p className="text-sm font-semibold mb-5" style={{ color: '#6b5c2a' }}>{brand.tagline}</p>

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
                                        background: `linear-gradient(135deg, ${slide.color}22, ${slide.color}0a)`,
                                        border: `1.5px solid ${slide.color}44`,
                                        boxShadow: `0 4px 16px ${slide.color}18`,
                                    }}
                                >
                                    {slide.emoji}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm md:text-[15px] leading-tight truncate" style={{ color: '#1a1a1a' }}>{slide.headline}</p>
                                    <p className="text-xs truncate" style={{ color: '#7a6e50' }}>{slide.sub}</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress indicators */}
                        {slides.length > 1 && (
                            <div className="flex gap-2 mt-4">
                                {slides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                                        className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
                                        style={{
                                            width: i === active ? '28px' : '12px',
                                            background: 'rgba(0,0,0,0.08)',
                                        }}
                                        aria-label={`Slide ${i + 1}`}
                                    >
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: i === active
                                                    ? 'linear-gradient(90deg, #b8860b, #2D5A27)'
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

                    {/* Right – Solar dehydration illustration */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                        {/* Sun orb */}
                        <div className="relative">
                            <div
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
                                style={{
                                    background: 'radial-gradient(circle at 40% 40%, rgba(200,160,50,0.2), rgba(180,140,30,0.06))',
                                    border: '2px solid rgba(180,140,30,0.2)',
                                    boxShadow: '0 0 30px rgba(180,150,50,0.1), inset 0 0 20px rgba(200,170,50,0.05)',
                                    animation: 'fb-float 4s ease-in-out infinite',
                                }}
                            >
                                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: '#b8860b' }}>
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="4" strokeWidth="2" fill="rgba(184,134,11,0.15)" />
                                </svg>
                            </div>
                            <div
                                className="absolute -inset-2 rounded-full pointer-events-none"
                                style={{
                                    border: '1.5px dashed rgba(180,140,30,0.15)',
                                    animation: 'fb-ring 8s linear infinite',
                                }}
                            />
                        </div>

                        {/* Arrow */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-[1px] h-4" style={{ background: 'linear-gradient(to bottom, rgba(180,140,30,0.25), transparent)' }} />
                            <svg className="w-4 h-4" style={{ color: 'rgba(180,140,30,0.2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                        </div>

                        {/* Product orb */}
                        <div
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, ${slide.color}30, ${slide.color}0a)`,
                                border: `2px solid ${slide.color}33`,
                                boxShadow: `0 0 20px ${slide.color}15`,
                                transition: 'all 0.35s ease',
                            }}
                        >
                            {slide.emoji}
                        </div>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(45,90,39,0.1), rgba(180,140,30,0.06))',
                                border: '1px solid rgba(45,90,39,0.2)',
                            }}
                        >
                            <span className="text-xs font-black" style={{ color: '#2D5A27' }}>{brand.discountLabel}</span>
                            <span className="text-xs" style={{ color: '#6b5c2a' }}>{brand.discountSub}</span>
                        </div>
                        <span className="text-xs" style={{ color: '#8a7e60' }}>{brand.productCount} products</span>
                    </div>
                    <div
                        className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:gap-2.5"
                        style={{ color: '#2D5A27' }}
                    >
                        <span>View Brand</span>
                        <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fb-sunrays {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes fb-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50%      { transform: scale(1.15); opacity: 1; }
                }
                @keyframes fb-leaf1 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50%      { transform: translate(-8px, 6px) rotate(15deg); }
                }
                @keyframes fb-leaf2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50%      { transform: translate(10px, -8px) rotate(-10deg); }
                }
                @keyframes fb-float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-6px); }
                }
                @keyframes fb-ring {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes fb-shimmer {
                    0%, 100% { opacity: 0.3; }
                    50%      { opacity: 1; }
                }
            `}</style>
        </Link>
    );
}
