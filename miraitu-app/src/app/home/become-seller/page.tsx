'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

const sellerTypes = [
    {
        id: 'dealer',
        icon: 'store',
        title: 'Authorized Dealer',
        description: 'Sell machinery, equipment, and agricultural products from leading brands.',
        perks: ['Brand partnerships', 'Bulk pricing', 'Priority listings', 'Dedicated support'],
        gradient: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50 dark:bg-blue-950/20',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    },
    {
        id: 'farmer-seller',
        icon: 'agriculture',
        title: 'Farmer Seller',
        description: 'Sell your livestock, crops, organic produce, and farm outputs directly.',
        perks: ['Zero commission', 'Direct buyers', 'Instant payments', 'Verified profile'],
        gradient: 'from-green-500 to-emerald-600',
        bgLight: 'bg-green-50 dark:bg-green-950/20',
        iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    },
    {
        id: 'service-provider',
        icon: 'engineering',
        title: 'Service Provider',
        description: 'Offer farm services like soil testing, drone spraying, transportation, and more.',
        perks: ['Bookings dashboard', 'Customer reviews', 'Service areas', 'Earnings tracker'],
        gradient: 'from-orange-500 to-amber-600',
        bgLight: 'bg-orange-50 dark:bg-orange-950/20',
        iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    },
];

const steps = [
    { step: 1, icon: 'person_add', title: 'Register', description: 'Create your seller account with basic details and verification.' },
    { step: 2, icon: 'verified', title: 'Get Verified', description: 'Submit documents for quick KYC verification and get a trusted badge.' },
    { step: 3, icon: 'inventory', title: 'List Products', description: 'Add your products, services, or livestock with photos and pricing.' },
    { step: 4, icon: 'payments', title: 'Start Earning', description: 'Receive orders, connect with buyers, and earn directly to your bank.' },
];

const stats = [
    { value: '10,000+', label: 'Active Sellers', icon: 'groups' },
    { value: '₹50L+', label: 'Monthly Sales', icon: 'trending_up' },
    { value: '200+', label: 'Districts Covered', icon: 'location_on' },
    { value: '4.8★', label: 'Seller Rating', icon: 'star' },
];

const faqs = [
    { q: 'Is there any registration fee?', a: 'No! Registration on Miraitu is completely free for all seller types. You can start listing your products immediately after verification.' },
    { q: 'How long does verification take?', a: 'Most verifications are completed within 24-48 hours. You\'ll receive an SMS and email notification once approved.' },
    { q: 'What documents do I need?', a: 'You\'ll need a valid Aadhaar card, PAN card (for dealers), bank account details, and relevant business licenses if applicable.' },
    { q: 'How do I receive payments?', a: 'Payments are directly transferred to your bank account. Farmer sellers receive instant settlements, while dealers get weekly payouts.' },
    { q: 'Can I sell in multiple categories?', a: 'Yes! You can list products across multiple categories — machinery, livestock, crops, organic produce, and services.' },
];

export default function BecomeSellerPage() {
    const [selectedType, setSelectedType] = useState('farmer-seller');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', location: '', type: 'farmer-seller' });

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            {/* Fixed Header Wrapper */}
            <div className="fixed top-0 left-0 right-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjJIMjR2Mmgxem0tMzAgMzBoMlYyMmgtMnYxMnptMzAgMGgyVjIyaC0ydjEyem0tMzAtMzBoMlYybC0yLS4wMVYxNHptMzAgMGgyVjJoLTJ2MTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10 px-6 pt-32 pb-20 lg:pt-40 lg:pb-28">
                    <div className="mx-auto max-w-[1280px] text-center text-white">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-8 border border-white/30">
                            <span className="material-symbols-outlined text-lg">rocket_launch</span>
                            Join 10,000+ sellers on Miraitu
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                            Become a<br />
                            <span className="text-white/90">Dealer</span> / <span className="text-white/90">Seller</span>
                        </h1>
                        <p className="text-xl lg:text-2xl font-medium text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Reach millions of farmers across India. Sell machinery, livestock, crops, and services — all in one platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#register" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-orange-600 rounded-2xl font-black text-lg shadow-2xl shadow-black/20 hover:-translate-y-1 hover:shadow-3xl active:scale-95 transition-all">
                                <span className="material-symbols-outlined">app_registration</span>
                                Register Now — It&apos;s Free
                            </a>
                            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-bold text-lg border border-white/30 hover:bg-white/25 transition-all">
                                <span className="material-symbols-outlined">play_circle</span>
                                How it Works
                            </a>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 64C1200 64 1320 48 1380 40L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" className="fill-background-light dark:fill-background-dark" />
                    </svg>
                </div>
            </section>

            {/* Stats Strip */}
            <section className="px-6 -mt-4 relative z-10">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="skeuo-card rounded-2xl p-6 text-center">
                                <span className="material-symbols-outlined text-primary text-2xl mb-2">{stat.icon}</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seller Types */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Choose Your Seller Type
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Whether you&apos;re a farmer, dealer, or service provider — we have a plan that fits your business.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {sellerTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setSelectedType(type.id);
                                    setFormData({ ...formData, type: type.id });
                                }}
                                className={`group text-left p-8 rounded-[2rem] border-2 transition-all hover:-translate-y-2 hover:shadow-2xl ${selectedType === type.id
                                    ? `border-orange-400 shadow-xl shadow-orange-500/10 ${type.bgLight}`
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121811]'
                                    }`}
                            >
                                <div className={`w-16 h-16 ${type.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-3xl">{type.icon}</span>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{type.title}</h3>
                                <p className="text-gray-500 mb-6 leading-relaxed">{type.description}</p>

                                <div className="space-y-2">
                                    {type.perks.map((perk) => (
                                        <div key={perk} className="flex items-center gap-2 text-sm">
                                            <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{perk}</span>
                                        </div>
                                    ))}
                                </div>

                                {selectedType === type.id && (
                                    <div className="mt-6 flex items-center gap-2 text-orange-600 font-bold text-sm">
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                        Selected
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="px-6 py-20 bg-gray-50 dark:bg-[#0e150d]">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-500">Simple steps to start your selling journey</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-300 via-amber-300 to-green-300"></div>

                        {steps.map((item) => (
                            <div key={item.step} className="relative text-center group">
                                <div className="relative z-10 mx-auto w-24 h-24 rounded-full bg-white dark:bg-[#1a251a] border-4 border-orange-200 dark:border-orange-900/30 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:border-orange-400 transition-all">
                                    <span className="material-symbols-outlined text-orange-500 text-4xl">{item.icon}</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-black flex items-center justify-center shadow-md">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Registration Form */}
            <section id="register" className="px-6 py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left — Info */}
                        <div>
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                                Start Selling In <span className="text-orange-500">Minutes</span>
                            </h2>
                            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                                Fill out the form and our team will get you onboarded within 24 hours. No hidden fees, no complicated processes.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: 'shield', title: '100% Secure', desc: 'Your data is encrypted and never shared with third parties.' },
                                    { icon: 'support_agent', title: 'Dedicated Support', desc: 'Get a personal account manager to help you succeed.' },
                                    { icon: 'trending_up', title: 'Growth Tools', desc: 'Access analytics, marketing tools, and buyer insights.' },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">{item.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Form */}
                        <div className="skeuo-card rounded-[2.5rem] p-8 lg:p-10 border border-white/50 dark:border-white/5">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Register as a Seller</h3>
                            <p className="text-sm text-gray-500 mb-8">Fill in your details to get started</p>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5">
                                        <input
                                            className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Phone Number</label>
                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5">
                                        <input
                                            className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                            placeholder="+91 Enter your phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            type="tel"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Location / District</label>
                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5">
                                        <input
                                            className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                            placeholder="Your district or village"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Seller Type</label>
                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5">
                                        <select
                                            className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 cursor-pointer"
                                            value={formData.type}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value });
                                                setSelectedType(e.target.value);
                                            }}
                                        >
                                            <option value="dealer">Authorized Dealer</option>
                                            <option value="farmer-seller">Farmer Seller</option>
                                            <option value="service-provider">Service Provider</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full rounded-2xl py-5 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-lg tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-orange-500/30 hover:brightness-110 active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined">storefront</span>
                                    Submit Application
                                </button>

                                <p className="text-xs text-gray-400 text-center mt-4">
                                    By registering, you agree to our{' '}
                                    <Link href="#" className="text-primary underline">Terms of Service</Link> and{' '}
                                    <Link href="#" className="text-primary underline">Privacy Policy</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="px-6 py-20 bg-gray-50 dark:bg-[#0e150d]">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-500">Everything you need to know about selling on Miraitu</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="skeuo-card rounded-2xl overflow-hidden border border-white/50 dark:border-white/5"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-gray-900 dark:text-white pr-4">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 -mt-2">
                                        <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-12 lg:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Ready to Grow Your Business?</h2>
                            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
                                Join thousands of sellers who trust Miraitu to connect them with farmers across India.
                            </p>
                            <a href="#register" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-orange-600 rounded-2xl font-black text-xl shadow-2xl shadow-black/20 hover:-translate-y-1 active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-2xl">storefront</span>
                                Get Started for Free
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
