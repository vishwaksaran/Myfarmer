'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RentMachineryPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        machinery_type: 'tractor',
        duration_type: 'hours',
        duration_value: '',
        start_date: '',
    });

    const calculateCost = () => {
        const duration = parseFloat(formData.duration_value) || 1;

        // Rates per Hour/Day (approx)
        const hourlyRates: Record<string, number> = {
            'tractor': 800,
            'harvester': 2500,
            'rotavator': 600,
            'drone': 1500,
        };

        // Assume 8 hours work day for day conversion if needed, but let's keep it simple
        const rate = hourlyRates[formData.machinery_type] || 800;
        const multiplier = formData.duration_type === 'days' ? 8 : 1;

        const total = rate * duration * multiplier;

        return Math.max(0, total).toLocaleString('en-IN');
    };

    const machineryTypes = [
        {
            icon: 'agriculture',
            title: 'Tractors (45-60 HP)',
            description: 'Powerful tractors for plowing, tilling, and transport.',
            features: ['4WD Options', 'AC Cabin Available', 'Operators Included', 'Fuel Inclusive'],
            price: 'From ₹800/hr',
        },
        {
            icon: 'grass',
            title: 'Combine Harvesters',
            description: 'Efficient harvesting for wheat, paddy, and soy.',
            features: ['Multi-crop Support', 'Track/Wheel Type', 'Grain Tank', 'Straw Management'],
            price: 'From ₹2,500/hr',
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Section */}
            <section className="relative px-6 py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="absolute top-6 left-6 md:left-12">
                        <Link
                            href="/v2/services"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm text-sm font-bold hover:bg-white/80 dark:hover:bg-black/40 transition-all text-gray-700 dark:text-gray-200"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Services
                        </Link>
                    </div>
                    <div className="text-center mb-12 pt-10">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">agriculture</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Farm Machinery Rentals</h1>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            Modern equipment at affordable hourly rates. Book tractors, harvesters, and drones instantly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Machinery Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Available Equipment</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {machineryTypes.map((machine, index) => (
                            <div key={index} className="skeuo-card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="flex items-start gap-6">
                                    <div className="size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                        <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">{machine.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{machine.title}</h3>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{machine.price}</span>
                                        </div>
                                        <p className="text-gray-500 mb-6">{machine.description}</p>
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {machine.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full rounded-xl py-3 bg-green-600 hover:bg-green-700 text-white font-bold transition-colors">
                                            Book Now
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
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Rental Estimator</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Duration</label>
                                        <input
                                            type="number"
                                            value={formData.duration_value}
                                            onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                            placeholder="e.g. 4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Unit</label>
                                        <select
                                            value={formData.duration_type}
                                            onChange={(e) => setFormData({ ...formData, duration_type: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        >
                                            <option value="hours">Hours</option>
                                            <option value="days">Days (8h shift)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Equipment Type</label>
                                    <select
                                        value={formData.machinery_type}
                                        onChange={(e) => setFormData({ ...formData, machinery_type: e.target.value })}
                                        className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                    >
                                        <option value="tractor">Tractor (₹800/hr)</option>
                                        <option value="harvester">Harvester (₹2500/hr)</option>
                                        <option value="rotavator">Rotavator (₹600/hr)</option>
                                        <option value="drone">Spray Drone (₹1500/hr)</option>
                                    </select>
                                </div>
                                {formData.duration_value && (
                                    <div className="mt-6 p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800">
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Estimated Rental Cost</p>
                                        <p className="text-4xl font-black text-green-700 dark:text-green-400">₹{calculateCost()}</p>
                                        <p className="text-xs text-gray-500 mt-2">*Fuel & Operator charges may vary</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="skeuo-card rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Confirm Booking</h3>
                            <p className="text-sm text-gray-500 mb-6">We'll connect you with the nearest equipment owner</p>
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
                                <button className="w-full rounded-xl py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-black text-lg shadow-lg hover:shadow-green-500/30 active:scale-[0.98] transition-all mt-6">
                                    REQUEST MACHINERY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
