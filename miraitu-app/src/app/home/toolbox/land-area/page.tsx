'use client';

import { useState } from 'react';
import Link from 'next/link';

type UnitSystem = 'acre' | 'hectare' | 'bigha' | 'guntha' | 'cent' | 'sqft' | 'sqm' | 'kanal' | 'marla';

const unitLabels: Record<UnitSystem, string> = {
    acre: 'Acres',
    hectare: 'Hectares',
    bigha: 'Bigha (Pucca)',
    guntha: 'Gunthas',
    cent: 'Cents',
    sqft: 'Square Feet',
    sqm: 'Square Meters',
    kanal: 'Kanals',
    marla: 'Marlas',
};

// All conversion factors relative to 1 square meter
const toSqM: Record<UnitSystem, number> = {
    sqm: 1,
    sqft: 0.092903,
    acre: 4046.86,
    hectare: 10000,
    bigha: 2529.28,
    guntha: 101.17,
    cent: 40.4686,
    kanal: 505.857,
    marla: 25.2929,
};

interface FieldPoint {
    id: number;
    x: number;
    y: number;
    label: string;
}

export default function LandAreaPage() {
    const [mode, setMode] = useState<'converter' | 'manual'>('converter');

    // Converter state
    const [inputValue, setInputValue] = useState('1');
    const [fromUnit, setFromUnit] = useState<UnitSystem>('acre');

    // Manual measurement state
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [measureUnit, setMeasureUnit] = useState<'feet' | 'meters'>('feet');
    const [displayUnit, setDisplayUnit] = useState<UnitSystem>('acre');

    // Polygon state
    const [points, setPoints] = useState<FieldPoint[]>([]);
    const [nextId, setNextId] = useState(1);

    // Converter logic
    const inputNum = parseFloat(inputValue) || 0;
    const sqMeters = inputNum * toSqM[fromUnit];
    const conversions = Object.entries(toSqM).map(([unit, factor]) => ({
        unit: unit as UnitSystem,
        label: unitLabels[unit as UnitSystem],
        value: sqMeters / factor,
    })).filter(c => c.unit !== fromUnit);

    // Manual calculation
    const L = parseFloat(length) || 0;
    const W = parseFloat(width) || 0;
    const areaSqM = measureUnit === 'feet' ? L * W * 0.092903 : L * W;
    const manualResult = areaSqM / toSqM[displayUnit];

    // Polygon area (shoelace formula using pixel coordinates scaled to meters, mock scale)
    const SCALE = 0.5; // 1 pixel = 0.5 meters (mock scale for demonstration)
    const polygonAreaSqM = (() => {
        if (points.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        return Math.abs(area / 2) * SCALE * SCALE;
    })();

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newPoint: FieldPoint = { id: nextId, x, y, label: `P${nextId}` };
        setPoints(prev => [...prev, newPoint]);
        setNextId(prev => prev + 1);
    };

    const fmt = (n: number) => {
        if (n === 0) return '0';
        if (n < 0.01) return n.toExponential(2);
        if (n >= 1000) return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return n.toFixed(4).replace(/\.?0+$/, '');
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
                        <span className="text-primary font-bold">Land Area Tool</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined text-2xl">map</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Land Area Tool</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Map-based perimeter and area measurement. Supports Acres, Bigha, and Hectares.</p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                        {(['converter', 'manual'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {m === 'converter' ? 'Unit Converter' : 'Measure Area'}
                            </button>
                        ))}
                    </div>

                    {mode === 'converter' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Convert Area</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value</label>
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 text-2xl font-black text-primary focus:ring-0 border-none"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.keys(unitLabels) as UnitSystem[]).map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => setFromUnit(u)}
                                                    className={`py-2 md:py-2.5 px-2 rounded-lg text-xs md:text-sm font-bold transition-all ${fromUnit === u ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    {unitLabels[u]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Results</h3>
                                <div className="space-y-3">
                                    {conversions.map(c => (
                                        <div key={c.unit} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{c.label}</span>
                                            <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">{fmt(c.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Manual Measurement */}
                            <div className="space-y-6">
                                <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                    <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Rectangular Plot</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-2 mb-4">
                                            {(['feet', 'meters'] as const).map(u => (
                                                <button
                                                    key={u}
                                                    onClick={() => setMeasureUnit(u)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${measureUnit === u ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                                                >
                                                    {u === 'feet' ? 'Feet' : 'Meters'}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Length ({measureUnit})</label>
                                                <input
                                                    type="number"
                                                    value={length}
                                                    onChange={e => setLength(e.target.value)}
                                                    className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Width ({measureUnit})</label>
                                                <input
                                                    type="number"
                                                    value={width}
                                                    onChange={e => setWidth(e.target.value)}
                                                    className="w-full skeuo-inset rounded-xl px-4 py-3 text-lg font-bold focus:ring-0 border-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Result In</label>
                                            <select
                                                value={displayUnit}
                                                onChange={e => setDisplayUnit(e.target.value as UnitSystem)}
                                                className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none"
                                            >
                                                {(Object.keys(unitLabels) as UnitSystem[]).map(u => (
                                                    <option key={u} value={u}>{unitLabels[u]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {L > 0 && W > 0 && (
                                        <div className="mt-6 p-4 md:p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs font-bold text-blue-500 uppercase mb-1">Calculated Area</p>
                                            <p className="text-3xl md:text-4xl font-black text-blue-600">{fmt(manualResult)} <span className="text-lg">{unitLabels[displayUnit]}</span></p>
                                            <p className="text-xs text-gray-500 mt-2">{fmt(areaSqM)} sq. meters | {fmt(areaSqM * 10.7639)} sq. feet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interactive Plot Canvas */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Draw Field Shape</h3>
                                    <button onClick={() => { setPoints([]); setNextId(1); }} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">delete</span> Clear
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">Click on the canvas to place corner points of your field. Minimum 3 points needed.</p>
                                <div
                                    className="relative w-full aspect-square bg-green-50 dark:bg-green-900/10 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-800 cursor-crosshair overflow-hidden"
                                    onClick={handleCanvasClick}
                                >
                                    {/* Grid lines */}
                                    <svg className="absolute inset-0 w-full h-full opacity-20">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <g key={i}>
                                                <line x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#4caf50" strokeWidth="0.5" />
                                                <line x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="#4caf50" strokeWidth="0.5" />
                                            </g>
                                        ))}
                                    </svg>

                                    {/* Polygon fill */}
                                    {points.length >= 3 && (
                                        <svg className="absolute inset-0 w-full h-full">
                                            <polygon
                                                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                                                fill="rgba(76,175,80,0.2)" stroke="#4caf50" strokeWidth="2"
                                            />
                                        </svg>
                                    )}

                                    {/* Lines */}
                                    {points.length >= 2 && (
                                        <svg className="absolute inset-0 w-full h-full">
                                            {points.map((p, i) => {
                                                const next = points[(i + 1) % points.length];
                                                if (i === points.length - 1 && points.length < 3) return null;
                                                return <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="#4caf50" strokeWidth="2" />;
                                            })}
                                        </svg>
                                    )}

                                    {/* Points */}
                                    {points.map(p => (
                                        <div
                                            key={p.id}
                                            className="absolute w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                            style={{ left: p.x, top: p.y }}
                                        >
                                            <span className="text-[7px] font-bold text-white">{p.id}</span>
                                        </div>
                                    ))}

                                    {points.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center text-green-500/50">
                                            <div className="text-center">
                                                <span className="material-symbols-outlined text-5xl">touch_app</span>
                                                <p className="text-sm font-bold mt-2">Tap to place points</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {points.length >= 3 && (
                                    <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs font-bold text-blue-500 uppercase mb-1">Estimated Area ({points.length} points)</p>
                                        <p className="text-2xl font-black text-blue-600">
                                            {fmt(polygonAreaSqM / toSqM.acre)} Acres
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {fmt(polygonAreaSqM)} sq.m | {fmt(polygonAreaSqM / toSqM.hectare)} ha | {fmt(polygonAreaSqM / toSqM.bigha)} bigha
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
