'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ImagePreview {
    file: File;
    url: string;
}

export default function HeroSection() {
    const { t } = useLanguage();
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('hero.catLivestock');
    const [subCategory, setSubCategory] = useState('');
    const [dynamicValue, setDynamicValue] = useState('');
    const [dynamicUnit, setDynamicUnit] = useState('');
    const [secondaryValue, setSecondaryValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_IMAGES = 3;

    const categories: Record<string, string[]> = {
        'hero.catMachinery': ['Tractors', 'JCBs', 'Small Machineries', 'Sprayers', 'Irrigation', 'Others'],
        'hero.catLivestock': ['Cows', 'Buffaloes', 'Sheep', 'Goats', 'Fishes', 'Others'],
        'hero.catAgriProducts': ['Ghee', 'Seeds', 'Plants', 'Others'],
        'hero.catFarmersLand': ['Sell', 'Lease/Rent'],
        'hero.catCrops': ['Rice & Grains', 'Vegetables', 'Spices', 'Plants', 'Others'],
    };

    // Category-specific field configurations
    // Categories with secondField get two inputs side by side
    const categoryDynamicFields: Record<string, {
        label: string; placeholder: string; unit: string; icon: string; options?: string[];
        secondField?: { label: string; placeholder: string; icon: string; type?: string };
    }> = {
        'hero.catLivestock': {
            label: 'No. of Animals', placeholder: 'e.g. 5', unit: 'Head', icon: 'pets',
            secondField: { label: 'Breed Name', placeholder: 'e.g. Holstein', icon: 'genetics', type: 'text' },
        },
        'hero.catMachinery': {
            label: 'Horsepower / Capacity', placeholder: 'e.g. 45', unit: 'HP', icon: 'speed',
            secondField: { label: 'Brand Name', placeholder: 'e.g. Mahindra', icon: 'factory', type: 'text' },
        },
        'hero.catAgriProducts': { label: 'Quantity', placeholder: 'e.g. 50', unit: 'Kg', icon: 'scale', options: ['Kg', 'Quintals', 'Tonnes', 'Bags'] },
        'hero.catFarmersLand': { label: 'Land Area', placeholder: 'e.g. 5', unit: 'Acres', icon: 'landscape', options: ['Acres', 'Hectares', 'Bigha', 'Guntha'] },
        'hero.catCrops': { label: 'Quantity Available', placeholder: 'e.g. 100', unit: 'Kg', icon: 'eco', options: ['Kg', 'Quintals', 'Tonnes', 'Bags'] },
    };

    const currentDynamicField = categoryDynamicFields[selectedCategory];

    const addImages = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const remaining = MAX_IMAGES - images.length;
        if (remaining <= 0) return;
        const toAdd = fileArray.slice(0, remaining).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...toAdd]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].url);
            updated.splice(index, 1);
            return updated;
        });
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addImages(e.target.files);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            addImages(e.dataTransfer.files);
        }
    };

    const stats = [
        { value: '50K+', label: 'Active Farmers' },
        { value: '₹2Cr+', label: 'Trade Volume' },
        { value: '500+', label: 'Villages Covered' },
        { value: '4.8★', label: 'User Rating' },
    ];

    return (
        <section className="relative px-4 md:px-6 pt-6 pb-4">
            <div className="mx-auto max-w-[1400px]">
                {/* Main Hero Container */}
                <div className="relative overflow-hidden rounded-tl-[2rem] rounded-tr-[2rem] rounded-bl-none rounded-br-none md:rounded-tl-[2.5rem] md:rounded-tr-[2.5rem] md:rounded-bl-none md:rounded-br-none min-h-[480px] md:min-h-[600px] lg:min-h-[680px]">
                    {/* Background Image with Parallax Feel */}
                    <div className="absolute inset-0 z-0">
                        <div className="hero-gradient-overlay absolute inset-0 z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center scale-105 transition-transform duration-[2000ms] hover:scale-110"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSBSarPJ_9uXmRvF0oViNMT9n8Kpr6mE6sYtDfNqvZQy4KY7B11aZ7EQFFb4Fo-NoH4961IGbY1cktD3WJ-2djyiUCg5pSHK2BGZ8Jo-nXEV7m8gAxbLSnjHIFHIHFBNq8-qmBTxQQHabiJPvPN32sY4HhOwim9zHPLDZ0OXM1clp10QoE2vwQMKbvE2vzMP0LPfSDeyvgc-A6YJ_pu8mfrqnXThxayo-7JD4F4lyjozHfZVytK_TXUoltcPQsPJ9qeip5VAPPrvY2')" }}
                        ></div>
                    </div>

                    {/* Floating Decorative Orbs */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float" aria-hidden="true"></div>
                    <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float stagger-3" aria-hidden="true"></div>

                    {/* Content Grid */}
                    <div className="relative z-20 flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-10 w-full items-center p-6 md:p-10 lg:p-12 min-h-[480px] md:min-h-[600px] lg:min-h-[680px]">
                        {/* Left Content - Text & CTA */}
                        <div className="text-white lg:col-span-7 flex flex-col justify-center animate-fade-in-left">
                            <span className="mb-5 inline-flex items-center gap-2 w-fit rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/30">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                {t('hero.badge')}
                            </span>
                            <h1 className="mb-5 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight">
                                {t('hero.mainTitle1')} <br />
                                <span className="bg-gradient-to-r from-accent via-yellow-400 to-accent bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">{t('hero.mainTitle2')}</span>
                            </h1>
                            <p className="mb-8 text-base md:text-lg font-medium leading-relaxed opacity-85 max-w-xl">
                                {t('hero.mainSubtitle')}
                            </p>
                            <div className="flex flex-row gap-3 mb-8">
                                <button className="group flex items-center gap-2 rounded-2xl bg-white px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-primary shadow-xl hover:shadow-2xl hover:bg-gray-50 active:scale-[0.97] transition-all whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg group-hover:rotate-45 transition-transform">explore</span>
                                    {t('hero.exploreHub')}
                                </button>
                                <button className="group flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white hover:bg-white/20 active:scale-[0.97] transition-all whitespace-nowrap" data-no-auth>
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">play_circle</span>
                                    Watch Demo
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="hidden md:grid grid-cols-4 gap-3">
                                {stats.map((stat, i) => (
                                    <div key={i} className={`stat-card rounded-2xl px-4 py-3 text-center opacity-0 animate-fade-in-up stagger-${i + 3}`}>
                                        <p className="text-xl lg:text-2xl font-black text-white">{stat.value}</p>
                                        <p className="text-[11px] font-semibold text-white/60 mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Content - Sell Form */}
                        <div className="lg:col-span-5 hidden lg:flex justify-center lg:justify-end w-full animate-fade-in-right">
                            <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-lush-green flex items-center justify-center shadow-lg">
                                        <span className="material-symbols-outlined text-white text-xl">sell</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-primary">{t('hero.sellTitle')}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{t('hero.sellSubtitle')}</p>
                                    </div>
                                </div>
                                <div className="space-y-3.5">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">{t('hero.productImages')} <span className="text-gray-500 normal-case">({images.length}/{MAX_IMAGES})</span></label>
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary/50 transition-colors text-center cursor-pointer relative group"
                                        >
                                            {images.length < MAX_IMAGES && (
                                                <>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <span className="material-symbols-outlined text-2xl text-gray-500 mb-1 group-hover:text-primary transition-colors">add_photo_alternate</span>
                                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{t('hero.dragPhotos')}</p>
                                                    <p className="text-[10px] font-semibold text-gray-500 mt-0.5">Max {MAX_IMAGES} photos allowed</p>
                                                </>
                                            )}
                                            {images.length >= MAX_IMAGES && (
                                                <p className="text-xs font-bold text-primary py-1">✓ Maximum {MAX_IMAGES} images uploaded</p>
                                            )}
                                        </div>
                                        {/* Image Previews */}
                                        {images.length > 0 && (
                                            <div className="mt-2 flex gap-2 flex-wrap">
                                                {images.map((img, i) => (
                                                    <div key={i} className="relative group/thumb rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm" style={{ width: '72px', height: '72px' }}>
                                                        <img
                                                            src={img.url}
                                                            alt={`Preview ${i + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(i)}
                                                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-bl-lg p-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-md"
                                                            title="Remove image"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5 truncate px-1">
                                                            {img.file.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">{t('hero.productName')}</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 placeholder:text-gray-500"
                                                placeholder={t('hero.productPlaceholder')}
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">{t('hero.category')}</label>
                                            <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => {
                                                        setSelectedCategory(e.target.value);
                                                        setSubCategory('');
                                                        setDynamicValue('');
                                                        setSecondaryValue('');
                                                        setDynamicUnit(categoryDynamicFields[e.target.value]?.unit || '');
                                                    }}
                                                    className="w-full border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 cursor-pointer"
                                                >
                                                    {Object.keys(categories).map((catKey) => (
                                                        <option key={catKey} value={catKey}>{t(catKey)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">{t('hero.type')}</label>
                                            <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5">
                                                <select
                                                    value={subCategory}
                                                    onChange={(e) => setSubCategory(e.target.value)}
                                                    className="w-full border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="">{t('hero.selectType')}</option>
                                                    {categories[selectedCategory]?.map((sub) => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category-Specific Dynamic Field(s) */}
                                    {currentDynamicField && (
                                        currentDynamicField.secondField ? (
                                            /* Dual fields side by side for Machinery / Livestock */
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Secondary field (Brand / Breed) — shown first visually */}
                                                <div>
                                                    <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">
                                                        {currentDynamicField.secondField.label}
                                                    </label>
                                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary/60 text-base shrink-0">
                                                            {currentDynamicField.secondField.icon}
                                                        </span>
                                                        <input
                                                            type={currentDynamicField.secondField.type || 'text'}
                                                            placeholder={currentDynamicField.secondField.placeholder}
                                                            value={secondaryValue}
                                                            onChange={(e) => setSecondaryValue(e.target.value)}
                                                            className="flex-1 border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 placeholder:text-gray-500 min-w-0"
                                                        />
                                                    </div>
                                                </div>
                                                {/* Primary field (HP / No. of Animals) */}
                                                <div>
                                                    <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">
                                                        {currentDynamicField.label}
                                                    </label>
                                                    <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary/60 text-base shrink-0">
                                                            {currentDynamicField.icon}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            inputMode="decimal"
                                                            placeholder={currentDynamicField.placeholder}
                                                            value={dynamicValue}
                                                            onChange={(e) => setDynamicValue(e.target.value)}
                                                            className="flex-1 border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 placeholder:text-gray-500 min-w-0"
                                                        />
                                                        <span className="text-xs font-bold text-primary/60 shrink-0">
                                                            {currentDynamicField.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Single field for Agri Products / Farmer Land / Crops */
                                            <div>
                                                <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">
                                                    {currentDynamicField.label}
                                                </label>
                                                <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary/60 text-lg shrink-0">
                                                        {currentDynamicField.icon}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        placeholder={currentDynamicField.placeholder}
                                                        value={dynamicValue}
                                                        onChange={(e) => setDynamicValue(e.target.value)}
                                                        className="flex-1 border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 placeholder:text-gray-500 min-w-0"
                                                    />
                                                    {currentDynamicField.options ? (
                                                        <select
                                                            value={dynamicUnit || currentDynamicField.unit}
                                                            onChange={(e) => setDynamicUnit(e.target.value)}
                                                            className="border-none bg-primary/10 rounded-lg px-2 py-1 text-xs font-bold text-primary focus:ring-0 cursor-pointer appearance-none shrink-0"
                                                        >
                                                            {currentDynamicField.options.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-xs font-bold text-primary/60 shrink-0">
                                                            {currentDynamicField.unit}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1 ml-1">{t('hero.price')}</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-2.5">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-0 placeholder:text-gray-500"
                                                placeholder={t('hero.enterAmount')}
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                    <button className="glossy-button w-full rounded-2xl py-3.5 mt-1 text-white font-black text-base tracking-wide flex items-center justify-center gap-2 group">
                                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">check_circle</span>
                                        {t('hero.submitBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrolling Trust Strip */}
                <div className="trust-strip rounded-b-2xl py-3 px-4 overflow-hidden">
                    <div className="flex animate-marquee whitespace-nowrap">
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex items-center gap-8 mr-8">
                                {['🌾 Trusted by 50,000+ Farmers', '🐄 10,000+ Livestock Listed', '🚜 Best Machinery Deals', '🌍 Covering 500+ Villages', '⭐ 4.8 Star Rating', '🔒 100% Secure Transactions', '📱 Available on Android & iOS'].map((item, i) => (
                                    <span key={i} className="text-white/80 text-xs font-semibold tracking-wide">{item}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
