'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function HeroSection() {
    const { t } = useLanguage();
    const [images, setImages] = useState<File[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('hero.catLivestock');
    const [subCategory, setSubCategory] = useState('');

    const categories: Record<string, string[]> = {
        'hero.catMachinery': ['Tractors', 'JCBs', 'Small Machineries', 'Sprayers', 'Irrigation', 'Others'],
        'hero.catLivestock': ['Cows', 'Buffaloes', 'Sheep', 'Goats', 'Fishes', 'Others'],
        'hero.catAgriProducts': ['Ghee', 'Seeds', 'Plants', 'Others'],
        'hero.catFarmersLand': ['Buy', 'Sell', 'Lease/Rent'],
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setImages(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <section className="px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                <div className="relative overflow-hidden rounded-[2.5rem] skeuo-card min-h-[850px] flex items-center px-12">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/40 z-10"></div>
                        <div
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDSBSarPJ_9uXmRvF0oViNMT9n8Kpr6mE6sYtDfNqvZQy4KY7B11aZ7EQFFb4Fo-NoH4961IGbY1cktD3WJ-2djyiUCg5pSHK2BGZ8Jo-nXEV7m8gAxbLSnjHIFHIHFBNq8-qmBTxQQHabiJPvPN32sY4HhOwim9zHPLDZ0OXM1clp10QoE2vwQMKbvE2vzMP0LPfSDeyvgc-A6YJ_pu8mfrqnXThxayo-7JD4F4lyjozHfZVytK_TXUoltcPQsPJ9qeip5VAPPrvY2')" }}
                        ></div>
                    </div>
                    <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">
                        <div className="text-white">
                            <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/50">
                                {t('hero.badge')}
                            </span>
                            <h1 className="mb-6 text-6xl font-black leading-[1.1] tracking-tight">
                                {t('hero.mainTitle1')} <br />
                                <span className="text-accent">{t('hero.mainTitle2')}</span>
                            </h1>
                            <p className="mb-8 text-lg font-medium leading-relaxed opacity-90 max-w-lg">
                                {t('hero.mainSubtitle')}
                            </p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-xl hover:bg-gray-100 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined">explore</span>
                                    {t('hero.exploreHub')}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="skeuo-card w-full max-w-md rounded-3xl p-8 border border-white/20">
                                <h3 className="text-2xl font-black text-primary mb-2">{t('hero.sellTitle')}</h3>
                                <p className="text-sm text-gray-500 mb-6 font-medium">{t('hero.sellSubtitle')}</p>
                                <div className="space-y-4">

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.productImages')}</label>
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors text-center cursor-pointer relative"
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">add_photo_alternate</span>
                                            <p className="text-xs font-bold text-gray-400">{t('hero.dragPhotos')}</p>
                                            {images.length > 0 && (
                                                <div className="mt-2 flex gap-1 justify-center flex-wrap">
                                                    {images.map((img, i) => (
                                                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate max-w-[100px]">{img.name}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.productName')}</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                                placeholder={t('hero.productPlaceholder')}
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.category')}</label>
                                            <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={(e) => {
                                                        setSelectedCategory(e.target.value);
                                                        setSubCategory('');
                                                    }}
                                                    className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 cursor-pointer"
                                                >
                                                    {Object.keys(categories).map((catKey) => (
                                                        <option key={catKey} value={catKey}>{t(catKey)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.type')}</label>
                                            <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                                <select
                                                    value={subCategory}
                                                    onChange={(e) => setSubCategory(e.target.value)}
                                                    className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="">{t('hero.selectType')}</option>
                                                    {categories[selectedCategory]?.map((sub) => (
                                                        <option key={sub} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.price')}</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300"
                                                placeholder={t('hero.enterAmount')}
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">{t('hero.description')}</label>
                                        <div className="skeuo-inset rounded-xl bg-white dark:bg-[#121811] px-4 py-3">
                                            <textarea
                                                className="w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0 placeholder:text-gray-300 resize-none"
                                                placeholder={t('hero.descPlaceholder')}
                                                rows={3}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button className="glossy-button w-full rounded-2xl py-4 mt-2 text-white font-black text-lg tracking-wide flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        {t('hero.submitBtn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
