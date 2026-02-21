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
    viewMode?: 'grid' | 'list';
    onCompare?: (id: number) => void;
    selectedForCompare?: number[];
}

export default function MachineryListing({ items, type, viewMode = 'grid', onCompare, selectedForCompare = [] }: MachineryListingProps) {
    const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [quotePhone, setQuotePhone] = useState('');
    const [quoteEmail, setQuoteEmail] = useState('');
    const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});

    const handleQuoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        const digits = quotePhone.replace(/\D/g, '');
        if (!digits) {
            errs.phone = 'Mobile number is required';
        } else if (digits.length !== 10) {
            errs.phone = 'Mobile number must be exactly 10 digits';
        }
        if (quoteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteEmail)) {
            errs.email = 'Enter a valid email address';
        }
        if (Object.keys(errs).length > 0) {
            setQuoteErrors(errs);
            return;
        }
        setQuoteErrors({});
        setSubmitSuccess(true);
    };

    const closeQuoteModal = () => {
        setShowQuoteModal(false);
        setSelectedItem(null);
        setQuotePhone('');
        setQuoteEmail('');
        setQuoteErrors({});
        setTimeout(() => setSubmitSuccess(false), 300);
    };

    return (
        <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item) => {
                        const isSelected = selectedForCompare.includes(item.id);
                        const isDisabled = !isSelected && selectedForCompare.length >= 3;

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
                                <div className="p-4 md:p-5 flex flex-col flex-1">
                                    <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white">{item.name}</h4>
                                    <p className="text-xs md:text-sm text-gray-500 mb-2">{item.specs}</p>

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
                                                    setSubmitSuccess(false);
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">currency_rupee</span>
                                                {type === 'new' ? 'Get Price' : 'Request Quote'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* LIST VIEW */
                <div className="flex flex-col gap-3 md:gap-4">
                    {items.map((item) => {
                        const isSelected = selectedForCompare.includes(item.id);
                        const isDisabled = !isSelected && selectedForCompare.length >= 3;

                        return (
                            <div
                                key={item.id}
                                className="skeuo-card group relative flex flex-row overflow-hidden rounded-xl md:rounded-2xl border border-white/10 hover:shadow-xl transition-all duration-300"
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
                                            className="h-5 w-5 rounded-lg border-white/50 bg-black/20 text-accent focus:ring-0 disabled:cursor-not-allowed"
                                            type="checkbox"
                                        />
                                    </label>
                                )}

                                {/* Image - Left Side */}
                                <div className="relative w-32 md:w-52 shrink-0">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url('${item.image}')` }}
                                    />
                                    {/* Category Badge */}
                                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                                        <span className="inline-block rounded-md bg-primary/90 px-1.5 py-0.5 text-[10px] md:text-xs font-bold text-white">
                                            {item.brand}
                                        </span>
                                        {type === 'used' && item.condition && (
                                            <span className="inline-block rounded-md bg-accent px-1.5 py-0.5 text-[10px] md:text-xs font-bold text-black">
                                                {item.condition}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content - Right Side */}
                                <div className="flex-1 min-w-0 p-3 md:p-5 flex flex-col">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white leading-tight">{item.name}</h4>
                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">{item.specs}</p>

                                        {/* Details - Inline */}
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-xs mt-2">
                                            {item.hp && (
                                                <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                                                    <span className="material-symbols-outlined text-xs md:text-sm">speed</span>
                                                    {item.hp} HP
                                                </div>
                                            )}
                                            {item.warranty && (
                                                <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                                                    <span className="material-symbols-outlined text-xs md:text-sm">verified</span>
                                                    {item.warranty}
                                                </div>
                                            )}
                                            {item.year && (
                                                <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                                                    <span className="material-symbols-outlined text-xs md:text-sm">calendar_month</span>
                                                    {item.year}
                                                </div>
                                            )}
                                            {item.location && (
                                                <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                                                    <span className="material-symbols-outlined text-xs md:text-sm">location_on</span>
                                                    {item.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price and Actions */}
                                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <div className="shrink-0">
                                            <span className="text-[10px] md:text-xs text-gray-500">{type === 'new' ? 'Starting from' : 'Asking Price'}</span>
                                            <p className="text-lg md:text-xl font-bold text-primary leading-tight">{item.price}</p>
                                        </div>
                                        <div className="flex gap-2 sm:ml-auto">
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-primary/10 text-primary text-xs md:text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">info</span>
                                                Details
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowQuoteModal(true);
                                                    setSubmitSuccess(false);
                                                }}
                                                className="flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-primary text-white text-xs md:text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">currency_rupee</span>
                                                {type === 'new' ? 'Get Price' : 'Request Quote'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                                    onClick={() => {
                                        setShowQuoteModal(true);
                                        setSubmitSuccess(false);
                                    }}
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
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeQuoteModal} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {submitSuccess ? 'Success!' : (type === 'new' ? 'Get On-Road Price' : 'Request Quote')}
                                </h3>
                                <button
                                    onClick={closeQuoteModal}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            {!submitSuccess && <p className="text-sm text-gray-500 mt-1">{selectedItem.name}</p>}
                        </div>

                        {submitSuccess ? (
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h4>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Thank you for your interest in {selectedItem.name}.
                                </p>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 mb-6">
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">📞 Our team will contact you soon with the best price</p>
                                </div>
                                <button
                                    onClick={closeQuoteModal}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={quotePhone}
                                        onChange={e => { setQuotePhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setQuoteErrors(prev => { const {phone, ...rest} = prev; return rest; }); }}
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${quoteErrors.phone ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none transition-colors`}
                                        placeholder="7448410198"
                                        maxLength={10}
                                    />
                                    {quoteErrors.phone && <p className="text-red-500 text-xs mt-1">{quoteErrors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={quoteEmail}
                                        onChange={e => { setQuoteEmail(e.target.value); setQuoteErrors(prev => { const {email, ...rest} = prev; return rest; }); }}
                                        className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 ${quoteErrors.email ? 'border-red-400' : 'border-transparent'} focus:border-primary outline-none transition-colors`}
                                        placeholder="john@example.com"
                                    />
                                    {quoteErrors.email && <p className="text-red-500 text-xs mt-1">{quoteErrors.email}</p>}
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
                                    <input type="checkbox" required className="mt-1 rounded border-gray-300" />
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
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
