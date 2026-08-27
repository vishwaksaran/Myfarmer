'use client';

import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

const landServices = [
    {
        nameKey: 'landPage.buy',
        icon: 'landscape',
        href: '/home/land/buy',
        description: 'Browse verified agricultural land listings across the country',
        badge: 'Popular',
        badgeColor: 'bg-green-500',
        bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
    },
    {
        nameKey: 'landPage.sell',
        icon: 'sell',
        href: '/home/land/sell',
        description: 'List your farm land for sale and reach genuine buyers instantly',
        badge: 'Zero Commission',
        badgeColor: 'bg-blue-500',
        bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
    },
    {
        nameKey: 'landPage.lease',
        icon: 'handshake',
        href: '/home/land/lease',
        description: 'Find land for lease or rent out your property for passive income',
        badge: 'High Demand',
        badgeColor: 'bg-amber-500',
        bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
    }
];

export default function LandPage() {
    const { t, lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    return (
        <div className="px-4 md:px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-sm border border-green-200 shadow-sm w-fit">
                            {t('landPage.title')} {t('landPage.titleHighlight')}
                        </span>
                        <NearbyLocation />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                        {tp('Find the Perfect Land for Your Farming')}
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl font-medium leading-relaxed">
                        {t('landPage.subtitle')}
                    </p>
                </div>

{/* Service Cards — three across at every width.
                    Below md these were one full-width card each, roughly a
                    screen tall, so reaching "Lease / Rent" meant scrolling past
                    the other two. Three tiles fit on one row instead; the
                    marketing badge, the blurb and the "Explore Options" row are
                    desktop-only because at ~120px wide none of them are
                    legible, and the whole tile is the link regardless. */}
                <div className="grid grid-cols-3 gap-2.5 md:gap-6 mb-10 md:mb-16">
                    {landServices.map((service) => (
                        <Link
                            key={service.nameKey}
                            href={service.href}
                            className={`group flex flex-col items-center text-center md:block md:text-left p-3 md:p-8 rounded-2xl md:rounded-[2rem] bg-gradient-to-br ${service.bgGradient} border border-black/5 dark:border-white/10 hover:shadow-xl transition-all md:hover:-translate-y-1 relative overflow-hidden`}
                        >
                            <div className="hidden md:block absolute top-0 right-0 p-32 bg-white/40 dark:bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-2 md:mb-6 relative z-10 w-full">
                                <div className={`w-11 h-11 md:w-16 md:h-16 ${service.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm md:group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-2xl md:text-3xl">{service.icon}</span>
                                </div>
                                {service.badge && (
                                    <span className={`hidden md:inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md ${service.badgeColor}`}>
                                        {tp(service.badge)}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xs md:text-2xl font-bold md:font-black text-gray-900 dark:text-white leading-tight md:mb-3 group-hover:text-primary transition-colors">
                                {t(service.nameKey)}
                            </h3>
                            <p className="hidden md:block text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-6">
                                {tp(service.description)}
                            </p>

                            <div className="hidden md:flex items-center text-primary font-bold tracking-wide text-sm uppercase group-hover:gap-2 transition-all">
                                {tp('Explore Options')}
                                <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Why Choose Section */}
                <div className="bg-white dark:bg-[#121811] rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <h2 className="text-2xl font-black text-center mb-10 text-gray-900 dark:text-white">{tp('Why Choose Our Land Marketplace?')}</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { title: 'Verified Listings', icon: 'verified', desc: 'Every land listing is manually verified for ownership authenticity' },
                            { title: 'Secure Transactions', icon: 'security', desc: 'Safe, transparent, and legally compliant dealing process' },
                            { title: 'Zero Brokerage', icon: 'money_off', desc: 'Connect directly with land owners and save on agent fees' },
                            { title: 'Legal Assistance', icon: 'gavel', desc: 'Get expert help with documentation, registration, and survey' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
                                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors duration-300">{item.icon}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{tp(item.title)}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{tp(item.desc)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

