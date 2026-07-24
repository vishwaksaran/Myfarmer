'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { useLanguage } from '@/i18n/LanguageContext';
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
        image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=400&fit=crop',
        href: '/home/services/farm-labours',
        description: 'Hire skilled farm workers for various tasks',
        available: '120+ workers',
        color: 'bg-primary',
    },
    {
        name: 'Transportation',
        icon: 'local_shipping',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=400&fit=crop',
        href: '/home/services/transportation',
        description: 'Move your produce safely to markets',
        available: '80+ vehicles',
        color: 'bg-primary',
    },
    {
        name: 'Storage and Godown',
        icon: 'warehouse',
        image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=400&fit=crop',
        href: '/home/services/storage-godown',
        description: 'Secure storage & godown facilities for produce',
        available: '20+ facilities',
        color: 'bg-primary',
    },
    {
        name: 'Plumber',
        icon: 'plumbing',
        image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop',
        href: '/home/services/plumber',
        description: 'Irrigation & pipeline services',
        available: '40+ available',
        color: 'bg-primary',
    },
    {
        name: 'Electrician',
        icon: 'electrical_services',
        image: 'https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=400&h=400&fit=crop',
        href: '/home/services/electrician',
        description: 'Motor & wiring solutions',
        available: '35+ available',
        color: 'bg-primary',
    },
    {
        name: 'Mechanic',
        icon: 'build_circle',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
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

const stateKisanPortals: Record<string, string> = {
    'Andhra Pradesh': 'https://apfr.agristack.gov.in/',
    'Bihar': 'https://bhfr.agristack.gov.in/',
    'Chhattisgarh': 'https://cgfr.agristack.gov.in/',
    'Gujarat': 'https://gjfr.agristack.gov.in/',
    'Haryana': 'https://hrfr.agristack.gov.in/',
    'Himachal Pradesh': 'https://hpfr.agristack.gov.in/',
    'Jharkhand': 'https://jhfr.agristack.gov.in/',
    'Karnataka': 'https://fruits.karnataka.gov.in/',
    'Kerala': 'https://klfr.agristack.gov.in/',
    'Madhya Pradesh': 'https://mpfr.agristack.gov.in/',
    'Maharashtra': 'https://mhfr.agristack.gov.in/',
    'Odisha': 'https://odfr.agristack.gov.in/',
    'Punjab': 'https://pbfr.agristack.gov.in/',
    'Rajasthan': 'https://rjfr.agristack.gov.in/',
    'Tamil Nadu': 'https://tnfr.agristack.gov.in/',
    'Telangana': 'https://tlfr.agristack.gov.in/',
    'Uttar Pradesh': 'https://upfr.agristack.gov.in/',
    'Uttarakhand': 'https://asfr.agristack.gov.in/farmer-registry-as/#/',
    'Goa': 'https://asfr.agristack.gov.in/farmer-registry-as/#/',
    'West Bengal': 'https://epaddy.wb.gov.in/PublicProfile/public',
};

const stateEnrolmentLinks: Record<string, string> = {
    'Andhra Pradesh': 'https://apfr.agristack.gov.in/farmer-registry-ap/#/CheckEnrollmentStatus',
    'Bihar': 'https://bhfr.agristack.gov.in/farmer-registry-bh/#/CheckEnrollmentStatus',
    'Chhattisgarh': 'https://cgfr.agristack.gov.in/farmer-registry-cg/#/CheckEnrollmentStatus',
    'Gujarat': 'https://gjfr.agristack.gov.in/farmer-registry-gj/#/CheckEnrollmentStatus',
    'Haryana': 'https://hrfr.agristack.gov.in/farmer-registry-hr/#/CheckEnrollmentStatus',
    'Himachal Pradesh': 'https://hpfr.agristack.gov.in/farmer-registry-hp/#/CheckEnrollmentStatus',
    'Jharkhand': 'https://jhfr.agristack.gov.in/farmer-registry-jh/#/CheckEnrollmentStatus',
    'Kerala': 'https://klfr.agristack.gov.in/farmer-registry-kl/#/CheckEnrollmentStatus',
    'Madhya Pradesh': 'https://mpfr.agristack.gov.in/farmer-registry-mp/#/CheckEnrollmentStatus',
    'Maharashtra': 'https://mhfr.agristack.gov.in/farmer-registry-mh/#/CheckEnrollmentStatus',
    'Odisha': 'https://odfr.agristack.gov.in/farmer-registry-od/#/CheckEnrollmentStatus',
    'Punjab': 'https://pbfr.agristack.gov.in/farmer-registry-pb/#/CheckEnrollmentStatus',
    'Rajasthan': 'https://rjfr.agristack.gov.in/farmer-registry-rj/#/CheckEnrollmentStatus',
    'Tamil Nadu': 'https://tnfr.agristack.gov.in/farmer-registry-tn/#/CheckEnrollmentStatus',
    'Telangana': 'https://tlfr.agristack.gov.in/farmer-registry-tl/#/CheckEnrollmentStatus',
    'Uttar Pradesh': 'https://upfr.agristack.gov.in/farmer-registry-up/#/CheckEnrollmentStatus',
    'Karnataka': 'https://fruits.karnataka.gov.in/',
    'West Bengal': 'https://epaddy.wb.gov.in/PublicProfile/public',
};

const stateSchemePortals: Record<string, string> = {
    'Andhra Pradesh': 'https://apseeds.ap.gov.in/Website/Schemes.aspx#:~:text=Supply%20Under%20Different%20Schemes&text=National%20Food%20Security%20Mission%20(NFSM,the%20farmers%20(Non%2Dplan)',
    'Telangana': 'https://www.rythubharosa.telangana.gov.in/Default_Home.aspx',
    'Karnataka': 'https://fruitspmk.karnataka.gov.in/',
    'Tamil Nadu': 'https://www.tnagrisnet.tn.gov.in/',
    'Maharashtra': 'https://mahadbt.maharashtra.gov.in/',
    'Madhya Pradesh': 'https://saara.mp.gov.in/',
    'Uttar Pradesh': 'https://upagripardarshi.gov.in/staticpages/AgriculturalUsefulInstrument.aspx',
    'Bihar': 'https://dbtagriculture.bihar.gov.in/',
    'Rajasthan': 'https://rajkisan.rajasthan.gov.in/',
    'Gujarat': 'https://ikhedut.gujarat.gov.in/',
    'Haryana': 'https://agriharyana.gov.in/',
    'Punjab': 'https://agri.punjab.gov.in/',
    'Goa': 'https://gscbgoa.bank.in/agriculture-scheme/',
    'Odisha': 'https://sugam.odisha.gov.in/website/home/scheme-list',
    'Uttarakhand': 'https://agriculture.uk.gov.in/schemes-programmes/',
    'West Bengal': 'https://web.umang.gov.in/landing/scheme/detail/amar-fasal-amar-gola_afag.html',
    'Kerala': 'https://keralaagriculture.gov.in/',
    'Jharkhand': 'https://jharkhand.gov.in/agriculture',
    'Chhattisgarh': 'https://agriportal.cg.nic.in/',
};

const stats = [
    { label: 'Active Providers', value: '500+', icon: 'people' },
    { label: 'Services Booked', value: '12,450', icon: 'calendar_month' },
    { label: 'Avg. Rating', value: '4.8★', icon: 'star' },
    { label: 'Areas Covered', value: '200+', icon: 'location_on' },
];

export default function ServicesPage() {
    const { t } = useLanguage();
    const [selectedState, setSelectedState] = useState('');
    const [enrolmentState, setEnrolmentState] = useState('');
    const [schemeState, setSchemeState] = useState('');
    const handleKisanRegistration = () => {
        if (selectedState && stateKisanPortals[selectedState]) {
            window.open(stateKisanPortals[selectedState], '_blank');
        }
    };

    const handleCheckEnrolment = () => {
        if (enrolmentState && stateEnrolmentLinks[enrolmentState]) {
            window.open(stateEnrolmentLinks[enrolmentState], '_blank');
        }
    };

    const handleSchemeRedirect = () => {
        if (schemeState && stateSchemePortals[schemeState]) {
            window.open(stateSchemePortals[schemeState], '_blank');
        }
    };

    // "Our Services" = the Top Categories first, then the remaining services.
    // Drop services that duplicate a top category (by concept) to avoid repeats.
    const topCategoryLabels = new Set(['Soil Testing', 'Drone Spray']);
    const ourServices = [
        ...topCategories.map((c) => ({ label: c.label, tKey: c.tKey, image: c.image, icon: c.icon, link: c.link })),
        ...services
            .filter((s) => !topCategoryLabels.has(s.name))
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

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-primary">{stat.icon}</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                            </div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

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
                                    {service.tKey ? t(service.tKey) : service.label}
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
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">Choose a Service</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                Select the type of service you need for your farm.
                            </p>
                        </div>
                        <div className="p-4 md:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl mb-3 md:mb-4">2</div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">Book & Schedule</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                Select a provider and book for your preferred date and time.
                            </p>
                        </div>
                        <div className="p-4 md:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 col-span-2 md:col-span-1">
                            <div className="w-10 md:w-12 h-10 md:h-12 bg-primary rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl mb-3 md:mb-4">3</div>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-2">Get It Done</h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                The provider arrives at your farm and completes the service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Check Enrolment Status */}


                {/* Grid Cards Section */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                    {/* Kisan Card Registration */}
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white">
                        <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className="w-12 md:w-16 h-12 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl">badge</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-2xl font-bold mb-1">Farmer Registration Card</h2>
                                <p className="text-xs md:text-sm text-white/90 line-clamp-2">Apply for your Unique Farmer ID and access government schemes.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full appearance-none bg-white text-gray-900 font-semibold py-2 md:py-3 px-3 md:px-4 pr-8 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(stateKisanPortals).map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">
                                    expand_more
                                </span>
                            </div>
                            <button
                                onClick={handleKisanRegistration}
                                disabled={!selectedState}
                                className="px-4 py-2 md:py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-colors shadow-lg"
                            >
                                Go to Portal →
                            </button>
                        </div>
                    </div>

                    {/* My Government Scheme */}
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white">
                        <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className="w-12 md:w-16 h-12 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl">policy</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-2xl font-bold mb-1">My Government Scheme</h2>
                                <p className="text-xs md:text-sm text-white/90 line-clamp-2">Find and apply for government schemes in your state.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <select
                                    value={schemeState}
                                    onChange={(e) => setSchemeState(e.target.value)}
                                    className="w-full appearance-none bg-white text-gray-900 font-semibold py-2 md:py-3 px-3 md:px-4 pr-8 rounded-lg md:rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                                >
                                    <option value="">Select State</option>
                                    {Object.keys(stateSchemePortals).map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">
                                    expand_more
                                </span>
                            </div>
                            <button
                                onClick={handleSchemeRedirect}
                                disabled={!schemeState}
                                className="px-4 py-2 md:py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-colors shadow-lg"
                            >
                                Go to Portal →
                            </button>
                        </div>
                    </div>

                    {/* Kisan Credit Card */}
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white">
                        <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className="w-12 md:w-16 h-12 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl">credit_card</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-2xl font-bold mb-1">Kisan Credit Card</h2>
                                <p className="text-xs md:text-sm text-white/90 line-clamp-2">Get affordable credit for your farming needs.</p>
                            </div>
                        </div>
                        <Link
                            href="https://www.myscheme.gov.in/schemes/kcc"
                            target="_blank"
                            className="block w-full text-center px-4 py-2 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-colors shadow-lg"
                        >
                            Check Eligibility →
                        </Link>
                    </div>

                    {/* Become a Dealer/Seller */}
                    <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white">
                        <div className="flex items-start gap-3 md:gap-4 mb-4">
                            <div className="w-12 md:w-16 h-12 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-white text-2xl md:text-3xl">storefront</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg md:text-2xl font-bold mb-1">Become a Dealer/Seller</h2>
                                <p className="text-xs md:text-sm text-white/90 line-clamp-2">Join our platform as a dealer or seller to expand your business reach across India.</p>
                            </div>
                        </div>
                        <Link
                            href="/home/become-seller"
                            className="block w-full text-center px-4 py-2 md:py-3 bg-white text-primary rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-green-50 transition-colors shadow-lg"
                        >
                            Learn More →
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}

