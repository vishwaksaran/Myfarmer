'use client';

import Link from 'next/link';

const services = [
    {
        name: 'Loan',
        icon: 'account_balance',
        href: '/v2/finance/loan',
        description: 'Get agricultural loans for equipment, crops, and land development',
        badge: '',
        badgeColor: '',
    },
    {
        name: 'Insurance',
        icon: 'verified_user',
        href: '/v2/finance/insurance',
        description: 'Protect your crops, livestock, and equipment with comprehensive coverage',
        badge: '',
        badgeColor: '',
    },
];

const stats = [
    { label: 'Partner Banks', value: '25+', icon: 'account_balance' },
    { label: 'Loans Disbursed', value: '₹50Cr+', icon: 'payments' },
    { label: 'Claims Settled', value: '98%', icon: 'check_circle' },
    { label: 'Processing Time', value: '48 hrs', icon: 'schedule' },
];

const benefits = [
    {
        title: 'Low Interest Rates',
        description: 'Competitive rates starting from 4% p.a. for agricultural loans',
        icon: 'trending_down',
    },
    {
        title: 'Quick Approval',
        description: 'Get loan approval within 48 hours with minimal documentation',
        icon: 'bolt',
    },
    {
        title: 'Flexible Repayment',
        description: 'Pay after harvest with seasonal repayment options',
        icon: 'event_repeat',
    },
    {
        title: 'Digital Process',
        description: '100% paperless application and disbursal process',
        icon: 'phone_android',
    },
];

export default function FinancePage() {
    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Hero Section */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Financial <span className="text-primary">Services</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl">
                        Access loans and insurance tailored for farmers. Get the financial support you need for your agricultural ventures.
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Financial Products</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <Link
                                key={service.name}
                                href={service.href}
                                className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-white text-4xl">{service.icon}</span>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-white text-sm font-bold ${service.badgeColor}`}>
                                        {service.badge}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{service.name}</h3>
                                <p className="text-gray-500 mb-4">{service.description}</p>
                                <div className="flex items-center text-primary font-semibold">
                                    Explore Options
                                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Miraitu Finance?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-primary">{benefit.icon}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-gray-500">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Government Schemes Banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 mb-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-3xl">policy</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Government Schemes</h2>
                                <p className="text-white/90">Access PM-KISAN, KCC, and other subsidized loans and insurance schemes</p>
                            </div>
                        </div>
                        <a
                            href="https://pmkisan.gov.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
                        >
                            Check Eligibility →
                        </a>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Need Financial Advice?</h2>
                            <p className="text-white/90">Talk to our experts who understand agricultural financing.</p>
                        </div>
                        <a
                            href="https://wa.me/917448410198?text=Hi%2C%20I%20need%20financial%20advice%20for%20agricultural%20services"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Schedule a Call →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
