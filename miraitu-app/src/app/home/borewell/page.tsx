'use client';

import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function BorewellServicesPage() {
    const [formData, setFormData] = useState({
        depth: '',
        diameter: '',
        location: '',
        soilType: 'clay',
        name: '',
        phone: '',
        preferredDate: '',
    });

    const calculateCost = () => {
        const depth = parseInt(formData.depth) || 0;
        const baseRate = 150; // per foot
        return (depth * baseRate).toLocaleString('en-IN');
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
            <section className="px-6 py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">water_drop</span>
                        </div>
                        <h1 className="text-5xl font-black text-primary-dark mb-4">Borewell & Water Solutions</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Professional borewell drilling and submersible pump installation for sustainable farm irrigation
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black mb-8">Our Services</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="skeuo-card rounded-3xl p-8 border border-white/50">
                                <div className="flex items-start gap-6">
                                    <div className="tactile-icon size-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-3xl text-blue-600">{service.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-2xl font-black text-primary-dark">{service.title}</h3>
                                            <span className="text-lg font-bold text-blue-600">{service.price}</span>
                                        </div>
                                        <p className="text-gray-600 mb-6">{service.description}</p>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {service.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                                                    <span className="text-sm font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="glossy-button w-full rounded-xl py-3 text-white font-bold">
                                            Request Quote
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Depth Calculator & Booking Form */}
            <section className="px-6 py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Depth Calculator */}
                        <div className="skeuo-card rounded-3xl p-8 border-4 border-white">
                            <h3 className="text-2xl font-black text-primary-dark mb-6">Depth Calculator</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Required Depth (feet)</label>
                                    <input
                                        type="number"
                                        value={formData.depth}
                                        onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Enter depth (e.g., 300)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Borewell Diameter</label>
                                    <select
                                        value={formData.diameter}
                                        onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                    >
                                        <option value="">Select diameter</option>
                                        <option value="6">6 inches</option>
                                        <option value="8">8 inches (Recommended)</option>
                                        <option value="10">10 inches</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Soil Type</label>
                                    <select
                                        value={formData.soilType}
                                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                    >
                                        <option value="clay">Clay</option>
                                        <option value="sandy">Sandy</option>
                                        <option value="rocky">Rocky</option>
                                        <option value="mixed">Mixed</option>
                                    </select>
                                </div>
                                {formData.depth && (
                                    <div className="mt-6 p-6 rounded-2xl bg-blue-50 border-2 border-blue-200">
                                        <p className="text-sm font-bold text-gray-600 mb-2">Estimated Cost</p>
                                        <p className="text-4xl font-black text-blue-600">₹{calculateCost()}</p>
                                        <p className="text-xs text-gray-500 mt-2">*Base rate: ₹150/ft. Final cost may vary.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expert Consultation Form */}
                        <div className="skeuo-card rounded-3xl p-8 border-4 border-white">
                            <h3 className="text-2xl font-black text-primary-dark mb-2">Book Expert Consultation</h3>
                            <p className="text-sm text-gray-500 mb-6">Get personalized advice from our water experts</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Preferred Visit Date</label>
                                    <input
                                        type="date"
                                        value={formData.preferredDate}
                                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                    />
                                </div>
                                <button className="vibrant-gradient w-full rounded-xl py-4 text-white font-black text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all mt-6">
                                    BOOK CONSULTATION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
