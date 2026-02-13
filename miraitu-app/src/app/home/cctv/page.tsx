'use client';

import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function CCTVSurveillancePage() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={40} />
                        <h2 className="text-2xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                    </div>
                    <a href="/home/services" className="text-sm font-semibold hover:text-primary transition-colors">
                        ← Back to Services
                    </a>
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
                    <h2 className="text-3xl font-black text-center mb-12">Why Farm Surveillance?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="skeuo-card rounded-2xl p-6 text-center">
                                <div className="inline-flex items-center justify-center size-16 rounded-xl bg-orange-100 mb-4">
                                    <span className="material-symbols-outlined text-3xl text-orange-600">{feature.icon}</span>
                                </div>
                                <h3 className="text-lg font-black mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages Section */}
            <section className="px-6 py-12 bg-slate-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-primary-dark mb-4">Choose Your Package</h2>
                        <p className="text-gray-600">All packages include free installation and 2-year warranty</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`skeuo-card rounded-3xl p-8 border-4 transition-all ${selectedPackage === pkg.id
                                    ? 'border-orange-500 shadow-2xl shadow-orange-500/30'
                                    : pkg.popular
                                        ? 'border-primary/30'
                                        : 'border-white'
                                    } ${pkg.popular ? 'lg:scale-105' : ''}`}
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
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Address *</label>
                                    <input
                                        type="text"
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District, State"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Area (Acres)</label>
                                    <input
                                        type="number"
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="e.g., 10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Preferred Installation Date</label>
                                    <input
                                        type="date"
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Special Requirements (Optional)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none bg-white resize-none"
                                        placeholder="Any specific requirements or questions..."
                                    ></textarea>
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
                                <button className="vibrant-gradient w-full rounded-xl py-5 text-white font-black text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                    SUBMIT REQUEST
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
