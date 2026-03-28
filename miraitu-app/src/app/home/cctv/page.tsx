'use client';

import { useState, useEffect, useRef } from 'react';
import MiraituLogo from '@/components/MiraituLogo';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';

export default function CCTVSurveillancePage() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        installDate: '',
    });
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

    const packages = [
        {
            id: 'solar-basic',
            icon: 'solar_power',
            title: 'Solar-Powered Kit (Basic)',
            price: '₹35,000',
            features: [
                '4 HD Cameras (1080p)',
                '100W Solar Panel',
                '12V Battery Backup',
                '500GB Storage DVR',
                'Mobile App Access',
                'Night Vision 30m',
            ],
            popular: false,
        },
        {
            id: 'solar-premium',
            icon: 'wb_sunny',
            title: 'Solar-Powered Kit (Premium)',
            price: '₹65,000',
            features: [
                '8 Full HD Cameras (2MP)',
                '300W Solar Panel Array',
                '24V Deep Cycle Battery',
                '2TB Storage NVR',
                'Cloud Backup (1 Year)',
                'Night Vision 50m',
                'PTZ Camera Included',
                'Motion Detection Alerts',
            ],
            popular: true,
        },
        {
            id: 'night-vision',
            icon: 'nightlight',
            title: 'Night Vision Specialist',
            price: '₹28,000',
            features: [
                '4 Infrared Cameras',
                'Color Night Vision',
                '1TB Storage',
                'True WDR Technology',
                'Smart IR Range 40m',
                'Weather Resistant IP67',
            ],
            popular: false,
        },
    ];

    const features = [
        {
            icon: 'smartphone',
            title: 'Remote Mobile Monitoring',
            description: 'Access live feed from anywhere using iOS/Android app with instant notifications.',
        },
        {
            icon: 'shield',
            title: 'Theft Prevention',
            description: 'AI-powered motion detection and instant alerts to prevent crop and equipment theft.',
        },
        {
            icon: 'pets',
            title: 'Livestock Monitoring',
            description: 'Monitor animal health, feeding patterns, and detect distress situations in real-time.',
        },
        {
            icon: 'wb_twilight',
            title: 'Day & Night Coverage',
            description: 'Advanced infrared technology ensures clear footage 24/7 in all weather conditions.',
        },
    ];

    const handleSubmitRequest = async () => {
        if (formData.name && formData.phone && formData.location && formData.installDate && selectedPackage) {
            const result = await submit({
                module: 'cctv',
                category: selectedPackage,
                full_name: formData.name,
                phone: formData.phone,
                location: formData.location,
                preferred_date: formData.installDate || undefined,
                extra_data: { selected_package: selectedPackage },
            });
            if (result.success) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setFormData({ name: '', phone: '', location: '', installDate: '' });
                    setSelectedPackage(null);
                    setShowSuccessModal(false);
                }, 3000);
            }
        }
    };
    const { submit, submitting } = useBookingSubmit();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className={`sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md transition-transform duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="mx-auto max-w-[1280px] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/home" className="flex items-center gap-2">
                            <MiraituLogo size={36} />
                            <h2 className="text-xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                        </a>
                    </div>
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1 mt-2 text-sm">
                        <a href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">Home</a>
                        <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        <a href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">Services</a>
                        <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                        <span className="text-primary font-bold">CCTV Surveillance</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-12 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-600 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">videocam</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4">Farm Security & CCTV Surveillance</h1>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Protect your crops, livestock, and equipment with advanced solar-powered surveillance systems
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black text-center mb-4">Why Farm Surveillance?</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">Keep your farm safe around the clock with smart, solar-powered monitoring</p>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5 md:max-w-2xl mx-auto">
                        {features.map((feature, index) => (
                            <div key={index} className="skeuo-card rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3 md:gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-900/40">
                                <div className="inline-flex items-center justify-center size-12 md:size-14 shrink-0 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 shadow-sm">
                                    <span className="material-symbols-outlined text-xl md:text-2xl text-orange-600 dark:text-orange-400">{feature.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-black mb-1 text-gray-900 dark:text-white">{feature.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="px-6 py-12 bg-slate-50 dark:bg-slate-900/50">
                <div className="mx-auto max-w-[900px]">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-primary-dark dark:text-white mb-3">Choose Your Package</h2>
                        <p className="text-gray-600 dark:text-gray-400">All packages include free installation and 2-year warranty</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:gap-6 md:max-w-xl md:mx-auto">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 border-2 md:border-4 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 ${selectedPackage === pkg.id
                                    ? 'border-orange-500 shadow-2xl shadow-orange-500/30'
                                    : pkg.popular
                                        ? 'border-primary/30 ring-2 ring-primary/10'
                                        : 'border-white dark:border-gray-800'
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="mb-4 -mt-4 -mx-4 bg-gradient-to-r from-primary to-green-600 text-white text-center py-2 rounded-t-2xl font-black text-sm">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white mb-4">
                                        <span className="material-symbols-outlined text-3xl">{pkg.icon}</span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">{pkg.title}</h3>
                                    <p className="text-4xl font-black text-orange-600">{pkg.price}</p>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                                            <span className="text-sm font-medium flex-1">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setSelectedPackage(pkg.id)}
                                    className={`w-full rounded-xl py-4 font-black text-lg transition-all ${selectedPackage === pkg.id
                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-2xl'
                                        : pkg.popular
                                            ? 'glossy-button text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {selectedPackage === pkg.id ? '✓ SELECTED' : 'SELECT PACKAGE'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Installation Request Form */}
            {selectedPackage && (
                <section className="px-6 py-12 bg-primary/5">
                    <div className="mx-auto max-w-2xl">
                        <div className="skeuo-card rounded-3xl p-8 md:p-12 border-4 border-white">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white mb-4">
                                    <span className="material-symbols-outlined text-3xl">schedule</span>
                                </div>
                                <h3 className="text-3xl font-black text-primary-dark mb-2">Schedule Installation</h3>
                                <p className="text-gray-600">Fill in your details and our expert will contact you within 24 hours</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Address *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District, State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Preferred Installation Date</label>
                                    <input
                                        type="date"
                                        value={formData.installDate}
                                        onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                    />
                                </div>
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-orange-800 mb-1">Selected Package:</p>
                                    <p className="text-lg font-black text-orange-600">
                                        {packages.find(p => p.id === selectedPackage)?.title}
                                    </p>
                                    <p className="text-2xl font-black text-primary-dark mt-2">
                                        {packages.find(p => p.id === selectedPackage)?.price}
                                    </p>
                                </div>
                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                                <button 
                                    onClick={handleSubmitRequest}
                                    disabled={!formData.name || !formData.phone || !formData.location || !formData.installDate || !agreedToTerms}
                                    className="vibrant-gradient w-full rounded-xl py-5 text-white font-black text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                    SUBMIT REQUEST
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center animate-bounce">
                                <span className="material-symbols-outlined text-white text-5xl">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-center text-gray-900 dark:text-white mb-3">Thanks for Applying!</h2>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-2 text-sm md:text-base">
                            Your CCTV installation request has been submitted successfully.
                        </p>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                            Our team will contact you within <span className="font-bold text-primary">48 hours</span> to finalize your installation.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
