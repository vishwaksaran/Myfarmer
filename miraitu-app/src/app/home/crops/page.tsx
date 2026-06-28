'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice, getCropIcon, spreadPercent } from '@/lib/mandi-api';
import { useAuth } from '@/context/AuthContext';
import { useLoginPrompt } from '@/context/LoginPromptContext';
import { useLanguage } from '@/i18n/LanguageContext';

/* ── Fallback data (shown when API key is missing or API fails) ─── */
const fallbackHighlights = [
    { crop: 'Wheat', price: '₹2,450/qtl', change: '+2.3%', trend: 'up' },
    { crop: 'Rice (Basmati)', price: '₹3,850/qtl', change: '+1.8%', trend: 'up' },
    { crop: 'Soybean', price: '₹4,200/qtl', change: '-0.5%', trend: 'down' },
    { crop: 'Cotton', price: '₹6,100/qtl', change: '+3.1%', trend: 'up' },
    { crop: 'Maize', price: '₹2,150/qtl', change: '+0.8%', trend: 'up' },
    { crop: 'Groundnut', price: '₹5,800/qtl', change: '-1.2%', trend: 'down' },
];

const fallbackPopular = [
    { name: 'Wheat', icon: 'grain', listings: 245, avgPrice: '₹2,450/qtl' },
    { name: 'Rice', icon: 'rice_bowl', listings: 312, avgPrice: '₹3,200/qtl' },
    { name: 'Tomato', icon: 'eco', listings: 189, avgPrice: '₹45/kg' },
    { name: 'Onion', icon: 'eco', listings: 156, avgPrice: '₹32/kg' },
    { name: 'Potato', icon: 'eco', listings: 203, avgPrice: '₹28/kg' },
    { name: 'Soybean', icon: 'spa', listings: 98, avgPrice: '₹4,200/qtl' },
];


function openCropAssistant() {
    window.dispatchEvent(new Event('open-crop-assistant'));
}

export default function CropsPage() {
    const { t } = useLanguage();
    const [selectedRegion, setSelectedRegion] = useState('Maharashtra');
    const { user } = useAuth();
    const { requireLogin } = useLoginPrompt();

    const quickActions = [
        { key: 'priceTrends', icon: 'show_chart', href: '/home/crops/mandi/trends' },
        { key: 'mandiPrices', icon: 'trending_up', href: '/home/crops/mandi/prices' },
        { key: 'buyCrops', icon: 'shopping_cart', href: '/home/crops/buy' },
        { key: 'buyGrains', icon: 'grain', href: '/home/crops/buy/grains' },
        { key: 'sellCrops', icon: 'sell', href: '/home/crops/sell' },
        { key: 'nearbyMandis', icon: 'location_on', href: '/home/crops/mandi/nearby' },
    ];

    // Fetch market highlights — top 50 records for selected state, grouped by commodity
    const { data: rawData, loading, error } = useMandiPrices({ state: selectedRegion, limit: 50 });

    // Group by commodity → pick latest / most-reported for each
    const grouped = rawData.reduce((acc, r) => {
        if (!acc[r.commodity]) acc[r.commodity] = [];
        acc[r.commodity].push(r);
        return acc;
    }, {} as Record<string, typeof rawData>);

    const liveHighlights = Object.entries(grouped).slice(0, 6).map(([commodity, records]) => {
        const latest = records[0];
        const pct = spreadPercent(latest.minPrice, latest.maxPrice);
        const trend = pct >= 0 ? 'up' : 'down';
        return {
            crop: commodity,
            price: formatPrice(latest.modalPrice),
            change: `${pct >= 0 ? '+' : ''}${pct}%`,
            trend,
        };
    });

    const livePopular = Object.entries(grouped).slice(0, 6).map(([commodity, records]) => ({
        name: commodity,
        icon: getCropIcon(commodity),
        listings: records.length,
        avgPrice: formatPrice(Math.round(records.reduce((s, r) => s + r.modalPrice, 0) / records.length)),
    }));

    const useFallback = error || liveHighlights.length === 0;
    const highlights = useFallback && !loading ? fallbackHighlights : liveHighlights;
    const popular = useFallback && !loading ? fallbackPopular : livePopular;

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <div className="px-6 py-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Hero Section */}
                    <div className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                                    {t('cropsPage.title')} <span className="text-primary">{t('cropsPage.titleHighlight')}</span>
                                </h1>
                                <p className="text-lg text-gray-500 max-w-2xl">
                                    {t('cropsPage.subtitle')}
                                </p>
                            </div>
                            <NearbyLocation />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {quickActions.map((action) => (
                            <Link
                                key={action.key}
                                href={action.href}
                                className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-2xl">{action.icon}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t(`cropsPage.${action.key}`)}</h3>
                                <p className="text-sm text-gray-500">{t(`cropsPage.${action.key}Desc`)}</p>
                            </Link>
                        ))}
                    </div>

                    {/* Crop Assistant Banner */}
                    <button
                        onClick={() => {
                            if (!user) {
                                requireLogin();
                                return;
                            }
                            openCropAssistant();
                        }}
                        className="w-full mb-10 group cursor-pointer"
                    >
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 p-5 sm:p-6 text-white hover:shadow-xl transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                            <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-12" />
                            <div className="relative flex items-center gap-4 sm:gap-6">
                                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl sm:text-4xl">psychiatry</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-lg sm:text-xl font-bold mb-1">{t('cropsPage.assistant')}</h3>
                                    <p className="text-sm sm:text-base text-white/80">{t('cropsPage.assistantDesc')}</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0 bg-white/20 px-4 py-2 rounded-xl group-hover:bg-white/30 transition-colors">
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                    <span className="font-semibold text-sm">{t('cropsPage.askNow')}</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Market Highlights */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cropsPage.marketHighlights')}</h2>
                                {!useFallback && !loading && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {t('cropsPage.live')}
                                    </span>
                                )}
                                {useFallback && !loading && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('cropsPage.sampleData')}</span>
                                )}
                            </div>
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                            >
                                <option>Maharashtra</option>
                                <option>Punjab</option>
                                <option>Madhya Pradesh</option>
                                <option>Uttar Pradesh</option>
                                <option>Karnataka</option>
                                <option>Rajasthan</option>
                                <option>Gujarat</option>
                                <option>Haryana</option>
                                <option>Tamil Nadu</option>
                                <option>Andhra Pradesh</option>
                                <option>Telangana</option>
                                <option>West Bengal</option>
                                <option>Bihar</option>
                                <option>Kerala</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {highlights.map((item) => (
                                    <div
                                        key={item.crop}
                                        className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                    >
                                        <p className="text-sm text-gray-500 mb-1">{item.crop}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{item.price}</p>
                                        <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                                            </span>
                                            {item.change}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Popular Crops */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cropsPage.popularCrops')}</h2>
                            <Link href="/home/crops/buy" className="text-primary font-semibold hover:underline">
                                {t('cropsPage.viewAll')} →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {popular.map((crop) => (
                                    <Link
                                        key={crop.name}
                                        href={`/home/crops/buy?crop=${crop.name.toLowerCase()}`}
                                        className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-2xl">{crop.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{crop.name}</h3>
                                        <p className="text-sm text-gray-500">{crop.listings} {!useFallback ? t('cropsPage.markets') : t('cropsPage.listings')}</p>
                                        <p className="text-sm font-semibold text-primary mt-1">{crop.avgPrice}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Call to Action - Green theme */}
                    <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-8 text-white mb-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t('cropsPage.sellTitle')}</h2>
                                <p className="text-white/90">{t('cropsPage.sellDesc')}</p>
                            </div>
                            <Link
                                href="/home/crops/sell"
                                className="shrink-0 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
                            >
                                {t('cropsPage.startSelling')} →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

