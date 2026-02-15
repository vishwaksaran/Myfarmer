'use client';

import { useState } from 'react';
import Link from 'next/link';

const landCategories = [
    { id: 'agriculture', name: 'Agriculture Land', icon: '🌾' },
    { id: 'farmhouse', name: 'Farm House', icon: '🏡' },
    { id: 'orchard', name: 'Orchard', icon: '🍊' },
    { id: 'plantation', name: 'Plantation', icon: '🌴' },
    { id: 'irrigated', name: 'Irrigated Land', icon: '💧' },
];

export default function SellLandPage() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        district: '',
        state: '',
        area: '',
        pricePerAcre: '',
        totalPrice: '',
        description: '',
        amenities: '',
        contactName: '',
        contactPhone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your land listing has been submitted for review! 🎉');
    };

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Sell</span>
                </div>

                {/* Header */}
                <div className="text-center mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Sell Your Farm Land
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        List your property and reach thousands of verified buyers with zero brokerage
                    </p>
                </div>

                {/* Benefits Row */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
                    {[
                        { icon: 'money_off', title: 'Zero Commission', desc: 'No brokerage fees' },
                        { icon: 'visibility', title: '10K+ Buyers', desc: 'Active audience' },
                        { icon: 'verified_user', title: 'Verified Process', desc: 'Secure listing' },
                    ].map((benefit, i) => (
                        <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg md:rounded-2xl p-3 md:p-5 text-center border border-green-100 dark:border-green-900/30">
                            <span className="material-symbols-outlined text-xl md:text-3xl text-green-600 mb-1 md:mb-2 block">{benefit.icon}</span>
                            <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white mb-0.5">{benefit.title}</h3>
                            <p className="text-[10px] md:text-xs text-gray-500">{benefit.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                        {/* Category Selection */}
                        <div className="mb-6 md:mb-8">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 md:mb-4">Select Land Type</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                                {landCategories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`p-2 md:p-4 rounded-lg md:rounded-xl border-2 text-center transition-all ${
                                            selectedCategory === cat.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/30'
                                        }`}
                                    >
                                        <span className="text-xl md:text-2xl mb-0.5 md:mb-1 block">{cat.icon}</span>
                                        <span className={`text-[10px] md:text-xs font-semibold line-clamp-2 ${
                                            selectedCategory === cat.id ? 'text-primary' : 'text-gray-600'
                                        }`}>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Land Details */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">info</span>
                            Land Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 5 Acres Irrigated Farm Land" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Total Area (Acres)</label>
                                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 5" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                        </div>

                        {/* Location */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">location_on</span>
                            Location
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Village / Town</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Srirangapatna" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">District</label>
                                <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Mandya" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                                <select name="state" value={formData.state} onChange={handleChange} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
                                    <option value="">Select State</option>
                                    <option>Karnataka</option>
                                    <option>Maharashtra</option>
                                    <option>Tamil Nadu</option>
                                    <option>Andhra Pradesh</option>
                                    <option>Kerala</option>
                                    <option>Telangana</option>
                                    <option>Gujarat</option>
                                    <option>Rajasthan</option>
                                    <option>Madhya Pradesh</option>
                                    <option>Uttar Pradesh</option>
                                </select>
                            </div>
                        </div>

                        {/* Pricing */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">currency_rupee</span>
                            Pricing
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price Per Acre (₹)</label>
                                <input type="text" name="pricePerAcre" value={formData.pricePerAcre} onChange={handleChange} placeholder="e.g. 900000" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Total Price (₹)</label>
                                <input type="text" name="totalPrice" value={formData.totalPrice} onChange={handleChange} placeholder="e.g. 4500000" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description & Amenities</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your land, facilities, water sources, crops grown, nearby landmarks..." className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base resize-none" />
                        </div>

                        {/* Upload Photos */}
                        <div className="mb-6">
                            <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Upload Photos</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg md:rounded-2xl p-4 md:p-8 text-center cursor-pointer hover:border-primary transition-colors">
                                <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-400 mb-1 md:mb-2 block">add_a_photo</span>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">Tap to upload land photos</p>
                                <p className="text-[10px] md:text-xs text-gray-400 mt-1">Supports JPG, PNG (Max 10MB each)</p>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base md:text-lg">call</span>
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Full Name" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg md:text-xl">publish</span>
                            Submit Listing for Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
