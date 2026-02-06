'use client';

import { useState } from 'react';

interface MachineryItem {
    id: number;
    name: string;
    category: string;
    specs: string;
    price: string;
    image: string;
    brand: string;
    hp?: string;
    warranty?: string;
    year?: string;
    location?: string;
    condition?: string;
    [key: string]: string | number | boolean | undefined;
}

interface MachineryListingProps {
    items: MachineryItem[];
    type: 'new' | 'used';
    onCompare?: (id: number) => void;
    selectedForCompare?: number[];
}

export default function MachineryListing({ items, type, onCompare, selectedForCompare = [] }: MachineryListingProps) {
    const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                    const isSelected = selectedForCompare.includes(item.id);
                    const isDisabled = !isSelected && selectedForCompare.length >= 2;

                    return (
                        <div
                            key={item.id}
                            className="skeuo-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 hover:shadow-xl transition-all duration-300"
                        >
                            {/* Compare Checkbox */}
                            {onCompare && (
                                <label
                                    className={`absolute right-3 top-3 z-10 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                >
                                    <input
                                        checked={isSelected}
                                        onChange={() => onCompare(item.id)}
                                        disabled={isDisabled}
                                        className="h-6 w-6 rounded-lg border-white/50 bg-black/20 text-accent focus:ring-0 disabled:cursor-not-allowed"
                                        type="checkbox"
                                    />
                                </label>
                            )}

                            {/* Category Badge */}
                            <div className="absolute left-3 top-3 z-10 flex gap-2">
                                <span className="inline-block rounded-lg bg-primary/90 px-2 py-1 text-xs font-bold text-white">
                                    {item.brand}
                                </span>
                                {type === 'used' && item.condition && (
                                    <span className="inline-block rounded-lg bg-accent px-2 py-1 text-xs font-bold text-black">
                                        {item.condition}
                                    </span>
                                )}
                            </div>

                            {/* Image */}
                            <div
                                className="aspect-[4/3] w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                style={{ backgroundImage: `url('${item.image}')` }}
                            />

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h4>
                                <p className="text-sm text-gray-500 mb-2">{item.specs}</p>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                    {item.hp && (
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">speed</span>
                                            {item.hp} HP
                                        </div>
                                    )}
                                    {item.warranty && (
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            {item.warranty}
                                        </div>
                                    )}
                                    {item.year && (
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                                            {item.year}
                                        </div>
                                    )}
                                    {item.location && (
                                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 col-span-2">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {item.location}
                                        </div>
                                    )}
                                </div>

                                {/* Price and Actions */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="text-xs text-gray-500">{type === 'new' ? 'Starting from' : 'Asking Price'}</span>
                                            <p className="text-xl font-bold text-primary">{item.price}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">info</span>
                                            Details
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowQuoteModal(true);
                                            }}
                                            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">request_quote</span>
                                            {type === 'new' ? 'Get Price' : 'Request Quote'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Details Modal */}
            {selectedItem && !showQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="relative h-64">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${selectedItem.image}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-white">close</span>
                            </button>
                            <div className="absolute bottom-4 left-6 right-6">
                                <span className="inline-block rounded-lg bg-primary px-3 py-1 text-sm font-bold text-white mb-2">
                                    {selectedItem.brand}
                                </span>
                                <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                    <span className="text-sm text-gray-500">Price</span>
                                    <p className="text-xl font-bold text-primary">{selectedItem.price}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                                    <span className="text-sm text-gray-500">{selectedItem.hp ? 'Horsepower' : 'Warranty'}</span>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {selectedItem.hp ? `${selectedItem.hp} HP` : selectedItem.warranty || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Specifications</h4>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedItem.specs}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowQuoteModal(true)}
                                    className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
                                >
                                    {type === 'new' ? 'Get On-Road Price' : 'Request Quote'}
                                </button>
                                <button className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote/Price Modal */}
            {showQuoteModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowQuoteModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {type === 'new' ? 'Get On-Road Price' : 'Request Quote'}
                                </h3>
                                <button
                                    onClick={() => setShowQuoteModal(false)}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{selectedItem.name}</p>
                        </div>

                        <form className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number *</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                    placeholder="+91 9876543210"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none">
                                        <option>Select State</option>
                                        <option>Maharashtra</option>
                                        <option>Karnataka</option>
                                        <option>Punjab</option>
                                        <option>Uttar Pradesh</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District *</label>
                                    <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none appearance-none">
                                        <option>Select District</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-2">
                                <input type="checkbox" className="mt-1 rounded border-gray-300" />
                                <span className="text-xs text-gray-500">
                                    I agree that by clicking Get Price, I am explicitly soliciting a call from Miraitu or its partners.
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition-colors"
                            >
                                {type === 'new' ? 'Get Price' : 'Request Quote'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
