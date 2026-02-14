'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';

const services = [
    {
        name: 'Soil Testing',
        icon: 'science',
        href: '/home/services/soil-testing',
        description: 'Get detailed soil analysis for better crop planning',
        available: '35+ labs',
        color: 'bg-primary',
    },
    {
        name: 'Rent Machinery',
        icon: 'agriculture',
        href: '/home/services/rent-machinery',
        description: 'Rent tractors, harvesters, and other farm equipment',
        available: '200+ machines',
        color: 'bg-primary',
    },
    {
        name: 'Borewell Services',
        icon: 'water_drop',
        href: '/home/borewell',
        description: 'Drilling, repair, and maintenance of borewells',
        available: '50+ providers',
        color: 'bg-primary',
    },
    {
        name: 'CCTV Installation',
        icon: 'videocam',
        href: '/home/cctv',
        description: 'Security camera setup for farm monitoring',
        available: '40+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Fencing Services',
        icon: 'fence',
        href: '/home/fencing',
        description: 'Protect your land with quality fencing solutions',
        available: '60+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Harvester',
        icon: 'grass',
        href: '/home/services/harvester',
        description: 'Book harvester services for all crop types',
        available: '45+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Drone Spray',
        icon: 'flight',
        href: '/home/services/drone-spray',
        description: 'Precision drone spraying for pesticides & fertilizers',
        available: '28+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Farm Labours',
        icon: 'group',
        href: '/home/services/farm-labours',
        description: 'Hire skilled farm workers for various tasks',
        available: '120+ workers',
        color: 'bg-primary',
    },
    {
        name: 'Transportation',
        icon: 'local_shipping',
        href: '/home/services/transportation',
        description: 'Move your produce safely to markets',
        available: '80+ vehicles',
        color: 'bg-primary',
    },
    {
        name: 'Storage and Godown',
        icon: 'warehouse',
        href: '/home/services/storage-godown',
        description: 'Secure storage & godown facilities for produce',
        available: '20+ facilities',
        color: 'bg-primary',
    },
    {
        name: 'Plumber',
        icon: 'plumbing',
        href: '/home/services/plumber',
        description: 'Irrigation & pipeline services',
        available: '40+ available',
        color: 'bg-primary',
    },
    {
        name: 'Electrician',
        icon: 'electrical_services',
        href: '/home/services/electrician',
        description: 'Motor & wiring solutions',
        available: '35+ available',
        color: 'bg-primary',
    },
    {
        name: 'Mechanic',
        icon: 'build_circle',
        href: '/home/services/mechanic',
        description: 'Tractor & machinery repair',
        available: '60+ mechanics',
        color: 'bg-primary',
    },
    {
        name: 'Milk Vendors',
        icon: 'water_drop',
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
    'Andhra Pradesh': 'https://ysrrythubharosa.ap.gov.in/',
    'Telangana': 'https://rythubandhu.telangana.gov.in/',
    'Karnataka': 'https://fruitspmk.karnataka.gov.in/',
    'Tamil Nadu': 'https://www.tnagrisnet.tn.gov.in/',
    'Maharashtra': 'https://mahadbt.maharashtra.gov.in/',
    'Madhya Pradesh': 'https://saara.mp.gov.in/',
    'Uttar Pradesh': 'https://upagriculture.com/',
    'Bihar': 'https://dbtagriculture.bihar.gov.in/',
    'Rajasthan': 'https://rajkisan.rajasthan.gov.in/',
    'Gujarat': 'https://ikhedut.gujarat.gov.in/',
    'Haryana': 'https://agriharyana.gov.in/',
    'Punjab': 'https://agri.punjab.gov.in/',
    'Odisha': 'https://kalia.odisha.gov.in/',
    'West Bengal': 'https://matirkatha.net/',
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
    const [selectedState, setSelectedState] = useState('');
    const [enrolmentState, setEnrolmentState] = useState('');

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

    const [schemeState, setSchemeState] = useState('');

    const handleSchemeRedirect = () => {
        if (schemeState && stateSchemePortals[schemeState]) {
            window.open(stateSchemePortals[schemeState], '_blank');
        }
    };

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Farm <span className="text-primary">Services</span>
                        </h1>
                        <NearbyLocation />
                    </div>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Book reliable farm services from verified providers. From harvesting to transportation, we've got you covered.
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

                {/* Services Grid */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Services</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <Link
                                key={service.name}
                                href={service.href}
                                className="group flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                            >
                                <div className={`w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-white text-4xl">{service.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{service.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                                    <p className="text-primary font-semibold">{service.available}</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-2 transition-all">
                                    arrow_forward
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* How it Works */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Choose a Service</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Select the type of service you need for your farm.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Book & Schedule</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Select a provider and book for your preferred date and time.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Get It Done</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                The provider arrives at your farm and completes the service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Check Enrolment Status */}


                {/* Kisan Card Registration */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">badge</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Farmer Registration Card</h2>
                                    <p className="text-white/90">Apply for your Unique Farmer ID and access government schemes. Select your state to proceed.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                            <div className="relative min-w-[250px]">
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full appearance-none bg-white text-gray-900 font-semibold py-4 px-6 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                                >
                                    <option value="">Select Your State</option>
                                    {Object.keys(stateKisanPortals).map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                            <button
                                onClick={handleKisanRegistration}
                                disabled={!selectedState}
                                className="px-8 py-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg whitespace-nowrap"
                            >
                                Go to Portal →
                            </button>
                        </div>
                    </div>
                </div>

                {/* My Government Scheme */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl p-8 text-white mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">policy</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">My Government Scheme</h2>
                                    <p className="text-white/90">Find and apply for government schemes in your state. Select your state to proceed.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                            <div className="relative min-w-[250px]">
                                <select
                                    value={schemeState}
                                    onChange={(e) => setSchemeState(e.target.value)}
                                    className="w-full appearance-none bg-white text-gray-900 font-semibold py-4 px-6 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                                >
                                    <option value="">Select Your State</option>
                                    {Object.keys(stateSchemePortals).map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                            <button
                                onClick={handleSchemeRedirect}
                                disabled={!schemeState}
                                className="px-8 py-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg whitespace-nowrap"
                            >
                                Go to Portal →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kisan Credit Card */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-8 text-white mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-3xl">credit_card</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Kisan Credit Card (KCC)</h2>
                                    <p className="text-white/90">Get affordable credit for your farming needs. Check your eligibility and apply online.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <Link
                                href="https://www.myscheme.gov.in/schemes/kcc"
                                target="_blank"
                                className="inline-block w-full text-center px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors shadow-lg whitespace-nowrap"
                            >
                                Check Eligibility →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Become a Service Provider</h2>
                            <p className="text-white/90">Own equipment? Register as a provider and earn by offering your services to farmers.</p>
                        </div>
                        <Link
                            href="/home/services/register-provider"
                            className="shrink-0 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            Register Now →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

