'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface CostItem {
    id: number;
    label: string;
    amount: string;
    category: 'input' | 'labor' | 'machinery' | 'other';
}

const presets: Record<string, { costs: Omit<CostItem, 'id'>[]; yieldQty: string; pricePerUnit: string; area: string }> = {
    wheat: {
        area: '1',
        yieldQty: '18',
        pricePerUnit: '2350',
        costs: [
            { label: 'Seeds', amount: '2400', category: 'input' },
            { label: 'DAP Fertilizer', amount: '3200', category: 'input' },
            { label: 'Urea', amount: '800', category: 'input' },
            { label: 'Irrigation (4 times)', amount: '4000', category: 'other' },
            { label: 'Pesticide Spray', amount: '1500', category: 'input' },
            { label: 'Ploughing & Sowing', amount: '3500', category: 'machinery' },
            { label: 'Harvesting (Combine)', amount: '4000', category: 'machinery' },
            { label: 'Labor (Weeding + misc)', amount: '3000', category: 'labor' },
            { label: 'Transport to Mandi', amount: '1200', category: 'other' },
        ],
    },
    rice: {
        area: '1',
        yieldQty: '25',
        pricePerUnit: '2300',
        costs: [
            { label: 'Seeds / Seedlings', amount: '2000', category: 'input' },
            { label: 'Nursery Preparation', amount: '1500', category: 'labor' },
            { label: 'Transplanting Labor', amount: '5000', category: 'labor' },
            { label: 'DAP + MOP', amount: '3500', category: 'input' },
            { label: 'Urea (3 doses)', amount: '1200', category: 'input' },
            { label: 'Pesticides', amount: '2000', category: 'input' },
            { label: 'Irrigation', amount: '5000', category: 'other' },
            { label: 'Harvesting', amount: '4500', category: 'machinery' },
            { label: 'Weeding Labor', amount: '3000', category: 'labor' },
            { label: 'Transport', amount: '1500', category: 'other' },
        ],
    },
    cotton: {
        area: '1',
        yieldQty: '8',
        pricePerUnit: '7350',
        costs: [
            { label: 'Bt Cotton Seeds', amount: '4500', category: 'input' },
            { label: 'DAP + Complex', amount: '4000', category: 'input' },
            { label: 'Urea', amount: '1000', category: 'input' },
            { label: 'Pesticides (5 sprays)', amount: '6000', category: 'input' },
            { label: 'Irrigation', amount: '5000', category: 'other' },
            { label: 'Ploughing', amount: '3000', category: 'machinery' },
            { label: 'Picking Labor (3 times)', amount: '12000', category: 'labor' },
            { label: 'Weeding', amount: '4000', category: 'labor' },
            { label: 'Transport', amount: '1500', category: 'other' },
        ],
    },
};

let nextId = 100;

export default function ProfitEstimatorPage() {
    const [cropName, setCropName] = useState('Wheat');
    const [area, setArea] = useState('1');
    const [yieldQty, setYieldQty] = useState('18');
    const [pricePerUnit, setPricePerUnit] = useState('2350');
    const [costs, setCosts] = useState<CostItem[]>(
        presets.wheat.costs.map((c, i) => ({ ...c, id: i + 1 }))
    );

    const loadPreset = (key: string) => {
        const p = presets[key];
        if (!p) return;
        setCropName(key.charAt(0).toUpperCase() + key.slice(1));
        setArea(p.area);
        setYieldQty(p.yieldQty);
        setPricePerUnit(p.pricePerUnit);
        setCosts(p.costs.map((c, i) => ({ ...c, id: i + 1 })));
    };

    const addCost = () => {
        setCosts(prev => [...prev, { id: nextId++, label: '', amount: '', category: 'other' }]);
    };

    const removeCost = (id: number) => setCosts(prev => prev.filter(c => c.id !== id));

    const updateCost = (id: number, field: keyof CostItem, value: string) => {
        setCosts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const results = useMemo(() => {
        const areaNum = parseFloat(area) || 1;
        const yieldNum = parseFloat(yieldQty) || 0;
        const priceNum = parseFloat(pricePerUnit) || 0;
        const totalCost = costs.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0) * areaNum;
        const totalRevenue = yieldNum * priceNum * areaNum;
        const profit = totalRevenue - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
        const costPerQtl = yieldNum > 0 ? totalCost / (yieldNum * areaNum) : 0;
        const breakEvenPrice = yieldNum > 0 ? totalCost / (yieldNum * areaNum) : 0;

        const byCat: Record<string, number> = {};
        costs.forEach(c => {
            const cat = c.category;
            byCat[cat] = (byCat[cat] || 0) + (parseFloat(c.amount) || 0);
        });

        return { totalCost, totalRevenue, profit, roi, costPerQtl, breakEvenPrice, byCat, areaNum };
    }, [costs, area, yieldQty, pricePerUnit]);

    const catColors: Record<string, { bg: string; text: string; bar: string }> = {
        input: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
        labor: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
        machinery: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
        other: { bg: 'bg-gray-100', text: 'text-gray-700', bar: 'bg-gray-500' },
    };

    const singleAcCost = costs.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);

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
                        <span className="text-primary font-bold">Profit Estimator</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Profit Estimator</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Calculate profit, ROI, and break-even price for your crop season.</p>
                    </div>

                    {/* Presets */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {Object.keys(presets).map(k => (
                            <button
                                key={k}
                                onClick={() => loadPreset(k)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${cropName.toLowerCase() === k
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Input Section */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Basic Details */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Crop Details</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Crop Name</label>
                                        <input type="text" value={cropName} onChange={e => setCropName(e.target.value)} className="skeuo-inset rounded-xl px-4 py-3 w-full text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area (Acres)</label>
                                        <input type="number" value={area} onChange={e => setArea(e.target.value)} className="skeuo-inset rounded-xl px-4 py-3 w-full text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yield (Qtl/Acre)</label>
                                        <input type="number" value={yieldQty} onChange={e => setYieldQty(e.target.value)} className="skeuo-inset rounded-xl px-4 py-3 w-full text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selling ₹/Qtl</label>
                                        <input type="number" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} className="skeuo-inset rounded-xl px-4 py-3 w-full text-sm font-bold" />
                                    </div>
                                </div>
                            </div>

                            {/* Cost Items */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Cost Items (per Acre)</h3>
                                    <button onClick={addCost} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-sm">add</span>Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {costs.map(c => (
                                        <div key={c.id} className="flex items-center gap-2 p-2 md:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                            <select
                                                value={c.category}
                                                onChange={e => updateCost(c.id, 'category', e.target.value)}
                                                className="w-20 md:w-28 bg-transparent text-xs font-bold border-none focus:ring-0 p-0"
                                            >
                                                <option value="input">Input</option>
                                                <option value="labor">Labor</option>
                                                <option value="machinery">Machine</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Item name"
                                                value={c.label}
                                                onChange={e => updateCost(c.id, 'label', e.target.value)}
                                                className="flex-1 bg-transparent text-sm font-medium border-none focus:ring-0 p-0 min-w-0"
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={c.amount}
                                                    onChange={e => updateCost(c.id, 'amount', e.target.value)}
                                                    className="w-16 md:w-20 bg-transparent text-sm font-bold text-right border-none focus:ring-0 p-0"
                                                />
                                            </div>
                                            <button onClick={() => removeCost(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-gray-500 text-sm">Total Cost / Acre</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">₹{singleAcCost.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Profit Card */}
                            <div className={`skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-8 border-2 ${results.profit >= 0 ? 'border-green-300/50' : 'border-red-300/50'}`}>
                                <h3 className="text-lg font-black mb-5 text-gray-900 dark:text-white">Profit Summary</h3>
                                <p className="text-xs text-gray-400 font-bold mb-4">For {results.areaNum} Acre(s) of {cropName}</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-bold">Total Revenue</span>
                                        <span className="text-lg font-black text-green-600">₹{results.totalRevenue.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 font-bold">Total Cost</span>
                                        <span className="text-lg font-black text-red-500">₹{results.totalCost.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Net Profit / Loss</span>
                                            <span className={`text-2xl font-black ${results.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {results.profit >= 0 ? '+' : ''}₹{results.profit.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="skeuo-card rounded-2xl p-4 text-center">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">ROI</p>
                                    <p className={`text-2xl font-black ${results.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>{results.roi.toFixed(1)}%</p>
                                </div>
                                <div className="skeuo-card rounded-2xl p-4 text-center">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Cost / Quintal</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">₹{Math.round(results.costPerQtl).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="skeuo-card rounded-2xl p-4 text-center col-span-2">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Break-Even Selling Price</p>
                                    <p className="text-2xl font-black text-amber-600">₹{Math.round(results.breakEvenPrice).toLocaleString('en-IN')} <span className="text-sm text-gray-400">/ qtl</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Sell above this price to make profit</p>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="skeuo-card rounded-2xl p-5">
                                <h4 className="font-bold text-sm mb-4 text-gray-900 dark:text-white">Cost Breakdown</h4>
                                <div className="space-y-3">
                                    {Object.entries(results.byCat).map(([cat, amt]) => {
                                        const cc = catColors[cat] || catColors.other;
                                        const pct = singleAcCost > 0 ? (amt / singleAcCost) * 100 : 0;
                                        return (
                                            <div key={cat}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`text-xs font-bold capitalize ${cc.text} px-2 py-0.5 rounded-full ${cc.bg}`}>{cat}</span>
                                                    <span className="text-xs font-bold text-gray-600">₹{amt.toLocaleString('en-IN')} ({pct.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div className={`h-full rounded-full ${cc.bar} transition-all`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
