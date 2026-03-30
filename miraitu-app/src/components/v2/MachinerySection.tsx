'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';

const popularBrands = [
    { name: 'Mahindra', slug: 'mahindra', logo: '/images/brands/tractors/mahindra.png', color: '#e41e26' },
    { name: 'John Deere', slug: 'john-deere', logo: '/images/brands/tractors/john-deere.png', color: '#367c2b' },
    { name: 'Sonalika', slug: 'sonalika', logo: '/images/brands/tractors/sonalika.png', color: '#00529b' },
    { name: 'Swaraj', slug: 'swaraj', logo: '/images/brands/tractors/swaraj.png', color: '#c60c30' },
    { name: 'Kubota', slug: 'kubota', logo: '/images/brands/tractors/kubota.png', color: '#f47920' },
    { name: 'Eicher', slug: 'eicher', logo: '/images/brands/tractors/eicher.png', color: '#003d79' },
    { name: 'New Holland', slug: 'new-holland', logo: '/images/brands/tractors/new-holland.png', color: '#0033a0' },
    { name: 'Massey Ferguson', slug: 'massey-ferguson', logo: '/images/brands/tractors/massey-ferguson.png', color: '#c8102e' },
    { name: 'Farmtrac', slug: 'farmtrac', logo: '/images/brands/tractors/farmtrac.png', color: '#e31e24' },
    { name: 'Powertrac', slug: 'powertrac', logo: '/images/brands/tractors/powertrac.png', color: '#d80027' },
];

export default function MachinerySection() {
    const { t } = useLanguage();

    const services = [
        { name: t('machinery.newMachinery'), icon: 'agriculture', desc: t('machinery.newMachineryDesc'), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', href: '/home/machinery' },
        { name: t('machinery.buyUsed'), icon: 'shopping_cart', desc: t('machinery.buyUsedDesc'), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', href: '/home/machinery' },
        { name: t('machinery.sellUsed'), icon: 'sell', desc: t('machinery.sellUsedDesc'), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', href: '/home/machinery' },
        { name: t('machinery.rent'), icon: 'handshake', desc: t('machinery.rentDesc'), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', href: '/home/services/rent-machinery' },
    ];

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
                            {t('machinery.badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            {t('machinery.title')}
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            {t('machinery.desc')}
                        </p>
                    </div>

                    <Link
                        href="/home/machinery"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        {t('machinery.viewAll')} <span className="material-symbols-outlined">arrow_forward</span>
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

                {/* Popular Tractor Brands */}
                <div className="mt-10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-xl font-bold text-[#121811] dark:text-[#f9fbf9]">
                            Popular Tractor Brands
                        </h3>
                        <Link
                            href="/home/machinery/tractors/brands"
                            className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
                        {popularBrands.map((brand) => (
                            <Link
                                key={brand.slug}
                                href={`/home/machinery/tractors/brand/${brand.slug}`}
                                className="group flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-[#1a231a] border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-green-200 dark:hover:border-green-700 transition-all"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white dark:bg-gray-700 p-1">
                                    <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="text-[10px] md:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate w-full">
                                    {brand.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <Link
                        href="/home/machinery"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                    >
                        {t('machinery.explore')} <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
