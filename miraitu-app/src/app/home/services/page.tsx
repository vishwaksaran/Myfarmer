'use client';

import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import { topCategories } from '@/lib/top-categories';

const services = [
    {
        name: 'Soil Testing',
        icon: 'science',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop',
        href: '/home/services/soil-testing',
        description: 'Get detailed soil analysis for better crop planning',
        available: '35+ labs',
        color: 'bg-primary',
    },
    {
        name: 'Rent Machinery',
        icon: 'agriculture',
        image: '/images/services/other/Rentmachiner.png',
        href: '/home/services/rent-machinery',
        description: 'Rent tractors, harvesters, and other farm equipment',
        available: '200+ machines',
        color: 'bg-primary',
    },
    {
        name: 'Borewell Services',
        icon: 'water_drop',
        image: '/images/services/other/Borewell.png',
        href: '/home/borewell',
        description: 'Drilling, repair, and maintenance of borewells',
        available: '50+ providers',
        color: 'bg-primary',
    },
    {
        name: 'CCTV Installation',
        icon: 'videocam',
        image: '/images/services/other/CCTV.png',
        href: '/home/cctv',
        description: 'Security camera setup for farm monitoring',
        available: '40+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Fencing Services',
        icon: 'fence',
        image: '/images/services/other/Fencing.png',
        href: '/home/fencing',
        description: 'Protect your land with quality fencing solutions',
        available: '60+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Veterinary Care',
        icon: 'pets',
        image: '/images/services/other/VeterinaryCare.png',
        href: '/home/veterinary',
        description: 'Veterinary doctors & animal healthcare',
        available: '90+ doctors',
        color: 'bg-primary',
    },
    {
        name: 'Drone Spray',
        icon: 'flight',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop',
        href: '/home/services/drone-spray',
        description: 'Precision drone spraying for pesticides & fertilizers',
        available: '28+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Farm Labours',
        icon: 'group',
        image: '/images/services/other/FarmLabour.png',
        href: '/home/services/farm-labours',
        description: 'Hire skilled farm workers for various tasks',
        available: '120+ workers',
        color: 'bg-primary',
    },
    {
        name: 'Transportation',
        icon: 'local_shipping',
        image: '/images/services/other/Transportation.png',
        href: '/home/services/transportation',
        description: 'Move your produce safely to markets',
        available: '80+ vehicles',
        color: 'bg-primary',
    },
    {
        name: 'Storage and Godown',
        icon: 'warehouse',
        image: '/images/services/other/StorageGodown.png',
        href: '/home/services/storage-godown',
        description: 'Secure storage & godown facilities for produce',
        available: '20+ facilities',
        color: 'bg-primary',
    },
    {
        name: 'Plumber',
        icon: 'plumbing',
        image: '/images/services/other/Plumber.png',
        href: '/home/services/plumber',
        description: 'Irrigation & pipeline services',
        available: '40+ available',
        color: 'bg-primary',
    },
    {
        name: 'Electrician',
        icon: 'electrical_services',
        image: '/images/services/other/Electrician.png',
        href: '/home/services/electrician',
        description: 'Motor & wiring solutions',
        available: '35+ available',
        color: 'bg-primary',
    },
    {
        name: 'Mechanic',
        icon: 'build_circle',
        image: '/images/services/other/Mechanic.png',
        href: '/home/services/mechanic',
        description: 'Tractor & machinery repair',
        available: '60+ mechanics',
        color: 'bg-primary',
    },
    {
        name: 'Milk Vendors',
        icon: 'water_drop',
        image: '/images/services/other/Milkvendor.png',
        href: '/home/services/milk-vendors',
        description: 'Fresh dairy supply near you',
        available: '80+ vendors',
        color: 'bg-primary',
    },
];

// Temporarily hidden from the "Our Services" grid — remove a name from this set
// to bring the service card back. The routes/pages themselves are untouched.
const hiddenServices = new Set([
    'Rent Machinery',
    'CCTV Installation',
    'Fencing Services',
    'Farm Labours',
    'Transportation',
    'Storage and Godown',
    'Plumber',
    'Electrician',
    'Mechanic',
    'Milk Vendors',
]);

// The stateKisanPortals / stateEnrolmentLinks / stateSchemePortals maps were
// removed with the government-scheme banners that used them. Recover them from
// git history if those banners are ever reinstated.

export default function ServicesPage() {
    const { t, lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);

    // "Our Services" = the Top Categories first, then the remaining services.
    // Drop services that duplicate a top category (by concept) to avoid repeats.
    const topCategoryLabels = new Set(['Soil Testing', 'Drone Spray']);
    const ourServices = [
        ...topCategories.map((c) => ({ label: c.label, tKey: c.tKey, image: c.image, icon: c.icon, link: c.link })),
        ...services
            .filter((s) => !topCategoryLabels.has(s.name) && !hiddenServices.has(s.name))
            .map((s) => ({ label: s.name, tKey: undefined as string | undefined, image: s.image, icon: s.icon, link: s.href })),
    ];

    return (
        <div className="px-3 md:px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-8 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {t('servicesPage.title')} <span className="text-primary">{t('servicesPage.titleHighlight')}</span>
                        </h1>
                        <NearbyLocation />
                    </div>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl">
                        {t('servicesPage.subtitle')}
                    </p>
                </div>

                {/* Quick Stats removed — the figures (500+ providers, 12,450
                    bookings, 4.8★, 200+ areas) were hardcoded marketing numbers,
                    not anything measured. */}

                {/* Our Services — Top Categories style, includes the top categories first */}
                <div className="mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{t('servicesPage.ourServices')}</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
                        {ourServices.map((service) => (
                            <Link key={service.label} href={service.link} className="group flex flex-col">
                                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-green-500 shadow-sm">
                                    <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-white text-4xl">{service.icon}</span>
                                    <img
                                        src={service.image}
                                        alt={service.tKey ? t(service.tKey) : service.label}
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-2 text-center text-xs md:text-sm font-semibold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                    {service.tKey ? t(service.tKey) : tp(service.label)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* How it Works */}
                <div className="mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('servicesPage.howItWorks')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="p-4 md:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl mb-3 md:mb-4">1</div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">{tp('Choose a Service')}</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                {tp('Select the type of service you need for your farm.')}
                            </p>
                        </div>
                        <div className="p-4 md:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl mb-3 md:mb-4">2</div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">{tp('Book & Schedule')}</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                {tp('Select a provider and book for your preferred date and time.')}
                            </p>
                        </div>
                        <div className="p-4 md:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 col-span-2 md:col-span-1">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl mb-3 md:mb-4">3</div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">{tp('Get It Done')}</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                {tp('The provider arrives at your farm and completes the service.')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* The Farmer Registration Card, My Government Scheme, Kisan
                    Credit Card and Become a Dealer/Seller banners were removed —
                    this page is now just the service catalogue. Their routes and
                    components are untouched: /home/become-seller still works and
                    is reachable from the header menu. */}
            </div>

        </div>
    );
}

