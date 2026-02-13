'use client';

import Link from 'next/link';

const landServices = [
    {
        name: 'Buy Farm Land',
        icon: 'landscape',
        desc: 'Find verified agricultural land for sale',
        color: 'text-green-700',
        bg: 'bg-green-100 dark:bg-green-900/30',
        href: '/home/land/buy',
        badge: 'Hot'
    },
    {
        name: 'Sell Farm Land',
        icon: 'real_estate_agent',
        desc: 'List your property for the best price',
        color: 'text-emerald-700',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        href: '/home/land/sell',
        badge: ''
    },
    {
        name: 'Lease Land',
        icon: 'handshake',
        desc: 'Long-term leasing opportunities',
        color: 'text-teal-700',
        bg: 'bg-teal-100 dark:bg-teal-900/30',
        href: '/home/land/lease',
        badge: ''
    },
    {
        name: 'Rent Farm Land',
        icon: 'key',
        desc: 'Short-term rental for seasonal farming',
        color: 'text-lime-700',
        bg: 'bg-lime-100 dark:bg-lime-900/30',
        href: '/home/land/rent',
        badge: ''
    }
];

export default function FarmLandSection() {
    return (
        <section className="px-4 md:px-6 py-12 md:py-16">
            <div className="mx-auto max-w-[1400px]">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-600 via-green-700 to-emerald-900 shadow-2xl p-8 md:p-16 text-center md:text-left">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                Find Your Perfect <br className="hidden md:block" />
                                <span className="text-lime-300">Farm Land</span>
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-8">
                                The easiest way to Buy, Sell, Rent, or Lease verified agricultural land. Connect directly with owners and buyers.
                            </p>

                            {/* Service Pills */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {landServices.map((service, index) => (
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
                                href="/home/land"
                                className="group relative overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-green-800 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-100/50 to-transparent w-full h-full -translate-x-full group-hover:animate-shimmer"></div>
                                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">travel_explore</span>
                                View All Listings
                            </Link>

                            <Link
                                href="/home/land/sell"
                                className="group flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-6 py-5 text-lg font-bold text-white hover:bg-white/20 hover:border-white/50 active:scale-[0.98] transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                                Post Your Land
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
