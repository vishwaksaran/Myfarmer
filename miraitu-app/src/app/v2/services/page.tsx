'use client';

import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';

const services = [
    {
        name: 'Harvester',
        icon: 'agriculture',
        href: '/v2/services/harvester',
        description: 'Book harvester services for all crop types',
        available: '45+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Drone Spray',
        icon: 'flight',
        href: '/v2/services/drone-spray',
        description: 'Precision drone spraying for pesticides & fertilizers',
        available: '28+ providers',
        color: 'bg-primary',
    },
    {
        name: 'Farm Labours',
        icon: 'group',
        href: '/v2/services/farm-labours',
        description: 'Hire skilled farm workers for various tasks',
        available: '120+ workers',
        color: 'bg-primary',
    },
    {
        name: 'Transportation',
        icon: 'local_shipping',
        href: '/v2/services/transportation',
        description: 'Move your produce safely to markets',
        available: '80+ vehicles',
        color: 'bg-primary',
    },
];

const stats = [
    { label: 'Active Providers', value: '500+', icon: 'people' },
    { label: 'Services Booked', value: '12,450', icon: 'calendar_month' },
    { label: 'Avg. Rating', value: '4.8★', icon: 'star' },
    { label: 'Areas Covered', value: '200+', icon: 'location_on' },
];

export default function ServicesPage() {
    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Farm <span className="text-primary">Services</span>
                    </h1>
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
                        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Book & Schedule</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Select a provider and book for your preferred date and time.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Get It Done</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                The provider arrives at your farm and completes the service.
                            </p>
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
                            href="/v2/services/register-provider"
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
