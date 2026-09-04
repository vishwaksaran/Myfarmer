'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Z } from '@/lib/z-layers';

/** Store subscription for a value that is fixed for the life of the document. */
const neverChanges = () => () => { };

interface MachineryItem {
    id: number;
    name: string;
    category: string;
    specs: string;
    price: string;
    image: string;
    brand?: string;
    hp?: string;
    warranty?: string;
    fuelType?: string;
    [key: string]: unknown;
}

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: MachineryItem[];
}

export default function CompareModal({ isOpen, onClose, items }: CompareModalProps) {
    // Portaled to <body>: page content sits in `<main class="relative z-10">`, which
    // traps any z-index declared here. See @/lib/z-layers.
    const canPortal = useSyncExternalStore(neverChanges, () => true, () => false);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !canPortal) return null;

    const specs = [
        { label: 'Price', key: 'price' },
        { label: 'Category', key: 'category' },
        { label: 'Brand', key: 'brand' },
        { label: 'Horsepower', key: 'hp' },
        { label: 'Fuel Type', key: 'fuelType' },
        { label: 'Warranty', key: 'warranty' },
        { label: 'Specifications', key: 'specs' },
    ];

    return createPortal(
        <div style={{ zIndex: Z.MODAL }} className="fixed inset-0 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90dvh] m-3 sm:m-4 bg-white dark:bg-[#1a231a] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-dark dark:text-white">Compare Models</h2>
                        <p className="text-sm text-gray-500">Side-by-side comparison of selected machinery</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-auto overscroll-contain p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">compare_arrows</span>
                            <p className="text-gray-500">Select items to compare</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-tl-xl font-semibold text-gray-600 dark:text-gray-300 w-40">
                                            Feature
                                        </th>
                                        {items.map((item) => (
                                            <th key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 last:rounded-tr-xl">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div
                                                        className="w-32 h-24 rounded-xl bg-cover bg-center shadow-md"
                                                        style={{ backgroundImage: `url('${item.image}')` }}
                                                    />
                                                    <span className="font-bold text-primary-dark dark:text-white">{item.name}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {specs.map((spec, idx) => (
                                        <tr key={spec.key} className={idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50/50 dark:bg-gray-800/30'}>
                                            <td className="p-4 font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">
                                                {spec.label}
                                            </td>
                                            {items.map((item) => (
                                                <td key={item.id} className="p-4 text-center text-gray-800 dark:text-gray-200">
                                                    {(item as Record<string, string | number | undefined>)[spec.key] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        Request Quote for All
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
