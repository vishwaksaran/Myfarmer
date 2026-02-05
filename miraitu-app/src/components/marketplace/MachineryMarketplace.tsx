'use client';

import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    image: string;
    price: string;
    priceValue: number;
    location: string;
    distance: string;
    description: string;
    badge?: string;
    badgeColor?: string;
    specs: {
        hp: string;
        lift: string;
        fuel: string;
        warranty: string;
        years: string;
    };
}

export default function MachineryMarketplace() {
    const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const machineryProducts: Product[] = [
        {
            id: 1,
            name: 'Mahindra 575 DI Tractor',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            price: '₹5,50,000',
            priceValue: 550000,
            location: 'Nasik, MH',
            distance: '12 km away',
            description: '2019 Model, excellent condition with attachment included.',
            badge: 'PREMIUM',
            badgeColor: 'bg-amber-500',
            specs: { hp: '47 HP', lift: '1800 kg', fuel: '60 Litres', warranty: '8F + 4R', years: '5 Years' }
        },
        {
            id: 2,
            name: 'John Deere 5055E',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            price: '₹6,20,000',
            priceValue: 620000,
            location: 'Pune, MH',
            distance: '10 km away',
            description: 'Latest model with advanced features and power steering.',
            badge: 'NEW',
            badgeColor: 'bg-lime-500',
            specs: { hp: '55 HP', lift: '2100 kg', fuel: '65 Litres', warranty: '12F + 3R', years: '6 Years' }
        },
        {
            id: 3,
            name: 'Mahindra Arjun 555',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            price: '₹7,50,000',
            priceValue: 750000,
            location: 'Satara, MH',
            distance: '8 km away',
            description: 'High performance tractor with excellent fuel efficiency.',
            specs: { hp: '52 HP', lift: '1850 kg', fuel: '65 Litres', warranty: '12F + 3R', years: '6 Years' }
        },
        {
            id: 4,
            name: 'Swaraj 855 FE',
            image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
            price: '₹5,80,000',
            priceValue: 580000,
            location: 'Nashik, MH',
            distance: '15 km away',
            description: 'Reliable tractor with low maintenance cost.',
            specs: { hp: '50 HP', lift: '1600 kg', fuel: '60 Litres', warranty: '8F + 4R', years: '5 Years' }
        },
    ];

    const handleComparisonToggle = (productId: number) => {
        setSelectedForComparison(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            if (prev.length >= 2) {
                return [prev[1], productId];
            }
            return [...prev, productId];
        });
    };

    const comparisonProducts = machineryProducts.filter(p => selectedForComparison.includes(p.id));

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary-dark mb-2">Machinery & Equipment</h2>
                <p className="text-soil-dark">Browse tractors and farming equipment</p>
            </div>

            {/* Comparison Bar */}
            {selectedForComparison.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-[#e8eede] border-2 border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">compare</span>
                        <span className="font-bold text-primary-dark">
                            {selectedForComparison.length} tractor{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {selectedForComparison.length === 2 && (
                            <button
                                onClick={() => setShowComparison(true)}
                                className="px-6 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">compare</span>
                                Compare Now
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedForComparison([])}
                            className="px-4 py-2 rounded-lg bg-white/50 font-bold text-soil-dark hover:bg-white transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Help Text */}
            {selectedForComparison.length === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-[#f0fae6] border border-primary/20">
                    <p className="text-sm text-soil-dark flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        Click the compare icon on any two tractors to see a side-by-side comparison
                    </p>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machineryProducts.map(product => (
                    <div
                        key={product.id}
                        className="group rounded-2xl bg-[#fbfaf9] overflow-hidden shadow-[8px_8px_16px_#d4d9ce,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] transition-all"
                    >
                        {/* Image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            {product.badge && (
                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full ${product.badgeColor} text-white text-xs font-bold shadow-md`}>
                                    {product.badge}
                                </div>
                            )}
                            <button
                                onClick={() => handleComparisonToggle(product.id)}
                                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${selectedForComparison.includes(product.id)
                                        ? 'bg-primary text-white scale-110'
                                        : 'bg-white/90 text-soil-dark hover:bg-white hover:scale-105'
                                    }`}
                                title="Add to comparison"
                            >
                                <span className="material-symbols-outlined text-lg">compare_arrows</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <h4 className="text-lg font-bold text-primary-dark mb-2">{product.name}</h4>
                            <p className="text-sm text-soil-dark mb-3 line-clamp-2">{product.description}</p>

                            {/* Quick Specs */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-1 rounded-lg bg-[#f2f4f0] text-xs font-bold text-primary-dark">
                                    {product.specs.hp}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-[#f2f4f0] text-xs font-bold text-primary-dark">
                                    {product.specs.lift}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-[#f2f4f0] text-xs font-bold text-primary-dark">
                                    {product.specs.fuel}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-soil-dark mb-3">
                                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                <span>{product.location}</span>
                                <span className="text-xs">• {product.distance}</span>
                            </div>

                            <div className="text-2xl font-black text-primary mb-4">{product.price}</div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">call</span>
                                    Call Seller
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Modal */}
            {showComparison && comparisonProducts.length === 2 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#fbfaf9] rounded-2xl p-8 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-primary-dark flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">compare</span>
                                Side-by-Side Tractor Comparison
                            </h3>
                            <button
                                onClick={() => setShowComparison(false)}
                                className="w-10 h-10 rounded-full bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] flex items-center justify-center transition-all"
                            >
                                <span className="material-symbols-outlined text-soil-dark">close</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {comparisonProducts.map((product, idx) => (
                                <div key={product.id} className="p-6 rounded-2xl bg-white border-2 border-primary/20 shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff]">
                                    {/* Image */}
                                    <div className="relative mb-4">
                                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" />
                                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    {/* Name & Price */}
                                    <h4 className="text-xl font-bold text-primary-dark mb-2">{product.name}</h4>
                                    <p className="text-3xl font-black text-primary mb-6">{product.price}</p>

                                    {/* Specs Table */}
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b-2 border-[#e0e5df]">
                                                <td className="py-3 font-bold text-soil-dark text-sm">Horsepower (HP)</td>
                                                <td className="py-3 text-right font-black text-xl text-primary">{product.specs.hp}</td>
                                            </tr>
                                            <tr className="border-b-2 border-[#e0e5df]">
                                                <td className="py-3 font-bold text-soil-dark text-sm">Lift Capacity</td>
                                                <td className="py-3 text-right font-black text-xl text-primary-dark">{product.specs.lift}</td>
                                            </tr>
                                            <tr className="border-b-2 border-[#e0e5df]">
                                                <td className="py-3 font-bold text-soil-dark text-sm">Fuel Capacity</td>
                                                <td className="py-3 text-right font-black text-xl text-primary-dark">{product.specs.fuel}</td>
                                            </tr>
                                            <tr className="border-b-2 border-[#e0e5df]">
                                                <td className="py-3 font-bold text-soil-dark text-sm">Transmission</td>
                                                <td className="py-3 text-right font-black text-xl text-primary-dark">{product.specs.warranty}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 font-bold text-soil-dark text-sm">Warranty</td>
                                                <td className="py-3 text-right font-black text-xl text-primary">{product.specs.years}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t-2 border-[#e0e5df]">
                            <p className="text-sm text-soil-dark italic">
                                Compare specifications to make an informed decision
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowComparison(false)}
                                    className="px-6 py-3 rounded-xl bg-[#fbfaf9] shadow-[4px_4px_8px_#d4d9ce,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d4d9ce,-2px_-2px_4px_#ffffff] font-bold text-primary-dark transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowComparison(false);
                                        setSelectedForComparison([]);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-b from-primary to-primary-dark text-white font-bold shadow-[0_3px_0_0_#1a3617] hover:shadow-[0_1px_0_0_#1a3617] active:translate-y-1 transition-all"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
