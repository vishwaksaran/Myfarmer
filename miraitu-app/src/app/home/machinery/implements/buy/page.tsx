'use client';

import { useEffect, useState } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';
import PostMachineryAdButton from '@/components/v2/machinery/PostMachineryAdButton';
import { fetchMachineryListings, type MachineryCard } from '@/lib/machinery-listings';

export default function BuyImplementsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [listings, setListings] = useState<MachineryCard[]>([]);
    const [loading, setLoading] = useState(true);

    // Real ads posted through this category's sell form. They also appear
    // on the Buy & Sell board under Machinery — same rows, narrowed here to
    // this one subcategory.
    useEffect(() => {
        let cancelled = false;
        fetchMachineryListings('implements', 'Implement')
            .then(rows => { if (!cancelled) setListings(rows); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeFromCompare = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const compareItems = listings.filter(item => selectedItems.includes(item.id));

    return (
        <div className="px-3 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="implements" currentAction="buy" />
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Implements</h1>
                    <p className="text-gray-500">Browse verified pre-owned farming implements from trusted sellers.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>All Types</option>
                        <option>Rotavator</option>
                        <option>Disc Harrow</option>
                        <option>Cultivator</option>
                        <option>Plough</option>
                    </select>
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>Condition</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Fair</option>
                    </select>
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>Price Range</option>
                        <option>Under ₹20,000</option>
                        <option>₹20,000 - ₹40,000</option>
                        <option>Above ₹40,000</option>
                    </select>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                {loading ? (
                    <div className="py-16 text-center text-sm text-gray-500">Loading listings…</div>
                ) : listings.length === 0 ? (
                    <div className="py-16 text-center bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">agriculture</span>
                        <p className="text-gray-500 font-medium px-6">No listings here yet — be the first to post one.</p>
                    </div>
                ) : (
                    <MachineryListing
                        items={listings}
                        type="used"
                        onCompare={toggleSelection}
                        selectedForCompare={selectedItems}
                    />
                )}

                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />

                {/* Selling moved here when the category modal was removed. */}
                <PostMachineryAdButton category="implements" />
            </div>
        </div>
    );
}

