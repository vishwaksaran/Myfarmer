'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function RentMachineryPage() {
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
            'small_machines': 400,
            'implements': 350,
            'spray_machine': 500,
            'agri_drone': 1500,
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
        {
            icon: 'settings',
            title: 'Small Machines',
            description: 'Compact equipment for small plots and precision work.',
            features: ['Power Weeder', 'Thresher', 'Seed Drill', 'Easy Transport'],
            price: 'From ₹400/hr',
        },
        {
            icon: 'build',
            title: 'Farm Implements',
            description: 'Essential attachments for various farm operations.',
            features: ['Plough Attachment', 'Harrow', 'Rotavator', 'Disc Harrow'],
            price: 'From ₹350/hr',
        },
        {
            icon: 'water_droplet',
            title: 'Spray Machines',
            description: 'Precision spraying for pesticides and fertilizers.',
            features: ['3-5 Ltr Tank', 'Adjustable Nozzles', 'Backpack Design', 'Lightweight'],
            price: 'From ₹500/hr',
        },
        {
            icon: 'airplanes',
            title: 'Agri Drones',
            description: 'Advanced drone technology for crop monitoring and spraying.',
            features: ['10L Tank Capacity', 'GPS Mapping', 'Real-time Monitoring', '25 mins Flight Time'],
            price: 'From ₹1,500/hr',
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
                        <span className="text-primary font-bold">Machinery Rentals</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative px-4 md:px-6 py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-6 md:mb-8 shadow-lg md:shadow-2xl">
                            <span className="material-symbols-outlined text-4xl md:text-5xl">agriculture</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">Farm Machinery Rentals</h1>
                        <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Modern equipment at affordable hourly rates. Book tractors, harvesters, drones, and more instantly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Machinery Grid */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-b from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Available Equipment</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 md:mb-12">Everything you need for efficient farm operations</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {machineryTypes.map((machine, index) => (
                            <div key={index} className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 md:border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300">
                                {/* Icon & Price */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="size-14 md:size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                                        <span className="material-symbols-outlined text-3xl md:text-4xl text-green-600 dark:text-green-400">{machine.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Starting from</p>
                                        <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">{machine.price}</p>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">{machine.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">{machine.description}</p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 gap-3 mb-8">
                                    {machine.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                                            <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400 flex-shrink-0">check_circle</span>
                                            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black text-base md:text-lg shadow-lg hover:shadow-green-600/30 active:scale-[0.98] transition-all">
                                    Book Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-linear-to-b from-green-50/30 to-transparent dark:from-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">Get Started Today</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-12">Choose your equipment and schedule a rental</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cost Calculator */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">calculate</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Rental Estimator</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Duration</label>
                                        <input
                                            type="number"
                                            value={formData.duration_value}
                                            onChange={(e) => setFormData({ ...formData, duration_value: e.target.value })}
                                            className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                            placeholder="e.g. 4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Unit</label>
                                        <select
                                            value={formData.duration_type}
                                            onChange={(e) => setFormData({ ...formData, duration_type: e.target.value })}
                                            className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                        >
                                            <option value="hours">Hours</option>
                                            <option value="days">Days (8h shift)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Equipment Type</label>
                                    <select
                                        value={formData.machinery_type}
                                        onChange={(e) => setFormData({ ...formData, machinery_type: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                    >
                                        <option value="tractor">Tractor (₹800/hr)</option>
                                        <option value="harvester">Harvester (₹2500/hr)</option>
                                        <option value="rotavator">Rotavator (₹600/hr)</option>
                                        <option value="small_machines">Small Machines (₹400/hr)</option>
                                        <option value="implements">Farm Implements (₹350/hr)</option>
                                        <option value="spray_machine">Spray Machine (₹500/hr)</option>
                                        <option value="agri_drone">Agri Drone (₹1500/hr)</option>
                                    </select>
                                </div>
                                {formData.duration_value && (
                                    <div className="mt-6 p-4 md:p-6 rounded-lg md:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800">
                                        <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Estimated Total</p>
                                        <p className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400">₹{calculateCost()}</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-3">*Fuel & Operator charges may vary</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">calendar_month</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Confirm Booking</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6 ml-13">We'll connect you with the nearest equipment owner</p>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <button className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-black text-base md:text-lg shadow-lg hover:shadow-green-600/30 active:scale-[0.98] transition-all mt-6">
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
