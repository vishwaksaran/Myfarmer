'use client';

import { useLanguage } from '@/i18n/LanguageContext';

const testimonials = [
    {
        name: 'Suresh Reddy',
        role: 'Farmer, Andhra Pradesh',
        text: 'Miraitu helped me sell my livestock at the best price. The app is simple to use and connects me with genuine buyers nearby.',
        rating: 5,
        avatar: '👨‍🌾',
        stat: '₹2.5L earned',
    },
    {
        name: 'Lakshmi Devi',
        role: 'Dairy Farmer, Karnataka',
        text: 'The borewell booking service saved me so much time. I got expert consultation and the water quality testing was very helpful.',
        rating: 5,
        avatar: '👩‍🌾',
        stat: '40% more yield',
    },
    {
        name: 'Ravi Kumar',
        role: 'Farmer, Tamil Nadu',
        text: 'I found the best tractor deals on Miraitu. The compare feature helped me choose the right machinery for my farm.',
        rating: 4,
        avatar: '🧑‍🌾',
        stat: '30% cost saved',
    },
];

export default function TestimonialsSection() {
    const { t } = useLanguage();

    return (
        <section className="px-4 md:px-6 py-14 relative overflow-hidden">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-10 text-center animate-fade-in-up">
                    <span className="inline-flex items-center gap-1.5 mb-4 rounded-full bg-accent/15 px-5 py-2 text-xs font-bold uppercase tracking-widest text-accent">
                        <span className="material-symbols-outlined text-sm">star</span>
                        Farmer Stories
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#121811] dark:text-white mb-3">
                        Trusted by Thousands of Farmers
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                        See how Miraitu is transforming farming across India
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`testimonial-card skeuo-card-hover rounded-3xl p-7 border border-white/50 dark:border-white/5 flex flex-col opacity-0 animate-fade-in-up stagger-${index + 2}`}
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-lg ${i < testimonial.rating ? 'text-accent' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mb-6 flex-grow">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>

                            {/* Stat badge */}
                            <div className="mb-5">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-black text-primary">
                                    <span className="material-symbols-outlined text-xs">trending_up</span>
                                    {testimonial.stat}
                                </span>
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                                <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{testimonial.name}</h4>
                                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
