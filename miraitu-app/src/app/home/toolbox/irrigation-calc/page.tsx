'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Method = 'flood' | 'drip' | 'sprinkler' | 'furrow';
type Soil = 'sandy' | 'loamy' | 'clay' | 'silty';
type Season = 'kharif' | 'rabi' | 'summer';

const cropWaterNeeds: Record<string, { daily: number; season: string; duration: number }> = {
    'Wheat': { daily: 4.5, season: 'rabi', duration: 120 },
    'Rice (Paddy)': { daily: 8, season: 'kharif', duration: 140 },
    'Maize': { daily: 5, season: 'kharif', duration: 100 },
    'Sugarcane': { daily: 6, season: 'kharif', duration: 365 },
    'Cotton': { daily: 5.5, season: 'kharif', duration: 180 },
    'Soybean': { daily: 4, season: 'kharif', duration: 100 },
    'Mustard': { daily: 3.5, season: 'rabi', duration: 110 },
    'Potato': { daily: 5, season: 'rabi', duration: 90 },
    'Onion': { daily: 4, season: 'rabi', duration: 120 },
    'Tomato': { daily: 5, season: 'rabi', duration: 100 },
};

const methodEfficiency: Record<Method, { efficiency: number; label: string; icon: string; savings: string }> = {
    flood: { efficiency: 0.45, label: 'Flood Irrigation', icon: 'waves', savings: 'Baseline (0% saving)' },
    furrow: { efficiency: 0.60, label: 'Furrow Irrigation', icon: 'water', savings: '~25% water saving vs flood' },
    sprinkler: { efficiency: 0.75, label: 'Sprinkler', icon: 'shower', savings: '~40% water saving vs flood' },
    drip: { efficiency: 0.90, label: 'Drip Irrigation', icon: 'opacity', savings: '~50-60% water saving vs flood' },
};

const soilFactor: Record<Soil, { factor: number; label: string; desc: string }> = {
    sandy: { factor: 1.3, label: 'Sandy Soil', desc: 'High drainage, needs more frequent watering' },
    loamy: { factor: 1.0, label: 'Loamy Soil', desc: 'Ideal water retention, balanced drainage' },
    silty: { factor: 0.9, label: 'Silty Soil', desc: 'Good water retention, moderate drainage' },
    clay: { factor: 0.8, label: 'Clay Soil', desc: 'High retention, risk of waterlogging' },
};

const seasonFactor: Record<Season, { factor: number; label: string }> = {
    kharif: { factor: 0.7, label: 'Kharif (Monsoon)' },
    rabi: { factor: 1.0, label: 'Rabi (Winter)' },
    summer: { factor: 1.4, label: 'Summer (Zaid)' },
};

export default function IrrigationCalcPage() {
    const [crop, setCrop] = useState('Wheat');
    const [method, setMethod] = useState<Method>('flood');
    const [soil, setSoil] = useState<Soil>('loamy');
    const [season, setSeason] = useState<Season>('rabi');
    const [area, setArea] = useState('1');
    const [pumpHP, setPumpHP] = useState('5');

    const areaNum = parseFloat(area) || 1;
    const hpNum = parseFloat(pumpHP) || 5;

    const results = useMemo(() => {
        const cropData = cropWaterNeeds[crop];
        if (!cropData) return null;

        const baseDaily = cropData.daily; // mm/day
        const sf = soilFactor[soil].factor;
        const snf = seasonFactor[season].factor;
        const eff = methodEfficiency[method].efficiency;

        // Adjusted water need (mm/day)
        const adjDaily = (baseDaily * sf * snf) / eff;

        // Liters per day per acre (1 mm over 1 acre = ~4047 liters)
        const litersPerDayPerAcre = adjDaily * 4047;
        const totalLitersPerDay = litersPerDayPerAcre * areaNum;

        // Total water for season
        const totalSeasonLiters = totalLitersPerDay * cropData.duration;

        // Pump runtime: 5 HP pump delivers ~180 liters/min (approx)
        const pumpLPM = hpNum * 36; // rough: 36 LPM per HP
        const dailyPumpHours = totalLitersPerDay / (pumpLPM * 60);

        // Number of irrigations (assuming each irrigation covers 50mm)
        const irrigationDepth = 50; // mm per irrigation
        const numIrrigations = Math.ceil((adjDaily * cropData.duration) / irrigationDepth);
        const intervalDays = Math.round(cropData.duration / numIrrigations);

        // Electricity cost (approx)
        const kwhPerHour = hpNum * 0.746; // 1 HP ≈ 0.746 kW
        const totalKwh = kwhPerHour * dailyPumpHours * cropData.duration;
        const electricityCost = totalKwh * 7; // ₹7 per kWh average

        // Water saved vs flood
        const floodDaily = (baseDaily * sf * snf) / methodEfficiency.flood.efficiency;
        const floodTotal = floodDaily * 4047 * areaNum * cropData.duration;
        const waterSaved = floodTotal - totalSeasonLiters;
        const savingPct = floodTotal > 0 ? (waterSaved / floodTotal) * 100 : 0;

        return {
            adjDaily,
            litersPerDayPerAcre,
            totalLitersPerDay,
            totalSeasonLiters,
            dailyPumpHours,
            numIrrigations,
            intervalDays,
            electricityCost,
            waterSaved,
            savingPct,
            duration: cropData.duration,
        };
    }, [crop, method, soil, season, area, pumpHP]);

    const fmtL = (n: number) => {
        if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr L`;
        if (n >= 100000) return `${(n / 100000).toFixed(1)} Lakh L`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K L`;
        return `${Math.round(n)} L`;
    };

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">Toolbox</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Irrigation Calculator</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                                <span className="material-symbols-outlined text-2xl">water_drop</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Irrigation Calculator</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Calculate water requirements, pump runtime, and irrigation schedule for your crops.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Input Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-cyan-600 p-2 rounded-xl bg-cyan-500/10">tune</span>
                                    Parameters
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Crop</label>
                                        <select value={crop} onChange={e => setCrop(e.target.value)} className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold text-sm">
                                            {Object.keys(cropWaterNeeds).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Irrigation Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(Object.entries(methodEfficiency) as [Method, typeof methodEfficiency.flood][]).map(([k, v]) => (
                                                <button
                                                    key={k}
                                                    onClick={() => setMethod(k)}
                                                    className={`p-3 rounded-xl text-center transition-all ${method === k
                                                        ? 'bg-cyan-500/10 ring-2 ring-cyan-500/30'
                                                        : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg ${method === k ? 'text-cyan-600' : 'text-gray-400'}`}>{v.icon}</span>
                                                    <p className={`text-xs font-bold mt-1 ${method === k ? 'text-cyan-600' : 'text-gray-500'}`}>{v.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Soil Type</label>
                                        <select value={soil} onChange={e => setSoil(e.target.value as Soil)} className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold text-sm">
                                            {(Object.entries(soilFactor) as [Soil, typeof soilFactor.loamy][]).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Season</label>
                                        <select value={season} onChange={e => setSeason(e.target.value as Season)} className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold text-sm">
                                            {(Object.entries(seasonFactor) as [Season, typeof seasonFactor.rabi][]).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area (Acres)</label>
                                            <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full skeuo-inset rounded-xl px-4 py-3 text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pump (HP)</label>
                                            <input type="number" value={pumpHP} onChange={e => setPumpHP(e.target.value)} className="w-full skeuo-inset rounded-xl px-4 py-3 text-sm font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {results && (
                                <>
                                    {/* Key Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="skeuo-card rounded-2xl p-4 text-center">
                                            <span className="material-symbols-outlined text-cyan-500 text-xl mb-1">water_drop</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Daily Need</p>
                                            <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{fmtL(results.totalLitersPerDay)}</p>
                                            <p className="text-[10px] text-gray-400">{results.adjDaily.toFixed(1)} mm/day</p>
                                        </div>
                                        <div className="skeuo-card rounded-2xl p-4 text-center">
                                            <span className="material-symbols-outlined text-blue-500 text-xl mb-1">waves</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Season Total</p>
                                            <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{fmtL(results.totalSeasonLiters)}</p>
                                            <p className="text-[10px] text-gray-400">{results.duration} days</p>
                                        </div>
                                        <div className="skeuo-card rounded-2xl p-4 text-center">
                                            <span className="material-symbols-outlined text-purple-500 text-xl mb-1">schedule</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Pump / Day</p>
                                            <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{results.dailyPumpHours.toFixed(1)}h</p>
                                            <p className="text-[10px] text-gray-400">{hpNum} HP pump</p>
                                        </div>
                                        <div className="skeuo-card rounded-2xl p-4 text-center">
                                            <span className="material-symbols-outlined text-green-500 text-xl mb-1">event_repeat</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Irrigations</p>
                                            <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{results.numIrrigations}</p>
                                            <p className="text-[10px] text-gray-400">Every {results.intervalDays} days</p>
                                        </div>
                                        <div className="skeuo-card rounded-2xl p-4 text-center">
                                            <span className="material-symbols-outlined text-amber-500 text-xl mb-1">bolt</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Electricity Cost</p>
                                            <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white">₹{Math.round(results.electricityCost).toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] text-gray-400">Full season (est.)</p>
                                        </div>
                                        <div className={`skeuo-card rounded-2xl p-4 text-center ${results.savingPct > 0 ? 'border-2 border-green-300/50' : ''}`}>
                                            <span className="material-symbols-outlined text-green-600 text-xl mb-1">eco</span>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Water Saved</p>
                                            <p className="text-lg md:text-xl font-black text-green-600">{results.savingPct.toFixed(0)}%</p>
                                            <p className="text-[10px] text-gray-400">vs Flood method</p>
                                        </div>
                                    </div>

                                    {/* Method Comparison */}
                                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                        <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Method Comparison</h3>
                                        <div className="space-y-3">
                                            {(Object.entries(methodEfficiency) as [Method, typeof methodEfficiency.flood][]).map(([k, v]) => {
                                                const cropData = cropWaterNeeds[crop];
                                                const adjD = (cropData.daily * soilFactor[soil].factor * seasonFactor[season].factor) / v.efficiency;
                                                const totalL = adjD * 4047 * areaNum * cropData.duration;
                                                const isActive = method === k;
                                                return (
                                                    <div
                                                        key={k}
                                                        onClick={() => setMethod(k)}
                                                        className={`p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between ${isActive
                                                            ? 'bg-cyan-500/10 ring-2 ring-cyan-500/30'
                                                            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`material-symbols-outlined text-lg ${isActive ? 'text-cyan-600' : 'text-gray-400'}`}>{v.icon}</span>
                                                            <div>
                                                                <p className={`text-sm font-bold ${isActive ? 'text-cyan-600' : 'text-gray-700 dark:text-gray-300'}`}>{v.label}</p>
                                                                <p className="text-[10px] text-gray-400">{v.savings}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-sm font-black ${isActive ? 'text-cyan-600' : 'text-gray-900 dark:text-white'}`}>{fmtL(totalL)}</p>
                                                            <p className="text-[10px] text-gray-400">Eff: {(v.efficiency * 100).toFixed(0)}%</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Soil Info */}
                                    <div className="skeuo-card rounded-2xl p-5 border-l-4 border-cyan-400">
                                        <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-cyan-600 text-lg">info</span>
                                            {soilFactor[soil].label}
                                        </h4>
                                        <p className="text-xs text-gray-500">{soilFactor[soil].desc}. Soil adjustment factor: {soilFactor[soil].factor}x. Season factor ({seasonFactor[season].label}): {seasonFactor[season].factor}x.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
