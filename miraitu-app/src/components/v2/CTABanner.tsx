'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageContext';

export default function CTABanner() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [callbackSubmitted, setCallbackSubmitted] = useState(false);

    // Placeholder contact details
    const contactNumber = "+91 74484 10198";
    const whatsappLink = "https://wa.me/917448410198";

    const handleGetStarted = () => {
        // Redirect to community page
        router.push('/home/community');
    };

    const handleCallbackRequest = (e: React.FormEvent) => {
        e.preventDefault();
        setCallbackSubmitted(true);
        // Simulate API call
        setTimeout(() => {
            setCallbackSubmitted(false);
            setIsContactModalOpen(false);
        }, 3000);
    };

    return (
        <section className="px-4 md:px-6 py-12 md:py-20">
            <div className="mx-auto max-w-[1400px]">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-dark to-[#1a3c1a] shadow-2xl p-8 md:p-16 text-center md:text-left">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    {/* Content Container */}
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                                Ready to grow your <br className="hidden md:block" />
                                <span className="text-green-300">farming business?</span>
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                Join 50,000+ farmers who are already using Miraitu to buy, sell, and connect with India&apos;s largest agricultural community.
                            </p>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-8">
                                <div className="flex -space-x-3">
                                    {[
                                        'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=100&h=100&fit=crop', // Indian Farmer Man
                                        'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=100&h=100&fit=crop', // Indian Farmer Woman
                                        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop', // Dealer
                                        'https://images.unsplash.com/photo-1534078362425-387ae9668c17?w=100&h=100&fit=crop'  // Rural Man
                                    ].map((src, i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-dark bg-gray-300 overflow-hidden">
                                            <img src={src} alt="User" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-primary-dark bg-white flex items-center justify-center text-[10px] font-bold text-primary">
                                        +50k
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400 text-lg">
                                        {'★'.repeat(5)}
                                    </div>
                                    <span className="text-white font-bold text-sm">4.9/5 Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
                            <button
                                onClick={handleGetStarted}
                                className="group relative overflow-hidden rounded-2xl bg-white px-8 py-5 text-lg font-black text-primary shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full -translate-x-full group-hover:animate-shimmer"></div>
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">rocket_launch</span>
                                    Get Started Free
                                </span>
                            </button>

                            <button
                                onClick={() => setIsContactModalOpen(true)}
                                className="group flex items-center justify-center gap-3 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-8 py-5 text-lg font-bold text-white hover:bg-white/20 hover:border-white/50 active:scale-[0.98] transition-all duration-300"
                                data-no-auth
                            >
                                <span className="material-symbols-outlined text-2xl">call</span>
                                Talk to Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-no-auth>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsContactModalOpen(false)}></div>

                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 pb-12 text-center relative">
                            <button
                                onClick={() => setIsContactModalOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-white shadow-xl">
                                <span className="material-symbols-outlined text-4xl">support_agent</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">We're Here to Help!</h3>
                            <p className="text-white/80 text-sm">Choose how you'd like to reach us</p>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-8 -mt-6 bg-white dark:bg-gray-900 rounded-t-[2rem] relative z-10">
                            {callbackSubmitted ? (
                                <div className="text-center py-8 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Received!</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Our expert will call you shortly.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Direct Actions */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <a href={`tel:${contactNumber}`} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                                            <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">call</span>
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">Call Now</span>
                                        </a>
                                        <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
                                            <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform">chat</span>
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">WhatsApp</span>
                                        </a>
                                    </div>

                                    {/* Callback Form */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white dark:bg-gray-900 px-2 text-gray-400 font-bold tracking-wider">Or Request Callback</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleCallbackRequest} className="space-y-3 mt-4">
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold text-gray-800 dark:text-white placeholder:text-gray-400 transition-all"
                                                required
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold text-gray-800 dark:text-white placeholder:text-gray-400 transition-all"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            Request Callback
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
