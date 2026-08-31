'use client';

import { useState, useEffect } from 'react';
import MachineryListing from '@/components/v2/machinery/MachineryListing';
import CompareModal from '@/components/v2/machinery/CompareModal';
import CompareSection from '@/components/v2/machinery/CompareSection';
import MachinerySubNav from '@/components/v2/machinery/MachinerySubNav';
import PostMachineryAdButton from '@/components/v2/machinery/PostMachineryAdButton';
import { fetchMachineryListings, type MachineryCard } from '@/lib/machinery-listings';

export default function BuyTractorsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [listings, setListings] = useState<MachineryCard[]>([]);
    const [loading, setLoading] = useState(true);

    // Real ads posted through the tractor sell form. They also appear on the
    // Buy & Sell board under Machinery — same rows, narrowed here to this one
    // subcategory.
    useEffect(() => {
        let cancelled = false;
        fetchMachineryListings('tractors', 'Tractor')
            .then(rows => { if (!cancelled) setListings(rows); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const toggleSelection = (id: number) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const removeFromCompare = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    const compareItems = listings.filter(item => selectedItems.includes(item.id));

    const filteredTractors = selectedCondition === 'All'
        ? listings
        : listings.filter(t => t.condition === selectedCondition);

    return (
        <div className="px-3 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <MachinerySubNav category="tractors" currentAction="buy" />
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Used Tractors</h1>
                    <p className="text-gray-500">Browse verified pre-owned tractors from trusted sellers. Request quotes instantly.</p>
                </div>

                {/* Condition Tabs */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {['All', 'Excellent', 'Good', 'Fair'].map((condition) => (
                        <button
                            key={condition}
                            onClick={() => setSelectedCondition(condition)}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedCondition === condition
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {condition}
                        </button>
                    ))}
                </div>

                {/* Filters Bar */}
                <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>All Brands</option>
                        <option>Mahindra</option>
                        <option>John Deere</option>
                        <option>Swaraj</option>
                        <option>Sonalika</option>
                        <option>Eicher</option>
                        <option>TAFE</option>
                    </select>
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>Year</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                        <option>2020</option>
                        <option>Older</option>
                    </select>
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>Price Range</option>
                        <option>Under ₹3 Lakhs</option>
                        <option>₹3-5 Lakhs</option>
                        <option>₹5-7 Lakhs</option>
                        <option>Above ₹7 Lakhs</option>
                    </select>
                    <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                        <option>Location</option>
                        <option>Maharashtra</option>
                        <option>Karnataka</option>
                        <option>Punjab</option>
                        <option>Tamil Nadu</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="w-full min-w-0 sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base">
                            <option>Recently Added</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Year: Newest</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredTractors.length}</span> used tractors
                    </p>
                </div>

                <CompareSection
                    items={compareItems}
                    onRemove={removeFromCompare}
                    onCompare={() => setShowCompareModal(true)}
                />

                {/* Listing */}
                {loading ? (
                    <div className="py-16 text-center text-sm text-gray-500">Loading listings…</div>
                ) : filteredTractors.length === 0 ? (
                    <div className="py-16 text-center bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800">
                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">agriculture</span>
                        <p className="text-gray-500 font-medium px-6">
                            {listings.length === 0
                                ? 'No listings here yet — be the first to post one.'
                                : `No ${selectedCondition.toLowerCase()} tractors listed right now.`}
                        </p>
                    </div>
                ) : (
                    <MachineryListing
                        items={filteredTractors}
                        type="used"
                        onCompare={toggleSelection}
                        selectedForCompare={selectedItems}
                    />
                )}

                {/* Compare Modal */}
                <CompareModal
                    isOpen={showCompareModal}
                    onClose={() => setShowCompareModal(false)}
                    items={compareItems}
                />

                {/* Selling moved here when the category modal was removed. */}
                <PostMachineryAdButton category="tractors" />
            </div>
        </div>
    );
}

