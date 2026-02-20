'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SoilParam {
    name: string;
    unit: string;
    value: string;
    ideal: string;
    status: 'low' | 'normal' | 'high';
    icon: string;
    tip: string;
}

const statusColors = {
    low: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', bar: 'bg-red-500' },
    normal: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', bar: 'bg-green-500' },
    high: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' },
};

const soilTypes = ['Black Soil (Regur)', 'Red Soil', 'Alluvial Soil', 'Laterite Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil'];

const cropRecommendations: Record<string, string[]> = {
    acidic: ['Rice', 'Tea', 'Potato', 'Blueberry', 'Sweet Potato'],
    neutral: ['Wheat', 'Maize', 'Soybean', 'Tomato', 'Onion', 'Cotton'],
    alkaline: ['Barley', 'Sugar Beet', 'Cabbage', 'Spinach'],
};

export default function SoilTestingPage() {
    const [soilType, setSoilType] = useState('Alluvial Soil');
    const [ph, setPh] = useState('6.5');
    const [showResults, setShowResults] = useState(false);

    const phNum = parseFloat(ph) || 7;
    const phCategory = phNum < 6.0 ? 'acidic' : phNum > 7.5 ? 'alkaline' : 'neutral';

    const [params, setParams] = useState<SoilParam[]>([
        { name: 'Nitrogen (N)', unit: 'kg/ha', value: '240', ideal: '250-350', status: 'low', icon: 'grass', tip: 'Apply urea or ammonium sulphate. Green manuring helps improve nitrogen.' },
        { name: 'Phosphorus (P)', unit: 'kg/ha', value: '28', ideal: '25-50', status: 'normal', icon: 'eco', tip: 'Adequate level. Maintain with DAP or single super phosphate during sowing.' },
        { name: 'Potassium (K)', unit: 'kg/ha', value: '180', ideal: '150-250', status: 'normal', icon: 'psychiatry', tip: 'Good level. Continue with MOP application as needed.' },
        { name: 'Organic Carbon', unit: '%', value: '0.4', ideal: '0.5-0.75', status: 'low', icon: 'compost', tip: 'Add FYM (Farm Yard Manure) or vermicompost at 5-10 tonnes per hectare.' },
        { name: 'Zinc (Zn)', unit: 'ppm', value: '0.8', ideal: '0.6-1.2', status: 'normal', icon: 'science', tip: 'Within optimal range. Monitor annually.' },
        { name: 'Iron (Fe)', unit: 'ppm', value: '5.2', ideal: '4.5-9.0', status: 'normal', icon: 'iron', tip: 'Adequate. Iron deficiency causes yellowing in crops like rice and sorghum.' },
    ]);

    const updateParamValue = (idx: number, val: string) => {
        const updated = [...params];
        updated[idx].value = val;
        setParams(updated);
    };

    const handleAnalyze = () => {
        setShowResults(true);
    };

    const getPhLabel = () => {
        if (phNum < 5.5) return { label: 'Strongly Acidic', color: 'text-red-600' };
        if (phNum < 6.0) return { label: 'Moderately Acidic', color: 'text-orange-600' };
        if (phNum < 6.5) return { label: 'Slightly Acidic', color: 'text-yellow-600' };
        if (phNum <= 7.0) return { label: 'Neutral', color: 'text-green-600' };
        if (phNum <= 7.5) return { label: 'Slightly Alkaline', color: 'text-cyan-600' };
        if (phNum <= 8.0) return { label: 'Moderately Alkaline', color: 'text-blue-600' };
        return { label: 'Strongly Alkaline', color: 'text-purple-600' };
    };

    const phInfo = getPhLabel();

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
                        <span className="text-primary font-bold">Soil Testing</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <span className="material-symbols-outlined text-2xl">science</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Soil Testing Guide</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Enter your soil test report values to get personalized recommendations for your farm.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Input Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-600 p-2 rounded-xl bg-amber-500/10">edit_note</span>
                                    Soil Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Soil Type</label>
                                        <select
                                            value={soilType}
                                            onChange={e => setSoilType(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold text-sm"
                                        >
                                            {soilTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">pH Level</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="3"
                                                max="11"
                                                step="0.1"
                                                value={ph}
                                                onChange={e => setPh(e.target.value)}
                                                className="flex-1 accent-primary"
                                            />
                                            <div className="skeuo-inset rounded-xl px-4 py-2 text-center min-w-[70px]">
                                                <span className="text-xl font-black text-gray-900 dark:text-white">{phNum.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-red-500 font-bold">Acidic (3)</span>
                                            <span className="text-[10px] text-green-500 font-bold">Neutral (7)</span>
                                            <span className="text-[10px] text-purple-500 font-bold">Alkaline (11)</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Nutrient Values (from soil report)</label>
                                        <div className="space-y-3">
                                            {params.map((p, i) => (
                                                <div key={p.name} className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-28 truncate">{p.name}</span>
                                                    <input
                                                        type="number"
                                                        value={p.value}
                                                        onChange={e => updateParamValue(i, e.target.value)}
                                                        className="skeuo-inset rounded-lg px-3 py-2 text-sm font-bold flex-1 min-w-0"
                                                    />
                                                    <span className="text-xs text-gray-400 w-10">{p.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    className="mt-6 w-full vibrant-gradient py-3.5 rounded-xl text-white font-bold text-base shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-lg">biotech</span>
                                        Analyze Soil
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {!showResults ? (
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-10 md:p-16 text-center">
                                    <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4">science</span>
                                    <h3 className="text-xl font-bold text-gray-400 mb-2">Enter Your Soil Test Values</h3>
                                    <p className="text-sm text-gray-400">Fill in the details on the left and click &quot;Analyze Soil&quot; to see recommendations.</p>
                                </div>
                            ) : (
                                <>
                                    {/* pH Analysis Card */}
                                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                        <h3 className="text-lg font-black mb-4 text-gray-900 dark:text-white">pH Analysis</h3>
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="skeuo-inset rounded-2xl p-5 text-center">
                                                <p className="text-4xl font-black text-gray-900 dark:text-white">{phNum.toFixed(1)}</p>
                                                <p className={`text-sm font-bold ${phInfo.color}`}>{phInfo.label}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    <strong>Soil Type:</strong> {soilType}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {phNum < 6.0 && 'Consider applying lime (calcium carbonate) at 2-4 quintals/acre to raise pH. Acidic soils can cause aluminum/manganese toxicity.'}
                                                    {phNum >= 6.0 && phNum <= 7.5 && 'Your soil pH is in the optimal range for most crops. Maintain by adding organic matter regularly.'}
                                                    {phNum > 7.5 && 'Consider applying gypsum (calcium sulphate) at 2-5 quintals/acre. Alkaline soils can cause iron and zinc deficiency.'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* pH scale bar */}
                                        <div className="relative h-4 rounded-full overflow-hidden mb-1" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6)' }}>
                                            <div
                                                className="absolute top-0 h-full w-1 bg-white border-2 border-gray-900 rounded-full"
                                                style={{ left: `${((phNum - 3) / 8) * 100}%`, transform: 'translateX(-50%)' }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                            <span>3</span><span>5</span><span>7</span><span>9</span><span>11</span>
                                        </div>
                                    </div>

                                    {/* Nutrient Analysis */}
                                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                        <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Nutrient Analysis</h3>
                                        <div className="space-y-3">
                                            {params.map(p => {
                                                const sc = statusColors[p.status];
                                                return (
                                                    <div key={p.name} className={`p-4 rounded-xl ${sc.bg}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-lg">{p.icon}</span>
                                                                <span className="font-bold text-sm text-gray-900 dark:text-white">{p.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{p.value} {p.unit}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${sc.text} ${sc.bg}`}>{p.status}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            <span className="font-bold">Ideal: {p.ideal} {p.unit}</span> — {p.tip}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Crop Recommendations */}
                                    <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                        <h3 className="text-lg font-black mb-4 text-gray-900 dark:text-white">
                                            Recommended Crops for {phInfo.label} Soil
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(cropRecommendations[phCategory] || cropRecommendations.neutral).map(c => (
                                                <span key={c} className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Collection Guide */}
                    <div className="mt-8 skeuo-card rounded-2xl p-5 md:p-6">
                        <h4 className="font-bold text-sm mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">help</span>
                            How to Collect a Soil Sample
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { step: '1', title: 'Select Spots', desc: 'Choose 8-10 random spots across the field in a zigzag pattern.' },
                                { step: '2', title: 'Dig Properly', desc: 'Use a khurpi to dig 6-9 inches deep. Remove top debris first.' },
                                { step: '3', title: 'Mix Well', desc: 'Combine samples from all spots, mix thoroughly, and take ~500g.' },
                                { step: '4', title: 'Send to Lab', desc: 'Pack in a clean cloth bag, label with your details, send to nearest KVK or soil testing lab.' },
                            ].map(s => (
                                <div key={s.step} className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full vibrant-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {s.step}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{s.title}</p>
                                        <p className="text-xs text-gray-500">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
