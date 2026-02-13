'use client';

import { useState } from 'react';
import MiraituLogo from '@/components/MiraituLogo';

export default function OrganicStorePage() {
    const [cart, setCart] = useState<string[]>([]);

    const pureFats = [
        {
            id: 'a2-ghee',
            name: 'A2 Cow Ghee',
            subtitle: 'Pure Desi Gir Cow',
            price: '₹1,200',
            unit: 'Per Liter',
            features: ['100% Pure A2', 'Hand-churned', 'No Preservatives', 'Vedic Method'],
            certification: 'FARMER-DIRECT',
            image: 'ghee',
        },
        {
            id: 'buffalo-ghee',
            name: 'Buffalo Ghee',
            subtitle: 'Murrah Buffalo Milk',
            price: '₹900',
            unit: 'Per Liter',
            features: ['Rich & Creamy', 'High Fat Content', 'Traditional Method', 'Premium Quality'],
            certification: 'FARMER-DIRECT',
            image: 'butter',
        },
    ];

    const coldPressedOils = [
        {
            id: 'sunflower',
            name: 'Sunflower Oil',
            subtitle: 'Wood-Pressed',
            price: '₹450',
            unit: 'Per Liter',
            icon: 'wb_sunny',
            color: 'from-yellow-400 to-orange-500',
        },
        {
            id: 'coconut',
            name: 'Coconut Oil',
            subtitle: 'Cold-Pressed',
            price: '₹380',
            unit: 'Per Liter',
            icon: 'energy',
            color: 'from-green-400 to-emerald-600',
        },
        {
            id: 'palm',
            name: 'Palm Oil',
            subtitle: 'Organic',
            price: '₹320',
            unit: 'Per Liter',
            icon: 'spa',
            color: 'from-red-400 to-orange-600',
        },
        {
            id: 'groundnut',
            name: 'Groundnut Oil',
            subtitle: 'Wood-Pressed',
            price: '₹420',
            unit: 'Per Liter',
            icon: 'nutrition',
            color: 'from-amber-400 to-yellow-600',
        },
    ];

    const addToCart = (id: string) => {
        setCart([...cart, id]);
    };

    const isInCart = (id: string) => cart.includes(id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <MiraituLogo size={40} />
                        <h2 className="text-2xl font-bold tracking-tight text-[#121811]">Miraitu</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button className="flex items-center gap-2 rounded-xl bg-white skeuo-card px-4 py-2 font-bold">
                                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                                <span className="text-sm">{cart.length}</span>
                            </button>
                        </div>
                        <a href="/home" className="text-sm font-semibold hover:text-primary transition-colors">
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-20 rounded-[2rem] bg-gradient-to-br from-green-600 to-emerald-700 text-white mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-4xl">eco</span>
                        </div>
                        <h1 className="text-5xl font-black text-primary-dark mb-4">Miraitu Organic Store</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Pure, authentic, and farmer-direct organic products in eco-friendly glass packaging
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                100% Organic
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                                <span className="material-symbols-outlined text-sm">recycling</span>
                                Eco Packaging
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                                <span className="material-symbols-outlined text-sm">agriculture</span>
                                Farmer-Direct
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pure Fats Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <h2 className="text-3xl font-black mb-8">Pure Fats & Ghee</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pureFats.map((product) => (
                            <div key={product.id} className="skeuo-card rounded-3xl overflow-hidden border-2 border-white">
                                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-12 relative">
                                    <div className="absolute top-4 left-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                        {product.certification}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="size-32 rounded-full bg-white/80 flex items-center justify-center shadow-2xl">
                                            <span className="material-symbols-outlined text-7xl text-amber-600">{product.image}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-primary-dark mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{product.subtitle}</p>
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        {product.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs text-green-600">check_circle</span>
                                                <span className="text-xs font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-3xl font-black text-primary">{product.price}</p>
                                            <p className="text-sm text-gray-500">{product.unit}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                                            Glass Bottle
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product.id)}
                                        disabled={isInCart(product.id)}
                                        className={`w-full rounded-xl py-4 font-black text-lg transition-all ${isInCart(product.id)
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                : 'glossy-button text-white hover:brightness-110'
                                            }`}
                                    >
                                        {isInCart(product.id) ? '✓ ADDED TO CART' : 'ADD TO CART'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cold-Pressed Oils Section */}
            <section className="px-6 py-12 bg-white/50">
                <div className="mx-auto max-w-[1280px]">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black mb-2">Cold-Pressed Oils</h2>
                        <p className="text-gray-600">Wood-pressed and cold-pressed oils retaining all natural nutrients</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coldPressedOils.map((oil) => (
                            <div key={oil.id} className="skeuo-card rounded-2xl overflow-hidden border border-white/50 group hover:shadow-2xl transition-all">
                                <div className={`bg-gradient-to-br ${oil.color} p-8 flex items-center justify-center`}>
                                    <div className="size-24 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                                        <span className="material-symbols-outlined text-5xl text-gray-700">{oil.icon}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-black mb-1">{oil.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{oil.subtitle}</p>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-2xl font-black text-primary">{oil.price}</span>
                                        <span className="text-sm text-gray-500">{oil.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(oil.id)}
                                        disabled={isInCart(oil.id)}
                                        className={`w-full rounded-xl py-3 font-bold transition-all ${isInCart(oil.id)
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                                            }`}
                                    >
                                        {isInCart(oil.id) ? '✓ IN CART' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packaging Info Section */}
            <section className="px-6 py-12">
                <div className="mx-auto max-w-[1280px]">
                    <div className="skeuo-card rounded-3xl p-12 text-center border-4 border-white">
                        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-6">
                            <span className="material-symbols-outlined text-3xl">recycling</span>
                        </div>
                        <h3 className="text-3xl font-black text-primary-dark mb-4">Sustainable Packaging Promise</h3>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                            All our products come in reusable glass bottles or eco-friendly containers. Return empty bottles for a ₹50 refund per bottle!
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl text-green-600 mb-2">local_shipping</span>
                                <p className="font-bold">Free Delivery</p>
                                <p className="text-sm text-gray-500">On orders above ₹1000</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl text-blue-600 mb-2">verified_user</span>
                                <p className="font-bold">Quality Guaranteed</p>
                                <p className="text-sm text-gray-500">100% Organic Certified</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl text-orange-600 mb-2">agriculture</span>
                                <p className="font-bold">Direct from Farms</p>
                                <p className="text-sm text-gray-500">Supporting local farmers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
