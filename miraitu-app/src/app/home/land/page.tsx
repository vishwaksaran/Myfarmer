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
        <div className="px-4 md:px-6 py-5 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section — kept short on phones so the three tiles below
                    land above the fold. The headline drops two sizes and the
                    sub-line is desktop-only: it says "buy, sell, or lease",
                    which is exactly what the three tiles underneath already
                    say, so on a small screen it was costing a scroll to repeat
                    them. */}
                <div className="mb-6 md:mb-12 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 mb-3 md:mb-4">
                        <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-xs md:text-sm border border-green-200 shadow-sm w-fit mx-auto md:mx-0">
                            {t('landPage.title')} {t('landPage.titleHighlight')}
                        </span>
                        <NearbyLocation />
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black text-gray-900 dark:text-white mb-1.5 md:mb-4 tracking-tight leading-tight">
                        {tp('Find the Perfect Land for Your Farming')}
                    </h1>
                    <p className="hidden md:block text-lg text-gray-500 max-w-2xl font-medium leading-relaxed">
                        {t('landPage.subtitle')}
                    </p>
                </div>

                {/* Service Cards — stacked rows on phones, three columns from md up.
                    Each row is icon + label + one line of blurb + chevron, about
                    68px tall, so all three still sit above the fold without the
                    page scrolling. The marketing badge and the "Explore Options"
                    line stay desktop-only; on a row that narrow they add height
                    without adding information the chevron does not already give. */}
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-6 mb-8 md:mb-16">
                    {landServices.map((service) => (
                        <Link
                            key={service.nameKey}
                            href={service.href}
                            className={`group flex items-center gap-3 md:block p-3 md:p-8 rounded-2xl md:rounded-[2rem] bg-gradient-to-br ${service.bgGradient} border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl active:scale-[0.98] md:active:scale-100 transition-all md:hover:-translate-y-1 relative overflow-hidden`}
                        >
                            <div className="hidden md:block absolute top-0 right-0 p-32 bg-white/40 dark:bg-black/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="shrink-0 flex md:items-start md:justify-between md:mb-6 md:w-full relative z-10">
                                <div className={`w-11 h-11 md:w-16 md:h-16 ${service.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10 md:group-hover:scale-110 transition-transform duration-300`}>
                                    <span className="material-symbols-outlined text-2xl md:text-3xl">{service.icon}</span>
                                </div>
                                {service.badge && (
                                    <span className={`hidden md:inline-block px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md ${service.badgeColor}`}>
                                        {tp(service.badge)}
                                    </span>
                                )}
                            </div>

                            {/* min-w-0 lets the blurb below actually truncate —
                                without it the flex item refuses to shrink. */}
                            <div className="flex-1 min-w-0 text-left relative z-10">
                                <h3 className="text-sm md:text-2xl font-bold md:font-black text-gray-900 dark:text-white leading-tight md:mb-3 group-hover:text-primary transition-colors">
                                    {t(service.nameKey)}
                                </h3>
                                <p className="text-[11px] md:text-base text-gray-500 md:text-gray-600 dark:text-gray-300 font-medium leading-snug md:leading-relaxed truncate md:overflow-visible md:whitespace-normal md:mb-6">
                                    {tp(service.description)}
                                </p>

                                <div className="hidden md:flex items-center text-primary font-bold tracking-wide text-sm uppercase group-hover:gap-2 transition-all">
                                    {tp('Explore Options')}
                                    <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                                </div>
                            </div>

                            <span className="material-symbols-outlined text-gray-400 shrink-0 md:hidden relative z-10">chevron_right</span>
                        </Link>
                    ))}
                </div>

                {/* Why Choose Section — compact stacked rows on phones, four
                    centred columns from md up.
                    These were centred stacks at every width: a 64px icon over a
                    title over two lines of copy, four of them with a 32px gap,
                    which came to roughly 900px of scrolling to read four short
                    promises. Turned on their side each row is about 48px, so the
                    same four fit in a screen's corner. Nothing is hidden — only
                    the axis and the type scale change. */}
                <div className="bg-white dark:bg-[#121811] rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm md:shadow-xl md:shadow-gray-200/50 dark:shadow-none">
                    <h2 className="text-lg md:text-2xl font-black text-center mb-4 md:mb-10 text-gray-900 dark:text-white">{tp('Why Choose Our Land Marketplace?')}</h2>
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-4 md:gap-8">
                        {[
                            { title: 'Verified Listings', icon: 'verified', desc: 'Every land listing is manually verified for ownership authenticity' },
                            { title: 'Secure Transactions', icon: 'security', desc: 'Safe, transparent, and legally compliant dealing process' },
                            { title: 'Zero Brokerage', icon: 'money_off', desc: 'Connect directly with land owners and save on agent fees' },
                            { title: 'Legal Assistance', icon: 'gavel', desc: 'Get expert help with documentation, registration, and survey' }
                        ].map((item, i) => (
                            <div key={i} className="group flex items-center gap-3 text-left rounded-2xl bg-gray-50/70 dark:bg-white/[0.03] p-3 md:bg-transparent md:dark:bg-transparent md:p-0 md:rounded-none md:flex-col md:items-center md:text-center">
                                <div className="shrink-0 w-10 h-10 md:w-16 md:h-16 bg-white dark:bg-white/10 md:bg-gray-50 md:dark:bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center md:mb-4 ring-1 ring-black/5 dark:ring-white/10 md:ring-0 group-hover:bg-primary/10 transition-colors duration-300">
                                    <span className="material-symbols-outlined text-xl md:text-4xl text-gray-400 group-hover:text-primary transition-colors duration-300">{item.icon}</span>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm md:text-lg mb-0.5 md:mb-2 text-gray-900 dark:text-white leading-tight">{tp(item.title)}</h3>
                                    <p className="text-[11px] md:text-sm text-gray-500 font-medium leading-snug md:leading-relaxed">{tp(item.desc)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

