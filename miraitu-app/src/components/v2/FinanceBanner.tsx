'use client';

import Link from 'next/link';

export default function FinanceBanner() {
    return (
        <section className="px-4 md:px-6 py-6 pb-0">
            <div className="mx-auto max-w-[1400px]">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-8 md:p-10 shadow-2xl">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        {/* Icon */}
                        <div className="shrink-0">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                <span className="material-symbols-outlined text-white text-5xl md:text-6xl">payments</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2">
                                Farmer Finance Services
                            </h2>
                            <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                                Get access to low-interest loans, crop insurance, and financial schemes tailored for farmers. Secure your future with our trusted financial partners.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="shrink-0">
                            <Link
                                href="/home/finance"
                                className="group flex items-center gap-3 bg-white text-[#1a5c2e] font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">info</span>
                                Know More
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
