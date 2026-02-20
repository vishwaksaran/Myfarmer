'use client';

import { useState } from 'react';

const steps = ['Basic Details', 'Condition & Specs', 'Photos & Price'];

// Custom Drone SVG Icon
const DroneIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ width: '1.875rem', height: '1.875rem' }}
    >
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="5" r="2" />
        <line x1="5" y1="7" x2="5" y2="8" />
        <line x1="19" y1="7" x2="19" y2="8" />
        <line x1="7" y1="6" x2="10" y2="10" />
        <line x1="17" y1="6" x2="14" y2="10" />
        <rect x="8" y="10" width="8" height="5" rx="1" />
        <line x1="11" y1="15" x2="10" y2="19" />
        <line x1="13" y1="15" x2="14" y2="19" />
        <line x1="9" y1="19" x2="11" y2="19" />
        <line x1="13" y1="19" x2="15" y2="19" />
        <rect x="10" y="16" width="4" height="3" rx="0.5" />
    </svg>
);

const categories = [
    { id: 'tractors', name: 'Tractors', icon: 'agriculture' },
    { id: 'jcb', name: 'JCB', icon: 'front_loader' },
    { id: 'small-machineries', name: 'Small Machineries', icon: 'precision_manufacturing' },
    { id: 'implements', name: 'Implements', icon: 'handyman' },
    { id: 'harvesters', name: 'Harvesters', icon: 'grass' },
    { id: 'drones', name: 'Agri Drones', icon: 'drone' },
];

const brands: Record<string, string[]> = {
    tractors: ['Mahindra', 'John Deere', 'Swaraj', 'Sonalika', 'New Holland', 'Kubota', 'TAFE', 'Eicher'],
    jcb: ['JCB', 'L&T Komatsu', 'Caterpillar', 'Volvo', 'Tata Hitachi', 'CASE', 'Hyundai'],
    'small-machineries': ['Honda', 'VST Shakti', 'Kirloskar', 'Stihl', 'Neptune', 'Aspee', 'Greaves'],
    implements: ['Fieldking', 'Mahindra', 'John Deere', 'Landforce', 'Shaktiman', 'Khedut'],
    harvesters: ['Kubota', 'John Deere', 'Preet', 'Dashmesh', 'New Holland', 'Claas'],
    drones: ['DJI', 'Garuda', 'IoTech', 'Marut', 'General Aeronautics', 'Throttle Aerospace'],
};

interface SellMachineryFormProps {
    category?: string;
}

export default function SellMachineryForm({ category = 'tractors' }: SellMachineryFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(category);
    const [showSuccess, setShowSuccess] = useState(false);
    const [stepErrors, setStepErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        category: category,
        brand: '',
        model: '',
        year: '',
        hp: '',
        hoursUsed: '',
        fuelType: 'Diesel',
        tireCondition: 75,
        hasServiceHistory: false,
        images: [] as File[],
        price: '',
        description: '',
    });

    const estimatedValue = formData.hp && formData.year
        ? `₹${Math.floor(Number(formData.hp) * 7000 + (2024 - Number(formData.year)) * (-15000) + 300000).toLocaleString('en-IN')} - ₹${Math.floor(Number(formData.hp) * 9000 + (2024 - Number(formData.year)) * (-12000) + 400000).toLocaleString('en-IN')}`
        : '₹4,50,000 - ₹5,10,000';

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!)],
            }));
        }
    };

    const validateStep = (step: number): boolean => {
        const errs: string[] = [];
        if (step === 1) {
            if (!formData.brand) errs.push('Please select a brand');
            if (!formData.model.trim()) errs.push('Please enter the model name');
            if (!formData.year) errs.push('Please select year of purchase');
            if (!formData.hp) errs.push('Please select HP range');
        } else if (step === 3) {
            if (!formData.price.trim()) errs.push('Please enter your asking price');
            else if (isNaN(Number(formData.price.replace(/,/g, '')))) errs.push('Enter a valid price');
        }
        setStepErrors(errs);
        return errs.length === 0;
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, idx) => (
                    <div key={step} className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${idx + 1 <= currentStep
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}
                        >
                            {idx + 1}
                        </div>
                        <span className={`mt-2 text-sm font-medium ${idx + 1 === currentStep ? 'text-primary' : 'text-gray-500'}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Card */}
            <div className="skeuo-card rounded-3xl p-8">
                {/* Step 1: Basic Details */}
                {currentStep === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-primary text-center mb-2">Sell Your Machinery</h2>
                        <p className="text-gray-500 text-center mb-8">Step 1: Provide basic information about your equipment</p>

                        {/* Category Selection */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Select Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id);
                                            setFormData(prev => ({ ...prev, category: cat.id, brand: '' }));
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all ${selectedCategory === cat.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                            }`}
                                    >
                                        {cat.icon === 'drone' ? (
                                            <DroneIcon className={selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'} />
                                        ) : (
                                            <span className={`material-symbols-outlined text-3xl ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}`}>
                                                {cat.icon}
                                            </span>
                                        )}
                                        <p className={`mt-1 font-semibold text-sm ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {cat.name}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Brand and Model */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Brand</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">factory</span>
                                    <select
                                        value={formData.brand}
                                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands[selectedCategory]?.map((brand) => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Model Name</label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                    placeholder="e.g. Yuvo 575 DI"
                                    className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Year of Purchase</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">calendar_month</span>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                    >
                                        <option value="">Select Year</option>
                                        {Array.from({ length: 20 }, (_, i) => 2024 - i).map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Estimated HP Range</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">speed</span>
                                    <select
                                        value={formData.hp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                    >
                                        <option value="">Select HP</option>
                                        {['25-35', '35-45', '45-55', '55-65', '65-75', '75+'].map((hp) => (
                                            <option key={hp} value={hp.split('-')[0]}>{hp} HP</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2: Condition & Specs */}
                {currentStep === 2 && (
                    <>
                        <h2 className="text-2xl font-bold text-primary mb-2">Condition & Specs</h2>
                        <p className="text-gray-500 mb-8">Step 2 of 3: Technical details of your machinery</p>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="col-span-2">
                                <div className="skeuo-card rounded-2xl p-6">
                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Year of Purchase</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">calendar_month</span>
                                                <select
                                                    value={formData.year}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-primary text-white font-semibold appearance-none cursor-pointer"
                                                >
                                                    {Array.from({ length: 20 }, (_, i) => 2024 - i).map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Hours Used (Engine)</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">schedule</span>
                                                <input
                                                    type="text"
                                                    value={formData.hoursUsed}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, hoursUsed: e.target.value }))}
                                                    placeholder="e.g. 1200"
                                                    className="w-full pl-12 pr-16 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary outline-none"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">HRS</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Horsepower (HP)</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">speed</span>
                                                <input
                                                    type="text"
                                                    value={formData.hp}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
                                                    placeholder="45"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-2">Fuel Type</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">local_gas_station</span>
                                                <select
                                                    value={formData.fuelType}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary outline-none appearance-none"
                                                >
                                                    <option>Diesel</option>
                                                    <option>Petrol</option>
                                                    <option>Electric</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tire Condition Slider */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm text-gray-600">Tire Condition</label>
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                                GOOD ({formData.tireCondition}%)
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.tireCondition}
                                            onChange={(e) => setFormData(prev => ({ ...prev, tireCondition: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>WORN OUT</span>
                                            <span>BRAND NEW</span>
                                        </div>
                                    </div>

                                    {/* Service History Toggle */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-gray-400">history</span>
                                            <div>
                                                <p className="font-semibold">Complete Service History</p>
                                                <p className="text-xs text-gray-500">Includes original logs and company records</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, hasServiceHistory: !prev.hasServiceHistory }))}
                                            className={`w-14 h-7 rounded-full transition-colors ${formData.hasServiceHistory ? 'bg-primary' : 'bg-gray-300'}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${formData.hasServiceHistory ? 'translate-x-7' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Seller Tip & Estimated Value */}
                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">👍</span>
                                        <span className="font-bold text-amber-800 dark:text-amber-200">Pro Seller Tip</span>
                                    </div>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Machines with <strong>detailed service history</strong> sell 35% faster on Miraitu. Highlighting genuine tire wear increases buyer trust.
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-primary text-white">
                                    <p className="text-sm text-white/70 mb-1">Estimated Value</p>
                                    <p className="text-2xl font-bold mb-2">{estimatedValue}</p>
                                    <p className="text-xs text-white/60 uppercase tracking-wide">Based on current market trends</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 3: Photos & Price */}
                {currentStep === 3 && (
                    <>
                        <h2 className="text-2xl font-bold text-primary mb-2">Photos & Price</h2>
                        <p className="text-gray-500 mb-8">Step 3 of 3: Add photos and set your price</p>

                        {/* Image Upload */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Upload Photos</label>
                            <div
                                className="relative p-12 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:border-primary/50 transition-all cursor-pointer"
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-5xl text-primary mb-4">add_photo_alternate</span>
                                    <h3 className="text-lg font-bold text-primary-dark mb-2">Drag and drop photos</h3>
                                    <p className="text-sm text-gray-500">or click to browse from your device</p>
                                    <p className="text-xs text-gray-400 mt-2">JPG • PNG • MAX 10MB each</p>
                                </div>
                            </div>

                            {formData.images.length > 0 && (
                                <div className="mt-4 flex gap-3 flex-wrap">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                                            <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    images: prev.images.filter((_, i) => i !== idx)
                                                }))}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Asking Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">₹</span>
                                <input
                                    type="text"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="Enter price"
                                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none text-2xl font-bold"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Suggested range: {estimatedValue}</p>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Add any additional details about your machinery..."
                                rows={4}
                                className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none resize-none"
                            />
                        </div>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {currentStep > 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="text-center">
                        <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (currentStep < steps.length) {
                                if (validateStep(currentStep)) {
                                    setStepErrors([]);
                                    setCurrentStep(prev => prev + 1);
                                }
                            } else {
                                if (validateStep(currentStep)) {
                                    setShowSuccess(true);
                                }
                            }
                        }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                    >
                        {currentStep === steps.length ? 'Publish Listing' : 'Next: ' + steps[currentStep]}
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>

                {/* Validation Errors */}
                {stepErrors.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        {stepErrors.map((err, i) => (
                            <p key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>{err}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSuccess(false)}>
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()} style={{ animation: 'successPop 0.5s ease-out' }}>
                        <div className="text-center">
                            <div className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-3xl md:text-4xl text-white">check</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 md:mb-3">Machinery Listed Successfully!</h2>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 font-bold mb-1">Great job! 🚜</p>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-4">Your machinery listing has been submitted for review. Our team will verify the details and connect you with interested buyers.</p>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-4">
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon</p>
                            </div>
                            <button onClick={() => setShowSuccess(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`@keyframes successPop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.02); } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
    );
}
