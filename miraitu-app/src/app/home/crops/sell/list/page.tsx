'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { translatePage } from '@/i18n/pageContent';
import TermsAgreementCheckbox from '@/components/TermsAgreementCheckbox';
import { uploadListingImages, createListing } from '@/lib/supabase-db';
import supabase from '@/lib/supabase';
import { SUBMISSION_HEADING, SUBMISSION_MESSAGE } from '@/lib/service-availability';

const cropCategories = [
    { id: 'grains', name: 'Grains & Cereals', icon: 'grain', examples: 'Wheat, Rice, Maize, Jowar' },
    { id: 'pulses', name: 'Pulses & Legumes', icon: 'spa', examples: 'Chana, Moong, Urad, Toor' },
    { id: 'vegetables', name: 'Vegetables', icon: 'eco', examples: 'Onion, Potato, Tomato, Cauliflower' },
    { id: 'fruits', name: 'Fruits', icon: 'nutrition', examples: 'Mango, Banana, Grapes, Orange' },
    { id: 'oilseeds', name: 'Oilseeds', icon: 'water_drop', examples: 'Soybean, Groundnut, Mustard' },
    { id: 'spices', name: 'Spices', icon: 'local_fire_department', examples: 'Turmeric, Chilli, Coriander' },
    { id: 'organic', name: 'Organic Products', icon: 'compost', examples: 'Organic Veggies, Pulses, Ghee, Honey' },
    { id: 'others', name: 'Others', icon: 'more_horiz', examples: 'Flowers, Medicinal Herbs, Fodder' },
];

export default function SellCropsListPage() {
    const { lang } = useLanguage();
    const tp = (s?: string) => translatePage(lang, s);
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [stepErrors, setStepErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        cropName: '',
        variety: '',
        quantity: '',
        unit: 'quintals',
        expectedPrice: '',
        description: '',
        location: '',
        district: '',
        state: '',
        harvestDate: '',
        imageFiles: [] as File[],
    });

    const validateStep = (s: number): boolean => {
        const errs: string[] = [];
        if (s === 1) {
            if (!selectedCategory) errs.push(tp('Please select a category'));
        } else if (s === 2) {
            if (!formData.cropName.trim()) errs.push(tp('Crop name is required'));
            if (!formData.quantity.trim()) errs.push(tp('Quantity is required'));
            if (!formData.state) errs.push(tp('State is required'));
            if (!formData.location.trim()) errs.push(tp('Location is required'));
            if (!formData.district.trim()) errs.push(tp('District is required'));
            if (!formData.harvestDate) errs.push(tp('Harvest date is required'));
        } else if (s === 3) {
            if (!formData.expectedPrice.trim()) errs.push(tp('Price is required'));
        }
        setStepErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSubmitError(tp('Please log in to list your produce'));
                setIsSubmitting(false);
                return;
            }

            let imageUrls: string[] = [];
            if (formData.imageFiles.length > 0) {
                imageUrls = await uploadListingImages(user.id, formData.imageFiles);
            }

            const priceNum = Number(formData.expectedPrice.replace(/,/g, ''));
            const { error } = await createListing({
                user_id: user.id,
                listing_type: 'crops',
                category: selectedCategory,
                title: formData.cropName,
                description: formData.description,
                price: priceNum,
                unit: formData.unit,
                location: formData.location,
                district: formData.district,
                state: formData.state,
                images: imageUrls,
                specs: {
                    variety: formData.variety,
                    quantity: formData.quantity,
                    unit: formData.unit,
                    harvestDate: formData.harvestDate,
                },
            });

            if (error) {
                setSubmitError(error);
            } else {
                setShowSuccess(true);
            }
        } catch (err) {
            setSubmitError(tp('Something went wrong. Please try again.'));
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-3 md:px-6">
            <div className="mx-auto max-w-[800px]">
                <div className="py-4 md:py-6">
                    <Link
                        href="/home/crops/sell"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        {tp('Back to Crops')}
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-6 md:mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{tp('List Your Produce')}</h1>
                    <p className="text-sm md:text-base text-gray-500">{tp('Sell directly to buyers. Get the best price for your harvest.')}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-1 md:gap-4 mb-8 md:mb-10">
                    {['Category', 'Details', 'Photos & Price'].map((stepName, idx) => (
                        <div key={stepName} className="flex items-center gap-1 md:gap-2">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm shrink-0 ${step > idx + 1 ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                {step > idx + 1 ? (
                                    <span className="material-symbols-outlined text-sm md:text-lg">check</span>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span className={`text-[10px] md:text-sm font-medium whitespace-nowrap ${step === idx + 1 ? 'text-primary' : 'text-gray-500'}`}>
                                {tp(stepName)}
                            </span>
                            {idx < 2 && <div className="w-4 md:w-12 h-0.5 bg-gray-200 dark:bg-gray-700 shrink-0" />}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 md:p-8">
                    {/* Step 1: Category Selection */}
                    {step === 1 && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{tp('What are you selling?')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                                {cropCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-3 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all text-left ${selectedCategory === cat.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-2xl md:text-3xl mb-1 md:mb-2 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {cat.icon}
                                        </span>
                                        <h3 className={`font-bold text-sm md:text-base ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                            {tp(cat.name)}
                                        </h3>
                                        <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 md:mt-1 leading-snug">{tp(cat.examples)}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => { if (validateStep(1)) setStep(2); }}
                                disabled={!selectedCategory}
                                className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all ${selectedCategory
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {tp('Continue')}
                            </button>
                        </>
                    )}

                    {/* Step 2: Crop Details */}
                    {step === 2 && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{tp('Crop Details')}</h2>
                            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Crop Name')} *</label>
                                        <input
                                            type="text"
                                            value={formData.cropName}
                                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                            placeholder={tp('e.g., Wheat, Rice, Onion')}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Variety')}</label>
                                        <input
                                            type="text"
                                            value={formData.variety}
                                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                            placeholder={tp('e.g., Sharbati, Basmati 1121')}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Quantity Available')} *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                placeholder={tp('Enter quantity')}
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                            />
                                            <select
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                            >
                                                <option value="quintals">{tp('Quintals')}</option>
                                                <option value="kg">{tp('Kg')}</option>
                                                <option value="tonnes">{tp('Tonnes')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Harvest Date')}</label>
                                        <input
                                            type="date"
                                            value={formData.harvestDate}
                                            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('State')} *</label>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        >
                                            <option value="">{tp('Select State')}</option>
                                            <option>Maharashtra</option>
                                            <option>Madhya Pradesh</option>
                                            <option>Punjab</option>
                                            <option>Haryana</option>
                                            <option>Uttar Pradesh</option>
                                            <option>Karnataka</option>
                                            <option>Rajasthan</option>
                                            <option>Gujarat</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Location/Village')} *</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder={tp('e.g., Indore, Dewas')}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('District')} *</label>
                                    <input
                                        type="text"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        placeholder={tp('e.g., Indore, Ujjain')}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Description')}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={tp('Describe your produce quality, grade, moisture content, etc.')}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 md:gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    {tp('Back')}
                                </button>
                                <button
                                    onClick={() => { if (validateStep(2)) setStep(3); }}
                                    className="flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg bg-primary text-white hover:bg-primary-dark transition-all"
                                >
                                    Continue
                                </button>
                            </div>

                            {stepErrors.length > 0 && (
                                <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    {stepErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">error</span>{err}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 3: Photos & Price */}
                    {step === 3 && (
                        <>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{tp('Photos & Price')}</h2>
                            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Upload Photos')}</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-center relative">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        imageFiles: [...prev.imageFiles, ...Array.from(e.target.files!)],
                                                    }));
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <span className="material-symbols-outlined text-4xl md:text-5xl text-gray-400 mb-2 md:mb-3">add_photo_alternate</span>
                                        <p className="text-sm md:text-base text-gray-500 mb-1 md:mb-2">{tp('Tap to add photos of your produce')}</p>
                                        <p className="text-xs text-gray-400">{tp('Upload up to 5 photos. Max 5MB each.')}</p>
                                    </div>
                                    {formData.imageFiles.length > 0 && (
                                        <div className="mt-3 flex gap-3 flex-wrap">
                                            {formData.imageFiles.map((img, idx) => (
                                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                                                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            imageFiles: prev.imageFiles.filter((_, i) => i !== idx)
                                                        }))}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{tp('Expected Price')} *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={formData.expectedPrice}
                                            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                                            placeholder={tp('Enter price')}
                                            className="w-full pl-10 pr-20 md:pr-24 py-3 md:py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-base md:text-lg"
                                        />
                                        <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-xs md:text-sm text-gray-500">{tp('per')} {formData.unit}</span>
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 mt-2">
                                        💡 {tp('Current mandi price for similar produce')}: ₹2,450/qtl
                                    </p>
                                </div>

                                <div className="p-3 md:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-2.5 md:gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl md:text-2xl flex-shrink-0">lightbulb</span>
                                        <div>
                                            <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{tp('Tips for better response')}</p>
                                            <ul className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1.5 md:mt-2 space-y-0.5 md:space-y-1">
                                                <li>• {tp('Add clear photos of your produce')}</li>
                                                <li>• {tp('Mention quality grade and moisture content')}</li>
                                                <li>• {tp('Price competitively based on mandi rates')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <TermsAgreementCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

                            <div className="flex gap-3 md:gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    {tp('Back')}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !agreedToTerms}
                                    className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg bg-primary text-white hover:bg-primary-dark transition-all ${isSubmitting || !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? tp('Submitting...') : tp('Publish Listing')}
                                </button>
                            </div>

                            {(stepErrors.length > 0 || submitError) && (
                                <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    {submitError && (
                                        <p className="text-sm text-red-600 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">error</span>{submitError}
                                        </p>
                                    )}
                                    {stepErrors.map((err, i) => (
                                        <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">error</span>{err}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Success Modal */}
                    {showSuccess && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl max-w-sm w-full text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-3xl text-white">check</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{tp(SUBMISSION_HEADING)}</h2>
                                <p className="text-sm text-gray-500 mb-4">{tp(SUBMISSION_MESSAGE)}</p>
                                <div className="flex gap-3">
                                    <Link href="/home/crops/sell" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-center">
                                        {tp('Done')}
                                    </Link>
                                    <Link href="/home/crops/buy" className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-center">
                                        {tp('View Market')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
