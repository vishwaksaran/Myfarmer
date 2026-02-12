'use client';

import { useLanguage } from '@/i18n/LanguageContext';

export default function CTABanner() {
    const { t } = useLanguage();

    return (
        <section className="px-4 md:px-6 py-6">
            <div className="mx-auto max-w-[1400px]">
                <div className="cta-banner-gradient rounded-[2rem] relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" aria-hidden="true"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12 lg:p-14">
                        <div className="text-white text-center md:text-left max-w-2xl">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight">
                                Ready to grow your farming business?
                            </h3>
                            <p className="text-white/70 text-base md:text-lg font-medium">
                                Join 50,000+ farmers who are already using Miraitu to buy, sell, and connect with India&apos;s largest agricultural community.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <button className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black text-primary shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.97] transition-all">
                                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">rocket_launch</span>
                                Get Started Free
                            </button>
                            <button className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white hover:bg-white/20 active:scale-[0.97] transition-all">
                                <span className="material-symbols-outlined text-lg">call</span>
                                Talk to Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
