'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice, spreadPercent } from '@/lib/mandi-api';

/* ── Fallback (shown while loading or when API is unavailable) ─── */
const fallbackPrices = [
    { id: 1, crop: 'Wheat', variety: 'Sharbati', mandi: 'Indore Mandi', price: '₹2,450', unit: 'qtl', change: '+2.3%', trend: 'up', arrival: '1,250 qtl' },
    { id: 2, crop: 'Rice', variety: 'Basmati 1121', mandi: 'Karnal Mandi', price: '₹3,850', unit: 'qtl', change: '+1.8%', trend: 'up', arrival: '890 qtl' },
    { id: 3, crop: 'Soybean', variety: 'Yellow', mandi: 'Ujjain Mandi', price: '₹4,200', unit: 'qtl', change: '-0.5%', trend: 'down', arrival: '560 qtl' },
    { id: 4, crop: 'Cotton', variety: 'DCH-32', mandi: 'Rajkot Mandi', price: '₹6,100', unit: 'qtl', change: '+3.1%', trend: 'up', arrival: '780 qtl' },
    { id: 5, crop: 'Maize', variety: 'Hybrid', mandi: 'Davangere Mandi', price: '₹2,150', unit: 'qtl', change: '+0.8%', trend: 'up', arrival: '450 qtl' },
    { id: 6, crop: 'Groundnut', variety: 'Bold', mandi: 'Junagadh Mandi', price: '₹5,800', unit: 'qtl', change: '-1.2%', trend: 'down', arrival: '320 qtl' },
    { id: 7, crop: 'Onion', variety: 'Red', mandi: 'Lasalgaon Mandi', price: '₹3,200', unit: 'qtl', change: '+5.2%', trend: 'up', arrival: '2,100 qtl' },
    { id: 8, crop: 'Potato', variety: 'Jyoti', mandi: 'Agra Mandi', price: '₹1,800', unit: 'qtl', change: '-2.1%', trend: 'down', arrival: '1,800 qtl' },
    { id: 9, crop: 'Tomato', variety: 'Hybrid', mandi: 'Kolar Mandi', price: '₹2,500', unit: 'qtl', change: '+8.5%', trend: 'up', arrival: '950 qtl' },
    { id: 10, crop: 'Chilli', variety: 'Guntur', mandi: 'Guntur Mandi', price: '₹12,500', unit: 'qtl', change: '+1.5%', trend: 'up', arrival: '420 qtl' },
];

export default function MandiPricesPage() {
    const [selectedState, setSelectedState] = useState('All States');
    const [selectedCrop, setSelectedCrop] = useState('All Crops');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: liveData, loading, error, updated, refetch } = useMandiPrices({
        state: selectedState,
        commodity: selectedCrop,
        limit: 50,
    });

    // Map live API data → same shape as UI
    const livePrices = liveData.map((r, idx) => {
        const pct = spreadPercent(r.minPrice, r.maxPrice);
        return {
            id: idx + 1,
            crop: r.commodity,
            variety: r.variety || '—',
            mandi: `${r.market}, ${r.district}`,
            price: formatPrice(r.modalPrice).replace('/qtl', ''),
            unit: 'qtl',
            change: `${pct >= 0 ? '+' : ''}${pct}%`,
            trend: pct >= 0 ? 'up' : 'down',
            arrival: r.arrivalDate
                ? new Date(r.arrivalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                : '—',
        };
    });

    const useFallback = (error || livePrices.length === 0) && !loading;
    const allPrices = useFallback ? fallbackPrices : livePrices;

    // Client-side search filter
    const filteredPrices = allPrices.filter(item => {
        if (searchQuery && !item.crop.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.mandi.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    // Format "Last updated" time
    const lastUpdated = updated
        ? new Date(updated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Today, 2:30 PM IST';

    return (
        <div className="px-4 sm:px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-4 sm:py-6">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Live Mandi Prices</h1>
                        {!useFallback && !loading && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500">
                        {useFallback
                            ? 'Sample commodity prices. Add your free data.gov.in API key for real-time data.'
                            : 'Real-time commodity prices from agricultural markets across India via data.gov.in.'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search crop or mandi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm sm:text-base"
                        />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base min-w-0"
                        >
                            <option>All States</option>
                            <option>Andhra Pradesh</option>
                            <option>Arunachal Pradesh</option>
                            <option>Assam</option>
                            <option>Bihar</option>
                            <option>Chhattisgarh</option>
                            <option>Goa</option>
                            <option>Gujarat</option>
                            <option>Haryana</option>
                            <option>Himachal Pradesh</option>
                            <option>Jharkhand</option>
                            <option>Karnataka</option>
                            <option>Kerala</option>
                            <option>Madhya Pradesh</option>
                            <option>Maharashtra</option>
                            <option>Manipur</option>
                            <option>Meghalaya</option>
                            <option>Mizoram</option>
                            <option>Nagaland</option>
                            <option>Odisha</option>
                            <option>Punjab</option>
                            <option>Rajasthan</option>
                            <option>Sikkim</option>
                            <option>Tamil Nadu</option>
                            <option>Telangana</option>
                            <option>Tripura</option>
                            <option>Uttar Pradesh</option>
                            <option>Uttarakhand</option>
                            <option>West Bengal</option>
                            <option>Andaman and Nicobar Islands</option>
                            <option>Chandigarh</option>
                            <option>Dadra and Nagar Haveli and Daman and Diu</option>
                            <option>Delhi</option>
                            <option>Jammu and Kashmir</option>
                            <option>Ladakh</option>
                            <option>Lakshadweep</option>
                            <option>Puducherry</option>
                        </select>
                        <select
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-sm sm:text-base min-w-0"
                        >
                            <option>All Crops</option>
                            <option>Wheat</option>
                            <option>Rice</option>
                            <option>Soyabean</option>
                            <option>Cotton</option>
                            <option>Maize</option>
                            <option>Onion</option>
                            <option>Tomato</option>
                            <option>Potato</option>
                            <option>Groundnut</option>
                            <option>Mustard</option>
                            <option>Gram</option>
                            <option>Chilli(Green)</option>
                        </select>
                    </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    Last updated: {lastUpdated}
                    <button
                        onClick={refetch}
                        className="ml-2 text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Refresh
                    </button>
                </div>

                {/* Price Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 sm:mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm sm:text-base">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Crop</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide hidden sm:table-cell">Variety</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Mandi</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Price</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Change</th>
                                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide hidden sm:table-cell">Arrival</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4"><div className="h-4 w-20 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right"><div className="h-4 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right"><div className="h-4 w-10 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden sm:table-cell"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredPrices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-sm sm:text-base">
                                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300 mb-2 block">search_off</span>
                                            No prices found. Try different filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPrices.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.crop}</span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{item.variety}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <span className="material-symbols-outlined text-gray-400 text-base sm:text-lg hidden sm:inline">store</span>
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{item.mandi}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{item.price}</span>
                                                <span className="text-gray-500 text-xs sm:text-sm">/{item.unit}</span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                                <span className={`inline-flex items-center gap-0.5 sm:gap-1 font-semibold text-sm sm:text-base ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                    <span className="material-symbols-outlined text-xs sm:text-sm">
                                                        {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                                                    </span>
                                                    {item.change}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-600 dark:text-gray-300 hidden sm:table-cell">{item.arrival}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="p-4 sm:p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl mb-2 sm:mb-3">info</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">About Mandi Prices</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Prices shown are modal prices (most common transaction price) reported by respective Agricultural Produce Market Committees (APMCs) via data.gov.in.
                        </p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <span className="material-symbols-outlined text-emerald-600 text-2xl sm:text-3xl mb-2 sm:mb-3">notifications</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Price Alerts</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Set price alerts for your crops and get notified when prices reach your target. Never miss the best selling opportunity.
                        </p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                        <span className="material-symbols-outlined text-teal-600 text-2xl sm:text-3xl mb-2 sm:mb-3">analytics</span>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Price Trends</h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            View historical price trends and make informed decisions about when to sell your produce.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
