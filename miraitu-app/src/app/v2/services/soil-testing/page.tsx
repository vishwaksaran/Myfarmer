'use client';

import { useState } from 'react';

export default function SoilTestingPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        soil_type: 'clay',
        service_type: 'basic',
        area_size: '',
    });

    const calculateCost = () => {
        const area = parseFloat(formData.area_size) || 0;
        const rates: Record<string, number> = {
            'basic': 500,
            'comprehensive': 1200,
            'micro_nutrient': 800,
        };
        const rate = rates[formData.service_type] || 500;
        // Basic calculation: rate per sample/acre roughly
        return Math.max(rate, rate * (Math.ceil(area / 5))).toLocaleString('en-IN');
    };

    const soilServices = [
        {
            icon: 'science',
            title: 'Basic Soil Analysis',
            description: 'Essential testing for pH, electrical conductivity, and organic carbon.',
            features: ['pH Level', 'EC Test', 'Organic Carbon', 'Texture Analysis'],
            price: '₹500/sample',
        },
        {
            icon: 'biotech',
            title: 'Comprehensive Package',
            description: 'Complete analysis including major nutrients (N, P, K) and micro-nutrients.',
            features: ['Macro Nutrients (NPK)', 'Micro Nutrients', 'Sulfur Test', 'Fertilizer Recommendation'],
            price: '₹1,200/sample',
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Section */}
            <section className="px-6 py-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">science</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Soil Testing Labs</h1>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            Get accurate soil health reports and expert fertilizer recommendations for higher yields.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Testing Packages</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {soilServices.map((service, index) => (
                            <div key={index} className="skeuo-card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="flex items-start gap-6">
                                    <div className="size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-900/30">
                                        <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-400">{service.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{service.title}</h3>
                                            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{service.price}</span>
                                        </div>
                                        <p className="text-gray-500 mb-6">{service.description}</p>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {service.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full rounded-xl py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
                                            Book Test
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="px-6 py-12 bg-amber-50/50 dark:bg-amber-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Cost Calculator */}
                        <div className="skeuo-card rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Estimate Cost</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Farm Size (Acres)</label>
                                    <input
                                        type="number"
                                        value={formData.area_size}
                                        onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-amber-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter total acres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Test Package</label>
                                    <select
                                        value={formData.service_type}
                                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-amber-500 outline-none transition-colors dark:text-white"
                                    >
                                        <option value="basic">Basic Analysis (₹500)</option>
                                        <option value="comprehensive">Comprehensive (₹1200)</option>
                                        <option value="micro_nutrient">Micro-Nutrients Only (₹800)</option>
                                    </select>
                                </div>
                                {formData.area_size && (
                                    <div className="mt-6 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-800">
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Estimated Cost</p>
                                        <p className="text-4xl font-black text-amber-600 dark:text-amber-400">₹{calculateCost()}</p>
                                        <p className="text-xs text-gray-500 mt-2">*Includes sample collection charges</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="skeuo-card rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Request Sample Collection</h3>
                            <p className="text-sm text-gray-500 mb-6">Our agent will visit your farm to collect soil samples</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-amber-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-amber-500 outline-none transition-colors dark:text-white"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Farm Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-amber-500 outline-none transition-colors dark:text-white"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <button className="w-full rounded-xl py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-lg shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] transition-all mt-6">
                                    SCHEDULE VISIT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
