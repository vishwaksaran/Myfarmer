'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
    {
        headline: 'Moringa Powder',
        description: '100% Natural, No Chemicals, Sun-Dried Goodness straight from our certified organic solar farms. Lock in the vibrant energy of nature.',
        emoji: '🌿',
        color: '#22863a',
        image: 'https://ralos.in/wp-content/uploads/2025/12/IMG-20250826-WA0003.jpg',
        price: '₹187',
    },
    {
        headline: 'Amla Powder',
        description: 'Nature\'s Vitamin C Powerhouse — solar dehydrated to preserve full nutritional value. Zero preservatives, pure Ayurvedic goodness.',
        emoji: '🫐',
        color: '#7c3d8e',
        image: 'https://ralos.in/wp-content/uploads/2025/12/20251221_171527-scaled.jpg',
        price: '₹187',
    },
    {
        headline: 'Herbal Tea',
        description: 'Ashwagandha, Shatavari & Yashtimadhu — a Vedic Kada blend for immunity and wellness. Handpicked, sun-dried, and chemical-free.',
        emoji: '🍵',
        color: '#b45309',
        image: '/images/ralos/herbal-tea.png',
        price: '₹213',
    },
];

export default function RalosBanner() {
    const [active, setActive] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    // Intersection observer for entrance animation
    useEffect(() => {
        const el = bannerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        const t = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setActive(prev => (prev + 1) % slides.length);
                setAnimating(false);
            }, 400);
        }, 4000);
        return () => clearInterval(t);
    }, []);

    const slide = slides[active];

    return (
        <div
            ref={bannerRef}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl mb-6 select-none"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            }}
        >
            {/* Background Image – HD farm field */}
            <div className="absolute inset-0 z-0">
                <img
                    alt="Organic farm field"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=90&fit=crop&auto=format"
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 55%, rgba(255,255,255,0.2) 100%)',
                    }}
                />
            </div>

            <div className="relative z-10 p-5 md:p-8">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-orange-500">
                                New Arrival
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-green-600">
                                Featured
                            </span>
                        </div>

                        {/* Headline with animated slide */}
                        <div
                            className="transition-all duration-400"
                            style={{
                                opacity: animating ? 0 : 1,
                                transform: animating ? 'translateY(10px)' : 'translateY(0)',
                                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        >
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-2">
                                <span className="text-gray-900">Solar Dried</span>
                                <br />
                                <span
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: 'linear-gradient(135deg, #16a34a 0%, #ea580c 100%)',
                                    }}
                                >
                                    {slide.headline}
                                </span>
                            </h2>

                            <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4 max-w-sm line-clamp-2">
                                {slide.description}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-3 mb-4">
                            <Link
                                href="/home/shop/solar-dry-products/ralos"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider"
                                style={{
                                    background: 'linear-gradient(180deg, #3d7a35 0%, #2D5A27 100%)',
                                    boxShadow: '0 4px 12px rgba(45,90,39,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                                    border: '1px solid #1e3d1a',
                                }}
                            >
                                Shop Now
                                <span>🛒</span>
                            </Link>
                            <Link
                                href="/home/shop/solar-dry-products/ralos"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-colors bg-white/60 backdrop-blur-sm"
                            >
                                View Brand
                            </Link>
                        </div>

                        {/* Trust Badges Row */}
                        <div className="flex items-center gap-4">
                            {[
                                { icon: '☀️', label: 'Solar Dehydrated', color: '#eab308' },
                                { icon: '🌿', label: '100% Organic', color: '#16a34a' },
                                { icon: '🛡️', label: 'FSSAI Certified', color: '#2563eb' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <span
                                        className="flex items-center justify-center w-5 h-5 rounded-full text-[10px]"
                                        style={{ background: `${badge.color}22`, border: `1px solid ${badge.color}44` }}
                                    >
                                        {badge.icon}
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-600">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right – Product Image Card */}
                    <div className="shrink-0 hidden sm:block">
                        <div
                            className="relative w-40 h-44 md:w-52 md:h-56 rounded-2xl overflow-hidden shadow-xl"
                            style={{
                                border: '3px solid rgba(255,255,255,0.7)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            }}
                        >
                            <div
                                className="w-full h-full transition-all duration-500"
                                style={{
                                    opacity: animating ? 0 : 1,
                                    transform: animating ? 'scale(0.95)' : 'scale(1)',
                                }}
                            >
                                <img
                                    alt={slide.headline}
                                    className="w-full h-full object-cover"
                                    src={slide.image}
                                />
                            </div>
                            {/* Price Tag */}
                            <div
                                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-white text-xs font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                                    boxShadow: '0 2px 8px rgba(234,88,12,0.4)',
                                }}
                            >
                                <span className="text-[8px] font-medium block leading-none opacity-80">STARTS AT</span>
                                <span className="text-sm font-black leading-none">{slide.price}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile – Smaller product image */}
                    <div className="shrink-0 sm:hidden">
                        <div
                            className="relative w-28 h-32 rounded-xl overflow-hidden shadow-lg"
                            style={{
                                border: '2px solid rgba(255,255,255,0.7)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            }}
                        >
                            <div
                                className="w-full h-full transition-all duration-500"
                                style={{
                                    opacity: animating ? 0 : 1,
                                    transform: animating ? 'scale(0.95)' : 'scale(1)',
                                }}
                            >
                                <img
                                    alt={slide.headline}
                                    className="w-full h-full object-cover"
                                    src={slide.image}
                                />
                            </div>
                            {/* Price Tag */}
                            <div
                                className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                                    boxShadow: '0 2px 6px rgba(234,88,12,0.3)',
                                }}
                            >
                                <span className="text-[7px] font-medium block leading-none opacity-80">STARTS AT</span>
                                <span className="text-xs font-black leading-none">{slide.price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RaloS Logo + Dot indicators row */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <img
                            alt="RaloS"
                            className="h-6 md:h-8 w-auto object-contain"
                            src="/images/ralos/ralos-transparent.png"
                        />
                        <div className="flex gap-1.5">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setAnimating(true); setTimeout(() => { setActive(i); setAnimating(false); }, 400); }}
                                    className="rounded-full transition-all duration-300"
                                    style={{
                                        width: i === active ? '18px' : '6px',
                                        height: '6px',
                                        background: i === active ? '#16a34a' : 'rgba(0,0,0,0.15)',
                                    }}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 rounded-lg px-2.5 py-1">
                        <span className="text-green-600 text-[10px] font-black">15% OFF</span>
                        <span className="text-green-600/60 text-[10px]">Flat Discount</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
