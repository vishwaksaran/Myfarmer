'use client';

import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import { useRef, useState, useEffect } from 'react';

const testimonials = [
    {
        name: 'Suresh Reddy',
        role: 'Farmer, Andhra Pradesh',
        text: 'Miraitu helped me sell my livestock at the best price. The app is simple to use and connects me with genuine buyers nearby.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=150&h=150&fit=crop', // Indian Farmer
        stat: '₹2.5L earned',
    },
    {
        name: 'Lakshmi Devi',
        role: 'Dairy Farmer, Karnataka',
        text: 'The borewell booking service saved me so much time. I got expert consultation and the water quality testing was very helpful.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=150&h=150&fit=crop', // Indian Woman Farmer
        stat: '40% more yield',
    },
    {
        name: 'Ravi Kumar',
        role: 'Farmer, Tamil Nadu',
        text: 'I found the best tractor deals on Miraitu. The compare feature helped me choose the right machinery for my farm.',
        rating: 4,
        image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=150&h=150&fit=crop', // Indian Farmer Man
        stat: '30% cost saved',
    },
];

export default function TestimonialsSection() {
    const { t, lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.scrollWidth / testimonials.length;
            setActiveIndex(Math.round(scrollLeft / cardWidth));
        };
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const TestimonialCard = ({ testimonial, index, className = '' }: { testimonial: typeof testimonials[0]; index: number; className?: string }) => (
        <div
            className={`testimonial-card skeuo-card-hover rounded-2xl md:rounded-3xl p-5 md:p-7 border border-white/50 dark:border-white/5 flex flex-col ${className}`}
        >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3 md:mb-4">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm md:text-lg ${i < testimonial.rating ? 'text-accent' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
                ))}
            </div>

            {/* Quote */}
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs md:text-sm mb-4 md:mb-6 flex-grow">
                &ldquo;{tp(testimonial.text)}&rdquo;
            </p>

            {/* Stat badge */}
            <div className="mb-4 md:mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-black text-primary">
                    <span className="material-symbols-outlined text-[10px] md:text-xs">trending_up</span>
                    {tp(testimonial.stat)}
                </span>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2.5 md:gap-3 pt-3 md:pt-4 border-t border-black/5 dark:border-white/5">
                <div className="h-9 w-9 md:h-11 md:w-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-bold text-xs md:text-sm">{testimonial.name}</h4>
                    <p className="text-[10px] md:text-xs text-gray-500">{tp(testimonial.role)}</p>
                </div>
            </div>
        </div>
    );

    return (
        <section className="px-4 md:px-6 py-14 relative overflow-hidden">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-10 text-center animate-fade-in-up">
                    <span className="inline-flex items-center gap-1.5 mb-4 rounded-full bg-accent/15 px-5 py-2 text-xs font-bold uppercase tracking-widest text-accent">
                        <span className="material-symbols-outlined text-sm">star</span>
                        {t('testimonials.badge')}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#121811] dark:text-white mb-3">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                        {t('testimonials.subtitle')}
                    </p>
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            testimonial={testimonial}
                            index={index}
                            className={`opacity-0 animate-fade-in-up stagger-${index + 2}`}
                        />
                    ))}
                </div>

                {/* Mobile: Horizontal Carousel */}
                <div className="md:hidden">
                    <div
                        ref={scrollRef}
                        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="snap-start shrink-0 w-[80vw]">
                                <TestimonialCard testimonial={testimonial} index={index} />
                            </div>
                        ))}
                    </div>

                    {/* Carousel Dots */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {testimonials.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'w-6 bg-accent' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
