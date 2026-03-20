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
                    className="relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0f1f13 0%, #132a17 30%, #1a3620 60%, #1e4028 100%)' }}
                >
                    {/* Aurora blobs */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full"
                            style={{ top: '-35%', right: '-15%', background: 'radial-gradient(circle, rgba(74,222,128,0.12) 0%, rgba(34,197,94,0.05) 40%, transparent 70%)', animation: 'r-aurora1 9s ease-in-out infinite' }} />
                        <div className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
                            style={{ bottom: '-30%', left: '-10%', background: 'radial-gradient(circle, rgba(250,204,21,0.10) 0%, rgba(234,179,8,0.04) 40%, transparent 70%)', animation: 'r-aurora2 11s ease-in-out infinite' }} />
                        <div className="absolute w-[350px] h-[350px] rounded-full"
                            style={{ top: '30%', left: '50%', background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 60%)', animation: 'r-aurora3 13s ease-in-out infinite' }} />
                    </div>

                    {/* Subtle grid */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                    {/* Top shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.4) 30%, rgba(250,204,21,0.4) 50%, rgba(163,230,53,0.3) 70%, transparent)', animation: 'r-shimmer 4s ease-in-out infinite' }} />

                    <div
                        className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-8 py-14 md:py-24"
                        style={{
                            opacity: hero.visible ? 1 : 0,
                            transform: hero.visible ? 'translateY(0)' : 'translateY(40px)',
                            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    >
                        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                            {/* Left */}
                            <div className="flex-1 text-center md:text-left">
                                <nav className="flex items-center gap-1 text-xs mb-6 justify-center md:justify-start flex-wrap">
                                    <Link href="/home" className="hover:text-emerald-300 transition-colors" style={{ color: 'rgba(74,222,128,0.5)' }}>Home</Link>
                                    <span className="text-white/20">›</span>
                                    <Link href="/home/shop" className="hover:text-emerald-300 transition-colors" style={{ color: 'rgba(74,222,128,0.5)' }}>Shop</Link>
                                    <span className="text-white/20">›</span>
                                    <Link href="/home/shop/solar-dry-products" className="hover:text-emerald-300 transition-colors" style={{ color: 'rgba(74,222,128,0.5)' }}>Solar Dry Products</Link>
                                    <span className="text-white/20">›</span>
                                    <span className="font-bold" style={{ color: '#4ade80' }}>RaloS</span>
                                </nav>

                                {/* Logo */}
                                <div className="flex items-center gap-1 justify-center md:justify-start mb-3">
                                    <span className="font-black text-white leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>Ral</span>
                                    <span className="leading-none"
                                        style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', animation: 'r-glow 3s ease-in-out infinite', filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.8))' }}>☀️</span>
                                    <span className="font-black text-white leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>S</span>
                                    <span className="text-white/35 text-sm ml-1 self-start mt-3 font-medium">™</span>
                                </div>

                                <p className="text-sm md:text-base font-medium mb-6 tracking-wide" style={{ color: 'rgba(163,230,53,0.6)' }}>
                                    100% Natural · Solar Dried · Zero Chemicals
                                </p>

                                <div className="flex items-center gap-3 mb-7 justify-center md:justify-start flex-wrap">
                                    <span className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                                        style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#86efac' }}>
                                        🌿 20 Products
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                                        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fcd34d' }}>
                                        ⭐ 4.8 Rated
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7' }}>
                                        🎉 15% OFF
                                    </span>
                                </div>

                                <a
                                    href="#products"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:gap-3 active:scale-95 group"
                                    style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0f1f13', boxShadow: '0 4px 24px rgba(74,222,128,0.3)' }}
                                >
                                    Shop Now
                                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </a>
                            </div>

                            {/* Right – Floating product circles */}
                            <div className="flex md:flex-col gap-5 md:gap-6 shrink-0">
                                {[
                                    { emoji: '🌿', name: 'Moringa', color: '#34d399' },
                                    { emoji: '🫐', name: 'Amla', color: '#a78bfa' },
                                    { emoji: '🍵', name: 'Vedic Kada', color: '#fbbf24' },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 relative"
                                        style={{ animation: `r-float ${3 + i * 0.6}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
                                    >
                                        {/* Rotating ring */}
                                        <div className="absolute -inset-1 rounded-2xl pointer-events-none"
                                            style={{ border: '1.5px dashed transparent', borderTopColor: `${item.color}55`, borderRightColor: `${item.color}22`, animation: `r-ring ${4 + i}s linear infinite` }} />
                                        <div
                                            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl relative"
                                            style={{
                                                background: `radial-gradient(circle at 30% 30%, ${item.color}33, ${item.color}0d)`,
                                                border: `1.5px solid ${item.color}44`,
                                                boxShadow: `0 0 24px ${item.color}22, inset 0 0 10px ${item.color}0a`,
                                            }}
                                        >
                                            {item.emoji}
                                        </div>
                                        <span className="text-xs font-medium hidden md:block" style={{ color: `${item.color}99` }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TRUST BAR ────────────────────────────────────── */}
                <div
                    ref={trust.ref}
                    style={{
                        background: 'linear-gradient(90deg, #0f1f13, #1a3620, #0f1f13)',
                        borderTop: '1px solid rgba(74,222,128,0.08)',
                        borderBottom: '1px solid rgba(74,222,128,0.08)',
                    }}
                >
                    <div
                        className="mx-auto max-w-[1280px] px-4 md:px-8 py-4 flex items-center justify-between md:justify-around gap-4 overflow-x-auto scrollbar-hide"
                        style={{
                            opacity: trust.visible ? 1 : 0,
                            transform: trust.visible ? 'translateY(0)' : 'translateY(15px)',
                            transition: 'all 0.6s ease-out 0.1s',
                        }}
                    >
                        {trustItems.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 whitespace-nowrap" style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="text-base">{t.icon}</span>
                                <span className="text-xs font-semibold" style={{ color: 'rgba(163,230,53,0.6)' }}>{t.label}</span>
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
                        <div className="flex gap-2 mb-6 overflow-x-auto p-1 -m-1 scrollbar-hide">
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
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${sortBy === s.key
                                            ? 'bg-white shadow-lg ring-2 ring-emerald-400 text-emerald-700'
                                            : 'bg-white/70 text-gray-500 hover:bg-white hover:shadow-sm'
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
                                            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-bold rounded-lg" style={{ background: 'rgba(0,0,0,0.7)', color: '#4ade80' }}>
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
