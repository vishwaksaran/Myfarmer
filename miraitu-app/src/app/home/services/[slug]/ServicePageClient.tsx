'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBookingSubmit } from '@/lib/useBookingSubmit';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { normalizeIndianPhone } from '@/lib/phone';
import { usePrefillLocation } from '@/context/LocationContext';

const serviceData: Record<string, any> = {
    'harvester': {
        title: 'Harvester Services',
        icon: 'agriculture',
        description: 'Book modern harvesting machines for efficient crop harvesting.',
        features: ['Wheat & Rice Harvesters', 'Sugarcane Harvesters', 'Experienced Operators', 'Hourly/Acre Rates'],
        color: 'green',
        price: 'From ₹1200/acre',
        stats: [{ label: 'Machines', value: '45+' }, { label: 'Bookings', value: '1.2k+' }],
    },
    'drone-spray': {
        title: 'Drone Spraying',
        icon: 'flight',
        description: 'Precision aerial spraying for pesticides and liquid fertilizers.',
        features: ['10L - 25L Capacity', '10 Acres/Hour', 'Uniform Spraying', 'Reduced Chemical Use'],
        color: 'green',
        price: 'From ₹400/acre',
        stats: [{ label: 'Pilots', value: '28+' }, { label: 'Acres Covered', value: '5k+' }],
    },
    'farm-labours': {
        title: 'Skilled Farm Labour',
        icon: 'group',
        description: 'Hire experienced workers for planting, weeding, and harvesting.',
        features: ['Verified Workers', 'Groups Available', 'Daily/Contract Basis', 'Skill Matched'],
        color: 'green',
        price: 'From ₹400/day',
        stats: [{ label: 'Workers', value: '120+' }, { label: 'Happy Farmers', value: '500+' }],
    },
    'transportation': {
        title: 'Agri-Logistics',
        icon: 'local_shipping',
        description: 'Reliable transport vehicles for moving your produce to market.',
        features: ['Pickup Trucks', 'Tractor Trolleys', 'Cold Storage Vans', 'Live Tracking'],
        color: 'green',
        price: 'From ₹25/km',
        stats: [{ label: 'Vehicles', value: '80+' }, { label: 'Trips', value: '3k+' }],
    },
    'technician': {
        title: 'Farm Technician',
        icon: 'engineering',
        description: 'Expert technicians for farm equipment and systems.',
        features: ['System Installation', 'Regular Maintenance', 'Emergency Repairs', 'Tech Support'],
        color: 'amber',
        price: 'From ₹500/visit',
        stats: [{ label: 'Technicians', value: '50+' }, { label: 'Repairs', value: '2k+' }],
    },
    'plumber': {
        title: 'Farm Plumber',
        icon: 'plumbing',
        description: 'Expert plumbing services for irrigation and water systems.',
        features: ['Irrigation Setup', 'Pump Repair', 'Pipeline Installation', 'Leak Fixes'],
        color: 'green',
        price: 'From ₹400/visit',
        stats: [{ label: 'Plumbers', value: '40+' }, { label: 'Projects', value: '1.5k+' }],
    },
    'electrician': {
        title: 'Agri-Electrician',
        icon: 'electrical_services',
        description: 'Certified electricians for farm motors and wiring.',
        features: ['Motor Winding', 'Panel Board Setup', 'Wiring Faults', 'Solar Connect'],
        color: 'green',
        price: 'From ₹400/visit',
        stats: [{ label: 'Electricians', value: '35+' }, { label: 'Jobs', value: '3k+' }],
    },
    'mechanic': {
        title: 'Tractor Mechanic',
        icon: 'build_circle',
        description: 'Specialized mechanics for tractors and farm machinery.',
        features: ['Engine Overhaul', 'Hydraulic Repair', 'On-site Service', 'Genuine Parts'],
        color: 'green',
        price: 'From ₹600/visit',
        stats: [{ label: 'Mechanics', value: '60+' }, { label: 'Serviced', value: '5k+' }],
    },
    'milk-vendors': {
        title: 'Milk Vendors',
        icon: 'water_drop',
        description: 'Connect with local milk vendors for fresh dairy supply.',
        features: ['Fresh Cow/Buffalo Milk', 'Morning/Evening Delivery', 'Bulk Supply', 'Dairy Products'],
        color: 'green',
        price: 'From ₹60/L',
        stats: [{ label: 'Vendors', value: '80+' }, { label: 'Daily Liters', value: '2.5k+' }],
    },
    'storage-godown': {
        title: 'Storage & Godowns',
        icon: 'warehouse',
        description: 'Secure storage facilities and godowns for your agricultural produce.',
        features: ['Climate Control', 'Pest Management', '24/7 Security', 'Insurance Coverage'],
        color: 'green',
        price: 'From ₹1.5/kg/mo',
        stats: [{ label: 'Facilities', value: '20+' }, { label: 'Capacity', value: '10k Tons' }],
    },
    'register-provider': {
        title: 'Become a Service Provider',
        icon: 'handshake',
        description: 'Register with Miraitu and start earning by offering your farm services to thousands of farmers near you.',
        features: [
            'Free Registration',
            'Verified Badge for your Profile',
            'Connect with 10,000+ Farmers',
            'Flexible Working Hours',
            'Timely Payments',
            'WhatsApp Booking Alerts',
        ],
        color: 'green',
        price: 'Free to Join',
        stats: [{ label: 'Providers', value: '500+' }, { label: 'Earnings Avg.', value: '₹18k/mo' }],
    },
};

export default function GenericServicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = serviceData[slug];
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        date: '',
        time: '',
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

    const handleFindProviders = async () => {
        const errs: Record<string, string> = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        const digits = formData.phone.replace(/\D/g, '');
        if (!digits) errs.phone = 'Phone number is required';
        else if (digits.length !== 10) errs.phone = 'Enter a valid 10-digit number';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
        setFormErrors({});
        const result = await submit({
            module: 'services',
            category: slug,
            full_name: formData.name,
            phone: formData.phone,
            location: formData.location,
            preferred_date: formData.date || undefined,
            preferred_time: formData.time || undefined,
        });
        if (result.success) setShowSuccessModal(true);
        else {
            console.error('[handleFindProviders] Submit failed:', result.error);
            setFormErrors({ submit: result.error || 'Failed to submit booking. Please try again.' });
        }
    };

    if (!service) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">error</span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Not Found</h1>
                    <p className="text-gray-500 mb-6">The service you are looking for is not available or coming soon.</p>
                    <Link href="/home/services" className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                        Browse Services
                    </Link>
                </div>
            </div>
        );
    }

    const colorClasses: Record<string, any> = {
        'green': { bg: 'bg-green-500', bgLight: 'bg-green-50', hover: 'hover:bg-green-600', text: 'text-green-600', icon: 'text-green-500' },
        'cyan': { bg: 'bg-cyan-500', bgLight: 'bg-cyan-50', hover: 'hover:bg-cyan-600', text: 'text-cyan-600', icon: 'text-cyan-500' },
        'teal': { bg: 'bg-teal-500', bgLight: 'bg-teal-50', hover: 'hover:bg-teal-600', text: 'text-teal-600', icon: 'text-teal-500' },
        'indigo': { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', hover: 'hover:bg-indigo-600', text: 'text-indigo-600', icon: 'text-indigo-500' },
        'amber': { bg: 'bg-amber-500', bgLight: 'bg-amber-50', hover: 'hover:bg-amber-600', text: 'text-amber-600', icon: 'text-amber-500' },
        'blue': { bg: 'bg-blue-500', bgLight: 'bg-blue-50', hover: 'hover:bg-blue-600', text: 'text-blue-600', icon: 'text-blue-500' },
        'yellow': { bg: 'bg-yellow-500', bgLight: 'bg-yellow-50', hover: 'hover:bg-yellow-600', text: 'text-yellow-600', icon: 'text-yellow-500' },
        'red': { bg: 'bg-red-500', bgLight: 'bg-red-50', hover: 'hover:bg-red-600', text: 'text-red-600', icon: 'text-red-500' },
        'rose': { bg: 'bg-rose-500', bgLight: 'bg-rose-50', hover: 'hover:bg-rose-600', text: 'text-rose-600', icon: 'text-rose-500' },
    };
    const colors = colorClasses[service.color] || colorClasses['green'];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-3 md:py-4">
                    <nav className="flex items-center gap-1 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary transition-colors font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <Link href="/home/services" className="text-gray-500 hover:text-primary transition-colors font-medium">Services</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs md:text-sm">chevron_right</span>
                        <span className="text-primary font-bold">{service.title}</span>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className={`relative px-6 py-12 ${colors.bgLight} dark:bg-opacity-10`}>
                <div className="mx-auto max-w-[1280px]">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className={`size-24 rounded-[2rem] ${colors.bg} flex items-center justify-center text-white shadow-2xl`}>
                            <span className="material-symbols-outlined text-5xl">{service.icon}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{service.title}</h1>
                            <p className="text-xl text-gray-500 max-w-2xl">{service.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Grid */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {service.features.map((feature: string, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                        <span className={`material-symbols-outlined ${colors.icon}`}>check_circle</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <h3 className="text-xl font-bold mb-4">Availability & Pricing</h3>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                                    <span className="text-gray-500">Base Price</span>
                                    <span className={`text-2xl font-black ${colors.text}`}>{service.price}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {service.stats.map((stat: any, idx: number) => (
                                        <div key={idx} className="text-center p-4">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Booking Form Side Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                    {slug === 'register-provider' ? 'Register Now' : 'Book Service'}
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    {slug === 'register-provider'
                                        ? 'Fill in your details and our team will get you onboarded'
                                        : 'Fill details to get callbacks from providers'
                                    }
                                </p>

                                {formErrors.submit && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-700 dark:text-red-400">{formErrors.submit}</p>
                                    </div>
                                )}

                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setFormErrors(prev => { const { name, ...r } = prev; return r; }); }}
                                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 ${formErrors.name ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none`}
                                        />
                                        {formErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            placeholder="10 digit phone number"
                                            value={formData.phone}
                                            onChange={(e) => { setFormData({ ...formData, phone: normalizeIndianPhone(e.target.value) }); setFormErrors(prev => { const { phone, ...r } = prev; return r; }); }}
                                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 ${formErrors.phone ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none`}
                                            maxLength={14}
                                        />
                                        {formErrors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location/Village <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Enter your location"
                                            value={formData.location}
                                            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setFormErrors(prev => { const { location, ...r } = prev; return r; }); }}
                                            className={`w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 ${formErrors.location ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none`}
                                        />
                                        {formErrors.location && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.location}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Time</label>
                                        <select
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                        >
                                            <option value="">Select a time slot</option>
                                            <option value="Morning (8 AM – 11 AM)">Morning (8 AM – 11 AM)</option>
                                            <option value="Late Morning (11 AM – 2 PM)">Late Morning (11 AM – 2 PM)</option>
                                            <option value="Afternoon (2 PM – 5 PM)">Afternoon (2 PM – 5 PM)</option>
                                            <option value="Evening (5 PM – 8 PM)">Evening (5 PM – 8 PM)</option>
                                        </select>
                                    </div>

                                    <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                                    <button
                                        type="button"
                                        onClick={handleFindProviders}
                                        disabled={submitting || !formData.name || !formData.phone || !formData.location || !agreedToTerms}
                                        className={`w-full py-4 rounded-xl ${colors.bg} ${colors.hover} text-white font-bold text-lg transition-all shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                                        {submitting ? 'SUBMITTING…' : slug === 'register-provider' ? 'REGISTER AS PROVIDER' : 'FIND PROVIDERS'}
                                    </button>
                                </form>
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
                            <div className={`inline-flex items-center justify-center size-16 md:size-20 rounded-full ${colors.bg}`}>
                                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">check_circle</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Booking Submitted!</h2>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4">Your {service.title.toLowerCase()} booking request has been submitted successfully.</p>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon to connect with verified providers</p>
                        </div>
                        <button onClick={() => { setShowSuccessModal(false); setFormData({ name: '', phone: '', location: '', date: '', time: '' }); }} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors">Done</button>
                    </div>
                    <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
                </div>
            )}
        </div>
    );
}
