'use client';

import { useState } from 'react';
import Link from 'next/link';

type Category = 'weight' | 'volume' | 'land' | 'length' | 'temperature';

interface UnitDef {
    label: string;
    toBase: (v: number) => number;
    fromBase: (v: number) => number;
}

const categories: Record<Category, { name: string; icon: string; color: string; baseUnit: string; units: Record<string, UnitDef> }> = {
    weight: {
        name: 'Weight',
        icon: 'scale',
        color: 'text-green-600 bg-green-500/10',
        baseUnit: 'kg',
        units: {
            kg: { label: 'Kilogram (kg)', toBase: v => v, fromBase: v => v },
            g: { label: 'Gram (g)', toBase: v => v / 1000, fromBase: v => v * 1000 },
            quintal: { label: 'Quintal', toBase: v => v * 100, fromBase: v => v / 100 },
            tonne: { label: 'Metric Tonne', toBase: v => v * 1000, fromBase: v => v / 1000 },
            pound: { label: 'Pound (lb)', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
            maund: { label: 'Maund (মণ)', toBase: v => v * 37.3242, fromBase: v => v / 37.3242 },
            seer: { label: 'Seer', toBase: v => v * 0.933105, fromBase: v => v / 0.933105 },
        },
    },
    volume: {
        name: 'Volume',
        icon: 'water_drop',
        color: 'text-blue-600 bg-blue-500/10',
        baseUnit: 'liter',
        units: {
            liter: { label: 'Liter (L)', toBase: v => v, fromBase: v => v },
            ml: { label: 'Milliliter (mL)', toBase: v => v / 1000, fromBase: v => v * 1000 },
            gallon_us: { label: 'US Gallon', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
            gallon_imp: { label: 'Imperial Gallon', toBase: v => v * 4.54609, fromBase: v => v / 4.54609 },
            cubic_m: { label: 'Cubic Meter (m³)', toBase: v => v * 1000, fromBase: v => v / 1000 },
            cubic_ft: { label: 'Cubic Feet (ft³)', toBase: v => v * 28.3168, fromBase: v => v / 28.3168 },
        },
    },
    land: {
        name: 'Land Area',
        icon: 'map',
        color: 'text-amber-600 bg-amber-500/10',
        baseUnit: 'sqm',
        units: {
            sqm: { label: 'Sq. Meters (m²)', toBase: v => v, fromBase: v => v },
            sqft: { label: 'Sq. Feet (ft²)', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
            acre: { label: 'Acres', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
            hectare: { label: 'Hectares', toBase: v => v * 10000, fromBase: v => v / 10000 },
            bigha: { label: 'Bigha (Pucca)', toBase: v => v * 2529.28, fromBase: v => v / 2529.28 },
            guntha: { label: 'Guntha', toBase: v => v * 101.17, fromBase: v => v / 101.17 },
            cent: { label: 'Cent', toBase: v => v * 40.4686, fromBase: v => v / 40.4686 },
            kanal: { label: 'Kanal', toBase: v => v * 505.857, fromBase: v => v / 505.857 },
            marla: { label: 'Marla', toBase: v => v * 25.2929, fromBase: v => v / 25.2929 },
        },
    },
    length: {
        name: 'Length',
        icon: 'straighten',
        color: 'text-purple-600 bg-purple-500/10',
        baseUnit: 'meter',
        units: {
            meter: { label: 'Meter (m)', toBase: v => v, fromBase: v => v },
            cm: { label: 'Centimeter (cm)', toBase: v => v / 100, fromBase: v => v * 100 },
            km: { label: 'Kilometer (km)', toBase: v => v * 1000, fromBase: v => v / 1000 },
            feet: { label: 'Feet (ft)', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
            inch: { label: 'Inch (in)', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
            yard: { label: 'Yard (yd)', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
            mile: { label: 'Mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
        },
    },
    temperature: {
        name: 'Temperature',
        icon: 'thermostat',
        color: 'text-red-600 bg-red-500/10',
        baseUnit: 'celsius',
        units: {
            celsius: { label: 'Celsius (°C)', toBase: v => v, fromBase: v => v },
            fahrenheit: { label: 'Fahrenheit (°F)', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
            kelvin: { label: 'Kelvin (K)', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
        },
    },
};

export default function UnitConverterPage() {
    const [category, setCategory] = useState<Category>('weight');
    const [fromUnit, setFromUnit] = useState('kg');
    const [toUnit, setToUnit] = useState('quintal');
    const [inputValue, setInputValue] = useState('1');

    const cat = categories[category];
    const unitKeys = Object.keys(cat.units);
    const inputNum = parseFloat(inputValue) || 0;

    const baseValue = cat.units[fromUnit]?.toBase(inputNum) ?? 0;
    const result = cat.units[toUnit]?.fromBase(baseValue) ?? 0;

    const handleCategoryChange = (newCat: Category) => {
        setCategory(newCat);
        const keys = Object.keys(categories[newCat].units);
        setFromUnit(keys[0]);
        setToUnit(keys.length > 1 ? keys[1] : keys[0]);
        setInputValue('1');
    };

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    const fmt = (n: number) => {
        if (n === 0) return '0';
        if (Math.abs(n) < 0.0001) return n.toExponential(4);
        if (Math.abs(n) >= 1000000) return n.toLocaleString('en-IN', { maximumFractionDigits: 4 });
        return n.toLocaleString('en-IN', { maximumFractionDigits: 6 });
    };

    // All conversions from the input
    const allResults = unitKeys
        .filter(u => u !== fromUnit)
        .map(u => ({
            unit: u,
            label: cat.units[u].label,
            value: cat.units[u].fromBase(baseValue),
        }));

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">Agri Calculators</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Unit Converter</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Unit Converter</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Convert weight, volume, and local land units across different regions seamlessly.</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {(Object.entries(categories) as [Category, typeof cat][]).map(([key, c]) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key)}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${category === key
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{c.icon}</span>
                                {c.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Converter Card */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                            <h3 className="text-lg font-black mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                                <span className={`material-symbols-outlined p-2 rounded-xl ${cat.color}`}>{cat.icon}</span>
                                {cat.name} Converter
                            </h3>

                            <div className="space-y-4">
                                {/* From */}
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">From</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            className="flex-1 text-2xl md:text-3xl font-black bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white"
                                            placeholder="0"
                                        />
                                    </div>
                                    <select
                                        value={fromUnit}
                                        onChange={e => setFromUnit(e.target.value)}
                                        className="mt-2 w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 font-bold text-sm border-none focus:ring-0"
                                    >
                                        {unitKeys.map(u => (
                                            <option key={u} value={u}>{cat.units[u].label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Swap Button */}
                                <div className="flex justify-center -my-1">
                                    <button
                                        onClick={swapUnits}
                                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">swap_vert</span>
                                    </button>
                                </div>

                                {/* To */}
                                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border-2 border-primary/20">
                                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">To</label>
                                    <div className="flex gap-3">
                                        <p className="flex-1 text-2xl md:text-3xl font-black text-primary truncate">
                                            {fmt(result)}
                                        </p>
                                    </div>
                                    <select
                                        value={toUnit}
                                        onChange={e => setToUnit(e.target.value)}
                                        className="mt-2 w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 font-bold text-sm border-none focus:ring-0"
                                    >
                                        {unitKeys.map(u => (
                                            <option key={u} value={u}>{cat.units[u].label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Formula */}
                                <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                                    <p className="text-xs text-gray-500 font-bold">
                                        {fmt(inputNum)} {cat.units[fromUnit]?.label} = {fmt(result)} {cat.units[toUnit]?.label}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* All Conversions Grid */}
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                            <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">
                                All {cat.name} Conversions
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">{fmt(inputNum)} {cat.units[fromUnit]?.label} equals:</p>
                            <div className="space-y-2">
                                {allResults.map(r => (
                                    <div
                                        key={r.unit}
                                        onClick={() => setToUnit(r.unit)}
                                        className={`flex items-center justify-between p-3 md:p-4 rounded-xl cursor-pointer transition-all ${toUnit === r.unit
                                            ? 'bg-primary/10 ring-2 ring-primary/30'
                                            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{r.label}</span>
                                        <span className={`text-base md:text-lg font-black ${toUnit === r.unit ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                                            {fmt(r.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Reference Cards */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="skeuo-card rounded-2xl p-5">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600 text-lg">info</span>
                                Weight Quick Reference
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <p>1 Quintal = 100 kg</p>
                                <p>1 Maund = 37.32 kg</p>
                                <p>1 Tonne = 10 Quintals</p>
                                <p>1 Seer = 0.933 kg</p>
                            </div>
                        </div>
                        <div className="skeuo-card rounded-2xl p-5">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                                Land Quick Reference
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <p>1 Acre = 4,047 sq.m</p>
                                <p>1 Hectare = 2.47 Acres</p>
                                <p>1 Bigha = 0.625 Acres (varies)</p>
                                <p>1 Kanal = 0.125 Acres</p>
                            </div>
                        </div>
                        <div className="skeuo-card rounded-2xl p-5">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-lg">info</span>
                                Volume Quick Reference
                            </h4>
                            <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <p>1 US Gallon = 3.785 Liters</p>
                                <p>1 Cubic Meter = 1,000 L</p>
                                <p>1 Cubic Foot = 28.32 L</p>
                                <p>1 Imp. Gallon = 4.546 L</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
