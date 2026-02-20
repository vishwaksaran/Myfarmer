'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLoginPrompt } from '@/context/LoginPromptContext';

const services = [
    {
        name: 'Treatment',
        icon: 'medical_services',
        desc: 'Expert diagnosis & care',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
        name: 'Vaccination',
        icon: 'vaccines',
        desc: 'Prevent diseases early',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
        name: 'Artificial Insemination',
        icon: 'science',
        desc: 'Elite genetics for better yield',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
        name: 'Deworming',
        icon: 'medication',
        desc: 'Regular health checkups',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20'
    }
];

export default function VeterinarySection() {
    const { requireLogin } = useLoginPrompt();
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        location: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleBookNow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!requireLogin()) return; // Enforce login

        const errs: Record<string, string> = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        const digits = formData.mobile.replace(/\D/g, '');
        if (!digits) errs.mobile = 'Mobile number is required';
        else if (digits.length !== 10) errs.mobile = 'Enter a valid 10-digit number';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        setShowSuccess(true);
    };

    return (
        <section className="py-12 md:py-16 bg-white dark:bg-[#121811] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#2c5926 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-sm">health_and_safety</span>
                            Animal Health
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            Veterinary Services
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            Verified veterinarians, 24/7 emergency support, and doorstep health services for your livestock.
                        </p>
                    </div>

                    <Link
                        href="/home/veterinary"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        View All Services <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {services.map((service, index) => (
                        <div
                            onClick={() => setSelectedService(service.name)}
                            key={index}
                            className="group relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a231a] hover:bg-white dark:hover:bg-[#222d21] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-3xl ${service.color}`}>
                                    {service.icon}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {service.desc}
                            </p>

                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                <span className="material-symbols-outlined text-sm text-gray-400">arrow_outward</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <button
                        onClick={() => setSelectedService('General Consultation')}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                        data-no-auth
                    >
                        Book a Service <span className="material-symbols-outlined">calendar_month</span>
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedService(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            data-no-auth
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        {!showSuccess ? (
                            <div className="p-8">
                                <div className="mb-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1 block">Book Appointment</span>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedService}</h3>
                                    <p className="text-gray-500 text-sm">Fill details to get callbacks from providers</p>
                                </div>

                                <form onSubmit={handleBookNow} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Mobile Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.mobile}
                                            onChange={(e) => { setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }); setFormErrors(prev => { const {mobile, ...r} = prev; return r; }); }}
                                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${formErrors.mobile ? 'border-red-400' : 'border-transparent'} focus:border-green-500 outline-none transition-colors`}
                                            placeholder="10-digit number"
                                            maxLength={10}
                                        />
                                        {formErrors.mobile && <p className="text-red-500 text-xs mt-1">{formErrors.mobile}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Location</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-green-500 outline-none transition-colors"
                                            placeholder="Village, District"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all mt-4"
                                    >
                                        Book Now
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-8 text-center py-12">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Thank you for booking. We will assign a doctor shortly.
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedService(null); setShowSuccess(false); setFormData({ name: '', mobile: '', location: '' }); }}
                                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
