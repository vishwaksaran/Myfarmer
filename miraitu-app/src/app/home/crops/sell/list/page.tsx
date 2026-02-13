'use client';

import { useState } from 'react';
import Link from 'next/link';

const cropCategories = [
    { id: 'grains', name: 'Grains & Cereals', icon: 'grain', examples: 'Wheat, Rice, Maize, Jowar' },
    { id: 'pulses', name: 'Pulses & Legumes', icon: 'spa', examples: 'Chana, Moong, Urad, Toor' },
    { id: 'vegetables', name: 'Vegetables', icon: 'eco', examples: 'Onion, Potato, Tomato, Cauliflower' },
    { id: 'fruits', name: 'Fruits', icon: 'nutrition', examples: 'Mango, Banana, Grapes, Orange' },
    { id: 'oilseeds', name: 'Oilseeds', icon: 'water_drop', examples: 'Soybean, Groundnut, Mustard' },
    { id: 'spices', name: 'Spices', icon: 'local_fire_department', examples: 'Turmeric, Chilli, Coriander' },
];

export default function SellCropsListPage() {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState({
        cropName: '',
        variety: '',
        quantity: '',
        unit: 'quintals',
        expectedPrice: '',
        description: '',
        location: '',
        state: '',
        harvestDate: '',
        images: [] as string[],
    });

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[800px]">
                <div className="py-6">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">List Your Produce</h1>
                    <p className="text-gray-500">Sell directly to buyers. Get the best price for your harvest.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {['Category', 'Details', 'Photos & Price'].map((stepName, idx) => (
                        <div key={stepName} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step > idx + 1 ? 'bg-green-500 text-white' : step === idx + 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                {step > idx + 1 ? (
                                    <span className="material-symbols-outlined text-lg">check</span>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span className={`text-sm font-medium ${step === idx + 1 ? 'text-primary' : 'text-gray-500'}`}>
                                {stepName}
                            </span>
                            {idx < 2 && <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8">
                    {/* Step 1: Category Selection */}
                    {step === 1 && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">What are you selling?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {cropCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-5 rounded-2xl border-2 transition-all text-left ${selectedCategory === cat.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-3xl mb-2 ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-400'}`}>
                                            {cat.icon}
                                        </span>
                                        <h3 className={`font-bold ${selectedCategory === cat.id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                            {cat.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">{cat.examples}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => selectedCategory && setStep(2)}
                                disabled={!selectedCategory}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedCategory
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Continue
                            </button>
                        </>
                    )}

                    {/* Step 2: Crop Details */}
                    {step === 2 && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Crop Details</h2>
                            <div className="space-y-6 mb-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Crop Name *</label>
                                        <input
                                            type="text"
                                            value={formData.cropName}
                                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                                            placeholder="e.g., Wheat, Rice, Onion"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Variety</label>
                                        <input
                                            type="text"
                                            value={formData.variety}
                                            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                            placeholder="e.g., Sharbati, Basmati 1121"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantity Available *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                placeholder="Enter quantity"
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                            />
                                            <select
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                            >
                                                <option value="quintals">Quintals</option>
                                                <option value="kg">Kg</option>
                                                <option value="tonnes">Tonnes</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Harvest Date</label>
                                        <input
                                            type="date"
                                            value={formData.harvestDate}
                                            onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">State *</label>
                                        <select
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        >
                                            <option value="">Select State</option>
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
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location/Village *</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g., Indore, Dewas"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe your produce quality, grade, moisture content, etc."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-primary text-white hover:bg-primary-dark transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Photos & Price */}
                    {step === 3 && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Photos & Price</h2>
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Upload Photos</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center">
                                        <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">add_photo_alternate</span>
                                        <p className="text-gray-500 mb-2">Drag and drop photos here, or click to browse</p>
                                        <p className="text-xs text-gray-400">Upload up to 5 photos. Max 5MB each.</p>
                                        <button className="mt-4 px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                            Choose Files
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expected Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={formData.expectedPrice}
                                            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                                            placeholder="Enter your expected price"
                                            className="w-full pl-10 pr-24 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">per {formData.unit}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        💡 Current mandi price for similar produce: ₹2,450/qtl
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary">lightbulb</span>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">Tips for better response</p>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                                                <li>• Add clear photos of your produce</li>
                                                <li>• Mention quality grade and moisture content</li>
                                                <li>• Price competitively based on mandi rates</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-primary text-white hover:bg-primary-dark transition-all"
                                >
                                    Publish Listing
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
