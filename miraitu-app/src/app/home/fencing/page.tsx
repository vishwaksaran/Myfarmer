'use client';

import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function FencingInfrastructurePage() {
    const [selectedFencingType, setSelectedFencingType] = useState<string>('chain-link');

    const fencingTypes = [
        {
            id: 'chain-link',
            icon: 'fence',
            title: 'Rough/Chain-Link Fencing',
            description: 'Cost-effective boundary marking and perimeter security for farms.',
            price: '₹45/ft',
            features: [
                'Galvanized steel wire',
                'Weather resistant',
                'Easy installation',
                'Low maintenance',
                '10-year lifespan',
            ],
            gradient: 'from-gray-500 to-gray-700',
        },
        {
            id: 'electric',
            icon: 'electric_bolt',
            title: 'Electrical/Power Fencing',
            description: 'Advanced protection against wild animals with certified shock-safe technology.',
            price: '₹120/ft',
            features: [
                'Shock-Safe Certified ⚡',
                'Solar powered option',
                'Anti-theft alarm',
                'Wild animal deterrent',
                'Remote monitoring',
            ],
            gradient: 'from-yellow-500 to-orange-600',
            popular: true,
        },
    ];

    const constructionMaterials = [
        {
            id: 101,
            name: 'River Sand',
            unit: 'Per Tonne',
            price: '₹800',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqMbvZ3gGUOEW-Y9Lbs8ooK2hPpxQ7q1TvE5QAPW8YvYDO7k_Z0QqBywU37VGLGqPQX8Cj3OI9n-PGaVNbsQlscHGxh8ZRx5Ke7fXunq3FQSF8FUbXKCTPmNbJw_n7aV6K0A',
            eco: true,
        },
        {
            id: 102,
            name: 'Hollow Blocks (6")',
            unit: 'Per Piece',
            price: '₹35',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYvQRJHlDLCH0L-_RRWFOwmX5CQZ-Vdz1xt4pUvZPXzJQKgTAo_6hNz8F5YPNaL2FZw7RFJxhEqPk5vKnk2cZWQ7lKMPvR5XDy3UqHTFJnL8Rw4Vm5tQzA1gHXQ7p9Kv2K0w',
            eco: true,
        },
        {
            id: 103,
            name: 'Red Clay Bricks',
            unit: 'Per 1000',
            price: '₹6,500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxZL8-VH2xFKP7RQvYJ5Kz9FWq4BNm1XT6yGpHcJQx8wL5z2Rv3KTnM9Pf6YDxL8Wq7Vm2Jz4Hs1Xv9TkWq5Pz8Nm7Rx4L6Y3Vq2Hs9Xz7Wm4Kq1Pz8Nm7Rx5',
            eco: false,
        },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={40} />
                        <h2 className="hidden sm:block text-2xl font-bold tracking-tight text-[#121811] dark:text-[#f9fbf9]">Miraitu</h2>
                    </div>
                    <a href="/home/services" className="text-xs md:text-sm font-semibold hover:text-primary transition-colors">
                        ← Back to Services
                    </a>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-3 md:px-6 py-8 md:py-12 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center size-16 md:size-20 rounded-[2rem] bg-gradient-to-br from-amber-600 to-orange-700 text-white mb-4 md:mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-3xl md:text-4xl">construction</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-primary-dark mb-2 md:mb-4">Fencing & Infrastructure</h1>
                        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                            Complete solutions for farm security, boundaries, and eco-friendly construction materials
                        </p>
                    </div>
                </div>
            </section>

            {/* Fencing Solutions */}
            <section className="px-3 md:px-6 py-8 md:py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8">Fencing Solutions</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                        {fencingTypes.map((fence) => (
                            <div
                                key={fence.id}
                                className={`skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 border-4 transition-all ${selectedFencingType === fence.id
                                    ? 'border-primary shadow-2xl shadow-primary/30'
                                    : fence.popular
                                        ? 'border-orange-500/30'
                                        : 'border-white'
                                    } ${fence.popular ? 'lg:scale-105' : ''}`}
                            >
                                {fence.popular && (
                                    <div className="mb-4 -mt-4 -mx-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-1.5 md:py-2 rounded-t-2xl font-black text-[10px] md:text-sm">
                                        ⚡ SHOCK-SAFE CERTIFIED
                                    </div>
                                )}
                                <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                                    <div className={`tactile-icon size-12 md:size-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${fence.gradient} flex-shrink-0 mx-auto md:mx-0`}>
                                        <span className="material-symbols-outlined text-2xl md:text-3xl text-white">{fence.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3 md:mb-4">
                                            <h3 className="text-lg md:text-2xl font-black text-primary-dark">{fence.title}</h3>
                                            <span className="text-base md:text-lg font-bold text-primary whitespace-nowrap">{fence.price}</span>
                                        </div>
                                        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{fence.description}</p>
                                        <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                                            {fence.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xs md:text-sm text-green-600">check_circle</span>
                                                    <span className="text-xs md:text-sm font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => setSelectedFencingType(fence.id)}
                                            className={`w-full rounded-lg md:rounded-xl py-2 md:py-3 font-bold text-sm md:text-base transition-all ${selectedFencingType === fence.id
                                                ? 'glossy-button text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                }`}
                                        >
                                            {selectedFencingType === fence.id ? '✓ SELECTED' : 'GET QUOTE'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Construction Materials Marketplace */}
            <section className="px-3 md:px-6 py-8 md:py-12 bg-primary/5">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-6 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-1 md:mb-2">Eco-Friendly Construction Materials</h2>
                        <p className="text-sm md:text-base text-gray-600">Build sustainable farmhouses and barns with certified materials</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {constructionMaterials.map((material) => (
                            <div key={material.id} className="skeuo-card rounded-xl md:rounded-2xl overflow-hidden border border-white/50 flex flex-col">
                                <div className="aspect-[4/3] bg-gray-200 relative">
                                    {material.eco && (
                                        <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10 rounded-lg bg-green-600 px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold text-white shadow-lg flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">eco</span>
                                            ECO-FRIENDLY
                                        </div>
                                    )}
                                    <div className="h-full w-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-5xl md:text-6xl text-amber-600">inventory_2</span>
                                    </div>
                                </div>
                                <div className="p-3 md:p-6 flex flex-col flex-1">
                                    <h3 className="text-base md:text-xl font-black mb-0.5 md:mb-1">{material.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">{material.unit}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xl md:text-2xl font-black text-primary">{material.price}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <a 
                                            href="tel:+919876543210"
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold hover:bg-primary-dark transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm md:text-base">call</span>
                                            Call for Details
                                        </a>
                                        <a 
                                            href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 text-white px-2 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold hover:bg-green-700 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm md:text-base">chat</span>
                                            Book Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Request Form */}
            {selectedFencingType && (
                <section className="px-3 md:px-6 py-8 md:py-12">
                    <div className="mx-auto max-w-2xl">
                        <div className="skeuo-card rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12 border-4 border-white">
                            <div className="text-center mb-6 md:mb-8">
                                <div className="inline-flex items-center justify-center size-14 md:size-16 rounded-2xl bg-gradient-to-br from-primary to-green-600 text-white mb-3 md:mb-4">
                                    <span className="material-symbols-outlined text-2xl md:text-3xl">request_quote</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-primary-dark mb-1 md:mb-2">Request Fencing Quote</h3>
                                <p className="text-sm md:text-base text-gray-600">Get a customized quotation for your farm fencing needs</p>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">Full Name *</label>
                                        <input
                                            type="text"
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">Farm Location *</label>
                                    <input
                                        type="text"
                                        className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                        placeholder="Village, District, State"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">Fencing Length (feet)</label>
                                        <input
                                            type="number"
                                            className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none"
                                            placeholder="e.g., 500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2 text-gray-700">Preferred Timeline</label>
                                        <select className="w-full skeuo-inset rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-bold focus:ring-0 border-none appearance-none">
                                            <option>Within 1 week</option>
                                            <option>Within 2 weeks</option>
                                            <option>Within 1 month</option>
                                            <option>Flexible</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg md:rounded-xl p-3 md:p-4">
                                    <p className="text-xs md:text-sm font-bold text-amber-800 mb-0.5 md:mb-1">Selected Fencing Type:</p>
                                    <p className="text-base md:text-lg font-black text-amber-600">
                                        {fencingTypes.find(f => f.id === selectedFencingType)?.title}
                                    </p>
                                </div>
                                <button className="vibrant-gradient w-full rounded-lg md:rounded-xl py-3 md:py-5 text-white font-black text-base md:text-xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">send</span>
                                    REQUEST QUOTE
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
