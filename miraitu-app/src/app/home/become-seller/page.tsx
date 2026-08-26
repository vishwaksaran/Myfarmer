'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useAuth } from '@/context/AuthContext';
import { createSeller, uploadImages } from '@/lib/supabase-db';
import supabase from '@/lib/supabase';
import { useSubmissionCopy, SUBMISSION_ACCENT, SUBMISSION_ICON } from '@/lib/service-availability';

const sellerTypes = [
    {
        id: 'dealer',
        icon: 'store',
        title: 'Authorized Dealer',
        description: 'Sell machinery, equipment, and agricultural products from leading brands.',
        perks: ['Brand partnerships', 'Bulk pricing', 'Priority listings', 'Dedicated support'],
        gradient: 'from-blue-500 to-indigo-600',
        bgLight: 'bg-blue-50 dark:bg-blue-950/20',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    },
    {
        id: 'farmer-seller',
        icon: 'agriculture',
        title: 'Farmer Seller',
        description: 'Sell your livestock, crops, organic produce, and farm outputs directly.',
        perks: ['Zero commission', 'Direct buyers', 'Instant payments', 'Verified profile'],
        gradient: 'from-green-500 to-emerald-600',
        bgLight: 'bg-green-50 dark:bg-green-950/20',
        iconBg: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    },
    {
        id: 'service-provider',
        icon: 'engineering',
        title: 'Service Provider',
        description: 'Offer farm services like soil testing, drone spraying, transportation, and more.',
        perks: ['Bookings dashboard', 'Customer reviews', 'Service areas', 'Earnings tracker'],
        gradient: 'from-orange-500 to-amber-600',
        bgLight: 'bg-orange-50 dark:bg-orange-950/20',
        iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    },
];

const howItWorksSteps = [
    { step: 1, icon: 'person_add', title: 'Register', description: 'Create your seller account with basic details and verification.' },
    { step: 2, icon: 'verified', title: 'Get Verified', description: 'Submit documents for quick KYC verification and get a trusted badge.' },
    { step: 3, icon: 'inventory', title: 'List Products', description: 'Add your products, services, or livestock with photos and pricing.' },
    { step: 4, icon: 'payments', title: 'Start Earning', description: 'Receive orders, connect with buyers, and earn directly to your bank.' },
];

const stats = [
    { value: '10,000+', label: 'Active Sellers', icon: 'groups' },
    { value: '₹50L+', label: 'Monthly Sales', icon: 'trending_up' },
    { value: '200+', label: 'Districts Covered', icon: 'location_on' },
    { value: '4.8★', label: 'Seller Rating', icon: 'star' },
];

const faqs = [
    { q: 'Is there any registration fee?', a: 'No! Registration on Miraitu is completely free for all seller types. You can start listing your products immediately after verification.' },
    { q: 'How long does verification take?', a: 'Most verifications are completed within 24-48 hours. You\'ll receive an SMS and email notification once approved.' },
    { q: 'What documents do I need?', a: 'You\'ll need a valid Aadhaar card, PAN card (for dealers), bank account details, and relevant business licenses if applicable.' },
    { q: 'How do I receive payments?', a: 'Payments are directly transferred to your bank account. Farmer sellers receive instant settlements, while dealers get weekly payouts.' },
    { q: 'Can I sell in multiple categories?', a: 'Yes! You can list products across multiple categories — machinery, livestock, crops, organic produce, and services.' },
];

const formStepsConfig: Record<string, { title: string; fields: { name: string; label: string; type: string; placeholder: string; options?: string[]; required?: boolean }[] }[]> = {
    dealer: [
        {
            title: 'Personal Details',
            fields: [
                { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'dealer@example.com', required: true },
                { name: 'location', label: 'Business Location', type: 'text', placeholder: 'City, District, State', required: true },
            ],
        },
        {
            title: 'Business Information',
            fields: [
                { name: 'businessName', label: 'Business / Shop Name', type: 'text', placeholder: 'Your business name', required: true },
                { name: 'sellingCategory', label: 'What will you sell?', type: 'select', placeholder: 'Select category', options: ['Tractors & Machinery', 'Farm Equipment', 'Seeds & Fertilizers', 'Irrigation Systems', 'Pesticides & Chemicals', 'Multiple Categories'], required: true },
                { name: 'brandPartners', label: 'Brand Partnerships (if any)', type: 'text', placeholder: 'e.g., Mahindra, TAFE, Swaraj' },
                { name: 'gstNumber', label: 'GST Number', type: 'text', placeholder: 'XXAAAAA0000A0Z0' },
            ],
        },
        {
            title: 'KYC Verification',
            fields: [
                { name: 'aadhaarNumber', label: 'Aadhaar Card Number', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
                { name: 'panNumber', label: 'PAN Card Number', type: 'text', placeholder: 'ABCDE1234F', required: true },
                { name: 'bankAccount', label: 'Bank Account Number', type: 'text', placeholder: 'Enter account number', required: true },
                { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'e.g., SBIN0001234', required: true },
            ],
        },
        { title: 'Upload Documents', fields: [] },
    ],
    'farmer-seller': [
        {
            title: 'Personal Details',
            fields: [
                { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true },
                { name: 'village', label: 'Village / Town', type: 'text', placeholder: 'Your village or town', required: true },
                { name: 'district', label: 'District & State', type: 'text', placeholder: 'e.g., Coimbatore, Tamil Nadu', required: true },
            ],
        },
        {
            title: 'Farm Information',
            fields: [
                { name: 'farmSize', label: 'Farm Size (in acres)', type: 'text', placeholder: 'e.g., 5 acres', required: true },
                { name: 'sellingCategory', label: 'What will you sell?', type: 'select', placeholder: 'Select category', options: ['Crops & Grains', 'Vegetables & Fruits', 'Livestock (Cattle/Goats)', 'Poultry & Eggs', 'Organic Produce', 'Dairy Products', 'Multiple Items'], required: true },
                { name: 'farmingType', label: 'Type of Farming', type: 'select', placeholder: 'Select type', options: ['Organic', 'Traditional', 'Mixed', 'Precision Farming'] },
                { name: 'experience', label: 'Years of Experience', type: 'text', placeholder: 'e.g., 10 years' },
            ],
        },
        {
            title: 'KYC Verification',
            fields: [
                { name: 'aadhaarNumber', label: 'Aadhaar Card Number', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
                { name: 'bankAccount', label: 'Bank Account Number', type: 'text', placeholder: 'Enter account number', required: true },
                { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'e.g., SBIN0001234', required: true },
                { name: 'landDocument', label: 'Land Document No.', type: 'text', placeholder: 'Survey number' },
            ],
        },
        { title: 'Upload Photos', fields: [] },
    ],
    'service-provider': [
        {
            title: 'Personal Details',
            fields: [
                { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 XXXXX XXXXX', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'provider@example.com' },
                { name: 'location', label: 'Service Area', type: 'text', placeholder: 'City, District, State', required: true },
            ],
        },
        {
            title: 'Service Information',
            fields: [
                { name: 'serviceType', label: 'Type of Service', type: 'select', placeholder: 'Select service', options: ['Drone Spraying', 'Soil Testing', 'Transportation', 'Equipment Rental', 'Veterinary', 'Consulting', 'Multiple Services'], required: true },
                { name: 'equipmentOwned', label: 'Equipment Owned', type: 'text', placeholder: 'e.g., Drone DJI Agras T30' },
                { name: 'serviceRange', label: 'Service Range (km)', type: 'text', placeholder: 'e.g., 50 km radius' },
                { name: 'pricing', label: 'Pricing (per unit)', type: 'text', placeholder: 'e.g., ₹500/acre' },
            ],
        },
        {
            title: 'KYC Verification',
            fields: [
                { name: 'aadhaarNumber', label: 'Aadhaar Card Number', type: 'text', placeholder: 'XXXX XXXX XXXX', required: true },
                { name: 'panNumber', label: 'PAN Card Number', type: 'text', placeholder: 'ABCDE1234F' },
                { name: 'bankAccount', label: 'Bank Account Number', type: 'text', placeholder: 'Enter account number', required: true },
                { name: 'ifscCode', label: 'IFSC Code', type: 'text', placeholder: 'e.g., SBIN0001234', required: true },
            ],
        },
        { title: 'Upload Documents', fields: [] },
    ],
};

export default function BecomeSellerPage() {
    const router = useRouter();
    const { user } = useAuth();
    const submission = useSubmissionCopy('request');
    const [selectedType, setSelectedType] = useState('farmer-seller');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentFormSteps = formStepsConfig[selectedType] || formStepsConfig['farmer-seller'];
    const totalSteps = currentFormSteps.length;

    const handleFieldChange = (name: string, value: string) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateField = (name: string, value: string, type: string): string => {
        if (!value.trim()) return '';
        if (name === 'phone' && !/^\d{10}$/.test(value.replace(/[\s+-]/g, '').slice(-10))) return 'Enter a valid 10-digit phone number';
        if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address';
        if (name === 'aadhaarNumber' && !/^\d{12}$/.test(value.replace(/\s/g, ''))) return 'Enter a valid 12-digit Aadhaar number';
        if (name === 'panNumber' && !/^[A-Z]{5}\d{4}[A-Z]$/.test(value.trim().toUpperCase())) return 'Enter a valid PAN (e.g. ABCDE1234F)';
        if (name === 'ifscCode' && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase())) return 'Enter a valid IFSC code';
        if (name === 'gstNumber' && value.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(value.trim().toUpperCase())) return 'Enter a valid GST number';
        return '';
    };

    const validateCurrentStep = (): boolean => {
        const step = currentFormSteps[currentStep];
        if (!step.fields.length) return true;
        const newErrors: Record<string, string> = {};
        for (const field of step.fields) {
            const val = formValues[field.name] || '';
            if (field.required && !val.trim()) {
                newErrors[field.name] = `${field.label} is required`;
            } else {
                const err = validateField(field.name, val, field.type);
                if (err) newErrors[field.name] = err;
            }
        }
        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = useCallback((files: FileList | null) => {
        if (!files) return;
        const remaining = 5 - uploadedImages.length;
        const toAdd = Array.from(files).slice(0, remaining);
        const newImages = toAdd.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setUploadedImages(prev => [...prev, ...newImages]);
    }, [uploadedImages.length]);

    const removeImage = (index: number) => {
        setUploadedImages(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleImageUpload(e.dataTransfer.files); }, [handleImageUpload]);

    const nextStep = () => { if (currentStep < totalSteps - 1 && validateCurrentStep()) setCurrentStep(prev => prev + 1); };
    const prevStep = () => { if (currentStep > 0) { setFieldErrors({}); setCurrentStep(prev => prev - 1); } };
    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!validateCurrentStep()) return;
        setIsSubmitting(true);

        try {
            // If user is logged in, save to Supabase
            if (user && !user.isGuest) {
                // Upload images to Supabase Storage
                let imageUrls: string[] = [];
                if (uploadedImages.length > 0) {
                    const files = uploadedImages.map(img => img.file);
                    imageUrls = await uploadImages('seller-images', user.id, files);
                }

                // Save seller data to Supabase DB
                await createSeller({
                    user_id: user.id,
                    seller_type: selectedType,
                    full_name: formValues.fullName || '',
                    phone: formValues.phone || '',
                    email: formValues.email || user.email || '',
                    business_name: formValues.businessName || '',
                    location: formValues.location || formValues.village || '',
                    form_data: formValues,
                    images: imageUrls,
                });

                // For service providers, update profiles table with role & service types
                if (selectedType === 'service-provider') {
                    const serviceTypeMap: Record<string, string> = {
                        'Drone Spraying': 'services',
                        'Soil Testing': 'services',
                        'Transportation': 'services',
                        'Equipment Rental': 'machinery',
                        'Veterinary': 'veterinary',
                        'Consulting': 'services',
                        'Multiple Services': 'services',
                    };
                    const selectedService = formValues.serviceType || '';
                    const serviceModule = serviceTypeMap[selectedService] || 'services';

                    await supabase
                        .from('profiles')
                        .update({
                            role: 'service_provider',
                            service_types: [serviceModule],
                            address: formValues.location || '',
                            whatsapp_number: formValues.phone || '',
                            availability_status: 'available',
                            bio: formValues.equipmentOwned ? `Equipment: ${formValues.equipmentOwned}` : '',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', user.id);
                }
            }

            // Also keep localStorage as fallback for dashboard personalization
            if (typeof window !== 'undefined') {
                localStorage.setItem('miraitu_seller_name', formValues.fullName || '');
                localStorage.setItem('miraitu_seller_type', selectedType);
                localStorage.setItem('miraitu_seller_data', JSON.stringify(formValues));
            }

            setShowSuccess(true);
        } catch (error) {
            console.error('Error submitting seller registration:', error);
            // Still show success for localStorage-only fallback
            setShowSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoToDashboard = () => {
        setShowSuccess(false);
        if (selectedType === 'service-provider') router.push('/home/provider-dashboard');
        else if (selectedType === 'dealer') router.push('/home/become-seller/dashboard/dealer');
        else router.push('/home/become-seller/dashboard/farmer');
    };

    const startRegistration = () => {
        setShowForm(true);
        setCurrentStep(0);
        setFormValues({});
        setUploadedImages([]);
        setTimeout(() => document.getElementById('multi-step-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const sellerLabel = selectedType === 'dealer' ? 'Authorized Dealer' : selectedType === 'farmer-seller' ? 'Farmer Seller' : 'Service Provider';
    const sellerGradient = selectedType === 'dealer' ? 'from-blue-500 to-indigo-600' : selectedType === 'farmer-seller' ? 'from-green-500 to-emerald-600' : 'from-orange-500 to-amber-600';

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjJIMjR2Mmgxem0tMzAgMzBoMlYyMmgtMnYxMnptMzAgMGgyVjIyaC0ydjEyem0tMzAtMzBoMlYybC0yLS4wMVYxNHptMzAgMGgyVjJoLTJ2MTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10 px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-28">
                    <div className="mx-auto max-w-[1280px] text-center text-white">
                        <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-xs md:text-sm font-bold mb-6 md:mb-8 border border-white/30">
                            <span className="material-symbols-outlined text-base md:text-lg">rocket_launch</span>
                            Join 10,000+ sellers on Miraitu
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-4 md:mb-6 leading-[1.1]">
                            Become a<br /><span className="text-white/90">Dealer</span> / <span className="text-white/90">Seller</span>
                        </h1>
                        <p className="text-base md:text-xl lg:text-2xl font-medium text-white/90 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
                            Reach millions of farmers across India. Sell machinery, livestock, crops, and services — all in one platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                            <button onClick={startRegistration} className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-4 md:py-5 bg-white text-orange-600 rounded-2xl font-black text-base md:text-lg shadow-2xl shadow-black/20 hover:-translate-y-1 active:scale-95 transition-all">
                                <span className="material-symbols-outlined">app_registration</span>
                                Register Now — It&apos;s Free
                            </button>
                            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 md:px-10 py-4 md:py-5 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-bold text-base md:text-lg border border-white/30 hover:bg-white/25 transition-all">
                                <span className="material-symbols-outlined">play_circle</span>
                                How it Works
                            </a>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full"><path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 36C840 48 960 64 1080 64C1200 64 1320 48 1380 40L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" className="fill-background-light dark:fill-background-dark" /></svg>
                </div>
            </section>

            {/* Stats */}
            <section className="px-4 md:px-6 -mt-4 relative z-10">
                <div className="mx-auto max-w-[1280px]">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="skeuo-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
                                <span className="material-symbols-outlined text-primary text-xl md:text-2xl mb-1 md:mb-2">{stat.icon}</span>
                                <p className="text-xl md:text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs md:text-sm font-medium text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Seller Types */}
            <section className="px-3 md:px-6 py-12 md:py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-8 md:mb-12">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold mb-4">
                            <span className="material-symbols-outlined text-sm">category</span>Seller Categories
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4">Choose Your Seller Type</h2>
                        <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto">Whether you&apos;re a farmer, dealer, or service provider — we have a plan that fits your business.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {sellerTypes.map((type) => (
                            <button key={type.id} onClick={() => { setSelectedType(type.id); setCurrentStep(0); setFormValues({}); setUploadedImages([]); }}
                                className={`group text-left rounded-2xl md:rounded-[2rem] overflow-hidden border-2 transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl ${selectedType === type.id ? `border-orange-400 shadow-xl shadow-orange-500/10 ${type.bgLight}` : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121811]'}`}>
                                <div className={`h-2 bg-gradient-to-r ${type.gradient}`}></div>
                                <div className="p-5 md:p-8">
                                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 ${type.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined text-2xl md:text-3xl">{type.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white">{type.title}</h3>
                                            {selectedType === type.id && <span className="inline-flex items-center gap-1 text-orange-600 font-bold text-xs mt-0.5"><span className="material-symbols-outlined text-xs">check_circle</span>Selected</span>}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 md:mb-6 leading-relaxed">{type.description}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {type.perks.map((perk) => (
                                            <div key={perk} className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 rounded-lg px-2.5 py-2 text-xs md:text-sm">
                                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{perk}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={startRegistration} className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined">arrow_downward</span>Register as {sellerLabel}
                        </button>
                    </div>
                </div>
            </section>

            {/* Multi-Step Registration Form */}
            {showForm && (
                <section id="multi-step-form" className="px-3 md:px-6 py-12 md:py-20 bg-gray-50 dark:bg-[#0e150d]">
                    <div className="mx-auto max-w-2xl">
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${sellerGradient} text-white mb-4 shadow-xl`}>
                                <span className="material-symbols-outlined text-3xl">{selectedType === 'dealer' ? 'store' : selectedType === 'farmer-seller' ? 'agriculture' : 'engineering'}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">Register as {sellerLabel}</h2>
                            <p className="text-sm text-gray-500">Complete all steps to submit your application</p>
                        </div>

                        {/* Step Progress Bar */}
                        <div className="flex items-center justify-between mb-8 px-2">
                            {currentFormSteps.map((s, i) => (
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center relative">
                                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${i < currentStep ? 'bg-green-500 text-white' : i === currentStep ? `bg-gradient-to-br ${sellerGradient} text-white shadow-lg scale-110` : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                            {i < currentStep ? <span className="material-symbols-outlined text-lg">check</span> : i + 1}
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-500 mt-1.5 text-center w-16 md:w-20 leading-tight">{s.title}</span>
                                    </div>
                                    {i < currentFormSteps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-1 md:mx-2 rounded-full mt-[-18px] ${i < currentStep ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Form Card */}
                        <div className="skeuo-card rounded-[2rem] p-5 md:p-8 lg:p-10 border border-white/50 dark:border-white/5">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1">
                                Step {currentStep + 1}: {currentFormSteps[currentStep].title}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-400 mb-6">
                                {currentStep === totalSteps - 1 ? 'Upload up to 5 images (shop photos, farm, equipment, ID cards)' : 'Fill in the required details below'}
                            </p>

                            {currentStep < totalSteps - 1 ? (
                                <div className="space-y-4">
                                    {currentFormSteps[currentStep].fields.map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.type === 'select' ? (
                                                <div className={`skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5 ${fieldErrors[field.name] ? 'ring-2 ring-red-400' : ''}`}>
                                                    <select className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 cursor-pointer" value={formValues[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)}>
                                                        <option value="">{field.placeholder}</option>
                                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className={`skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3.5 ${fieldErrors[field.name] ? 'ring-2 ring-red-400' : ''}`}>
                                                    <input className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300" placeholder={field.placeholder} type={field.type} value={formValues[field.name] || ''} onChange={(e) => handleFieldChange(field.name, e.target.value)} />
                                                </div>
                                            )}
                                            {fieldErrors[field.name] && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors[field.name]}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                        onClick={() => uploadedImages.length < 5 && fileInputRef.current?.click()}
                                        className={`relative border-3 border-dashed rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5'} ${uploadedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} disabled={uploadedImages.length >= 5} />
                                        <div className="w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-orange-500 text-3xl">cloud_upload</span>
                                        </div>
                                        <p className="text-base md:text-lg font-black text-gray-700 dark:text-gray-300 mb-1">{isDragging ? 'Drop images here!' : 'Drag & Drop Images'}</p>
                                        <p className="text-xs md:text-sm text-gray-400">or <span className="text-primary font-bold underline">browse from folder</span> • Max 5 images</p>
                                        <p className="text-[10px] text-gray-400 mt-2">{uploadedImages.length}/5 uploaded</p>
                                    </div>
                                    {uploadedImages.length > 0 && (
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                                            {uploadedImages.map((img, i) => (
                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group">
                                                    <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                                                    <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">✕</button>
                                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 font-bold">{i + 1}/5</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex gap-3 mt-8">
                                {currentStep > 0 && (
                                    <button onClick={prevStep} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <span className="material-symbols-outlined text-lg">arrow_back</span>Previous
                                    </button>
                                )}
                                {currentStep < totalSteps - 1 ? (
                                    <button onClick={nextStep} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r ${sellerGradient} text-white font-black text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all`}>
                                        Next Step<span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                ) : (
                                    <>
                                        <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />
                                        <button onClick={handleSubmit} disabled={isSubmitting || !agreedToTerms} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-base shadow-2xl shadow-orange-500/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                            {isSubmitting ? (
                                                <><span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>Submitting...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-xl">send</span>Submit Application</>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section id="how-it-works" className="px-3 md:px-6 py-12 md:py-20 bg-gray-50 dark:bg-[#0e150d]">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-8 md:mb-14">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold mb-4">
                            <span className="material-symbols-outlined text-sm">route</span>Getting Started
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4">How It Works</h2>
                        <p className="text-sm md:text-lg text-gray-500">Simple steps to start your selling journey</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                        {howItWorksSteps.map((item) => (
                            <div key={item.step} className="group relative bg-white dark:bg-[#1a251a] rounded-2xl md:rounded-[1.5rem] p-4 md:p-6 border-2 border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl transition-all">
                                <div className="absolute -top-2.5 -right-2.5 md:-top-3 md:-right-3 w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-full text-xs md:text-sm font-black flex items-center justify-center shadow-lg">{item.step}</div>
                                <div className="w-11 h-11 md:w-14 md:h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-orange-500 text-2xl md:text-3xl">{item.icon}</span>
                                </div>
                                <h3 className="text-base md:text-xl font-black text-gray-900 dark:text-white mb-1 md:mb-2">{item.title}</h3>
                                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-4 md:px-6 py-12 md:py-20">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3 md:mb-4">Frequently Asked Questions</h2>
                        <p className="text-sm md:text-lg text-gray-500">Everything you need to know about selling on Miraitu</p>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="skeuo-card rounded-xl md:rounded-2xl overflow-hidden border border-white/50 dark:border-white/5">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 md:p-6 text-left">
                                    <span className="font-bold text-sm md:text-base text-gray-900 dark:text-white pr-4">{faq.q}</span>
                                    <span className={`material-symbols-outlined text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                {openFaq === i && <div className="px-4 md:px-6 pb-4 md:pb-6 -mt-2"><p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-4 md:px-6 py-12 md:py-20">
                <div className="mx-auto max-w-[1280px]">
                    <div className="rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8 md:p-12 lg:p-16 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 tracking-tight">Ready to Grow Your Business?</h2>
                            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto mb-8 md:mb-10">Join thousands of sellers who trust Miraitu to connect them with farmers across India.</p>
                            <button onClick={startRegistration} className="inline-flex items-center gap-3 px-10 md:px-12 py-4 md:py-5 bg-white text-orange-600 rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-black/20 hover:-translate-y-1 active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-xl md:text-2xl">storefront</span>Get Started for Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Success Modal with Blast Animation */}
            {showSuccess && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="absolute w-3 h-3 rounded-full animate-blast"
                                style={{ left: `${50 + (Math.random() - 0.5) * 80}%`, top: `${50 + (Math.random() - 0.5) * 60}%`, backgroundColor: ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#ec4899'][i % 7], animationDelay: `${Math.random() * 0.5}s`, animationDuration: `${1 + Math.random() * 1.5}s` }} />
                        ))}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={`star-${i}`} className="absolute text-xl md:text-3xl animate-blast"
                                style={{ left: `${50 + (Math.random() - 0.5) * 70}%`, top: `${50 + (Math.random() - 0.5) * 50}%`, animationDelay: `${Math.random() * 0.3}s`, animationDuration: `${1.2 + Math.random()}s` }}>
                                {['🎉', '⭐', '🎊', '✨', '🚀', '🏆'][i % 6]}
                            </div>
                        ))}
                    </div>
                    <div className="relative bg-white dark:bg-[#1a251a] rounded-[2rem] p-6 md:p-10 max-w-md w-full shadow-2xl animate-success-pop text-center">
                        <div className="relative mx-auto w-20 h-20 md:w-24 md:h-24 mb-5 md:mb-6">
                            <div className={`relative w-full h-full rounded-full ${SUBMISSION_ACCENT.circle} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined ${SUBMISSION_ACCENT.icon} text-4xl md:text-5xl`}>{SUBMISSION_ICON}</span>
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">{submission.heading}</h2>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 text-xs font-bold ${SUBMISSION_ACCENT.badge}`}><span className="material-symbols-outlined text-sm leading-none">location_off</span>{submission.badge}</span>
                        <p className="text-sm md:text-base text-gray-500 mb-6 leading-relaxed">{submission.message}</p>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                <span className="material-symbols-outlined text-green-500 text-xl mb-1">verified</span>
                                <p className="text-[10px] md:text-xs font-bold text-green-700 dark:text-green-400">Verification Pending</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                                <span className="material-symbols-outlined text-blue-500 text-xl mb-1">dashboard</span>
                                <p className="text-[10px] md:text-xs font-bold text-blue-700 dark:text-blue-400">Dashboard Ready</p>
                            </div>
                        </div>
                        <button onClick={handleGoToDashboard} className={`w-full py-4 rounded-2xl bg-gradient-to-r ${sellerGradient} text-white font-black text-base shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}>
                            <span className="material-symbols-outlined">dashboard</span>Go to Your Dashboard
                        </button>
                        <button onClick={() => setShowSuccess(false)} className="w-full mt-3 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Close</button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes blast { 0% { transform: scale(0) translateY(0); opacity: 1; } 50% { opacity: 1; } 100% { transform: scale(1.5) translateY(-200px) rotate(720deg); opacity: 0; } }
                @keyframes success-pop { 0% { transform: scale(0.3) translateY(50px); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 80% { transform: scale(0.95); } 100% { transform: scale(1) translateY(0); opacity: 1; } }
                @keyframes check-bounce { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 70% { transform: scale(0.9); } 100% { transform: scale(1); } }
                @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.2; } 100% { transform: scale(1); opacity: 0.5; } }
                .animate-blast { animation: blast ease-out forwards; }
                .animate-success-pop { animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-check-bounce { animation: check-bounce 0.8s ease-out 0.3s both; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
}

