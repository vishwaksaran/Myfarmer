'use client';

import { useState } from 'react';

type MachineryCategory = 'Tractors' | 'Harvesters' | 'Tools';

interface MachineryProduct {
    id: number;
    name: string;
    image: string;
    price: string;
    priceValue: number;
    category: MachineryCategory;
    location: string;
    badge?: string;
    specs: {
        [key: string]: string;
    };
}

export default function MachineryMarketPage() {
    const [selectedCategory, setSelectedCategory] = useState<MachineryCategory>('Tractors');

    const categories: { id: MachineryCategory; label: string; emoji: string }[] = [
        { id: 'Tractors', label: 'Tractors', emoji: '🚜' },
        { id: 'Harvesters', label: 'Harvesters', emoji: '🌾' },
        { id: 'Tools', label: 'Tools', emoji: '🔧' },
    ];

    const products: MachineryProduct[] = [
        {
            id: 1,
            name: 'Mahindra 575 DI',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            price: '₹5,50,000',
            priceValue: 550000,
            category: 'Tractors',
            location: 'Nasik, MH',
            badge: 'Premium',
            specs: {
                HP: '47 HP',
                Lift: '1800 kg',
                Fuel: '60 Litres',
            },
        },
        {
            id: 2,
            name: 'John Deere 5055E',
            image: 'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=400&h=300&fit=crop',
            price: '₹6,20,000',
            priceValue: 620000,
            category: 'Tractors',
            location: 'Pune, MH',
            specs: {
                HP: '55 HP',
                Lift: '2100 kg',
                Fuel: '65 Litres',
            },
        },
        {
            id: 3,
            name: 'New Holland TT75',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
            price: '₹7,80,000',
            priceValue: 780000,
            category: 'Tractors',
            location: 'Satara, MH',
            specs: {
                HP: '75 HP',
                Lift: '2500 kg',
                Fuel: '70 Litres',
            },
        },
        {
            id: 4,
            name: 'John Deere Combine',
            image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
            price: '₹35,00,000',
            priceValue: 3500000,
            category: 'Harvesters',
            location: 'Ludhiana, Punjab',
            badge: 'Premium',
            specs: {
                Width: '6.1m',
                Tank: '8000 L',
                Power: '235 HP',
            },
        },
        {
            id: 5,
            name: 'Claas Lexion 780',
            image: 'https://images.unsplash.com/photo-1589923188900-892ea9661c12?w=400&h=300&fit=crop',
            price: '₹42,00,000',
            priceValue: 4200000,
            category: 'Harvesters',
            location: 'Amritsar, Punjab',
            specs: {
                Width: '7.7m',
                Tank: '10500 L',
                Power: '320 HP',
            },
        },
        {
            id: 6,
            name: 'Preet 987',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
            price: '₹25,00,000',
            priceValue: 2500000,
            category: 'Harvesters',
            location: 'Patiala, Punjab',
            specs: {
                Width: '5.2m',
                Tank: '6000 L',
                Power: '180 HP',
            },
        },
        {
            id: 7,
            name: 'Rotavator Pro 2000',
            image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=400&h=300&fit=crop',
            price: '₹85,000',
            priceValue: 85000,
            category: 'Tools',
            location: 'Nashik, MH',
            specs: {
                Width: '2.1m',
                Blades: '42 Blades',
                Type: 'Heavy Duty',
            },
        },
        {
            id: 8,
            name: 'Cultivator Set',
            image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop',
            price: '₹45,000',
            priceValue: 45000,
            category: 'Tools',
            location: 'Pune, MH',
            specs: {
                Width: '1.8m',
                Tines: '11 Tines',
                Type: 'Spring Loaded',
            },
        },
        {
            id: 9,
            name: 'Seed Drill Machine',
            image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=400&h=300&fit=crop',
            price: '₹65,000',
            priceValue: 65000,
            category: 'Tools',
            location: 'Satara, MH',
            specs: {
                Rows: '9 Rows',
                Capacity: '150 kg',
                Type: 'Precision',
            },
        },
    ];

    const filteredProducts = products.filter(p => p.category === selectedCategory);

    const handleWhatsApp = () => {
        window.open('https://wa.me/919876543210', '_blank');
    };

    return (
        <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-[#fbfaf9] font-display">
            {/* Header */}
            <header className="sticky top-0 z-30 px-6 py-5 bg-[#fbfaf9]/90 backdrop-blur-md border-b border-[#e0e5df]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button className="size-8 rounded-full bg-white shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#2c5926] text-xl">arrow_back</span>
                        </button>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#4a453e]/60">
                            <span>Marketplace</span>
                            <span className="material-symbols-outlined text-xs">chevron_right</span>
                            <span className="text-[#2c5926]">Machinery</span>
                        </div>
                    </div>
                    <div className="size-10 rounded-full bg-white shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center border border-white">
                        <span className="text-2xl font-black bg-gradient-to-br from-[#2c5926] to-[#B0EA3C] bg-clip-text text-transparent">M</span>
                    </div>
                </div>
                <h1 className="text-2xl font-black text-[#1F3A1D] mt-4">Machinery & Equipment</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-32">
                {/* Category Pills */}
                <div className="flex overflow-x-auto gap-6 px-6 py-8 hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center size-20 rounded-3xl bg-[#fbfaf9] border border-white/60 transition-all ${selectedCategory === cat.id
                                ? 'bg-[#2c5926]/5 shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] border-[#2c5926]/30'
                                : 'shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] active:shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]'
                                }`}
                        >
                            <div
                                className="text-3xl mb-1"
                                style={{
                                    WebkitTextStroke: '0px',
                                    fontVariantEmoji: 'emoji',
                                    paintOrder: 'fill',
                                }}
                            >
                                {cat.emoji}
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase ${selectedCategory === cat.id ? 'text-[#2c5926]' : 'text-[#4a453e]'}`}>
                                {cat.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Product Listings */}
                <section className="px-6 space-y-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="rounded-[2.5rem] bg-[#fbfaf9] p-4 border-t border-white/80 shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] transition-all flex flex-col gap-4">
                            {/* Image */}
                            <div className="relative w-full h-56 rounded-[2rem] overflow-hidden bg-zinc-200 border-4 border-white shadow-inner">
                                <img
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    src={product.image}
                                />
                                {product.badge && (
                                    <div className="absolute top-4 left-4 bg-[#2c5926]/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                        {product.badge}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="px-2">
                                <div className="flex justify-between items-start mb-1">
                                    <h2 className="text-xl font-extrabold text-[#1F3A1D]">{product.name}</h2>
                                    <span className="text-2xl font-black text-[#2c5926]">{product.price}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#DAA520] text-lg font-bold">location_on</span>
                                    <span className="text-xs font-bold text-[#4a453e] uppercase tracking-wider">{product.location}</span>
                                </div>

                                {/* Specs Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {Object.entries(product.specs).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="bg-[#2c5926]/5 rounded-2xl p-3 border border-white/50 shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] flex flex-col"
                                        >
                                            <span className="text-[9px] font-black text-[#4a453e]/60 uppercase">{key}</span>
                                            <span className="text-sm font-bold text-[#1F3A1D]">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button className="flex-1 py-4 rounded-2xl bg-[#FF8C42] text-white font-black shadow-lg shadow-[#FF8C42]/30 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 border-t border-white/20">
                                        <span className="material-symbols-outlined font-bold">call</span>
                                        CALL SELLER
                                    </button>
                                    <button className="flex-1 py-4 rounded-2xl bg-[#2c5926] text-white font-black shadow-lg shadow-[#2c5926]/30 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 border-t border-white/20">
                                        <span className="material-symbols-outlined font-bold">shopping_cart</span>
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>

            {/* WhatsApp FAB */}
            <div className="fixed bottom-24 right-6 z-50">
                <button
                    onClick={handleWhatsApp}
                    className="relative size-16 lg:size-20 rounded-full bg-[#25D366] text-white shadow-[0_20px_40px_-10px_rgba(37,211,102,0.6)] border-4 border-[#B0EA3C]/30 active:scale-95 transition-transform flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                    <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <div className="absolute inset-0 bg-[#B0EA3C]/10 animate-pulse"></div>
                </button>
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-[#e0e5df] px-4 py-3 pb-6 z-40 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <a className="flex flex-col items-center gap-1 flex-1 group" href="#">
                    <div className="px-5 py-1 rounded-full text-[#4a453e] group-hover:bg-[#2c5926]/5 transition-all">
                        <span className="material-symbols-outlined">home</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#4a453e] uppercase tracking-tighter">Home</span>
                </a>
                <a className="flex flex-col items-center gap-1 flex-1 group" href="#">
                    <div className="px-5 py-1 rounded-full bg-[#2c5926]/10 text-[#2c5926] transition-all">
                        <span className="material-symbols-outlined fill-current">storefront</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#2c5926] uppercase tracking-tighter">Market</span>
                </a>
                <a className="flex flex-col items-center gap-1 flex-1 group" href="#">
                    <div className="px-5 py-1 rounded-full text-[#4a453e] group-hover:bg-[#2c5926]/5 transition-all">
                        <span className="material-symbols-outlined">potted_plant</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#4a453e] uppercase tracking-tighter">My Farm</span>
                </a>
                <a className="flex flex-col items-center gap-1 flex-1 group" href="#">
                    <div className="px-5 py-1 rounded-full text-[#4a453e] group-hover:bg-[#2c5926]/5 transition-all">
                        <span className="material-symbols-outlined">groups</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#4a453e] uppercase tracking-tighter">Community</span>
                </a>
            </nav>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
