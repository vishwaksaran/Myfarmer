'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const categoryKeys = [
    { key: 'livestock.cows', value: 'Cows', icon: '🐄' },
    { key: 'livestock.buffaloes', value: 'Buffaloes', icon: '🐃' },
    { key: 'livestock.goats', value: 'Goats', icon: '🐐' },
    { key: 'livestock.others', value: 'Others', icon: '🐑' },
];

const livestockData = [
    {
        id: 1,
        name: 'Gir Cow - ID: 204',
        breed: 'Gir',
        price: '₹45,000',
        health: 98,
        distance: '4.8km away from your farm',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg2t-TR44_5vONuYPchNlXLME9CjfDBfecWTN7WhLaftderLujG-PRwPSxNcJEaTVPQYwlomOLPEwZ6osSDf-2hXp59n6LsjA_i0OkHzhdaTvaGjwc5Capynusf0PxzQ4nt5bX9M5WClNtIfux2CAwyAA7FGrkAmIQDOiw9xw7ybJp0AYGVF2h-wZxzZMLi2dLfypaUfH84EKtHg_K_BwKxoER4Ad4AcCAs7rxtnmMTlusAzPAsCGLOAmy58yJihwWuZf2uiw5rTK8',
        badge: 'NEW',
        category: 'Cows',
        milkYield: '12L/day',
    },
    {
        id: 2,
        name: 'Murrah Buffalo',
        breed: 'Murrah',
        price: '₹80,000',
        health: 95,
        distance: '2.1km away',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzVzcMm-84b5-CalLd0dK_6MJc7dpcsenUDV3Tw98vk8e5871y-VUXEldxSOmezi41z0LT1LutNcpEC-eYpfff6BtTt1A4sCL9bqoVFP3V3so5krk-R-jHapHv3C7vH7rnM2emiJjeIc3WZOBv4PXvSIKWxamO05g_x5Js2B-ptYT0b4xQoAUcmCzTEG1WP5pmmbii2Xf6RLCC7F1s1kr_VEsri0QLmeM6cfR4rXch0aSoBHan1UPX6Vha4OrC1HAYPjh1AFv-4cw1',
        category: 'Buffaloes',
        milkYield: '18L/day',
    },
    {
        id: 3,
        name: 'Holstein Friesian',
        breed: 'HF',
        price: '₹65,000',
        health: 99,
        distance: '5.5km away',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TXeY2ROJiepraT_BpzNCcqUDACYG58KribQVbsBeya0mztK_GcEUXt3dioJE6IhXVdzniM0BlH_Y9MpwPQW_j9kJ5Au_KdTerPFxUDISJMfPy8-aL5CedJdNWlI7OAcd8GPYDM2xT29BmtYThE0TMcCXwzZIg9Be3IRi-DmCwK9l4YpoDHl9PNwOKT0AsrJUGbtSuBXjxfTSVrZcLpb3LCZRZIymmK-3wcN-TTayo7g8OGyRxTBWHLBu6zLcKO14JHNzifc-axBE',
        badge: 'NEW',
        category: 'Cows',
        milkYield: '20L/day',
    },
    {
        id: 4,
        name: 'Jamnapari Goat',
        breed: 'Jamnapari',
        price: '₹12,000',
        health: 97,
        distance: '1.5km away',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR8JKJ6O2abZGX3VMvIK-RdAG3gQ42lUI_UFTp4n7b9hmM5XBIvIF1CrSM2U8cVD1onkzEecaJBhngDw0P6mRifLmlTF_XDv600TiZaYGKGDhezTvLWdEPIo8TuzQhKpQmmtNB9s4V4RzxSI8nz-WHllE1FW_cl1aLhAhSG6LV8d4lMA3yV8pDZJG_SEzGjD0CqDTFZj0u6xi7zz64edzezkpoUdeLpN4aVMDYITHuJpMn0wEyEOT_0Wm_Xe96Y7nWSHG2pnWoPLBa',
        category: 'Goats',
    },
];

export default function LivestockMarketplace() {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('Cows');

    const filteredLivestock = livestockData.filter(item => item.category === activeCategory);

    return (
        <section className="px-4 md:px-6 py-14 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent">
            <div className="mx-auto max-w-[1400px]">
                {/* Section Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex-1 animate-fade-in-left">
                        <span className="inline-flex items-center gap-1.5 mb-3 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                            <span className="material-symbols-outlined text-xs">pets</span>
                            Marketplace
                        </span>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{t('livestock.title')}</h2>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg">{t('livestock.subtitle')}</p>
                    </div>
                    <a href="/home/livestock">
                        <button className="skeuo-button-3d flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-primary hover:scale-105 transition-transform">
                            {t('livestock.viewAll')}
                            <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                        </button>
                    </a>
                </div>

                {/* Category Tabs - Premium Pill Style */}
                <div className="mb-8 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {categoryKeys.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeCategory === cat.value
                                ? 'category-pill-active'
                                : 'skeuo-card text-gray-600 dark:text-gray-200 hover:scale-105'
                                }`}
                        >
                            <span className="text-lg">{cat.icon}</span>
                            {t(cat.key)}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredLivestock.map((item, index) => (
                        <div key={item.id} className={`skeuo-card-hover group flex flex-col overflow-hidden rounded-3xl border border-white/10 opacity-0 animate-fade-in-up stagger-${index + 1}`}>
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                                {item.badge && (
                                    <div className="absolute left-3 top-3 z-10 rounded-lg bg-gradient-to-r from-accent to-yellow-500 px-3 py-1 text-xs font-black text-black shadow-lg">
                                        {item.badge}
                                    </div>
                                )}
                                {/* Favorite button */}
                                <button className="absolute right-3 top-3 z-10 size-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">favorite</span>
                                </button>
                                <div
                                    className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                                    style={{ backgroundImage: `url('${item.image}')` }}
                                ></div>
                                {/* Price overlay */}
                                <div className="absolute bottom-3 right-3 z-10">
                                    <span className="rounded-xl bg-primary/90 backdrop-blur-sm px-3 py-1.5 text-sm font-black text-white shadow-lg">
                                        {item.price}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col p-5">
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span>{t('livestock.breed')}: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.breed}</span></span>
                                        {item.milkYield && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-primary font-semibold">🥛 {item.milkYield}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Health & Distance */}
                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">{t('livestock.healthStatus')}</span>
                                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${item.health >= 95 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {item.health}% Healthy
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-green-400 transition-all duration-1000" style={{ width: `${item.health}%` }}></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                                        <span>{item.distance}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-sm">
                                        <span className="material-symbols-outlined text-sm">call</span>
                                        {t('livestock.call')}
                                    </button>
                                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-2.5 text-xs font-bold text-green-700 hover:bg-green-100 transition-all active:scale-95">
                                        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
