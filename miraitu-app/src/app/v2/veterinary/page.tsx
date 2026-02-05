'use client';

import Link from 'next/link';

const services = [
    {
        name: 'Treatment',
        icon: 'medical_services',
        href: '/v2/veterinary/treatment',
        description: 'Get expert veterinary treatment for your livestock',
        color: 'bg-primary',
    },
    {
        name: 'Vaccination',
        icon: 'vaccines',
        href: '/v2/veterinary/vaccination',
        description: 'Schedule vaccinations to protect your animals',
        color: 'bg-emerald-600',
    },
    {
        name: 'Deworming',
        icon: 'medication',
        href: '/v2/veterinary/deworming',
        description: 'Regular deworming for healthy livestock',
        color: 'bg-teal-600',
    },
    {
        name: 'Mastitis Test',
        icon: 'science',
        href: '/v2/veterinary/mastitis-test',
        description: 'Early detection and treatment of mastitis',
        color: 'bg-cyan-600',
    },
    {
        name: 'Grooming',
        icon: 'content_cut',
        href: '/v2/veterinary/grooming',
        description: 'Professional grooming services for your animals',
        color: 'bg-green-600',
    },
    {
        name: 'Nutritional Advice',
        icon: 'nutrition',
        href: '/v2/veterinary/nutritional-advice',
        description: 'Expert dietary guidance for optimal health',
        color: 'bg-lime-600',
    },
];

const stats = [
    { label: 'Verified Vets', value: '150+', icon: 'verified' },
    { label: 'Animals Treated', value: '25,000+', icon: 'pets' },
    { label: 'Avg. Rating', value: '4.9★', icon: 'star' },
    { label: 'Response Time', value: '<30 min', icon: 'schedule' },
];

export default function VeterinaryPage() {
    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Veterinary <span className="text-primary">Services</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Expert veterinary care for your livestock. Book consultations, vaccinations, and treatments from verified professionals.
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Link
                                key={service.name}
                                href={service.href}
                                className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-white text-3xl">{service.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                                <p className="text-sm text-gray-500">{service.description}</p>
                                <div className="mt-4 flex items-center text-primary font-semibold">
                                    Book Now
                                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Emergency Section */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-8 mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-3xl">emergency</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-1">Emergency Services</h2>
                                <p className="text-red-600 dark:text-red-300">24/7 emergency veterinary care available for critical cases</p>
                            </div>
                        </div>
                        <button className="shrink-0 px-8 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg">
                            Call Emergency →
                        </button>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Are You a Veterinarian?</h2>
                            <p className="text-white/90">Join our network and connect with farmers who need your expertise.</p>
                        </div>
                        <Link
                            href="/v2/veterinary/register"
                            className="shrink-0 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                        >
                            Register as Vet →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
