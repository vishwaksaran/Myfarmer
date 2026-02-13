'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function StoragePage() {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        crop_type: 'wheat',
        storage_type: 'dry',
        quantity: '',
        duration: '',
    });

    const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

    const handleCalculate = () => {
        const qty = parseFloat(formData.quantity) || 0;
        const months = parseFloat(formData.duration) || 1;

        // Rates per Quintal per Month (approx)
        const rates: Record<string, number> = {
            'dry': 50,      // Dry Storage
            'cold': 150,    // Cold Storage
            'silo': 80,     // Silo Storage
        };

        const rate = rates[formData.storage_type] || 50;
        const total = rate * qty * months;

        setEstimatedCost(Math.max(0, total).toLocaleString('en-IN'));
    };

    const storageServices = [
        {
            icon: 'warehouse',
            title: 'Dry Storage Godowns',
            description: 'Secure, ventilated godowns for grains, pulses, and non-perishable crops.',
            features: ['Pest Control', 'Moisture Monitoring', '24/7 Security', 'Fire Safety'],
            price: '₹50/quintal/mo',
        },
        {
            icon: 'ac_unit',
            title: 'Cold Storage Units',
            description: 'Temperature-controlled storage for fruits, vegetables, and perishables.',
            features: ['Temp. Control (2°C - 15°C)', 'Humidity Control', 'Backup Power', 'Hygiene Standards'],
            price: '₹150/quintal/mo',
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Section */}
            <section className="relative px-6 py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="absolute top-6 left-6 md:left-12">
                        <Link
                            href="/home/services"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-sm font-bold hover:bg-white/80 dark:hover:bg-black/40 transition-all text-gray-700 dark:text-gray-200"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Services
                        </Link>
                    </div>
                    <div className="text-center mb-12 pt-10">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">warehouse</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Agricultural Storage & Godowns</h1>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            Protect your harvest from spoilage, pests, and price fluctuations. Secure storage facilities near you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Storage Types</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {storageServices.map((service, index) => (
                            <div key={index} className="skeuo-card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="flex items-start gap-6">
                                    <div className="size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                        <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">{service.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{service.title}</h3>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{service.price}</span>
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
                                        <button className="w-full rounded-xl py-3 bg-green-700 hover:bg-green-800 text-white font-bold transition-colors">
                                            Book Space
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="px-6 py-12 bg-green-50/50 dark:bg-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Cost Calculator */}
                        <div className="skeuo-card rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Storage Cost Estimator</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Quantity (Quintals)</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter weight in quintals"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Duration (Months)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Number of provided months"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Storage Type</label>
                                    <select
                                        value={formData.storage_type}
                                        onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                    >
                                        <option value="dry">Dry Godown (₹50/qtl)</option>
                                        <option value="cold">Cold Storage (₹150/qtl)</option>
                                        <option value="silo">Grain Silo (₹80/qtl)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleCalculate}
                                    className="w-full rounded-xl py-3 bg-green-600 hover:bg-green-700 text-white font-bold transition-colors mt-4 shadow-lg hover:shadow-green-500/20 active:scale-[0.98]"
                                >
                                    Calculate Cost
                                </button>

                                {estimatedCost && (
                                    <div className="mt-6 p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Estimated Storage Cost</p>
                                        <p className="text-4xl font-black text-green-700 dark:text-green-300">₹{estimatedCost}</p>
                                        <p className="text-xs text-gray-500 mt-2">*Includes handling charges</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="skeuo-card rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Book Storage Space</h3>
                            <p className="text-sm text-gray-500 mb-6">Connect with verified godown owners instantly</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Crop / Item</label>
                                    <input
                                        type="text"
                                        value={formData.crop_type}
                                        onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="e.g. Wheat, Onions, Potatoes"
                                    />
                                </div>
                                <button className="w-full rounded-xl py-4 bg-gradient-to-r from-green-700 to-emerald-800 text-white font-black text-lg shadow-lg hover:shadow-green-500/30 active:scale-[0.98] transition-all mt-6">
                                    FIND GODOWN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
