'use client';

import { useState, useEffect, useRef } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function BorewellServicesPage() {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setHeaderVisible(y <= 80 || y < lastScrollY.current);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const [formData, setFormData] = useState({
        depth: '',
        diameter: '',
        location: '',
        soilType: 'clay',
        name: '',
        phone: '',
        preferredDate: '',
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleBookConsultation = () => {
        if (!formData.name || !formData.phone || !formData.location || !formData.preferredDate) {
            alert('Please fill in all required fields');
            return;
        }
        setShowSuccessModal(true);
        setTimeout(() => {
            setFormData({ depth: '', diameter: '', location: '', soilType: 'clay', name: '', phone: '', preferredDate: '' });
            setShowSuccessModal(false);
        }, 3000);
    };

    const services = [
        {
            icon: 'water_drop',
            title: 'Borewell Drilling',
            description: 'Professional drilling services with advanced equipment for depths up to 1000 feet.',
            features: ['Depth up to 1000ft', 'Modern Equipment', '24/7 Support', 'Water Quality Test'],
            price: '₹150/ft',
        },
        {
            icon: 'settings',
            title: 'Submersible Pump Installation',
            description: 'Complete pump installation with electrical setup and maintenance warranty.',
            features: ['HP Selection Guide', 'Electrical Setup', '2-Year Warranty', 'Free Maintenance'],
            price: 'From ₹25,000',
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className={`sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                        <a href="/home" className="flex items-center gap-2">
                            <MiraituLogo size={36} />
                            <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                        </a>
                    </div>
                    <nav className="flex items-center gap-1 mt-1.5 text-xs md:text-sm">
                        <a href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">Home</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <a href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">Services</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <span className="text-primary font-bold">Borewell & Water</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-4 md:px-6 py-8 md:py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-lg md:rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-4 md:mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-2xl md:text-4xl">water_drop</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-primary-dark mb-3 md:mb-4">Borewell & Water Solutions</h1>
                        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                            Professional borewell drilling and submersible pump installation for sustainable farm irrigation
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-3 md:px-6 py-8 md:py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-xl md:text-3xl font-black mb-4 md:mb-8">Our Services</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6 lg:gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="skeuo-card rounded-lg md:rounded-3xl p-3 md:p-8 border border-white/50">
                                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
                                    <div className="tactile-icon size-12 md:size-16 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-lg md:text-3xl text-blue-600">{service.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4 mb-2 md:mb-4">
                                            <h3 className="text-sm md:text-2xl font-black text-primary-dark leading-tight">{service.title}</h3>
                                            <span className="text-xs md:text-lg font-bold text-blue-600 shrink-0 whitespace-nowrap">{service.price}</span>
                                        </div>
                                        <p className="text-xs md:text-base text-gray-600 mb-2 md:mb-6 line-clamp-2 md:line-clamp-3">{service.description}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-3 mb-2 md:mb-6">
                                            {service.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-1 md:gap-2 min-w-0">
                                                    <span className="material-symbols-outlined text-xs md:text-sm text-green-600 flex-shrink-0">check_circle</span>
                                                    <span className="text-[10px] md:text-sm font-medium truncate">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="glossy-button w-full rounded-lg md:rounded-xl py-2 md:py-3 text-xs md:text-base text-white font-bold">
                                            Request Quote
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="px-4 md:px-6 py-8 md:py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="max-w-2xl">
                        {/* Expert Consultation Form */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 md:border-4 border-white">
                            <h3 className="text-xl md:text-2xl font-black text-primary-dark mb-1.5 md:mb-2">Book Expert Consultation</h3>
                            <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">Get personalized advice from our water experts</p>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700">Farm Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700">Preferred Visit Date</label>
                                    <input
                                        type="date"
                                        value={formData.preferredDate}
                                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                        className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                    />
                                </div>
                                <button 
                                    onClick={handleBookConsultation}
                                    disabled={!formData.name || !formData.phone || !formData.location || !formData.preferredDate}
                                    className="vibrant-gradient w-full rounded-lg md:rounded-xl py-3 md:py-4 text-white font-black text-base md:text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all mt-4 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    BOOK CONSULTATION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center animate-bounce">
                                <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-center text-gray-900 dark:text-white mb-3">Thanks for Applying!</h2>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-2 text-sm md:text-base">
                            Your borewell consultation request has been submitted successfully.
                        </p>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                            Our team will contact you within <span className="font-bold text-primary">48 hours</span> to schedule your visit.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
