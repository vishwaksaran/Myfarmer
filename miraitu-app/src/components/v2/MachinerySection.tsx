'use client';

import Link from 'next/link';
import { useState } from 'react';

const services = [
    {
        name: 'New Machinery',
        icon: 'agriculture',
        desc: 'Get Quote',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/machinery'
    },
    {
        name: 'Buy Used Machinery',
        icon: 'shopping_cart',
        desc: 'Find great deals',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/machinery'
    },
    {
        name: 'Sell Used Machinery',
        icon: 'sell',
        desc: 'Best price for your equipment',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/machinery'
    },
    {
        name: 'Rent Machinery',
        icon: 'handshake',
        desc: 'Hire by hour, day or season',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/services/rent-machinery'
    }
];

export default function MachinerySection() {
    return (
        <section className="py-12 md:py-16 bg-white dark:bg-[#121811] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#2c5926 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                            Farm Equipment
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            Machinery Services
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            Buy, sell, or rent farm machinery with ease. Connect with verified dealers and buyers.
                        </p>
                    </div>

                    <Link
                        href="/home/machinery"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        View All Services <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    {services.map((service, index) => (
                        <Link
                            href={service.href}
                            key={index}
                            className="group relative p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a231a] hover:bg-white dark:hover:bg-[#222d21] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl ${service.bg} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-2xl md:text-3xl ${service.color}`}>
                                    {service.icon}
                                </span>
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {service.desc}
                            </p>

                            <div className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <span className="material-symbols-outlined text-xs md:text-sm text-gray-400">arrow_outward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <Link
                        href="/home/machinery"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                    >
                        Explore Machinery <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
