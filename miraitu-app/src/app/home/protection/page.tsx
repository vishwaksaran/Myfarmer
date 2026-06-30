'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import { normalizeIndianPhone } from '@/lib/phone';

export default function ProtectionServicesPage() {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        pond_area: '',
        pond_depth: '',
    });
    const { submit, submitting } = useBookingSubmit();

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setHeaderVisible(y <= 80 || y < lastScrollY.current);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleGetQuotation = async () => {
        const errs: Record<string, string> = {};
        if (!formData.full_name.trim()) errs.full_name = 'Name is required';
        const digits = formData.phone.replace(/\D/g, '');
        if (!digits) errs.phone = 'Phone number is required';
        else if (digits.length !== 10) errs.phone = 'Enter a valid 10-digit number';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        const result = await submit({
            module: 'protection',
            category: selectedSheet || 'tarpaulin',
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            extra_data: {
                pond_area: formData.pond_area,
                pond_depth: formData.pond_depth,
                selected_sheet: selectedSheet,
            },
        });
        if (result.success) setShowSuccessModal(true);
        else setFormErrors({ submit: result.error || 'Failed to submit' });
    };

    const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

    const tharpaiSheets = [
        {
            id: 'light-duty',
            name: 'Light Duty Tarpaulin',
            gsm: '120 GSM',
            price: '₹45/sqm',
            uses: ['Crop cover', 'Temporary shade', 'Light protection'],
            color: 'Blue/Green',
        },
        {
            id: 'heavy-duty',
            name: 'Heavy Duty Tarpaulin',
            gsm: '200 GSM',
            price: '₹75/sqm',
            uses: ['Warehouse cover', 'Equipment protection', 'Long-term use'],
            color: 'Green/Orange',
            popular: true,
        },
        {
            id: 'virgin',
            name: 'Virgin HDPE Sheet',
            gsm: '250 GSM',
            price: '₹95/sqm',
            uses: ['Premium protection', 'UV resistant', 'All-weather'],
            color: 'Various colors',
        },
    ];

    const pondingSheets = [
        {
            id: 'fish-pond-400',
            name: 'Fish Pond Liner - 400 GSM',
            thickness: '400 microns',
            price: '₹180/sqm',
            features: [
                'BIS Certified',
                'UV Stabilized',
                'Puncture resistant',
                'Flexible in cold',
                '10-year lifespan',
            ],
            applications: ['Fish farming', 'Aquaculture', 'Water storage'],
        },
        {
            id: 'fish-pond-600',
            name: 'Fish Pond Liner - 600 GSM',
            thickness: '600 microns',
            price: '₹250/sqm',
            features: [
                'Premium quality',
                'BIS Certified',
                'Ultra UV resistant',
                'Tear resistant',
                'Chemical resistant',
                '15-year lifespan',
            ],
            applications: ['Commercial fish farming', 'Large ponds', 'Industrial water storage'],
            premium: true,
        },
    ];

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
                        <span className="text-primary font-bold">Protection</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-12 bg-gradient-to-br from-teal-50 to-cyan-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-teal-600 to-cyan-700 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text4xl">shield</span>
                        </div>
                        <h1 className="text-5xl font-black text-primary-dark mb-4">Protection & Specialized Services</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Heavy-duty tarpaulins and high-GSM sheets for crop protection and fish farming
                        </p>
                    </div>
                </div>
            </section>

            {/* Tharpai/Tarpaulin Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black mb-2">Tharpai (Tarpaulin) Sheets</h2>
                        <p className="text-gray-600">Durable protection for crops, equipment, and temporary structures</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tharpaiSheets.map((sheet) => (
                            <div
                                key={sheet.id}
                                className={`skeuo-card rounded-2xl p-6 border-4 transition-all ${sheet.popular
                                    ? 'border-primary/30 lg:scale-105'
                                    : 'border-white'
                                    }`}
                            >
                                {sheet.popular && (
                                    <div className="mb-4 -mt-2 -mx-2 bg-gradient-to-r from-primary to-green-600 text-white text-center py-1.5 rounded-t-xl font-black text-xs">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-teal-100 text-teal-600 mb-4">
                                        <span className="material-symbols-outlined text-3xl">package_2</span>
                                    </div>
                                    <h3 className="text-xl font-black mb-2">{sheet.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{sheet.gsm}</p>
                                    <p className="text-2xl font-black text-primary">{sheet.price}</p>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Common Uses:</p>
                                        {sheet.uses.map((use, idx) => (
                                            <div key={idx} className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-xs text-green-600">check</span>
                                                <span className="text-sm">{use}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Available Color:</p>
                                        <p className="text-sm font-medium">{sheet.color}</p>
                                    </div>
                                </div>
                                <button className="w-full rounded-xl py-3 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
                                    Get Quote
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ponding Sheets for Fish Farming */}
            <section className="px-6 py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black mb-2">Ponding Sheets for Fish Farming</h2>
                        <p className="text-gray-600">High-GSM specialized sheets for fish ponds and water storage tanks</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pondingSheets.map((sheet) => (
                            <div
                                key={sheet.id}
                                className={`skeuo-card rounded-3xl p-8 border-4 ${sheet.premium ? 'border-cyan-500/30' : 'border-white'
                                    }`}
                            >
                                {sheet.premium && (
                                    <div className="mb-6 -mt-4 -mx-4 bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-center py-2.5 rounded-t-2xl font-black text-sm">
                                        💎 PREMIUM QUALITY
                                    </div>
                                )}
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="tactile-icon size-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-600 flex-shrink-0">
                                        <span className="material-symbols-outlined text-3xl text-white">water</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-primary-dark mb-1">{sheet.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">Thickness: {sheet.thickness}</p>
                                        <p className="text-3xl font-black text-primary">{sheet.price}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">Features:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sheet.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs text-green-600">verified</span>
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">Applications:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sheet.applications.map((app, idx) => (
                                            <span key={idx} className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                                                {app}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSheet(sheet.id)}
                                    className={`w-full rounded-xl py-4 font-black text-lg transition-all ${selectedSheet === sheet.id
                                        ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-2xl'
                                        : sheet.premium
                                            ? 'glossy-button text-white'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {selectedSheet === sheet.id ? '✓ SELECTED' : 'REQUEST QUOTE'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Request Form */}
            {selectedSheet && (
                <section className="px-6 py-12">
                    <div className="mx-auto max-w-2xl">
                        <div className="skeuo-card rounded-3xl p-8 md:p-12 border-4 border-white">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white mb-4">
                                    <span className="material-symbols-outlined text-3xl">request_quote</span>
                                </div>
                                <h3 className="text-3xl font-black text-primary-dark mb-2">Request Pond Liner Quote</h3>
                                <p className="text-gray-600">Get customized quotation for your fish farming needs</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); setFormErrors(prev => { const { full_name, ...r } = prev; return r; }); }}
                                            className={`w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none ${formErrors.full_name ? 'ring-2 ring-red-400' : ''}`}
                                            placeholder="Enter your name"
                                        />
                                        {formErrors.full_name && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.full_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => { setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) }); setFormErrors(prev => { const { phone, ...r } = prev; return r; }); }}
                                            className={`w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none ${formErrors.phone ? 'ring-2 ring-red-400' : ''}`}
                                            placeholder="10-digit number"
                                            maxLength={14}
                                        />
                                        {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.phone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Location *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors(prev => { const { location, ...r } = prev; return r; }); }}
                                        className={`w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none ${formErrors.location ? 'ring-2 ring-red-400' : ''}`}
                                        placeholder="Village, District, State"
                                    />
                                    {formErrors.location && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.location}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Pond Area (sqm)</label>
                                        <input
                                            type="number"
                                            value={formData.pond_area}
                                            onChange={(e) => setFormData({ ...formData, pond_area: e.target.value })}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="e.g., 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Pond Depth (feet)</label>
                                        <input
                                            type="number"
                                            value={formData.pond_depth}
                                            onChange={(e) => setFormData({ ...formData, pond_depth: e.target.value })}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="e.g., 6"
                                        />
                                    </div>
                                </div>
                                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-cyan-800 mb-1">Selected Product:</p>
                                    <p className="text-lg font-black text-cyan-600">
                                        {pondingSheets.find(s => s.id === selectedSheet)?.name}
                                    </p>
                                </div>
                                <button
                                    onClick={handleGetQuotation}
                                    disabled={!formData.full_name || !formData.phone || !formData.location}
                                    className="vibrant-gradient w-full rounded-xl py-5 text-white font-black text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                    GET QUOTATION
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}>
                    <div className="mx-4 max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6 md:p-8 text-center shadow-2xl" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                        <div className="flex justify-center mb-4 md:mb-6">
                            <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Quote Requested!</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">Your protection sheet quotation request has been submitted successfully.</p>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon with customized solutions</p>
                        </div>
                        <button onClick={() => { setShowSuccessModal(false); setFormData({ full_name: '', phone: '', location: '', pond_area: '', pond_depth: '' }); }} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">Done</button>
                    </div>
                    <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
                </div>
            )}
        </div>
    );
}
