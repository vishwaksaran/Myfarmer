'use client';

import { useState } from 'react';

type LivestockCategory = 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Others';

interface LivestockProduct {
    id: number;
    name: string;
    image: string;
    price: string;
    priceValue: number;
    category: LivestockCategory;
    location: string;
    badge?: string;
    specs: {
        milk?: string;
        age?: string;
        weight?: string;
        breed?: string;
    };
}

export default function LivestockMarketPage() {
    const [selectedCategory, setSelectedCategory] = useState<LivestockCategory>('Cow');

    const categories: { id: LivestockCategory; label: string; emoji: string }[] = [
        { id: 'Cow', label: 'Cow', emoji: '🐄' },
        { id: 'Buffalo', label: 'Buffalo', emoji: '🐃' },
        { id: 'Goat', label: 'Goat', emoji: '🐐' },
        { id: 'Sheep', label: 'Sheep', emoji: '🐑' },
        { id: 'Others', label: 'Poultry', emoji: '🐔' },
    ];

    const products: LivestockProduct[] = [
        {
            id: 1,
            name: 'Pure Sahiwal Cow',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSu3-1DmxIpy2wKq5WTAD1o51crQzRyk5FUaXf2WGc1G2eQWzyx_Dar6pSiq7ZjsxnNslVvUFk3XbyHxau8iVpwiOxOl76T9-VCdNqLIzOvQIRs7lrYh_Oc1LZLmxkPaV3Hw8mzCDbwbKcoYaMGrtAZWYHL0yW1gk9nuvhXqcO_-of7LHKw2EQev1Dfw5_VJaF5G5IbvICsh1ZreLHcMIVFxTD7Ws2HXx3NHlJe9BTCeXENvLilh-dXKnac4T1gRNj5zpPcUaeZh49',
            price: '₹85,000',
            priceValue: 85000,
            category: 'Cow',
            location: 'Ludhiana, Punjab',
            badge: 'Premium',
            specs: {
                milk: '18-20 Liters',
                age: '42 Months',
            },
        },
        {
            id: 2,
            name: 'Holstein Friesian Cow',
            image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop',
            price: '₹95,000',
            priceValue: 95000,
            category: 'Cow',
            location: 'Amritsar, Punjab',
            specs: {
                milk: '22-25 Liters',
                age: '36 Months',
            },
        },
        {
            id: 3,
            name: 'Murrah Buffalo',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP9XsbxcXU-LW6s0ui96SUbvZ5gsWjz9pAEZ_bYQXN-tdptYt62s8Wp6vEaKUz4SSUKt6KTWL3I3ASUjJOg-i7XctgNcNsfCJrVfauFq685ka6lQW2qTQjfKpjWN8cwTT2mJga-41DrZH4TwpCGIpygcXAOCsnV5slpKb8f1KyBWpWIEObDT6AxWsRAwcogrrBwlYE_E6NvHYTM6yI_7aPZw2mHnUj6OmIHn91VgCSuPW_zRWV-oIABDHKzg3goonUfYRyNMssQNle',
            price: '₹1,20,000',
            priceValue: 120000,
            category: 'Buffalo',
            location: 'Moga, Punjab',
            specs: {
                milk: '14 Liters',
                weight: '450 Kg',
            },
        },
        {
            id: 4,
            name: 'Jaffrabadi Buffalo',
            image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
            price: '₹1,35,000',
            priceValue: 135000,
            category: 'Buffalo',
            location: 'Patiala, Punjab',
            specs: {
                milk: '16 Liters',
                weight: '500 Kg',
            },
        },
        {
            id: 5,
            name: 'Sirohi Goat',
            image: 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=400&h=300&fit=crop',
            price: '₹12,000',
            priceValue: 12000,
            category: 'Goat',
            location: 'Jalandhar, Punjab',
            specs: {
                age: '18 Months',
                weight: '45 Kg',
            },
        },
        {
            id: 6,
            name: 'Beetal Goat',
            image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
            price: '₹15,000',
            priceValue: 15000,
            category: 'Goat',
            location: 'Bathinda, Punjab',
            specs: {
                age: '24 Months',
                weight: '55 Kg',
            },
        },
        {
            id: 7,
            name: 'Merino Sheep',
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
            price: '₹8,500',
            priceValue: 8500,
            category: 'Sheep',
            location: 'Hoshiarpur, Punjab',
            specs: {
                age: '12 Months',
                weight: '35 Kg',
            },
        },
        {
            id: 8,
            name: 'Country Hen',
            image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=300&fit=crop',
            price: '₹450',
            priceValue: 450,
            category: 'Others',
            location: 'Kapurthala, Punjab',
            specs: {
                age: '8 Months',
                breed: 'Desi',
            },
        },
    ];

    const filteredProducts = products.filter(p => p.category === selectedCategory);

    const handleWhatsApp = () => {
        window.open('https://wa.me/917448410198', '_blank');
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
                            <span className="text-[#2c5926]">Livestock</span>
                        </div>
                    </div>
                    <div className="size-10 rounded-full bg-white shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center border border-white">
                        <span className="text-2xl font-black bg-gradient-to-br from-[#2c5926] to-[#B0EA3C] bg-clip-text text-transparent">M</span>
                    </div>
                </div>
                <h1 className="text-2xl font-black text-[#1F3A1D] mt-4">Livestock Market</h1>
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-32">
                {/* Category Pills */}
                <div className="flex overflow-x-auto gap-6 px-6 py-8 hide-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center size-20 rounded-3xl bg-[#fbfaf9] shadow-[6px_6px_16px_rgba(166,164,156,0.4),-6px_-6px_16px_rgba(255,255,255,0.9)] border border-white/60 transition-all active:shadow-[inset_4px_4px_10px_rgba(166,164,156,0.25),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] ${selectedCategory === cat.id ? '!bg-[#2c5926]/5 ring-2 ring-[#2c5926]/20' : ''
                                }`}
                        >
                            <div className="text-3xl mb-1 filter drop-shadow-md">{cat.emoji}</div>
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
