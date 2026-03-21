'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FeatureHighlight {
    icon: string;          // material-symbols name
    label: string;
}

export interface BannerSlide {
    image: string;          // hero tractor photo (dominant)
    title: string;
    subtitle: string;
    cta: string;
    ctaAction?: () => void;
    gradient?: string;      // fallback tint colour
    accent?: string;
    /** Stat numbers shown as animated counters */
    stats?: { label: string; value: string; suffix?: string }[];
    /** Floating tag chips (e.g. tech pack names) */
    tags?: string[];
    /** Circular feature highlights shown at the bottom (like the Swaraj brochure) */
    features?: FeatureHighlight[];
}

interface BrandBannerProps {
    brand: string;
    slides: BannerSlide[];
    autoPlayInterval?: number;
    brandColor?: string;
}

/* ── Animated stat counter ── */
function AnimatedStat({ value, suffix, label, delay }: { value: string; suffix?: string; label: string; delay: number }) {
    const numericVal = parseInt(value.replace(/[^0-9]/g, ''));
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(0);
        const timeout = setTimeout(() => {
            const steps = 30;
            const increment = numericVal / steps;
            let step = 0;
            const interval = setInterval(() => {
                step++;
                setCount(Math.min(Math.round(increment * step), numericVal));
                if (step >= steps) clearInterval(interval);
            }, 40);
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [numericVal, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
            className="text-center"
        >
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums drop-shadow-lg">
                {count}{suffix || ''}
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/70 uppercase tracking-wider mt-0.5 drop-shadow">{label}</div>
        </motion.div>
    );
}

/* ── Content slide variants ── */
const contentVariants = {
    enter: { opacity: 0, x: -40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
};

export default function BrandBanner({
    brand,
    slides,
    autoPlayInterval = 5000,
}: BrandBannerProps) {
    const [[current, direction], setCurrent] = useState([0, 0]);
    const [isPaused, setIsPaused] = useState(false);

    const paginate = useCallback(
        (newDirection: number) => {
            setCurrent(([prev]) => {
                const next = (prev + newDirection + slides.length) % slides.length;
                return [next, newDirection];
            });
        },
        [slides.length]
    );

    useEffect(() => {
        if (isPaused || slides.length <= 1) return;
        const timer = setInterval(() => paginate(1), autoPlayInterval);
        return () => clearInterval(timer);
    }, [isPaused, paginate, autoPlayInterval, slides.length]);

    const slide = slides[current];
    const grad = slide.gradient || 'from-red-700 via-red-900 to-gray-950';

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden mb-8 select-none group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative h-[340px] sm:h-[370px] md:h-[400px] lg:h-[440px]">

                {/* ── HERO IMAGE — dominant, full-bleed ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`bg-${current}`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute inset-0"
                    >
                        {/* Full image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        />
                        {/* Light left-side gradient for text readability — keeps image visible on right */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${grad} opacity-60`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                        {/* Bottom fade for feature circles */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* ── Subtle animated light sweep ── */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-[1]"
                    animate={{
                        background: [
                            'linear-gradient(105deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
                            'linear-gradient(105deg, transparent 60%, rgba(255,255,255,0.06) 100%)',
                            'linear-gradient(105deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
                        ],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />

                {/* ── CONTENT OVERLAY ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`content-${current}`}
                        variants={contentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                        className="absolute inset-0 z-[2] flex flex-col justify-between"
                    >
                        {/* Top section */}
                        <div className="p-4 sm:p-7 md:p-9 lg:p-11">
                            {/* Brand badge row */}
                            <div className="flex items-center justify-between mb-3 sm:mb-5">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20"
                                >
                                    <span className="material-symbols-outlined text-white text-sm">agriculture</span>
                                    <span className="text-white text-xs font-bold tracking-wider uppercase">{brand}</span>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                                    </span>
                                </motion.div>

                                {/* Tags (top right) */}
                                {slide.tags && slide.tags.length > 0 && (
                                    <div className="hidden sm:flex items-center gap-2">
                                        {slide.tags.map((tag, i) => (
                                            <motion.span
                                                key={tag}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 + i * 0.08 }}
                                                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm text-white/90 border border-white/15"
                                            >
                                                {tag}
                                            </motion.span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title + subtitle — left side only, keeps tractor visible on right */}
                            <div className="max-w-[75%] sm:max-w-[55%] md:max-w-[50%]">
                                {/* Decorative accent lines */}
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: 48 }}
                                    transition={{ delay: 0.15, duration: 0.4 }}
                                    className="h-[3px] rounded-full bg-white mb-1"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: 48 }}
                                    transition={{ delay: 0.2, duration: 0.4 }}
                                    className="h-[3px] rounded-full bg-white/60 mb-3 sm:mb-4"
                                />

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5 }}
                                    className="text-lg sm:text-2xl md:text-3xl lg:text-[2.6rem] font-black text-white leading-[1.1] mb-1.5 sm:mb-2 drop-shadow-xl uppercase"
                                    style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                                >
                                    {slide.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.5 }}
                                    className="text-[10px] sm:text-xs md:text-sm text-white/85 mb-3 sm:mb-4 leading-relaxed line-clamp-2 drop-shadow"
                                >
                                    {slide.subtitle}
                                </motion.p>

                                {/* CTA button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.4 }}
                                >
                                    <button
                                        onClick={slide.ctaAction}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-white text-gray-900 font-bold text-[11px] sm:text-sm hover:bg-gray-50 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                                    >
                                        {slide.cta}
                                        <motion.span
                                            className="material-symbols-outlined text-sm sm:text-base"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            arrow_forward
                                        </motion.span>
                                    </button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Bottom section: Feature circles + stats */}
                        <div className="px-4 sm:px-7 md:px-9 lg:px-11 pb-10 sm:pb-12">
                            {/* Stats row (above circles on mobile) */}
                            {slide.stats && slide.stats.length > 0 && (
                                <div className="flex items-center gap-5 sm:gap-6 md:gap-8 mb-3 sm:mb-4">
                                    {slide.stats.map((s, i) => (
                                        <AnimatedStat key={`${current}-${s.label}`} value={s.value} suffix={s.suffix} label={s.label} delay={0.3 + i * 0.15} />
                                    ))}
                                    {/* Slide counter */}
                                    <span className="text-white/40 text-[10px] font-mono hidden sm:block ml-auto">
                                        {String(current + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
                                    </span>
                                </div>
                            )}


                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Navigation arrows ── */}
                {slides.length > 1 && (
                    <>
                        <button
                            onClick={() => paginate(-1)}
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                            aria-label="Previous slide"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                            aria-label="Next slide"
                        >
                            <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                        </button>
                    </>
                )}
            </div>

            {/* ── Dot indicators ── */}
            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent([i, i > current ? 1 : -1])}
                            className={`rounded-full transition-all duration-300 ${i === current
                                    ? 'w-7 h-2 bg-white shadow-lg shadow-white/30'
                                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* ── Progress bar ── */}
            {slides.length > 1 && !isPaused && (
                <motion.div
                    key={`progress-${current}`}
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-white/90 via-white/60 to-white/30 z-10"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                />
            )}
        </div>
    );
}
