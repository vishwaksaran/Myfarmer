'use client';

import Link from 'next/link';

// Buy & Sell — marketplace category shortcuts shown on the home page
// right after Top Categories.
const options = [
    {
        label: 'Machinery',
        icon: 'agriculture',
        description: 'Tractors, harvesters & farm equipment',
        link: '/home/machinery',
    },
    {
        label: 'Crops',
        icon: 'energy_savings_leaf',
        description: 'Rice, vegetables, spices & more',
        link: '/home/crops',
    },
    {
        label: 'Livestock',
        icon: 'pets',
        description: 'Cattle, poultry, goats & sheep',
        link: '/home/livestock',
    },
    {
        label: 'Land',
        icon: 'landscape',
        description: 'Buy, sell, lease & rent farmland',
        link: '/home/land',
    },
];

export default function BuySell() {
    return (
        <section className="px-4 md:px-6 pt-4 pb-8">
            <div className="mx-auto max-w-[1400px]">
                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#121811] dark:text-white">
                        Buy &amp; Sell
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a marketplace category</p>
                </div>

                {/* Cards — 2x2 on mobile, 4-up on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {options.map((opt) => (
                        <Link
                            key={opt.label}
                            href={opt.link}
                            className="skeuo-card group rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col items-center text-center border border-white/40 dark:border-gray-700/40 transition-all hover:-translate-y-1"
                        >
                            <div className="mb-3 md:mb-4 h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl">{opt.icon}</span>
                            </div>
                            <h3 className="text-sm md:text-lg font-black mb-1 text-gray-900 dark:text-white group-hover:text-primary transition-colors">{opt.label}</h3>
                            <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400 leading-snug">{opt.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
