'use client';

import { useState } from 'react';
import Link from 'next/link';

const grainListings = [
    { id: 1, crop: 'Wheat', variety: 'Sharbati MP', quantity: '50 Quintals', price: '₹2,450/qtl', location: 'Indore, MP', seller: 'Ramesh Patel', rating: 4.5, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop', verified: true },
    { id: 2, crop: 'Rice', variety: 'Basmati 1121', quantity: '100 Quintals', price: '₹3,850/qtl', location: 'Karnal, Haryana', seller: 'Sukhdev Singh', rating: 4.8, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop', verified: true },
    { id: 3, crop: 'Soybean', variety: 'Yellow Grade A', quantity: '30 Quintals', price: '₹4,200/qtl', location: 'Ujjain, MP', seller: 'Kishore Kumar', rating: 4.2, image: 'https://images.unsplash.com/photo-1599666505227-ea9b7d29c7c9?w=300&h=200&fit=crop', verified: false },
    { id: 4, crop: 'Maize', variety: 'Yellow Hybrid', quantity: '75 Quintals', price: '₹2,150/qtl', location: 'Davangere, Karnataka', seller: 'Manjunath Reddy', rating: 4.0, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=200&fit=crop', verified: true },
    { id: 5, crop: 'Jowar', variety: 'Maldandi', quantity: '40 Quintals', price: '₹3,100/qtl', location: 'Solapur, Maharashtra', seller: 'Vitthal Jadhav', rating: 4.3, image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=300&h=200&fit=crop', verified: true },
    { id: 6, crop: 'Bajra', variety: 'HHB 67', quantity: '25 Quintals', price: '₹2,800/qtl', location: 'Jaipur, Rajasthan', seller: 'Mohan Sharma', rating: 3.9, image: 'https://images.unsplash.com/photo-1547987669-2d5f2d7a10c3?w=300&h=200&fit=crop', verified: false },
];

export default function BuyGrainsPage() {
    const [selectedCrop, setSelectedCrop] = useState('All');
    const [priceRange, setPriceRange] = useState('All');

    return (
        <div className="px-6">
            <div className="mx-auto max-w-[1280px]">
                <div className="py-6">
                    <Link
                        href="/v2/crops"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Crops
                    </Link>
                </div>
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Buy Grains & Cereals</h1>
                    <p className="text-gray-500">Browse quality grains directly from farmers. Best prices, verified sellers.</p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['All', 'Wheat', 'Rice', 'Maize', 'Soybean', 'Jowar', 'Bajra'].map((crop) => (
                        <button
                            key={crop}
                            onClick={() => setSelectedCrop(crop)}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedCrop === crop
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {crop}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                    >
                        <option value="All">All Prices</option>
                        <option>Under ₹2,000/qtl</option>
                        <option>₹2,000 - ₹3,000/qtl</option>
                        <option>₹3,000 - ₹4,000/qtl</option>
                        <option>Above ₹4,000/qtl</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>All States</option>
                        <option>Maharashtra</option>
                        <option>Madhya Pradesh</option>
                        <option>Punjab</option>
                        <option>Haryana</option>
                        <option>Karnataka</option>
                    </select>
                    <select className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium">
                        <option>Min Quantity: Any</option>
                        <option>10+ Quintals</option>
                        <option>50+ Quintals</option>
                        <option>100+ Quintals</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Verified Only</span>
                    </label>
                </div>

                {/* Results */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{grainListings.length}</span> listings
                </p>

                {/* Listings Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {grainListings.map((listing) => (
                        <div
                            key={listing.id}
                            className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={listing.image}
                                    alt={listing.crop}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {listing.verified && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        Verified
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{listing.crop}</h3>
                                        <p className="text-sm text-gray-500">{listing.variety}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">{listing.price}</p>
                                        <p className="text-xs text-gray-500">{listing.quantity}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span className="material-symbols-outlined text-lg">location_on</span>
                                    {listing.location}
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-500">person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{listing.seller}</p>
                                            <div className="flex items-center gap-1 text-xs text-amber-500">
                                                <span className="material-symbols-outlined text-sm">star</span>
                                                {listing.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
                                        Contact
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center">
                    <button className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
                        Load More Listings
                    </button>
                </div>
            </div>
        </div>
    );
}
