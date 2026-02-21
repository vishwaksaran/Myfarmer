'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CostItem {
    id: number;
    category: string;
    name: string;
    qty: string;
    unit: string;
    rate: string;
}

const cropPresets: Record<string, { name: string; icon: string; items: Omit<CostItem, 'id'>[] }> = {
    wheat: {
        name: 'Wheat',
        icon: 'grass',
        items: [
            { category: 'Seeds', name: 'Wheat Seeds (HD-2967)', qty: '40', unit: 'kg', rate: '38' },
            { category: 'Fertilizers', name: 'DAP (Basal)', qty: '50', unit: 'kg', rate: '27' },
            { category: 'Fertilizers', name: 'Urea (Top Dress)', qty: '65', unit: 'kg', rate: '6' },
            { category: 'Labor', name: 'Land Preparation', qty: '1', unit: 'acre', rate: '2500' },
            { category: 'Labor', name: 'Sowing', qty: '1', unit: 'acre', rate: '1500' },
            { category: 'Labor', name: 'Harvesting', qty: '1', unit: 'acre', rate: '3000' },
            { category: 'Irrigation', name: 'Water (4 irrigations)', qty: '4', unit: 'times', rate: '500' },
            { category: 'Pesticides', name: 'Weedicide (Sulfosulfuron)', qty: '1', unit: 'pack', rate: '350' },
        ],
    },
    rice: {
        name: 'Rice (Paddy)',
        icon: 'rice_bowl',
        items: [
            { category: 'Seeds', name: 'Paddy Seeds (Pusa-44)', qty: '8', unit: 'kg', rate: '50' },
            { category: 'Fertilizers', name: 'DAP', qty: '50', unit: 'kg', rate: '27' },
            { category: 'Fertilizers', name: 'Urea', qty: '80', unit: 'kg', rate: '6' },
            { category: 'Fertilizers', name: 'MOP', qty: '25', unit: 'kg', rate: '17' },
            { category: 'Labor', name: 'Puddling & Levelling', qty: '1', unit: 'acre', rate: '3500' },
            { category: 'Labor', name: 'Transplanting', qty: '1', unit: 'acre', rate: '4000' },
            { category: 'Labor', name: 'Harvesting & Threshing', qty: '1', unit: 'acre', rate: '4500' },
            { category: 'Irrigation', name: 'Water (Flood)', qty: '8', unit: 'times', rate: '600' },
            { category: 'Pesticides', name: 'Stem Borer Spray', qty: '1', unit: 'pack', rate: '450' },
        ],
    },
    cotton: {
        name: 'Cotton',
        icon: 'filter_vintage',
        items: [
            { category: 'Seeds', name: 'BT Cotton Seeds', qty: '1', unit: 'packet', rate: '850' },
            { category: 'Fertilizers', name: 'DAP', qty: '50', unit: 'kg', rate: '27' },
            { category: 'Fertilizers', name: 'Urea', qty: '50', unit: 'kg', rate: '6' },
            { category: 'Labor', name: 'Land Preparation', qty: '1', unit: 'acre', rate: '3000' },
            { category: 'Labor', name: 'Sowing', qty: '1', unit: 'acre', rate: '2000' },
            { category: 'Labor', name: 'Picking (3 rounds)', qty: '3', unit: 'rounds', rate: '2500' },
            { category: 'Irrigation', name: 'Drip/Sprinkler', qty: '6', unit: 'times', rate: '500' },
            { category: 'Pesticides', name: 'Bollworm Spray', qty: '3', unit: 'spray', rate: '400' },
        ],
    },
    custom: {
        name: 'Custom Crop',
        icon: 'eco',
        items: [],
    },
};

export default function CropCostingPage() {
    const [selectedCrop, setSelectedCrop] = useState('wheat');
    const [items, setItems] = useState<CostItem[]>(
        cropPresets.wheat.items.map((item, i) => ({ ...item, id: i + 1 }))
    );
    const [expectedYield, setExpectedYield] = useState('18');
    const [sellingPrice, setSellingPrice] = useState('2275');
    const [landSize, setLandSize] = useState('1');
    const [nextItemId, setNextItemId] = useState(100);

    const handleCropChange = (crop: string) => {
        setSelectedCrop(crop);
        const preset = cropPresets[crop];
        if (preset.items.length > 0) {
            setItems(preset.items.map((item, i) => ({ ...item, id: i + 1 })));
        }
        // Set default yield and price based on crop
        if (crop === 'wheat') { setExpectedYield('18'); setSellingPrice('2275'); }
        else if (crop === 'rice') { setExpectedYield('25'); setSellingPrice('2183'); }
        else if (crop === 'cotton') { setExpectedYield('8'); setSellingPrice('6620'); }
    };

    const updateItem = (id: number, field: keyof CostItem, value: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const addItem = () => {
        setItems(prev => [...prev, { id: nextItemId, category: 'Other', name: '', qty: '', unit: 'unit', rate: '' }]);
        setNextItemId(prev => prev + 1);
    };

    // Calculations
    const acres = parseFloat(landSize) || 1;
    const totalCost = items.reduce((sum, item) => {
        const cost = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
        return sum + cost;
    }, 0) * acres;

    const yieldQtl = (parseFloat(expectedYield) || 0) * acres;
    const revenue = yieldQtl * (parseFloat(sellingPrice) || 0);
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
    const costPerQtl = yieldQtl > 0 ? totalCost / yieldQtl : 0;

    const categoryTotals = items.reduce((acc, item) => {
        const cost = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0) * acres;
        acc[item.category] = (acc[item.category] || 0) + cost;
        return acc;
    }, {} as Record<string, number>);

    const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

    const categoryColors: Record<string, string> = {
        Seeds: 'bg-green-500',
        Fertilizers: 'bg-blue-500',
        Labor: 'bg-amber-500',
        Irrigation: 'bg-cyan-500',
        Pesticides: 'bg-red-400',
        Other: 'bg-purple-500',
    };

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
                        <span className="text-primary font-bold">Crop Costing</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <span className="material-symbols-outlined text-2xl">inventory_2</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Crop Costing & ROI</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Track input costs: Seeds, Fertilizers, Labor, and Irrigation to calculate ROI.</p>
                    </div>

                    {/* Crop Selector */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
                        {Object.entries(cropPresets).map(([key, crop]) => (
                            <button
                                key={key}
                                onClick={() => handleCropChange(key)}
                                className={`skeuo-card rounded-xl md:rounded-2xl p-3 md:p-5 text-center transition-all ${selectedCrop === key ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20 scale-[1.02]' : 'hover:shadow-md'}`}
                            >
                                <span className={`material-symbols-outlined text-2xl md:text-3xl mb-1 block ${selectedCrop === key ? 'text-amber-600' : 'text-gray-400'}`}>{crop.icon}</span>
                                <p className={`text-xs md:text-sm font-bold ${selectedCrop === key ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>{crop.name}</p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cost Items */}
                        <div className="lg:col-span-2">
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Input Costs (Per Acre)</h3>
                                    <button onClick={addItem} className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80">
                                        <span className="material-symbols-outlined text-sm">add_circle</span> Add Item
                                    </button>
                                </div>

                                {/* Header Row - hidden on mobile */}
                                <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    <div className="col-span-2">Category</div>
                                    <div className="col-span-3">Item Name</div>
                                    <div className="col-span-2">Qty</div>
                                    <div className="col-span-1">Unit</div>
                                    <div className="col-span-2">Rate (₹)</div>
                                    <div className="col-span-1 text-right">Cost</div>
                                    <div className="col-span-1"></div>
                                </div>

                                <div className="space-y-2">
                                    {items.map(item => {
                                        const itemCost = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                                        return (
                                            <div key={item.id} className="p-3 md:p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                {/* Mobile Layout */}
                                                <div className="md:hidden space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <select
                                                            value={item.category}
                                                            onChange={e => updateItem(item.id, 'category', e.target.value)}
                                                            className="text-xs font-bold rounded-lg px-2 py-1 bg-white dark:bg-gray-800 border-none"
                                                        >
                                                            <option>Seeds</option><option>Fertilizers</option><option>Labor</option><option>Irrigation</option><option>Pesticides</option><option>Other</option>
                                                        </select>
                                                        <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                        </button>
                                                    </div>
                                                    <input
                                                        value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                                                        className="w-full text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Item name"
                                                    />
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)}
                                                            className="text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Qty" />
                                                        <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                                                            className="text-sm bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Unit" />
                                                        <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)}
                                                            className="text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Rate ₹" />
                                                    </div>
                                                    <div className="text-right font-black text-amber-600 text-sm">{fmt(itemCost)}</div>
                                                </div>

                                                {/* Desktop Layout */}
                                                <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                                                    <select value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)}
                                                        className="col-span-2 text-xs font-bold rounded-lg px-2 py-2 bg-white dark:bg-gray-800 border-none">
                                                        <option>Seeds</option><option>Fertilizers</option><option>Labor</option><option>Irrigation</option><option>Pesticides</option><option>Other</option>
                                                    </select>
                                                    <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                                                        className="col-span-3 text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Item" />
                                                    <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)}
                                                        className="col-span-2 text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="Qty" />
                                                    <input value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                                                        className="col-span-1 text-xs bg-white dark:bg-gray-800 rounded-lg px-2 py-2 border-none" placeholder="Unit" />
                                                    <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)}
                                                        className="col-span-2 text-sm font-bold bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border-none" placeholder="₹ Rate" />
                                                    <div className="col-span-1 text-right font-bold text-amber-600 text-sm">{fmt(itemCost)}</div>
                                                    <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center">
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button onClick={addItem} className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">add</span> Add Cost Item
                                </button>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="space-y-6">
                            {/* Revenue Input */}
                            <div className="skeuo-card rounded-2xl p-5 md:p-6">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Estimation</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Land Size (Acres)</label>
                                        <input type="number" value={landSize} onChange={e => setLandSize(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Yield (Quintals/Acre)</label>
                                        <input type="number" value={expectedYield} onChange={e => setExpectedYield(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (₹ per Quintal)</label>
                                        <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none" />
                                    </div>
                                </div>
                            </div>

                            {/* ROI Summary */}
                            <div className="skeuo-card rounded-2xl p-5 md:p-6 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white">Profit & Loss Summary</h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-center">
                                        <p className="text-[10px] font-bold text-red-400 uppercase">Total Cost</p>
                                        <p className="text-lg font-black text-red-600">{fmt(totalCost)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 text-center">
                                        <p className="text-[10px] font-bold text-green-400 uppercase">Revenue</p>
                                        <p className="text-lg font-black text-green-600">{fmt(revenue)}</p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl text-center ${profit >= 0 ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                    <p className="text-xs font-bold uppercase mb-1">{profit >= 0 ? 'Net Profit' : 'Net Loss'}</p>
                                    <p className={`text-2xl md:text-3xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(Math.abs(profit))}</p>
                                    <p className="text-xs text-gray-500 mt-1">ROI: <strong className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>{roi.toFixed(1)}%</strong> | Cost/Qtl: {fmt(costPerQtl)}</p>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="skeuo-card rounded-2xl p-5 md:p-6">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Cost Breakdown</h4>
                                <div className="space-y-3">
                                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                                        <div key={cat}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{cat}</span>
                                                <span className="font-bold">{fmt(amount)}</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                <div className={`h-full rounded-full ${categoryColors[cat] || 'bg-gray-400'}`} style={{ width: `${totalCost > 0 ? (amount / totalCost) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
