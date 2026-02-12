'use client';

import { useState, useEffect } from 'react';

export default function FPOBanner() {
    const [showModal, setShowModal] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        location: '',
        aadhar: '',
        pan: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const updateField = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\d{10}$/.test(form.phone.trim())) newErrors.phone = 'Enter a valid 10-digit number';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        if (!form.aadhar.trim()) newErrors.aadhar = 'Aadhar number is required';
        else if (!/^\d{12}$/.test(form.aadhar.trim())) newErrors.aadhar = 'Enter a valid 12-digit Aadhar';
        // PAN is optional
        if (form.pan.trim() && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan.trim().toUpperCase())) {
            newErrors.pan = 'Enter a valid PAN (e.g. ABCDE1234F)';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setShowModal(false);
                setForm({ name: '', phone: '', location: '', aadhar: '', pan: '' });
                setErrors({});
            }, 3500);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSubmitted(false);
        setErrors({});
    };

    return (
        <>
            {/* FPO Banner */}
            <section className="px-4 md:px-6 py-6">
                <div className="mx-auto max-w-[1400px]">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1a5c2e] via-[#237a3b] to-[#2d9649] p-8 md:p-10 shadow-2xl">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-green-300/30 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-200/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            {/* Icon */}
                            <div className="shrink-0">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/20">
                                    <span className="material-symbols-outlined text-white text-5xl md:text-6xl">groups_3</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-[10px]">verified</span>
                                        Government Recognized
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2">
                                    FPO — Farmer Producer Organization
                                </h2>
                                <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                                    Join a collective of farmers to get better prices, access government schemes, subsidized inputs, and direct market linkages.
                                    Book a free consultation with our FPO experts today.
                                </p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-[11px] font-bold text-white/70 uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        Free Registration
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        Expert Guidance
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-green-300 text-sm">check_circle</span>
                                        Government Subsidies
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="shrink-0">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="group flex items-center gap-3 bg-white text-[#1a5c2e] font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-[0.98] transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">calendar_month</span>
                                    Book a Service
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>

                    {/* Modal Card */}
                    <div
                        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Success Overlay */}
                        {submitted && (
                            <div className="absolute inset-0 z-20 bg-white dark:bg-gray-900 flex flex-col items-center justify-center rounded-[2rem] animate-fade-in-up p-8">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-green-400 flex items-center justify-center mb-5 shadow-xl shadow-primary/30 animate-bounce">
                                    <span className="material-symbols-outlined text-white text-4xl">check</span>
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">Consultation Booked!</h3>
                                <p className="text-gray-500 text-sm text-center max-w-xs">Our FPO expert will contact you within 24 hours. Thank you for your interest!</p>
                            </div>
                        )}

                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-[#1a5c2e] to-[#2d9649] px-8 py-6 text-white">
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-white text-lg">close</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-2xl">groups_3</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">FPO Consultation</h3>
                                    <p className="text-white/80 text-xs">Fill the form to book a free consultation</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                            {/* Name - Required */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.name ? 'border-red-400' : 'border-transparent focus-within:border-primary'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder="Enter your full name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.name}</p>}
                            </div>

                            {/* Phone - Required */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.phone ? 'border-red-400' : 'border-transparent focus-within:border-primary'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">call</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder="10-digit mobile number"
                                        type="tel"
                                        maxLength={10}
                                        value={form.phone}
                                        onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.phone}</p>}
                            </div>

                            {/* Location - Required */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    Location / Village <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.location ? 'border-red-400' : 'border-transparent focus-within:border-primary'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder="District, Village, or Pin code"
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                    />
                                </div>
                                {errors.location && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.location}</p>}
                            </div>

                            {/* Aadhar - Required */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    Aadhar Number <span className="text-red-500">*</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.aadhar ? 'border-red-400' : 'border-transparent focus-within:border-primary'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">badge</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                                        placeholder="12-digit Aadhar number"
                                        type="text"
                                        maxLength={12}
                                        value={form.aadhar}
                                        onChange={(e) => updateField('aadhar', e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                {errors.aadhar && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.aadhar}</p>}
                            </div>

                            {/* PAN - Optional */}
                            <div>
                                <label className="text-[10px] font-extrabold block mb-1.5 text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">
                                    PAN Card Number <span className="text-gray-400 normal-case">(Optional)</span>
                                </label>
                                <div className={`flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 px-4 py-3 transition-all ${errors.pan ? 'border-red-400' : 'border-transparent focus-within:border-primary'}`}>
                                    <span className="material-symbols-outlined text-gray-400 text-lg">credit_card</span>
                                    <input
                                        className="w-full bg-transparent border-none focus:ring-0 font-bold text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 uppercase"
                                        placeholder="e.g. ABCDE1234F"
                                        type="text"
                                        maxLength={10}
                                        value={form.pan}
                                        onChange={(e) => updateField('pan', e.target.value.toUpperCase())}
                                    />
                                </div>
                                {errors.pan && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">error</span>{errors.pan}</p>}
                            </div>

                            {/* Mandatory notice */}
                            <p className="text-[10px] text-gray-400 ml-1">
                                <span className="text-red-500">*</span> Marked fields are mandatory
                            </p>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1a5c2e] to-[#2d9649] text-white font-black text-base tracking-wide flex items-center justify-center gap-2 group hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-green-800/20"
                            >
                                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">calendar_month</span>
                                Book a Consultation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
