'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { MachineryModel, TractorBrand, TractorComparison } from '@/lib/machinery-db';
import { fetchAllTractors, fetchBrands, fetchPopularComparisons } from '@/app/actions/tractors';
import ComparisonCards from '@/components/v2/machinery/ComparisonCards';
import { getTractorImageUrl } from '@/lib/tractor-images';

function formatPrice(price: number): string {
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
}

export default function CompareTractorsPage() {
    return (
        <Suspense fallback={
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-6" />
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
            </div>
        }>
            <CompareContent />
        </Suspense>
    );
}

function CompareContent() {
    const searchParams = useSearchParams();
    const preselected = searchParams.get('model');
    const paramA = searchParams.get('a');
    const paramB = searchParams.get('b');

    const [brands, setBrands] = useState<TractorBrand[]>([]);
    const [allModels, setAllModels] = useState<MachineryModel[]>([]);
    const [comparisons, setComparisons] = useState<TractorComparison[]>([]);
    const [loading, setLoading] = useState(true);

    const [brandA, setBrandA] = useState('');
    const [modelA, setModelA] = useState<MachineryModel | null>(null);
    const [brandB, setBrandB] = useState('');
    const [modelB, setModelB] = useState<MachineryModel | null>(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const [b, m, c] = await Promise.all([
                fetchBrands(),
                fetchAllTractors(),
                fetchPopularComparisons(10),
            ]);
            if (!cancelled) {
                setBrands(b);
                setAllModels(m);
                setComparisons(c);
                setLoading(false);

                // Pre-select both tractors from URL params (e.g. ?a=slug1&b=slug2)
                if (paramA && paramB) {
                    const foundA = m.find((mm) => mm.slug === paramA);
                    const foundB = m.find((mm) => mm.slug === paramB);
                    if (foundA) {
                        setBrandA(foundA.brand);
                        setModelA(foundA);
                    }
                    if (foundB) {
                        setBrandB(foundB.brand);
                        setModelB(foundB);
                    }
                    if (foundA && foundB) {
                        setShowResult(true);
                    }
                } else if (preselected) {
                    const found = m.find((mm) => mm.slug === preselected);
                    if (found) {
                        setBrandA(found.brand);
                        setModelA(found);
                    }
                }
            }
        }
        load();
        return () => { cancelled = true; };
    }, [preselected, paramA, paramB]);

    const modelsForBrandA = allModels.filter((m) => m.brand === brandA);
    const modelsForBrandB = allModels.filter((m) => m.brand === brandB);

    const canCompare = modelA && modelB && modelA.id !== modelB.id;

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-6" />
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                <Link href="/home" className="hover:text-emerald-600">Home</Link>
                <span>/</span>
                <Link href="/home/machinery/tractors" className="hover:text-emerald-600">Tractors</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium">Compare</span>
            </nav>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Compare Tractors</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select two tractors to compare side by side</p>

            {/* VS Hero */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                <div className="flex items-center relative">
                    {/* Model A side */}
                    <div className="flex-1 p-6 text-center border-r border-gray-100 dark:border-gray-700">
                        <div className="w-24 h-24 mx-auto bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                            {modelA ? (
                                <img src={getTractorImageUrl(modelA.image_url, modelA.brand, modelA.model_name, modelA.slug)} alt={modelA.model_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-gray-300">agriculture</span>
                            )}
                        </div>
                        {modelA && (
                            <>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{modelA.brand}</p>
                                <p className="text-xs text-gray-500">{modelA.model_name}</p>
                                <p className="text-sm font-bold text-emerald-600 mt-1">{formatPrice(modelA.base_price)}</p>
                            </>
                        )}
                        {!modelA && <p className="text-xs text-gray-400">Select Tractor A</p>}
                    </div>

                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">VS</span>
                        </div>
                    </div>

                    {/* Model B side */}
                    <div className="flex-1 p-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                            {modelB ? (
                                <img src={getTractorImageUrl(modelB.image_url, modelB.brand, modelB.model_name, modelB.slug)} alt={modelB.model_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-gray-300">agriculture</span>
                            )}
                        </div>
                        {modelB && (
                            <>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{modelB.brand}</p>
                                <p className="text-xs text-gray-500">{modelB.model_name}</p>
                                <p className="text-sm font-bold text-emerald-600 mt-1">{formatPrice(modelB.base_price)}</p>
                            </>
                        )}
                        {!modelB && <p className="text-xs text-gray-400">Select Tractor B</p>}
                    </div>
                </div>

                {/* Selectors */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Column A */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Tractor A</label>
                            <select
                                value={brandA}
                                onChange={(e) => { setBrandA(e.target.value); setModelA(null); setShowResult(false); }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="">Select Brand</option>
                                {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            <select
                                value={modelA?.id || ''}
                                onChange={(e) => { setModelA(modelsForBrandA.find((m) => m.id === e.target.value) || null); setShowResult(false); }}
                                disabled={!brandA}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white disabled:opacity-50"
                            >
                                <option value="">Select Model</option>
                                {modelsForBrandA.map((m) => <option key={m.id} value={m.id}>{m.model_name} ({m.hp} HP)</option>)}
                            </select>
                        </div>

                        {/* Column B */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Tractor B</label>
                            <select
                                value={brandB}
                                onChange={(e) => { setBrandB(e.target.value); setModelB(null); setShowResult(false); }}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                            >
                                <option value="">Select Brand</option>
                                {brands.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            <select
                                value={modelB?.id || ''}
                                onChange={(e) => { setModelB(modelsForBrandB.find((m) => m.id === e.target.value) || null); setShowResult(false); }}
                                disabled={!brandB}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white disabled:opacity-50"
                            >
                                <option value="">Select Model</option>
                                {modelsForBrandB.map((m) => <option key={m.id} value={m.id}>{m.model_name} ({m.hp} HP)</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowResult(true)}
                        disabled={!canCompare}
                        className="w-full mt-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Compare Now
                    </button>
                </div>
            </div>

            {/* Comparison Result */}
            {showResult && modelA && modelB && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="font-bold text-sm text-gray-900 dark:text-white">
                            {modelA.brand} {modelA.model_name} vs {modelB.brand} {modelB.model_name}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/30">
                                    <th className="py-2 px-4 text-left text-gray-500 font-medium w-1/3">Specification</th>
                                    <th className="py-2 px-4 text-center text-gray-900 dark:text-white font-semibold w-1/3">{modelA.brand} {modelA.model_name}</th>
                                    <th className="py-2 px-4 text-center text-gray-900 dark:text-white font-semibold w-1/3">{modelB.brand} {modelB.model_name}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Price', formatPrice(modelA.base_price), formatPrice(modelB.base_price)],
                                    ['HP', `${modelA.hp} HP`, `${modelB.hp} HP`],
                                    ['Cylinders', modelA.features?.cylinders, modelB.features?.cylinders],
                                    ['Engine CC', modelA.features?.engineCc, modelB.features?.engineCc],
                                    ['Torque (Nm)', modelA.features?.torqueNm, modelB.features?.torqueNm],
                                    ['RPM', modelA.features?.rpm, modelB.features?.rpm],
                                    ['Drive', modelA.drive_type || '2WD', modelB.drive_type || '2WD'],
                                    ['Gears', modelA.features?.gears, modelB.features?.gears],
                                    ['Transmission', modelA.features?.transmission, modelB.features?.transmission],
                                    ['PTO Speed', modelA.features?.ptoSpeed, modelB.features?.ptoSpeed],
                                    ['Hydraulics (kg)', modelA.features?.hydraulicsCapacity, modelB.features?.hydraulicsCapacity],
                                    ['Brakes', modelA.features?.brakes, modelB.features?.brakes],
                                    ['Steering', modelA.features?.steeringType, modelB.features?.steeringType],
                                    ['Weight (kg)', modelA.features?.weightKg, modelB.features?.weightKg],
                                    ['Fuel Type', modelA.fuel_type, modelB.fuel_type],
                                    ['Warranty', `${modelA.warranty_years} Years`, `${modelB.warranty_years} Years`],
                                ]
                                    .filter(([, a, b]) => a || b)
                                    .map(([label, valA, valB], i) => {
                                        const a = String(valA || 'N/A');
                                        const b = String(valB || 'N/A');
                                        const numA = parseFloat(a.replace(/[^0-9.]/g, ''));
                                        const numB = parseFloat(b.replace(/[^0-9.]/g, ''));
                                        const aWins = !isNaN(numA) && !isNaN(numB) && numA > numB;
                                        const bWins = !isNaN(numA) && !isNaN(numB) && numB > numA;

                                        return (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-700/10' : ''}>
                                                <td className="py-2.5 px-4 text-gray-500 dark:text-gray-400">{String(label)}</td>
                                                <td className={`py-2.5 px-4 text-center font-medium ${aWins ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {a} {aWins && <span className="text-[10px]">✓</span>}
                                                </td>
                                                <td className={`py-2.5 px-4 text-center font-medium ${bWins ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {b} {bWins && <span className="text-[10px]">✓</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Popular Comparisons */}
            <ComparisonCards comparisons={comparisons} title="Popular Tractor Comparisons" />
        </div>
    );
}
