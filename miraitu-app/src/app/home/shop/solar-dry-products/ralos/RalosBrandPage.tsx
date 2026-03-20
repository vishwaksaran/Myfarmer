'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useCart } from '@/context/CartContext';
import { categoryProducts } from '../../categoryData';

const products = categoryProducts['solar-dry-products'] || [];

const trustItems = [
    { icon: '☀️', label: 'Solar Dehydrated' },
    { icon: '🌿', label: '100% Organic Herbs' },
    { icon: '🧪', label: 'Zero Preservatives' },
    { icon: '🏆', label: 'FSSAI Certified' },
];

const stats = [
    { value: '19+', label: 'Products' },
    { value: '25+', label: 'Herbs Used' },
    { value: '5+', label: 'Years Trusted' },
    { value: '10k+', label: 'Happy Customers' },
];

/* ── Scroll-reveal hook ──────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, visible };
}

type SortOption = 'all' | 'popular' | 'price-low' | 'price-high' | 'rating';

const parsePrice = (p: string) => {
    const num = p.replace(/[₹,]/g, '');
    return parseFloat(num) || 0;
};

export default function RalosBrandPage() {
    const { quantities, addItem, removeItem } = useCart();
    const [showAll, setShowAll] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('all');

    const sorted = (() => {
        const list = [...products];
        switch (sortBy) {
            case 'price-low': return list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            case 'price-high': return list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            case 'rating': return list.sort((a, b) => b.rating - a.rating);
            case 'popular': return list.sort((a, b) => b.reviews - a.reviews);
            default: return list;
        }
    })();
    const displayed = showAll ? sorted : sorted.slice(0, 8);

    const hero = useReveal(0.1);
    const trust = useReveal();
    const about = useReveal();
    const ribbon = useReveal();
    const grid = useReveal(0.05);
    const cta = useReveal();

    return (
        <div className="min-h-screen bg-[#f4f7fa]">
            <Header />

            <main>
                {/* ── HERO ─────────────────────────────────────────── */}
                <section
                    ref={hero.ref}
                    className="relative w-full min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden"
                >
                    {/* Background Image – High-res solar farm scene */}
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Solar powered tunnel dryer for natural food processing"
                            className="w-full h-full object-cover"
                            src="/images/ralos/Bg-ralos.png"
                        />
                        {/* Light overlay for airy feel + logo contrast */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.05) 100%)',
                            }}
                        />
                    </div>

                    {/* Main Content */}
                    <div
                        className="relative z-10 container mx-auto px-4 md:px-6 py-10 md:py-20 flex flex-col items-center text-center max-w-7xl"
                        style={{
                            opacity: hero.visible ? 1 : 0,
                            transform: hero.visible ? 'translateY(0)' : 'translateY(40px)',
                            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    >
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 text-xs mb-4 md:mb-8 flex-wrap justify-center">
                            <Link href="/home" className="text-gray-500 hover:text-gray-800 transition-colors font-medium">Home</Link>
                            <span className="text-gray-400">›</span>
                            <Link href="/home/shop" className="text-gray-500 hover:text-gray-800 transition-colors font-medium">Shop</Link>
                            <span className="text-gray-400">›</span>
                            <Link href="/home/shop/solar-dry-products" className="text-gray-500 hover:text-gray-800 transition-colors font-medium">Solar Dry Products</Link>
                            <span className="text-gray-400">›</span>
                            <span className="font-bold text-gray-900">RaloS</span>
                        </nav>

                        {/* Logo Image */}
                        <div className="mb-4 md:mb-12 transform transition-transform hover:scale-105 duration-500">
                            <img
                                alt="RaloS Logo"
                                className="h-20 md:h-44 xl:h-52 w-auto object-contain"
                                src="/images/ralos/ralos-transparent.png"
                                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25)) drop-shadow(0 0 30px rgba(255,255,255,0.5))' }}
                            />
                        </div>

                        {/* Tagline */}
                        <div className="mb-6 md:mb-12 xl:mb-16">
                            <h2 className="text-gray-900 text-sm md:text-2xl xl:text-3xl font-extrabold tracking-widest drop-shadow-sm" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                <span>100% Natural</span>
                                <span className="mx-2 md:mx-4 text-orange-500 font-black">•</span>
                                <span>Solar Dried</span>
                                <span className="mx-2 md:mx-4 text-orange-500 font-black">•</span>
                                <span>Zero Chemicals</span>
                            </h2>
                        </div>

                        {/* CTA Button – Skeuomorphic */}
                        <div className="mb-8 md:mb-24 xl:mb-32">
                            <a
                                href="#products"
                                className="relative overflow-hidden inline-flex items-center gap-2 md:gap-3 px-8 py-3 md:px-14 md:py-6 rounded-full text-white text-base md:text-xl xl:text-2xl font-bold uppercase tracking-wider group"
                                style={{
                                    background: 'linear-gradient(180deg, #3d7a35 0%, #2D5A27 100%)',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
                                    border: '1px solid #1e3d1a',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                }}
                            >
                                <span>Shop Now</span>
                                <span
                                    className="absolute top-0 left-[-100%] w-full h-full pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                        transition: '0.5s',
                                    }}
                                />
                                <svg className="h-6 w-6 xl:h-8 xl:w-8 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                                </svg>
                            </a>
                        </div>

                        {/* Trust Badges – Glassmorphism */}
                        <div className="grid grid-cols-3 gap-3 md:gap-12 xl:gap-20 w-full max-w-md md:max-w-none">
                            {[
                                {
                                    label: 'Solar\nDehydrated',
                                    bgColor: 'bg-yellow-500',
                                    icon: (
                                        <svg className="h-5 w-5 md:h-8 md:w-8 xl:h-10 xl:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: '100%\nOrganic',
                                    bgColor: 'bg-green-600',
                                    icon: (
                                        <svg className="h-5 w-5 md:h-8 md:w-8 xl:h-10 xl:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'FSSAI\nCertified',
                                    bgColor: 'bg-blue-600',
                                    icon: (
                                        <svg className="h-5 w-5 md:h-8 md:w-8 xl:h-10 xl:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                    ),
                                },
                            ].map((badge, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center w-full aspect-square max-w-[10rem] md:w-40 md:h-40 xl:w-48 xl:h-48 rounded-2xl md:rounded-[2.5rem] hover:bg-white/60 transition-all group mx-auto"
                                    style={{
                                        background: 'rgba(255,255,255,0.4)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.6)',
                                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <div className={`mb-2 md:mb-4 p-2.5 md:p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform ${badge.bgColor}`}>
                                        {badge.icon}
                                    </div>
                                    <span className="text-[10px] md:text-xs xl:text-sm font-extrabold text-gray-800 text-center leading-tight whitespace-pre-line">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Decorative bottom curve */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
                        <svg className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
                            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF" />
                        </svg>
                    </div>
                </section>

                {/* ── TRUST BAR ────────────────────────────────────── */}
                <div
                    ref={trust.ref}
                    className="bg-white"
                >
                    <div
                        className="mx-auto max-w-[1280px] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between md:justify-around gap-3 md:gap-4 overflow-x-auto scrollbar-hide"
                        style={{
                            opacity: trust.visible ? 1 : 0,
                            transform: trust.visible ? 'translateY(0)' : 'translateY(15px)',
                            transition: 'all 0.6s ease-out 0.1s',
                        }}
                    >
                        {trustItems.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 whitespace-nowrap" style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="text-base">{t.icon}</span>
                                <span className="text-xs font-semibold text-gray-600">{t.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── ABOUT + STATS ─────────────────────────────────── */}
                <section ref={about.ref} className="bg-white py-12 md:py-16">
                    <div
                        className="mx-auto max-w-[1280px] px-4 md:px-8"
                        style={{
                            opacity: about.visible ? 1 : 0,
                            transform: about.visible ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s',
                        }}
                    >
                        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#16a34a' }}>
                                    <span className="w-6 h-0.5 rounded" style={{ background: '#22c55e' }} />
                                    About the Brand
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                                    Nature&apos;s Healing Power,<br />
                                    <span style={{ color: '#15803d' }}>Delivered to You</span>
                                </h2>
                                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-5">
                                    RaloS brings the ancient wisdom of Ayurvedic herbs with modern solar dehydration technology. Every product is handpicked, sun-dried naturally, and packed without any artificial preservatives or chemicals — preserving the full nutritional value of each herb.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['☀️ Solar Dried', '🌿 Organic Herbs', '🧪 No Preservatives', '🍃 Farm Direct'].map(pill => (
                                        <span key={pill} className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                                            style={{ borderColor: 'rgba(34,197,94,0.2)', color: '#15803d', background: 'rgba(34,197,94,0.05)' }}>
                                            {pill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((s, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl p-5 text-center border transition-all hover:shadow-lg hover:-translate-y-0.5"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(34,197,94,0.03), rgba(163,230,53,0.03))',
                                            borderColor: 'rgba(34,197,94,0.12)',
                                            opacity: about.visible ? 1 : 0,
                                            transform: about.visible ? 'scale(1)' : 'scale(0.9)',
                                            transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.1}s`,
                                        }}
                                    >
                                        <div className="text-3xl font-black mb-1" style={{ color: '#16a34a' }}>{s.value}</div>
                                        <div className="text-gray-500 text-sm font-medium">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── DISCOUNT RIBBON ──────────────────────────────── */}
                <div
                    ref={ribbon.ref}
                    className="relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, #16a34a, #22c55e, #a3e635, #22c55e, #16a34a)',
                        backgroundSize: '300% 100%',
                        animation: 'r-ribbon 4s linear infinite',
                    }}
                >
                    <div
                        className="mx-auto max-w-[1280px] px-4 py-3.5 text-center"
                        style={{
                            opacity: ribbon.visible ? 1 : 0,
                            transition: 'opacity 0.5s ease-out',
                        }}
                    >
                        <span className="text-sm md:text-base font-black" style={{ color: '#052e16' }}>
                            🎉 Flat 15% Off on All RaloS Products — No Coupon Needed!
                        </span>
                    </div>
                </div>

                {/* ── PRODUCTS GRID ─────────────────────────────────── */}
                <section ref={grid.ref} id="products" className="py-12 md:py-16 bg-[#f4f7fa]">
                    <div className="mx-auto max-w-[1280px] px-4 md:px-8">
                        <div
                            className="flex items-center justify-between mb-8"
                            style={{
                                opacity: grid.visible ? 1 : 0,
                                transform: grid.visible ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.6s ease-out',
                            }}
                        >
                            <div>
                                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#16a34a' }}>
                                    <span className="w-6 h-0.5 rounded" style={{ background: '#22c55e' }} />
                                    Our Collection
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">All RaloS Products</h2>
                            </div>
                            <span className="text-sm text-gray-400">{products.length} products</span>
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex gap-2.5 mb-6 overflow-x-auto py-2 px-1 -mx-1 scrollbar-hide">
                            {([
                                { key: 'all', label: 'All' },
                                { key: 'popular', label: 'Popular' },
                                { key: 'price-low', label: 'Price Low to High' },
                                { key: 'price-high', label: 'Price High to Low' },
                                { key: 'rating', label: 'Top Rated' },
                            ] as { key: SortOption; label: string }[]).map(s => (
                                <button
                                    key={s.key}
                                    onClick={() => setSortBy(s.key)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${sortBy === s.key
                                        ? 'bg-white shadow-md border-emerald-400 text-emerald-700'
                                        : 'bg-white/80 border-gray-200 text-gray-500 hover:bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                            {displayed.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="group bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    style={{
                                        borderColor: '#e8edf3',
                                        opacity: grid.visible ? 1 : 0,
                                        transform: grid.visible ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.97)',
                                        transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.min(idx * 0.06, 0.4)}s`,
                                    }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden" style={{ background: '#ffffff' }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className={`w-full h-full ${product.imageFit === 'cover' ? 'object-cover' : 'object-contain p-2'} group-hover:scale-105 transition-transform duration-500`}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ imageRendering: 'auto', WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
                                        />
                                        {product.badge && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 text-white text-xs font-bold rounded-lg" style={{ background: '#16a34a' }}>
                                                {product.badge}
                                            </span>
                                        )}
                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                                            15% OFF
                                        </span>
                                        {product.weight && (
                                            <span className="absolute bottom-2 left-2 px-2.5 py-1 text-[11px] font-extrabold rounded-full backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                {product.weight}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 min-h-[36px] mb-1">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mb-2">{product.description}</p>

                                        <div className="flex items-center gap-1.5 mb-3">
                                            <span className="font-black text-base" style={{ color: '#059669' }}>{product.price}</span>
                                            <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                                        </div>

                                        {(quantities[product.id] || 0) > 0 ? (
                                            <div className="w-full flex items-center justify-between rounded-xl overflow-hidden" style={{ background: '#16a34a' }}>
                                                <button onClick={() => removeItem(product.id)} className="px-4 py-2 font-black text-white hover:bg-black/10 text-lg">−</button>
                                                <span className="font-black text-white text-sm">{quantities[product.id]}</span>
                                                <button onClick={() => addItem(product.id)} className="px-4 py-2 font-black text-white hover:bg-black/10 text-lg">+</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addItem(product.id)}
                                                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-md active:scale-95"
                                                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#052e16' }}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!showAll && products.length > 8 && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-base transition-all hover:shadow-lg hover:gap-4 active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#052e16', boxShadow: '0 6px 28px rgba(34,197,94,0.3)' }}
                                >
                                    View All {products.length} Products
                                    <span className="text-lg">→</span>
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── CTA BANNER ────────────────────────────────────── */}
                <section
                    ref={cta.ref}
                    className="relative py-14 md:py-20 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0f1f13 0%, #132a17 30%, #1a3620 60%, #1e4028 100%)' }}
                >
                    {/* CTA aurora */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute w-[400px] h-[400px] rounded-full"
                            style={{ top: '-20%', left: '10%', background: 'radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 60%)', animation: 'r-aurora1 8s ease-in-out infinite' }} />
                        <div className="absolute w-[300px] h-[300px] rounded-full"
                            style={{ bottom: '-15%', right: '15%', background: 'radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 60%)', animation: 'r-aurora2 10s ease-in-out infinite' }} />
                    </div>

                    <div
                        className="relative z-10 mx-auto max-w-[1280px] px-4 text-center"
                        style={{
                            opacity: cta.visible ? 1 : 0,
                            transform: cta.visible ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    >
                        <div className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(163,230,53,0.5)' }}>Ready to transform your wellness?</div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-7">
                            Shop the complete RaloS collection
                        </h3>
                        <Link
                            href="/home/shop/solar-dry-products"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base transition-all hover:brightness-110 hover:gap-3 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0f1f13', boxShadow: '0 6px 24px rgba(74,222,128,0.3)' }}
                        >
                            ← Back to Solar Dry Products
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />

            <style>{`
                @keyframes r-aurora1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%      { transform: translate(-25px, 15px) scale(1.1); }
                    66%      { transform: translate(15px, -10px) scale(0.95); }
                }
                @keyframes r-aurora2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50%      { transform: translate(35px, -18px) scale(1.12); }
                }
                @keyframes r-aurora3 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    50%      { transform: translate(-18px, 12px) scale(1.18); opacity: 1; }
                }
                @keyframes r-glow {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(251,191,36,0.6)); }
                    50%      { transform: scale(1.12); filter: drop-shadow(0 0 22px rgba(251,191,36,1)); }
                }
                @keyframes r-float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-8px); }
                }
                @keyframes r-ring {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes r-shimmer {
                    0%, 100% { opacity: 0.4; }
                    50%      { opacity: 1; }
                }
                @keyframes r-ribbon {
                    0%   { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
            `}</style>
        </div>
    );
}
