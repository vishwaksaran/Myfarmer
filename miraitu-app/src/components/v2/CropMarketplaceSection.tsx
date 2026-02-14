'use client';

import Link from 'next/link';

const services = [
    {
        name: 'Mandi Prices',
        icon: 'currency_rupee',
        desc: 'Check daily market rates',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        href: '/home/crops/mandi/prices'
    },
    {
        name: 'Buy Crops',
        icon: 'shopping_cart',
        desc: 'Quality produce from farmers',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        href: '/home/crops/buy'
    },
    {
        name: 'Sell Crops',
        icon: 'sell',
        desc: 'Get best rates for your harvest',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        href: '/home/crops/sell'
    },
    {
        name: 'Nearby Mandis',
        icon: 'location_on',
        desc: 'Find markets near you',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        href: '/home/crops/mandi/nearby'
    }
];

export default function CropMarketplaceSection() {
    return (
        <section className="px-4 md:px-6 py-12 md:py-16">
            <div className="mx-auto max-w-[1400px]">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-900 shadow-2xl p-8 md:p-16 text-center md:text-left">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                Maximize Your <br className="hidden md:block" />
                                <span className="text-lime-300">Harvest Profits</span>
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-8">
                                Real-time mandi prices, direct farmer-to-buyer trade, and local market discovery at your fingertips.
                            </p>

                            {/* Service Pills */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {services.map((service, index) => (
                                    <Link
                                        key={index}
                                        href={service.href}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all font-bold text-sm backdrop-blur-sm"
                                    >
                                        <span className="material-symbols-outlined text-lg opacity-80">{service.icon}</span>
                                        {service.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                            <Link
                                href="/home/crops"
                                className="group relative overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-emerald-800 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent w-full h-full -translate-x-full group-hover:animate-shimmer"></div>
                                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">eco</span>
                                Browse Crops
                            </Link>

                            <Link
                                href="/home/crops/sell"
                                className="group flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-6 py-5 text-lg font-bold text-white hover:bg-white/20 hover:border-white/50 active:scale-[0.98] transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">add_circle</span>
                                Sell Crops
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
