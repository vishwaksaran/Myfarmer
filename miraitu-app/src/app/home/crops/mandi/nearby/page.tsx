'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMandiPrices } from '@/lib/useMandiPrices';
import { formatPrice } from '@/lib/mandi-api';

const nearbyMandis = [
    { id: 1, name: 'Pune APMC Market', distance: '12 km', address: 'Market Yard, Gultekdi, Pune', timings: '6:00 AM - 6:00 PM', commodities: ['Onion', 'Potato', 'Tomato', 'Vegetables'], rating: 4.2, market: 'Pune', district: 'Pune' },
    { id: 2, name: 'Pimpri Chinchwad Mandi', distance: '18 km', address: 'Sector 24, PCMC, Pune', timings: '5:00 AM - 5:00 PM', commodities: ['Grains', 'Pulses', 'Vegetables'], rating: 4.0, market: 'Pimpri', district: 'Pune' },
    { id: 3, name: 'Nashik APMC', distance: '145 km', address: 'Satpur, Nashik', timings: '6:00 AM - 7:00 PM', commodities: ['Onion', 'Grapes', 'Tomato'], rating: 4.5, market: 'Nashik', district: 'Nashik' },
    { id: 4, name: 'Solapur Agricultural Market', distance: '230 km', address: 'Market Yard Rd, Solapur', timings: '5:30 AM - 6:00 PM', commodities: ['Jowar', 'Groundnut', 'Cotton'], rating: 3.8, market: 'Solapur', district: 'Solapur' },
    { id: 5, name: 'Kolhapur Mandi', distance: '210 km', address: 'Shivaji Udyam Nagar, Kolhapur', timings: '6:00 AM - 6:30 PM', commodities: ['Sugarcane', 'Jaggery', 'Vegetables'], rating: 4.1, market: 'Kolhapur', district: 'Kolhapur' },
    { id: 6, name: 'Sangli APMC', distance: '225 km', address: 'Market Yard, Sangli', timings: '5:00 AM - 5:00 PM', commodities: ['Turmeric', 'Grapes', 'Raisins'], rating: 4.3, market: 'Sangli', district: 'Sangli' },
];

export default function NearbyMandisPage() {
    const [searchLocation, setSearchLocation] = useState('Pune, Maharashtra');
    const [sortBy, setSortBy] = useState('distance');

    // Fetch Maharashtra market data to enrich nearby mandis with live prices
    const { data: liveData, loading: liveLoading } = useMandiPrices({ state: 'Maharashtra', limit: 100 });

    // Build a map: market name → top commodities with prices
    const marketPrices = useMemo(() => {
        const map: Record<string, { commodity: string; price: string }[]> = {};
        for (const r of liveData) {
            const key = r.market.toLowerCase();
            if (!map[key]) map[key] = [];
            if (map[key].length < 4) {
                map[key].push({ commodity: r.commodity, price: formatPrice(r.modalPrice) });
            }
        }
        return map;
    }, [liveData]);

    const sortedMandis = [...nearbyMandis].sort((a, b) => {
        if (sortBy === 'distance') {
            return parseInt(a.distance) - parseInt(b.distance);
        } else if (sortBy === 'rating') {
            return b.rating - a.rating;
        }
        return 0;
    });

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-6">
                    <Link
                        href="/home/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nearby Mandis</h1>
                    <p className="text-gray-500">Find agricultural markets near your location.</p>
                </div>

                {/* Location Search */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="relative flex-1 min-w-[250px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                        <input
                            type="text"
                            placeholder="Enter your location..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        />
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">my_location</span>
                        Use Current Location
                    </button>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    >
                        <option value="distance">Sort by Distance</option>
                        <option value="rating">Sort by Rating</option>
                    </select>
                </div>

                {/* Results */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{sortedMandis.length}</span> mandis near {searchLocation}
                </p>

                {/* Mandi Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {sortedMandis.map((mandi) => (
                        <div
                            key={mandi.id}
                            className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{mandi.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">location_on</span>
                                        {mandi.address}
                                    </p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {mandi.distance}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4 text-sm">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-lg text-gray-400">schedule</span>
                                    {mandi.timings}
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <span className="material-symbols-outlined text-lg">star</span>
                                    <span className="font-semibold">{mandi.rating}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Main Commodities</p>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const live = marketPrices[mandi.market.toLowerCase()];
                                        if (live && live.length > 0) {
                                            return live.map((c) => (
                                                <span
                                                    key={c.commodity}
                                                    className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-sm text-green-700 dark:text-green-300 font-medium"
                                                >
                                                    {c.commodity} <span className="text-xs opacity-75">{c.price}</span>
                                                </span>
                                            ));
                                        }
                                        return mandi.commodities.map((commodity) => (
                                            <span
                                                key={commodity}
                                                className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300"
                                            >
                                                {commodity}
                                            </span>
                                        ));
                                    })()}
                                </div>
                                {liveLoading && <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />}
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">directions</span>
                                    Get Directions
                                </button>
                                <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg">call</span>
                                    Contact
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map Placeholder */}
                <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-80 flex items-center justify-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-400 mb-3">map</span>
                        <p className="text-gray-500">Interactive map coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
