'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { WeatherPayload } from '@/lib/weather-types';
import {
    buildWeatherApiQuery,
    clearSavedWeatherCoords,
    clearSavedWeatherLocation,
    getSavedWeatherLocation,
    getWeatherLocationConsent,
    isGeoPermissionDenied,
    isLikelyWaterLocation,
    markGeoPermissionDenied,
    parseDistrictStateInput,
    requestBrowserCoords,
    saveWeatherCoords,
    saveWeatherLocation,
    type WeatherLocationConsent,
} from '@/lib/weather-location';

export default function ToolboxPage() {
    const { t } = useLanguage();
    const [locationConsent, setLocationConsent] = useState<WeatherLocationConsent | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);

    const tools = [
        {
            id: 'interest-calculator',
            tName: 'toolboxPage.interestCalc',
            tDesc: 'toolboxPage.interestCalcDesc',
            icon: 'calculate',
            color: 'primary',
            bgColor: 'bg-primary/10',
            textColor: 'text-primary',
            hoverBg: 'group-hover:bg-primary',
            buttonBg: 'bg-primary/5',
            tButton: 'toolboxPage.openTool',
            path: '/home/toolbox/interest-calculator',
        },
        {
            id: 'land-area',
            tName: 'toolboxPage.landAreaTool',
            tDesc: 'toolboxPage.landAreaToolDesc',
            icon: 'map',
            color: 'blue',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
            hoverBg: 'group-hover:bg-blue-600',
            buttonBg: 'bg-blue-500/5',
            tButton: 'toolboxPage.startMapping',
            path: '/home/toolbox/land-area',
        },
        {
            id: 'crop-costing',
            tName: 'toolboxPage.cropCosting',
            tDesc: 'toolboxPage.cropCostingDesc',
            icon: 'inventory_2',
            color: 'amber',
            bgColor: 'bg-amber-500/10',
            textColor: 'text-amber-600',
            hoverBg: 'group-hover:bg-amber-600',
            buttonBg: 'bg-amber-500/5',
            tButton: 'toolboxPage.calculateROI',
            path: '/home/toolbox/crop-costing',
        },
        {
            id: 'unit-converter',
            tName: 'toolboxPage.unitConverter',
            tDesc: 'toolboxPage.unitConverterDesc',
            icon: 'swap_horiz',
            color: 'orange',
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-600',
            hoverBg: 'group-hover:bg-orange-600',
            buttonBg: 'bg-orange-500/5',
            tButton: 'toolboxPage.convertUnits',
            path: '/home/toolbox/unit-converter',
        },
    ];

    const moreTools = [
        { tName: 'toolboxPage.weatherAlerts', icon: 'thunderstorm', color: 'text-blue-500', path: '/home/toolbox/weather-alerts' },
        { tName: 'toolboxPage.soilTesting', icon: 'science', color: 'text-amber-600', path: '/home/toolbox/soil-testing' },
        { tName: 'toolboxPage.marketRates', icon: 'trending_up', color: 'text-green-600', path: '/home/toolbox/market-rates' },
        { tName: 'toolboxPage.profitEstimator', icon: 'payments', color: 'text-purple-600', path: '/home/toolbox/profit-estimator' },
        { tName: 'toolboxPage.irrigationCalc', icon: 'water_drop', color: 'text-cyan-600', path: '/home/toolbox/irrigation-calc' },
        { tName: 'toolboxPage.fertilizerGuide', icon: 'compost', color: 'text-orange-600', path: '/home/toolbox/fertilizer-guide' },
    ];

    useEffect(() => {
        const loadWeather = async () => {
            try {
                const consent = getWeatherLocationConsent();
                setLocationConsent(consent);
                if (!consent) {
                    setWeatherData(null);
                    return;
                }

                let queryString = '';

                if (consent === 'granted') {
                    if (!isGeoPermissionDenied()) {
                        try {
                            const coords = await requestBrowserCoords();
                            markGeoPermissionDenied(false);
                            saveWeatherCoords(coords);
                            queryString = buildWeatherApiQuery({ coords });
                        } catch (err) {
                            if (err instanceof Error && err.message === 'PERMISSION_DENIED') {
                                markGeoPermissionDenied(true);
                            }
                        }
                    }

                    if (!queryString) {
                        setWeatherData(null);
                        return;
                    }
                } else {
                    clearSavedWeatherCoords();
                }

                if (!queryString) {
                    const savedLocation = getSavedWeatherLocation() || 'Hyderabad';
                    const parsed = parseDistrictStateInput(savedLocation);
                    queryString = parsed
                        ? buildWeatherApiQuery({ district: parsed.district, state: parsed.state })
                        : buildWeatherApiQuery({ location: savedLocation });
                }

                const response = await fetch(`/api/weather/forecast?${queryString}`, {
                    cache: 'no-store',
                });

                if (!response.ok) return;
                const payload = (await response.json()) as WeatherPayload;
                if (consent === 'granted' && isLikelyWaterLocation(payload.location.name)) {
                    clearSavedWeatherCoords();
                    clearSavedWeatherLocation();
                    setWeatherData(null);
                    return;
                }

                setWeatherData(payload);
                saveWeatherLocation(payload.location.name || 'Hyderabad');
            } catch (error) {
                console.error('[toolbox] weather load failed:', error);
            }
        };

        void loadWeather();
    }, []);

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-6 pt-12 pb-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary dark:text-[#f9fbf9] mb-4">
                                {t('toolboxPage.title')}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium max-w-2xl">
                                {t('toolboxPage.subtitle')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {!locationConsent ? (
                                <Link href="/home/toolbox/weather-alerts" className="skeuo-card rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined font-bold">location_searching</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('toolboxPage.localWeather')}</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">Choose weather location mode</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Tap to enable current or manual location</p>
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/home/toolbox/weather-alerts" className="skeuo-card rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform">
                                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined font-bold">{weatherData?.current.icon || 'partly_cloudy_day'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('toolboxPage.localWeather')}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {weatherData ? `${weatherData.current.temperature}°C • ${weatherData.current.condition}` : 'Set location in Weather Alerts'}
                                        </p>
                                        {weatherData && (
                                            <p className="text-xs text-gray-500 mt-0.5">{weatherData.location.name}</p>
                                        )}
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {tools.map((tool) => (
                            <Link
                                key={tool.id}
                                href={tool.path}
                                className="skeuo-card group rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 border border-white/40 dark:border-gray-700/40"
                            >
                                <div className={`mb-6 h-24 w-24 rounded-full ${tool.bgColor} flex items-center justify-center ${tool.textColor} group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-5xl">{tool.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t(tool.tName)}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t(tool.tDesc)}</p>
                                <div className={`mt-auto w-full py-3 ${tool.buttonBg} rounded-xl font-bold ${tool.textColor} ${tool.hoverBg} group-hover:text-white transition-colors`}>
                                    {t(tool.tButton)}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Yield Prediction Pro Section */}
                    <section className="mb-20">
                        <div className="skeuo-card rounded-[3rem] overflow-hidden border-4 border-white/50 dark:border-gray-700/50">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 w-fit">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        {t('toolboxPage.proAvailable')}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
                                        {t('toolboxPage.advancedYield')} <span className="text-primary">{t('toolboxPage.yieldPredAI')}</span> <br />{t('toolboxPage.aiForFields')}
                                    </h2>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                        {t('toolboxPage.proDesc')}
                                    </p>
                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">satellite_alt</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{t('toolboxPage.satellite')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">query_stats</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{t('toolboxPage.climate')}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl skeuo-inset flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">eco</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{t('toolboxPage.soilHealth')}</span>
                                        </div>
                                    </div>
                                    <button className="vibrant-gradient px-10 py-5 rounded-2xl text-white font-black text-xl shadow-2xl shadow-primary/40 hover:brightness-110 active:scale-95 transition-all w-fit">
                                        {t('toolboxPage.upgradePro')}
                                    </button>
                                </div>
                                <div className="lg:w-1/2 relative min-h-[400px]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop')" }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#161d15] lg:from-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 right-8 skeuo-card p-6 rounded-2xl border border-white/20 backdrop-blur-md bg-white/60 dark:bg-black/60">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">{t('toolboxPage.confidence')}</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-primary">94.2%</span>
                                            <span className="text-sm font-bold text-green-600 mb-1">+2.4% vs last season</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Quick Access Tools */}
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-primary text-2xl">apps</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('toolboxPage.moreTools')}</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {moreTools.map((item) => (
                                <Link
                                    key={item.tName}
                                    href={item.path}
                                    className="skeuo-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all group"
                                >
                                    <div className={`h-14 w-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{t(item.tName)}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}
