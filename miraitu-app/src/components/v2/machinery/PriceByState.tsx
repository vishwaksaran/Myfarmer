'use client';

import { useState } from 'react';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal',
];

// State-wise tax multiplier (RTO + road tax varies by state)
const STATE_TAX_RATES: Record<string, { rto: number; insurance: number; handling: number }> = {
    'Andhra Pradesh': { rto: 0.06, insurance: 0.03, handling: 8000 },
    'Bihar': { rto: 0.05, insurance: 0.03, handling: 6000 },
    'Chhattisgarh': { rto: 0.05, insurance: 0.03, handling: 7000 },
    'Gujarat': { rto: 0.06, insurance: 0.03, handling: 9000 },
    'Haryana': { rto: 0.05, insurance: 0.03, handling: 7500 },
    'Jharkhand': { rto: 0.05, insurance: 0.03, handling: 6500 },
    'Karnataka': { rto: 0.07, insurance: 0.03, handling: 9000 },
    'Kerala': { rto: 0.08, insurance: 0.03, handling: 10000 },
    'Madhya Pradesh': { rto: 0.06, insurance: 0.03, handling: 7000 },
    'Maharashtra': { rto: 0.07, insurance: 0.03, handling: 10000 },
    'Odisha': { rto: 0.05, insurance: 0.03, handling: 6500 },
    'Punjab': { rto: 0.05, insurance: 0.03, handling: 7000 },
    'Rajasthan': { rto: 0.06, insurance: 0.03, handling: 8000 },
    'Tamil Nadu': { rto: 0.07, insurance: 0.03, handling: 9500 },
    'Telangana': { rto: 0.06, insurance: 0.03, handling: 8500 },
    'Uttar Pradesh': { rto: 0.05, insurance: 0.03, handling: 7000 },
    'West Bengal': { rto: 0.06, insurance: 0.03, handling: 8000 },
};

function parsePrice(price: string): number {
    return parseInt(price.replace(/[₹,\s]/g, ''), 10) || 0;
}

function formatINR(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
}

interface PriceByStateProps {
    basePrice: string;
    modelName: string;
    onClose: () => void;
}

export default function PriceByState({ basePrice, modelName, onClose }: PriceByStateProps) {
    const [selectedState, setSelectedState] = useState('');
    const exShowroom = parsePrice(basePrice);

    const rates = selectedState ? STATE_TAX_RATES[selectedState] : null;
    const rtoAmount = rates ? Math.round(exShowroom * rates.rto) : 0;
    const insuranceAmount = rates ? Math.round(exShowroom * rates.insurance) : 0;
    const handlingAmount = rates?.handling || 0;
    const onRoadPrice = exShowroom + rtoAmount + insuranceAmount + handlingAmount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1a231a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-emerald-600 p-5 text-white">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold">On-Road Price</h3>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                    <p className="text-sm text-white/80">{modelName}</p>
                </div>

                <div className="p-5">
                    {/* State Selector */}
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select your state
                    </label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white mb-5 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">Choose State...</option>
                        {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Price Breakdown */}
                    {selectedState ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ex-Showroom Price</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatINR(exShowroom)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">RTO & Registration</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">+ {formatINR(rtoAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Insurance (1 Year)</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">+ {formatINR(insuranceAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Handling & Logistics</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">+ {formatINR(handlingAmount)}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                                <span className="font-bold text-gray-900 dark:text-white">Estimated On-Road Price</span>
                                <span className="font-bold text-lg text-primary">{formatINR(onRoadPrice)}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                * Prices are approximate and may vary by dealer. Contact your nearest dealer for exact on-road price.
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 block">location_on</span>
                            <p className="text-sm">Select a state to see the estimated on-road price</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
