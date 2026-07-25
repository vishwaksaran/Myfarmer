'use client';

import { useState, useEffect, useRef } from 'react';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { normalizeIndianPhone } from '@/lib/phone';
import { usePrefillLocation } from '@/context/LocationContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';

export default function FencingInfrastructurePage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        location: '',
        fencing_length: '',
        preferred_timeline: 'Within 1 week',
        preferred_date: '',
        preferred_time: '',
    });
    const { submit, submitting } = useBookingSubmit();

    usePrefillLocation(formData.location, (loc) => setFormData(prev => ({ ...prev, location: loc })));

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setHeaderVisible(y <= 80 || y < lastScrollY.current);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleRequestFencingQuote = async () => {
        const errs: Record<string, string> = {};
        if (!formData.full_name.trim()) errs.full_name = tp('Name is required');
        const digits = formData.phone.replace(/\D/g, '');
        if (!digits) errs.phone = tp('Phone number is required');
        else if (digits.length !== 10) errs.phone = tp('Enter a valid 10-digit number');
        if (!formData.location.trim()) errs.location = tp('Location is required');
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        const result = await submit({
            module: 'fencing',
            category: selectedFencingType || 'chain-link',
            full_name: formData.full_name,
            phone: formData.phone,
            location: formData.location,
            preferred_date: formData.preferred_date || undefined,
            preferred_time: formData.preferred_time || undefined,
            extra_data: {
                fencing_length: formData.fencing_length,
                preferred_timeline: formData.preferred_timeline,
                fencing_type: selectedFencingType,
            },
        });
        if (result.success) setShowSuccessModal(true);
        else setFormErrors({ submit: result.error || 'Failed to submit' });
    };

    const [selectedFencingType, setSelectedFencingType] = useState<string>('chain-link');

    const fencingTypes = [
        {
            id: 'chain-link',
            icon: 'grid_on',
            title: tp('Rough/Chain-Link Fencing'),
            description: tp('Cost-effective boundary marking and perimeter security for farms.'),
            price: '₹45/ft',
            features: [
                tp('Galvanized steel wire'),
                tp('Weather resistant'),
                tp('Easy installation'),
                tp('Low maintenance'),
                tp('10-year lifespan'),
            ],
            gradient: 'from-gray-500 to-gray-700',
        },
        {
            id: 'electric',
            icon: 'bolt',
            title: tp('Electrical/Power Fencing'),
            description: tp('Advanced protection against wild animals with certified shock-safe technology.'),
            price: '₹120/ft',
            features: [
                tp('Shock-Safe Certified ⚡'),
                tp('Solar powered option'),
                tp('Anti-theft alarm'),
                tp('Wild animal deterrent'),
                tp('Remote monitoring'),
            ],
            gradient: 'from-yellow-500 to-orange-600',
            popular: true,
        },
    ];

    const constructionMaterials = [
        {
            id: 101,
            name: tp('River Sand'),
            unit: tp('Per Tonne'),
            price: '₹800',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqMbvZ3gGUOEW-Y9Lbs8ooK2hPpxQ7q1TvE5QAPW8YvYDO7k_Z0QqBywU37VGLGqPQX8Cj3OI9n-PGaVNbsQlscHGxh8ZRx5Ke7fXunq3FQSF8FUbXKCTPmNbJw_n7aV6K0A',
            eco: true,
        },
        {
            id: 102,
            name: tp('Hollow Blocks (6")'),
            unit: tp('Per Piece'),
            price: '₹35',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYvQRJHlDLCH0L-_RRWFOwmX5CQZ-Vdz1xt4pUvZPXzJQKgTAo_6hNz8F5YPNaL2FZw7RFJxhEqPk5vKnk2cZWQ7lKMPvR5XDy3UqHTFJnL8Rw4Vm5tQzA1gHXQ7p9Kv2K0w',
            eco: true,
        },
        {
            id: 103,
            name: tp('Red Clay Bricks'),
            unit: tp('Per 1000'),
            price: '₹6,500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxZL8-VH2xFKP7RQvYJ5Kz9FWq4BNm1XT6yGpHcJQx8wL5z2Rv3KTnM9Pf6YDxL8Wq7Vm2Jz4Hs1Xv9TkWq5Pz8Nm7Rx4L6Y3Vq2Hs9Xz7Wm4Kq1Pz8Nm7Rx5',
            eco: false,
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1280px] px-3 md:px-6 py-3 md:py-4">
                    <nav className="flex items-center gap-1 text-xs md:text-sm">
                        <a href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">{tp('Home')}</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <a href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">{tp('Services')}</a>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <span className="text-primary font-bold">{tp('Fencing')}</span>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-3 md:px-6 py-8 md:py-12 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-[2rem] bg-gradient-to-br from-amber-600 to-orange-700 text-white mb-4 md:mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-3xl md:text-4xl">construction</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-primary-dark mb-2 md:mb-4">{tp('Fencing & Infrastructure')}</h1>
                        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                            {tp('Complete solutions for farm security, boundaries, and eco-friendly construction materials')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Fencing Solutions */}
            <section className="px-3 md:px-6 py-8 md:py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">{tp('Fencing Solutions')}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                        {fencingTypes.map((fence) => (
                            <div
                                key={fence.id}
                                className={`skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 border-4 transition-all ${selectedFencingType === fence.id
                                    ? 'border-primary shadow-2xl shadow-primary/30'
                                    : fence.popular
                                        ? 'border-orange-500/30'
                                        : 'border-white'
                                    } ${fence.popular ? 'lg:scale-105' : ''}`}
                            >
                                {fence.popular && (
                                    <div className="mb-4 -mt-4 -mx-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-1.5 md:py-2 rounded-t-2xl font-black text-[10px] md:text-sm">
                                        {tp('⚡ SHOCK-SAFE CERTIFIED')}
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                                    <div className={`tactile-icon size-12 md:size-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${fence.gradient} flex-shrink-0 mx-auto md:mx-0`}>
                                        <span className="material-symbols-outlined text-2xl md:text-3xl text-white">{fence.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3 md:mb-4">
                                            <h3 className="text-lg md:text-2xl font-black text-primary-dark">{fence.title}</h3>
                                            <span className="text-base md:text-lg font-bold text-primary whitespace-nowrap">{fence.price}</span>
                                        </div>
                                        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{fence.description}</p>
                                        <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                                            {fence.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs md:text-sm text-green-600">check_circle</span>
                                                    <span className="text-xs md:text-sm font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => setSelectedFencingType(fence.id)}
                                            className={`w-full rounded-lg md:rounded-xl py-2 md:py-3 font-bold text-sm md:text-base transition-all ${selectedFencingType === fence.id
                                                ? 'glossy-button text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                }`}
                                        >
                                            {selectedFencingType === fence.id ? tp('✓ SELECTED') : tp('GET QUOTE')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Construction Materials Marketplace */}
            <section className="px-3 md:px-6 py-8 md:py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-6 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-1 md:mb-2">{tp('Eco-Friendly Construction Materials')}</h2>
                        <p className="text-sm md:text-base text-gray-600">{tp('Build sustainable farmhouses and barns with certified materials')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {constructionMaterials.map((material) => (
                            <div key={material.id} className="skeuo-card rounded-xl md:rounded-2xl overflow-hidden border border-white/50 flex flex-col">
                                <div className="aspect-[4/3] bg-gray-200 relative">
                                    {material.eco && (
                                        <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 rounded-lg bg-green-600 px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold text-white shadow-lg flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">eco</span>
                                            {tp('ECO-FRIENDLY')}
                                        </div>
                                    )}
                                    <div className="h-full w-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl md:text-6xl text-amber-600">inventory_2</span>
                                    </div>
                                </div>
                                <div className="p-3 md:p-6 flex flex-col flex-1">
                                    <h3 className="text-base md:text-xl font-black mb-0.5 md:mb-1">{material.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">{material.unit}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xl md:text-2xl font-black text-primary">{material.price}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <a
                                            href="tel:+919380306475"
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold hover:bg-primary-dark transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm md:text-base">call</span>
                                            {tp('Call for Details')}
                                        </a>
                                        <a
                                            href="https://wa.me/919380306475" target="_blank" rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 text-white px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold hover:bg-green-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm md:text-base">chat</span>
                                            {tp('Book Details')}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Request Form */}
            {selectedFencingType && (
                <section className="px-3 md:px-6 py-8 md:py-12">
                    <div className="mx-auto max-w-2xl">
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12 border-4 border-white">
                            <div className="text-center mb-6 md:mb-8">
                                <div className="inline-flex items-center justify-center size-14 md:size-16 rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white mb-3 md:mb-4">
                                    <span className="material-symbols-outlined text-2xl md:text-3xl">request_quote</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-primary-dark mb-1 md:mb-2">{tp('Request Fencing Quote')}</h3>
                                <p className="text-sm md:text-base text-gray-600">{tp('Get a customized quotation for your farm fencing needs')}</p>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Full Name')} *</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); setFormErrors(prev => { const { full_name, ...r } = prev; return r; }); }}
                                            className={`w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none ${formErrors.full_name ? 'ring-2 ring-red-400' : ''}`}
                                            placeholder={tp('Enter your name')}
                                        />
                                        {formErrors.full_name && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.full_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Phone Number')} *</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => { setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) }); setFormErrors(prev => { const { phone, ...r } = prev; return r; }); }}
                                            className={`w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none ${formErrors.phone ? 'ring-2 ring-red-400' : ''}`}
                                            placeholder={tp('10-digit number')}
                                            maxLength={14}
                                        />
                                        {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.phone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Farm Location')} *</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors(prev => { const { location, ...r } = prev; return r; }); }}
                                        className={`w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none ${formErrors.location ? 'ring-2 ring-red-400' : ''}`}
                                        placeholder={tp('Village, District, State')}
                                    />
                                    {formErrors.location && <p className="text-red-500 text-xs font-bold mt-1">{formErrors.location}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Fencing Length (feet)')}</label>
                                        <input
                                            type="number"
                                            value={formData.fencing_length}
                                            onChange={(e) => setFormData({ ...formData, fencing_length: e.target.value })}
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                            placeholder={tp('e.g., 500')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Preferred Timeline')}</label>
                                        <select
                                            value={formData.preferred_timeline}
                                            onChange={(e) => setFormData({ ...formData, preferred_timeline: e.target.value })}
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none">
                                            <option value="Within 1 week">{tp('Within 1 week')}</option>
                                            <option value="Within 2 weeks">{tp('Within 2 weeks')}</option>
                                            <option value="Within 1 month">{tp('Within 1 month')}</option>
                                            <option value="Flexible">{tp('Flexible')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Preferred Start Date')}</label>
                                        <input
                                            type="date"
                                            value={formData.preferred_date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">{tp('Preferred Time')}</label>
                                        <select
                                            value={formData.preferred_time}
                                            onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        >
                                            <option value="">{tp('Select a time slot')}</option>
                                            <option value="Morning (8 AM – 11 AM)">{tp('Morning (8 AM – 11 AM)')}</option>
                                            <option value="Late Morning (11 AM – 2 PM)">{tp('Late Morning (11 AM – 2 PM)')}</option>
                                            <option value="Afternoon (2 PM – 5 PM)">{tp('Afternoon (2 PM – 5 PM)')}</option>
                                            <option value="Evening (5 PM – 8 PM)">{tp('Evening (5 PM – 8 PM)')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg md:rounded-xl p-3 md:p-4">
                                    <p className="text-xs md:text-sm font-bold text-amber-800 mb-0.5 md:mb-1">{tp('Selected Fencing Type:')}</p>
                                    <p className="text-base md:text-lg font-black text-amber-600">
                                        {fencingTypes.find(f => f.id === selectedFencingType)?.title}
                                    </p>
                                </div>
                                <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                                <button
                                    onClick={handleRequestFencingQuote}
                                    disabled={!formData.full_name || !formData.phone || !formData.location || !agreedToTerms}
                                    className="vibrant-gradient w-full rounded-lg md:rounded-xl py-3 md:py-5 text-white font-black text-base md:text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">send</span>
                                    {tp('REQUEST QUOTE')}
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
                            <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-full bg-gradient-to-br from-green-400 to-primary">
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary-dark dark:text-white mb-2 md:mb-3">{tp('Quote Requested!')}</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">{tp('Your fencing quote request has been submitted successfully.')}</p>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">{tp('📞 Our team will contact you soon to finalize your fencing installation')}</p>
                        </div>
                        <button onClick={() => { setShowSuccessModal(false); setFormData({ full_name: '', phone: '', location: '', fencing_length: '', preferred_timeline: 'Within 1 week', preferred_date: '', preferred_time: '' }); }} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">{tp('Done')}</button>
                    </div>
                    <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
                </div>
            )}
        </div>
    );
}
