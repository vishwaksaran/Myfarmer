'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ImagePreview {
    file: File;
    url: string;
}

const galleryItems = [
    {
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
        title: 'Smart Irrigation',
        desc: 'Modern drip & sprinkler systems save up to 60% water while boosting crop yield significantly.',
        brief: 'Water is the lifeline of agriculture. Smart irrigation technologies like drip irrigation, sprinkler systems, and automated sensors are transforming how Indian farmers manage water resources. These systems deliver water directly to plant roots, reducing wastage by up to 60% compared to traditional flood irrigation. With climate change making rainfall increasingly unpredictable, smart irrigation ensures consistent crop growth regardless of monsoon patterns. Farmers using these systems report 30-50% higher yields while consuming significantly less water — a win for both productivity and sustainability.',
    },
    {
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop',
        title: 'Organic Farming',
        desc: 'Chemical-free farming practices that produce healthier crops and protect soil for future generations.',
        brief: 'Organic farming is more than a trend — it\'s a return to nature\'s way of growing food. By eliminating synthetic pesticides and fertilizers, organic farmers produce crops that are safer for consumers and gentler on the environment. The organic market in India is growing at 25% annually, with premium prices rewarding farmers who make the switch. Practices like composting, crop rotation, and bio-pest control not only improve soil health but also reduce input costs over time. Miraitu connects organic farmers directly with health-conscious consumers, ensuring fair prices and eliminating middlemen.',
    },
    {
        image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
        title: 'Livestock Care',
        desc: 'Proper animal husbandry and veterinary care ensure healthy livestock and better dairy production.',
        brief: 'India has the world\'s largest livestock population, and proper animal care is crucial for rural livelihoods. Good livestock management includes balanced nutrition, timely vaccinations, clean shelter, and access to veterinary services. Healthy animals produce more milk, grow faster, and have better reproductive outcomes. With Miraitu\'s veterinary services, farmers can connect with qualified vets for on-demand consultations, schedule vaccinations, and get expert advice on breeding programs. This reduces mortality rates and significantly increases farm income from dairy and meat production.',
    },
    {
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
        title: 'Modern Machinery',
        desc: 'Tractors, harvesters & drones are revolutionizing farming efficiency across rural India.',
        brief: 'Agricultural mechanization is transforming Indian farming from labor-intensive to efficient and scalable. Modern tractors with GPS guidance, combine harvesters that reduce post-harvest losses, and agricultural drones for precision spraying are now accessible to farmers through Miraitu\'s rental and marketplace platform. A single drone can spray 10 acres in 30 minutes — work that would take manual laborers an entire day. Mechanization reduces costs by 20-40%, improves crop quality, and frees farmers to focus on strategic decisions rather than back-breaking manual labor.',
    },
    {
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
        title: 'Crop Diversity',
        desc: 'Growing multiple crops reduces risk and ensures food security while maintaining soil nutrients.',
        brief: 'Crop diversification is a farmer\'s best insurance policy against market volatility and climate risks. By growing a mix of cereals, pulses, vegetables, and cash crops, farmers spread their risk and maintain multiple income streams throughout the year. Intercropping and mixed farming systems also improve soil fertility naturally — legumes fix nitrogen for neighboring cereal crops, reducing fertilizer needs. The Indian government\'s push for crop diversification aligns with Miraitu\'s mission to help farmers explore profitable alternatives beyond traditional rice-wheat systems.',
    },
    {
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
        title: 'Golden Harvests',
        desc: 'India\'s wheat and rice fields feed billions — timely harvesting maximizes returns for farmers.',
        brief: 'Harvesting at the right time is critical for maximizing both quality and quantity of produce. Delayed harvesting can lead to 15-25% crop losses due to shattering, pest damage, and weather exposure. Modern harvesting techniques and machinery help farmers collect their crops at peak maturity, preserving nutritional value and commanding better market prices. Miraitu\'s real-time mandi price tracking helps farmers decide the optimal time to sell, while our logistics network ensures produce reaches markets quickly, minimizing post-harvest losses that cost Indian agriculture ₹92,000 crores annually.',
    },
    {
        image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&h=600&fit=crop',
        title: 'Soil Health',
        desc: 'Regular soil testing and proper fertilization are the foundation of high-yield sustainable farming.',
        brief: 'Healthy soil is the foundation of productive agriculture. India\'s soils face challenges from over-cultivation, chemical overuse, and erosion. Regular soil testing reveals pH levels, nutrient deficiencies, and organic matter content — enabling farmers to apply exactly the right fertilizers in the right amounts. This precision approach reduces input costs by 20-30% while improving yields. Practices like cover cropping, minimum tillage, and adding organic matter rebuild soil structure over time. Miraitu\'s soil testing service connects farmers with certified labs and provides actionable recommendations in their local language.',
    },
    {
        image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&h=600&fit=crop',
        title: 'Farm to Market',
        desc: 'Direct market access eliminates middlemen and ensures farmers get fair prices for their produce.',
        brief: 'The journey from farm to consumer\'s plate involves multiple middlemen, each taking a cut that reduces farmer income. Studies show Indian farmers receive only 15-25% of the final retail price. Miraitu\'s digital marketplace connects farmers directly with buyers, processors, and retailers — increasing farmer earnings by 30-50%. Real-time price discovery across mandis empowers farmers to negotiate better deals. Our platform also facilitates group selling through FPOs, giving small farmers the bargaining power of large cooperatives. From listing produce to arranging transport, Miraitu handles the entire supply chain.',
    },
];

export default function HeroSection() {
    const { t } = useLanguage();
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [showGallery, setShowGallery] = useState(false);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
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
        <>
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
                                <button onClick={() => setShowGallery(true)} className="group flex items-center gap-2 rounded-2xl bg-white px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-primary shadow-xl hover:shadow-2xl hover:bg-gray-50 active:scale-[0.97] transition-all whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg group-hover:rotate-45 transition-transform">photo_library</span>
                                    {t('hero.exploreGallery')}
                                </button>
                                <a href="https://www.youtube.com/@miraituapp" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white hover:bg-white/20 active:scale-[0.97] transition-all whitespace-nowrap" data-no-auth>
                                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">play_circle</span>
                                    {t('hero.watchFarmerVideos')}
                                </a>
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

            {/* Gallery Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => { setShowGallery(false); setExpandedItem(null); }}>
                    <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#121811] rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-5 md:px-8 py-4 md:py-5 bg-gradient-to-r from-primary to-green-600 text-white">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl">photo_library</span>
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black tracking-tight">Explore Gallery</h2>
                                    <p className="text-[11px] md:text-xs text-white/70 font-medium">Discover the importance of modern agriculture</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowGallery(false); setExpandedItem(null); }} className="size-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-white text-xl">close</span>
                            </button>
                        </div>

                        {/* Expanded View */}
                        {expandedItem !== null && (
                            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                                <div className="relative">
                                    <img
                                        src={galleryItems[expandedItem].image}
                                        alt={galleryItems[expandedItem].title}
                                        className="w-full h-[250px] md:h-[400px] object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-5 md:left-8 right-5 md:right-8">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-primary text-[10px] font-bold mb-2">
                                            <span className="material-symbols-outlined text-xs">eco</span>
                                            Agriculture
                                        </span>
                                        <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">{galleryItems[expandedItem].title}</h3>
                                    </div>
                                </div>
                                <div className="p-5 md:p-8">
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{galleryItems[expandedItem].brief}</p>
                                    <button onClick={() => setExpandedItem(null)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                                        Back to Gallery
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gallery Grid */}
                        {expandedItem === null && (
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 md:p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {galleryItems.map((item, index) => (
                                    <div key={index} onClick={() => setExpandedItem(index)} className="group rounded-2xl overflow-hidden bg-gray-50 dark:bg-[#1a2318] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 text-primary text-[10px] font-bold">
                                                    <span className="material-symbols-outlined text-xs">eco</span>
                                                    Agriculture
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-gray-700 text-[10px] font-bold">
                                                    <span className="material-symbols-outlined text-xs">open_in_full</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3 md:p-4">
                                            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{item.desc}</p>
                                            <span className="inline-flex items-center gap-1 text-primary text-[11px] font-bold mt-2">
                                                Read More <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
