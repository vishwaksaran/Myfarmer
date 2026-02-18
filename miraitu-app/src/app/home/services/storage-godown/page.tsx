'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function StoragePage() {
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
        crop_type: 'wheat',
        storage_type: 'dry',
        quantity: '',
        duration: '',
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [estimatedCost, setEstimatedCost] = useState<string | null>(null);

    const handleFindGodown = () => {
        if (!formData.full_name || !formData.phone || !formData.location) {
            alert('Please fill in all required fields');
            return;
        }
        setShowSuccessModal(true);
        setTimeout(() => {
            setFormData({ full_name: '', phone: '', location: '', crop_type: 'wheat', storage_type: 'dry', quantity: '', duration: '' });
            setShowSuccessModal(false);
        }, 3000);
    };

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
                        <span className="text-primary font-bold">Storage & Godowns</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative px-4 md:px-6 py-8 md:py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center size-14 md:size-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-4 md:mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-2xl md:text-4xl">warehouse</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 md:mb-4">Agricultural Storage & Godowns</h1>
                        <p className="text-sm md:text-lg lg:text-xl text-gray-500 max-w-3xl mx-auto">
                            Protect your harvest from spoilage, pests, and price fluctuations. Secure storage facilities near you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-4 md:px-6 py-8 md:py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-5 md:mb-8">Storage Types</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                        {storageServices.map((service, index) => (
                            <div key={index} className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                                    <div className="size-12 md:size-16 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30">
                                        <span className="material-symbols-outlined text-2xl md:text-3xl text-green-600 dark:text-green-400">{service.icon}</span>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3 md:mb-4">
                                            <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">{service.title}</h3>
                                            <span className="text-sm md:text-lg font-bold text-green-600 dark:text-green-400 flex-shrink-0">{service.price}</span>
                                        </div>
                                        <p className="text-xs md:text-base text-gray-500 mb-4 md:mb-6">{service.description}</p>
                                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                                            {service.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 md:gap-2">
                                                    <span className="material-symbols-outlined text-xs md:text-sm text-green-500">check_circle</span>
                                                    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full rounded-lg md:rounded-xl py-2.5 md:py-3 bg-green-700 hover:bg-green-800 text-white font-bold text-sm md:text-base transition-colors">
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
            <section className="px-4 md:px-6 py-8 md:py-12 bg-green-50/50 dark:bg-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                        {/* Cost Calculator */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mb-4 md:mb-6">Storage Cost Estimator</h3>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Quantity (Quintals)</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter weight in quintals"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Duration (Months)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Number of months"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Storage Type</label>
                                    <select
                                        value={formData.storage_type}
                                        onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                    >
                                        <option value="dry">Dry Godown (₹50/qtl)</option>
                                        <option value="cold">Cold Storage (₹150/qtl)</option>
                                        <option value="silo">Grain Silo (₹80/qtl)</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleCalculate}
                                    className="w-full rounded-lg md:rounded-xl py-2.5 md:py-3 text-sm md:text-base bg-green-600 hover:bg-green-700 text-white font-bold transition-colors mt-3 md:mt-4 shadow-lg hover:shadow-green-500/20 active:scale-[0.98]"
                                >
                                    Calculate Cost
                                </button>

                                {estimatedCost && (
                                    <div className="mt-4 md:mt-6 p-4 md:p-6 rounded-xl md:rounded-2xl bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Estimated Storage Cost</p>
                                        <p className="text-2xl md:text-4xl font-black text-green-700 dark:text-green-300">₹{estimatedCost}</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">*Includes handling charges</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white mb-1 md:mb-2">Book Storage Space</h3>
                            <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">Connect with verified godown owners instantly</p>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="Village, District"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700 dark:text-gray-300">Crop / Item</label>
                                    <input
                                        type="text"
                                        value={formData.crop_type}
                                        onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white"
                                        placeholder="e.g. Wheat, Onions, Potatoes"
                                    />
                                </div>
                                <button 
                                    onClick={handleFindGodown}
                                    disabled={!formData.full_name || !formData.phone || !formData.location}
                                    className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-gradient-to-r from-green-700 to-emerald-800 text-white font-black text-sm md:text-lg shadow-lg hover:shadow-green-500/30 active:scale-[0.98] transition-all mt-4 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                                    FIND GODOWN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 md:p-8 text-center shadow-2xl animate-in fade-in scale-in duration-300">
                        <div className="flex justify-center mb-4 md:mb-6">
                            <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 animate-bounce">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Thanks for Applying!</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-1">Your storage space request has been submitted successfully.</p>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Our team will contact you within 48 hours to connect you with verified godown owners.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
