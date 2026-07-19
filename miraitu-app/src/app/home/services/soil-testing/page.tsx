'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { normalizeIndianPhone } from '@/lib/phone';
import { usePrefillLocation } from '@/context/LocationContext';

export default function SoilTestingPage() {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const { submit, submitting } = useBookingSubmit();
    const bookingFormRef = useRef<HTMLDivElement>(null);

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
        soil_type: 'clay',
        service_type: 'basic',
        area_size: '',
        preferred_date: '',
        preferred_time: '',
    });

    usePrefillLocation(formData.location, (loc) => setFormData(prev => ({ ...prev, location: loc })));

    const calculateCost = () => {
        const area = parseFloat(formData.area_size) || 0;
        const rates: Record<string, number> = {
            'basic': 500,
            'comprehensive': 1200,
            'micro_nutrient': 800,
        };
        const rate = rates[formData.service_type] || 500;
        return Math.max(rate, rate * (Math.ceil(area / 5))).toLocaleString('en-IN');
    };

    const handleBookTest = (serviceType: string) => {
        setFormData(prev => ({ ...prev, service_type: serviceType }));
        // Scroll to booking form
        setTimeout(() => {
            bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const handleScheduleVisit = async () => {
        const errs: Record<string, string> = {};
        if (!formData.full_name.trim()) errs.full_name = 'Name is required';
        const digits = formData.phone.replace(/\D/g, '');
        if (!digits) errs.phone = 'Phone number is required';
        else if (digits.length !== 10) errs.phone = 'Enter a valid 10-digit number';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        const result = await submit({
            module: 'services',
            category: 'soil-testing',
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            preferred_date: formData.preferred_date || undefined,
            preferred_time: formData.preferred_time || undefined,
            extra_data: {
                soil_type: formData.soil_type,
                service_type: formData.service_type,
                area_size: formData.area_size,
                estimated_cost: `₹${calculateCost()}`,
            },
        });
        if (result.success) setShowSuccessModal(true);
        else setFormErrors({ submit: result.error || 'Failed to submit' });
    };

    const soilServices = [
        {
            id: 'basic',
            icon: 'science',
            title: 'Basic Soil Analysis',
            description: 'Essential testing for pH, electrical conductivity, and organic carbon.',
            features: ['pH Level', 'EC Test', 'Organic Carbon', 'Texture Analysis'],
            price: '₹500/sample',
        },
        {
            id: 'comprehensive',
            icon: 'biotech',
            title: 'Comprehensive Package',
            description: 'Complete analysis including major nutrients (N, P, K) and micro-nutrients.',
            features: ['Macro Nutrients (NPK)', 'Micro Nutrients', 'Sulfur Test', 'Fertilizer Recommendation'],
            price: '₹1,200/sample',
        },
    ];

    const packageLabels: Record<string, string> = {
        basic: 'Basic Analysis',
        comprehensive: 'Comprehensive Package',
        micro_nutrient: 'Micro-Nutrients Only',
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-3 md:py-4">
                    <nav className="flex items-center gap-1 text-xs md:text-sm">
                        <a href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">Home</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <a href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">Services</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <span className="text-primary font-bold">Soil Testing</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative px-4 md:px-6 py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-2xl md:rounded-3xl bg-gradient-to-br from-green-600 to-emerald-600 text-white mb-6 md:mb-8 shadow-lg md:shadow-2xl">
                            <span className="material-symbols-outlined text-4xl md:text-5xl">science</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">Soil Testing Labs</h1>
                        <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Get accurate soil health reports and expert fertilizer recommendations for higher yields.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="px-4 md:px-6 py-12 bg-gradient-to-b from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Testing Packages</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 md:mb-12">Choose the package that fits your farm&apos;s needs</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {soilServices.map((service) => (
                            <div key={service.id} className={`skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 md:border transition-all duration-300 ${formData.service_type === service.id
                                ? 'border-primary shadow-2xl shadow-primary/30 bg-white dark:bg-gray-800'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl'
                                }`}>
                                {/* Icon & Price */}
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="size-14 md:size-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                                        <span className="material-symbols-outlined text-3xl md:text-4xl text-green-600 dark:text-green-400">{service.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Starting from</p>
                                        <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">{service.price}</p>
                                    </div>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">{service.title}</h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 gap-3 mb-8">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 dark:bg-green-900/20">
                                            <span className="material-symbols-outlined text-sm text-green-600 dark:text-green-400 flex-shrink-0">check_circle</span>
                                            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleBookTest(service.id)}
                                    className={`w-full rounded-lg md:rounded-xl py-3 md:py-4 font-black text-base md:text-lg shadow-lg active:scale-[0.98] transition-all ${formData.service_type === service.id
                                        ? 'glossy-button text-white'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-green-600/30'
                                        }`}
                                >
                                    {formData.service_type === service.id ? '✓ SELECTED' : 'Book Test'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Form */}
            <section className="px-4 md:px-6 py-12 md:py-16 bg-gradient-to-b from-green-50/30 to-transparent dark:from-green-900/10">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">Get Started Today</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-12">Choose your package and schedule a sample collection visit</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Cost Calculator */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">calculate</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Estimate Cost</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Farm Size (Acres)</label>
                                    <input
                                        type="number"
                                        value={formData.area_size}
                                        onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        placeholder="Enter total acres"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Test Package</label>
                                    <select
                                        value={formData.service_type}
                                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                        className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                    >
                                        <option value="basic">Basic Analysis (₹500)</option>
                                        <option value="comprehensive">Comprehensive (₹1200)</option>
                                        <option value="micro_nutrient">Micro-Nutrients Only (₹800)</option>
                                    </select>
                                </div>
                                {formData.area_size && (
                                    <div className="mt-6 p-4 md:p-6 rounded-lg md:rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/10 border-2 border-green-200 dark:border-green-800">
                                        <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Estimated Total</p>
                                        <p className="text-3xl md:text-4xl font-black text-green-600 dark:text-green-400">₹{calculateCost()}</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-3">*Includes sample collection charges</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div ref={bookingFormRef} className="skeuo-card rounded-2xl md:rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-green-900/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg text-green-600 dark:text-green-400">location_on</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Schedule Collection</h3>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-6 ml-13">Our agent will visit your farm to collect soil samples</p>

                            {/* Selected Package Indicator */}
                            <div className="mb-4 p-3 md:p-4 rounded-lg md:rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                                <p className="text-xs md:text-sm font-bold text-gray-600 dark:text-gray-400 mb-0.5">Selected Package:</p>
                                <p className="text-base md:text-lg font-black text-green-600 dark:text-green-400">
                                    {packageLabels[formData.service_type] || 'Basic Analysis'}
                                </p>
                            </div>

                            {formErrors.submit && (
                                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{formErrors.submit}</p>
                                </div>
                            )}

                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); setFormErrors(prev => { const { full_name, ...r } = prev; return r; }); }}
                                        className={`w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 outline-none transition-colors dark:text-white text-sm md:text-base ${formErrors.full_name ? 'border-red-400' : 'border-transparent focus:border-green-500'}`}
                                        placeholder="Enter your name"
                                    />
                                    {formErrors.full_name && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.full_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Phone Number *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => { setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) }); setFormErrors(prev => { const { phone, ...r } = prev; return r; }); }}
                                        className={`w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 outline-none transition-colors dark:text-white text-sm md:text-base ${formErrors.phone ? 'border-red-400' : 'border-transparent focus:border-green-500'}`}
                                        placeholder="10-digit number"
                                        maxLength={14}
                                    />
                                    {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Farm Location *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors(prev => { const { location, ...r } = prev; return r; }); }}
                                        className={`w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 outline-none transition-colors dark:text-white text-sm md:text-base ${formErrors.location ? 'border-red-400' : 'border-transparent focus:border-green-500'}`}
                                        placeholder="Village, District"
                                    />
                                    {formErrors.location && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.location}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Preferred Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.preferred_date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                                            className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Preferred Time</label>
                                        <select
                                            value={formData.preferred_time}
                                            onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                                            className="w-full rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-green-500 outline-none transition-colors dark:text-white text-sm md:text-base appearance-none"
                                        >
                                            <option value="">Select a time slot</option>
                                            <option value="Morning (8 AM – 11 AM)">Morning (8 AM – 11 AM)</option>
                                            <option value="Late Morning (11 AM – 2 PM)">Late Morning (11 AM – 2 PM)</option>
                                            <option value="Afternoon (2 PM – 5 PM)">Afternoon (2 PM – 5 PM)</option>
                                            <option value="Evening (5 PM – 8 PM)">Evening (5 PM – 8 PM)</option>
                                        </select>
                                    </div>
                                </div>
                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                                <button
                                    onClick={handleScheduleVisit}
                                    disabled={submitting || !agreedToTerms}
                                    className="w-full rounded-lg md:rounded-xl py-3 md:py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-black text-base md:text-lg shadow-lg hover:shadow-green-600/30 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                            SUBMITTING...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xl">send</span>
                                            SCHEDULE VISIT
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}>
                    <div className="mx-4 max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 md:p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                        <div className="flex justify-center mb-4 md:mb-6">
                            <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-full bg-gradient-to-br from-green-400 to-primary">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary-dark dark:text-white mb-2 md:mb-3">Visit Scheduled!</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">Your soil testing request has been submitted successfully.</p>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon to schedule the soil sample collection</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setFormData({ full_name: '', phone: '', location: '', soil_type: 'clay', service_type: formData.service_type, area_size: '', preferred_date: '', preferred_time: '' });
                            }}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                    <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
                </div>
            )}
        </div>
    );
}
