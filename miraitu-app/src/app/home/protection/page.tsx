'use client';

import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function ProtectionServicesPage() {
    const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

    const tharpaiSheets = [
        {
            id: 'light-duty',
            name: 'Light Duty Tarpaulin',
            gsm: '120 GSM',
            price: '₹45/sqm',
            uses: ['Crop cover', 'Temporary shade', 'Light protection'],
            color: 'Blue/Green',
        },
        {
            id: 'heavy-duty',
            name: 'Heavy Duty Tarpaulin',
            gsm: '200 GSM',
            price: '₹75/sqm',
            uses: ['Warehouse cover', 'Equipment protection', 'Long-term use'],
            color: 'Green/Orange',
            popular: true,
        },
        {
            id: 'virgin',
            name: 'Virgin HDPE Sheet',
            gsm: '250 GSM',
            price: '₹95/sqm',
            uses: ['Premium protection', 'UV resistant', 'All-weather'],
            color: 'Various colors',
        },
    ];

    const pondingSheets = [
        {
            id: 'fish-pond-400',
            name: 'Fish Pond Liner - 400 GSM',
            thickness: '400 microns',
            price: '₹180/sqm',
            features: [
                'BIS Certified',
                'UV Stabilized',
                'Puncture resistant',
                'Flexible in cold',
                '10-year lifespan',
            ],
            applications: ['Fish farming', 'Aquaculture', 'Water storage'],
        },
        {
            id: 'fish-pond-600',
            name: 'Fish Pond Liner - 600 GSM',
            thickness: '600 microns',
            price: '₹250/sqm',
            features: [
                'Premium quality',
                'BIS Certified',
                'Ultra UV resistant',
                'Tear resistant',
                'Chemical resistant',
                '15-year lifespan',
            ],
            applications: ['Commercial fish farming', 'Large ponds', 'Industrial water storage'],
            premium: true,
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={40} />
                        <h2 className="text-2xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                    </div>
                    <a href="/home" className="text-sm font-semibold hover:text-primary transition-colors">
                        ← Back to Home
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-12 bg-gradient-to-br from-teal-50 to-cyan-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-teal-600 to-cyan-700 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text4xl">shield</span>
                        </div>
                        <h1 className="text-5xl font-black text-primary-dark mb-4">Protection & Specialized Services</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Heavy-duty tarpaulins and high-GSM sheets for crop protection and fish farming
                        </p>
                    </div>
                </div>
            </section>

            {/* Tharpai/Tarpaulin Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black mb-2">Tharpai (Tarpaulin) Sheets</h2>
                        <p className="text-gray-600">Durable protection for crops, equipment, and temporary structures</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tharpaiSheets.map((sheet) => (
                            <div
                                key={sheet.id}
                                className={`skeuo-card rounded-2xl p-6 border-4 transition-all ${sheet.popular
                                        ? 'border-primary/30 lg:scale-105'
                                        : 'border-white'
                                    }`}
                            >
                                {sheet.popular && (
                                    <div className="mb-4 -mt-2 -mx-2 bg-gradient-to-r from-primary to-green-600 text-white text-center py-1.5 rounded-t-xl font-black text-xs">
                                        ⭐ MOST POPULAR
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-teal-100 text-teal-600 mb-4">
                                        <span className="material-symbols-outlined text-3xl">package_2</span>
                                    </div>
                                    <h3 className="text-xl font-black mb-2">{sheet.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{sheet.gsm}</p>
                                    <p className="text-2xl font-black text-primary">{sheet.price}</p>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Common Uses:</p>
                                        {sheet.uses.map((use, idx) => (
                                            <div key={idx} className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-xs text-green-600">check</span>
                                                <span className="text-sm">{use}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Available Color:</p>
                                        <p className="text-sm font-medium">{sheet.color}</p>
                                    </div>
                                </div>
                                <button className="w-full rounded-xl py-3 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">
                                    Get Quote
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ponding Sheets for Fish Farming */}
            <section className="px-6 py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black mb-2">Ponding Sheets for Fish Farming</h2>
                        <p className="text-gray-600">High-GSM specialized sheets for fish ponds and water storage tanks</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pondingSheets.map((sheet) => (
                            <div
                                key={sheet.id}
                                className={`skeuo-card rounded-3xl p-8 border-4 ${sheet.premium ? 'border-cyan-500/30' : 'border-white'
                                    }`}
                            >
                                {sheet.premium && (
                                    <div className="mb-6 -mt-4 -mx-4 bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-center py-2.5 rounded-t-2xl font-black text-sm">
                                        💎 PREMIUM QUALITY
                                    </div>
                                )}
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="tactile-icon size-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-teal-600 flex-shrink-0">
                                        <span className="material-symbols-outlined text-3xl text-white">water</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-primary-dark mb-1">{sheet.name}</h3>
                                        <p className="text-sm text-gray-500 mb-3">Thickness: {sheet.thickness}</p>
                                        <p className="text-3xl font-black text-primary">{sheet.price}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">Features:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sheet.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs text-green-600">verified</span>
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-gray-700 uppercase mb-3">Applications:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sheet.applications.map((app, idx) => (
                                            <span key={idx} className="inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">
                                                {app}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSheet(sheet.id)}
                                    className={`w-full rounded-xl py-4 font-black text-lg transition-all ${selectedSheet === sheet.id
                                            ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-2xl'
                                            : sheet.premium
                                                ? 'glossy-button text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {selectedSheet === sheet.id ? '✓ SELECTED' : 'REQUEST QUOTE'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Request Form */}
            {selectedSheet && (
                <section className="px-6 py-12">
                    <div className="mx-auto max-w-2xl">
                        <div className="skeuo-card rounded-3xl p-8 md:p-12 border-4 border-white">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-teal-700 text-white mb-4">
                                    <span className="material-symbols-outlined text-3xl">request_quote</span>
                                </div>
                                <h3 className="text-3xl font-black text-primary-dark mb-2">Request Pond Liner Quote</h3>
                                <p className="text-gray-600">Get customized quotation for your fish farming needs</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Farm Location *</label>
                                    <input
                                        type="text"
                                        className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District, State"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Pond Area (sqm)</label>
                                        <input
                                            type="number"
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="e.g., 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">Pond Depth (feet)</label>
                                        <input
                                            type="number"
                                            className="w-full skeuo-inset rounded-xl px-4 py-3 font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="e.g., 6"
                                        />
                                    </div>
                                </div>
                                <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-cyan-800 mb-1">Selected Product:</p>
                                    <p className="text-lg font-black text-cyan-600">
                                        {pondingSheets.find(s => s.id === selectedSheet)?.name}
                                    </p>
                                </div>
                                <button className="vibrant-gradient w-full rounded-xl py-5 text-white font-black text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-2xl">send</span>
                                    GET QUOTATION
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
