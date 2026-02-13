'use client';

import { useState } from 'react';
import Link from 'next/link';

// Sample machinery data
const allMachinery = [
    {
        id: 1,
        name: 'Titan TX-500',
        brand: 'John Deere Series',
        category: 'TRACTOR',
        power: '450 HP',
        efficiency: '12.5 L/h',
        weight: '9,500 kg',
        price: '$285,000',
        engine: '6-Cylinder Turbo Diesel',
        transmission: '24-Speed PowerShift',
        hydraulics: '150 L/min',
        pto: '540/1000 RPM',
        fuelTank: '650 Liters',
        warranty: '5 Years',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWsqsKqEqa_h-S_aYAkE4ZqzR1MQd2aRdT1gvRnx9WEOdtnuHtVNLka56bmLI_TE6CYFGjA_uQHZRLo8LVAP0ZlXrdtvHzyYftqpvWTr6CKXSgJnsAjjb_71gvo-Bu-_z-rgFL0BiY1TokeFHiYUzG76huPkqwLZ7ya4TB3v_9ColMS3PzKzFWkqNrqfyU0i_cinEdO3BvQt0xaUaLmmOamOqkO2wQcvCZQ1P-oYknPm4SxdlZlmk0TiVDd69_VrmcgXnS4UKPTJ7C',
    },
    {
        id: 2,
        name: 'Xerion 5000 VC',
        brand: 'Claas Machinery',
        category: 'TRACTOR',
        power: '530 HP',
        efficiency: '14.2 L/h',
        weight: '16,000 kg',
        price: '$320,000',
        engine: '6-Cylinder MTU',
        transmission: 'CVT Infinitely Variable',
        hydraulics: '210 L/min',
        pto: '1000 RPM',
        fuelTank: '900 Liters',
        warranty: '4 Years',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtM8TSKMPgBVKfBrFRv35XUcQxeNHBCocIJr-EhVwMsXpwRhwUfh8cJyAb_jlT3KlL-gTNVeV0UmU686uHIlpl66NlgQc8j2y6cEKwXPEkUMRpxvpQ6NljEMRXJdg2BvModl1ckkJlngdiilgPFQIdLBDuxv2QILSkUIwinzeUFso79NyvpTB4JTb2CHOOWK7Wi5DzLIQfkaqRyRnCmqmDFKoA88uyZOE_7mB9NHLUZ34oThbXIRVjACMbxoUB-EgVCwZECqbl8XnE',
    },
    {
        id: 3,
        name: 'Titan TX-600',
        brand: 'John Deere',
        category: 'TRACTOR',
        power: '460 HP',
        efficiency: '12.5 L/h',
        weight: '9,500 kg',
        price: '$295,000',
        engine: '6-Cylinder Turbo Diesel',
        transmission: '18-Speed AutoPowr',
        hydraulics: '160 L/min',
        pto: '540/1000 RPM',
        fuelTank: '700 Liters',
        warranty: '5 Years',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
    },
];

const specLabels = [
    { key: 'power', label: 'Engine Power', icon: 'bolt' },
    { key: 'efficiency', label: 'Fuel Efficiency', icon: 'local_gas_station' },
    { key: 'weight', label: 'Operating Weight', icon: 'scale' },
    { key: 'engine', label: 'Engine Type', icon: 'settings' },
    { key: 'transmission', label: 'Transmission', icon: 'sync' },
    { key: 'hydraulics', label: 'Hydraulic Flow', icon: 'water_drop' },
    { key: 'pto', label: 'PTO Speed', icon: 'rotate_right' },
    { key: 'fuelTank', label: 'Fuel Tank', icon: 'propane_tank' },
    { key: 'warranty', label: 'Warranty', icon: 'verified' },
    { key: 'price', label: 'Price', icon: 'payments' },
];

export default function ComparePage() {
    const [compareSlots, setCompareSlots] = useState<(typeof allMachinery[0] | null)[]>([
        allMachinery[0],
        allMachinery[1],
        null,
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    const addToSlot = (item: typeof allMachinery[0], slotIndex: number) => {
        const newSlots = [...compareSlots];
        newSlots[slotIndex] = item;
        setCompareSlots(newSlots);
        setShowAddModal(false);
        setActiveSlot(null);
    };

    const removeFromSlot = (index: number) => {
        const newSlots = [...compareSlots];
        newSlots[index] = null;
        setCompareSlots(newSlots);
    };

    const filledSlots = compareSlots.filter(slot => slot !== null);

    return (
        <div className="px-6 pb-12">
            <div className="mx-auto max-w-[1280px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/home/machinery"
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compare Models</h1>
                        </div>
                        <p className="text-gray-500">Compare technical specifications side by side</p>
                    </div>

                    <button
                        onClick={() => setCompareSlots([null, null, null])}
                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                {/* Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {compareSlots.map((slot, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl overflow-hidden border-2 transition-all ${slot
                                    ? 'border-primary/20 bg-white dark:bg-[#1a231a] shadow-lg'
                                    : 'border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                }`}
                        >
                            {slot ? (
                                <>
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromSlot(index)}
                                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>

                                    {/* Image */}
                                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
                                        <img
                                            src={slot.image}
                                            alt={slot.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded mb-2">
                                            {slot.category}
                                        </span>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{slot.name}</h3>
                                        <p className="text-sm text-gray-500">{slot.brand}</p>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setActiveSlot(index);
                                        setShowAddModal(true);
                                    }}
                                    className="w-full h-full min-h-[300px] flex flex-col items-center justify-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl">add</span>
                                    </div>
                                    <p className="text-gray-500 font-medium">Add Model to Compare</p>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Specifications Comparison Table */}
                {filledSlots.length >= 2 && (
                    <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Detailed Specifications
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {specLabels.map((spec) => (
                                <div key={spec.key} className="grid grid-cols-4 items-center">
                                    {/* Label */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-lg">{spec.icon}</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{spec.label}</span>
                                        </div>
                                    </div>

                                    {/* Values */}
                                    {compareSlots.map((slot, idx) => (
                                        <div key={idx} className="p-4 text-center">
                                            {slot ? (
                                                <span className={`font-semibold ${spec.key === 'price' ? 'text-primary text-lg' : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {(slot as any)[spec.key]}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filledSlots.length < 2 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">compare_arrows</span>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Add at least 2 models to compare</h3>
                        <p className="text-gray-500">Select models from the slots above to see detailed comparisons</p>
                    </div>
                )}
            </div>

            {/* Add Model Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />

                    <div className="relative bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a Model</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-500">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 gap-4">
                                {allMachinery.map((item) => {
                                    const isAlreadySelected = compareSlots.some(slot => slot?.id === item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => activeSlot !== null && addToSlot(item, activeSlot)}
                                            disabled={isAlreadySelected}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isAlreadySelected
                                                    ? 'border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5'
                                                }`}
                                        >
                                            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                                <p className="text-sm text-gray-500">{item.brand}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    <span>{item.power}</span>
                                                    <span>•</span>
                                                    <span>{item.efficiency}</span>
                                                </div>
                                            </div>
                                            {isAlreadySelected ? (
                                                <span className="text-sm text-gray-400">Already added</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-primary">add_circle</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
