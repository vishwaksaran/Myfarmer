'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';

const landTypes = ['All', 'Agriculture', 'Farm House', 'Orchard', 'Plantation', 'Irrigated', 'Dry Land'];

const listings = [
    {
        id: 1,
        title: '5 Acres Irrigated Farm Land',
        location: 'Mandya, Karnataka',
        area: '5 Acres',
        price: '₹45,00,000',
        pricePerAcre: '₹9,00,000/acre',
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['Borewell', 'Fencing', 'Road Access'],
        seller: 'Ramesh Kumar',
        postedDate: '2 days ago',
    },
    {
        id: 2,
        title: '10 Acres Dry Land with Mango Trees',
        location: 'Ramanagara, Karnataka',
        area: '10 Acres',
        price: '₹70,00,000',
        pricePerAcre: '₹7,00,000/acre',
        type: 'Orchard',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['Mango Trees', 'Electricity', 'Compound Wall'],
        seller: 'Suresh Gowda',
        postedDate: '5 days ago',
    },
    {
        id: 3,
        title: '3 Acres Farm House Land',
        location: 'Mysore, Karnataka',
        area: '3 Acres',
        price: '₹1,20,00,000',
        pricePerAcre: '₹40,00,000/acre',
        type: 'Farm House',
        image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&h=300&fit=crop',
        verified: false,
        featured: false,
        amenities: ['Farm House', 'Swimming Pool', 'Garden'],
        seller: 'Prakash Reddy',
        postedDate: '1 week ago',
    },
    {
        id: 4,
        title: '8 Acres Coconut Plantation',
        location: 'Hassan, Karnataka',
        area: '8 Acres',
        price: '₹56,00,000',
        pricePerAcre: '₹7,00,000/acre',
        type: 'Plantation',
        image: 'https://images.unsplash.com/photo-1591543620767-582b2e76369e?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['200+ Coconut Trees', 'Borewell', 'Canal Water'],
        seller: 'Mahesh B',
        postedDate: '3 days ago',
    },
    {
        id: 5,
        title: '15 Acres Agriculture Land',
        location: 'Tumkur, Karnataka',
        area: '15 Acres',
        price: '₹90,00,000',
        pricePerAcre: '₹6,00,000/acre',
        type: 'Agriculture',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['Open Well', 'Road Access', 'Electricity'],
        seller: 'Venkatesh N',
        postedDate: '1 day ago',
    },
    {
        id: 6,
        title: '2 Acres Irrigated Land Near Highway',
        location: 'Davangere, Karnataka',
        area: '2 Acres',
        price: '₹24,00,000',
        pricePerAcre: '₹12,00,000/acre',
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['Highway Access', 'Drip Irrigation', 'Power Supply'],
        seller: 'Deepak M',
        postedDate: '4 days ago',
    },
];

export default function BuyLandPage() {
    const [selectedType, setSelectedType] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    const filteredListings = selectedType === 'All'
        ? listings
        : listings.filter(l => l.type === selectedType);

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Buy</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Buy Farm Land
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            Browse verified agricultural land for sale across the country
                        </p>
                    </div>
                    <NearbyLocation />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    {[
                        { label: 'Total Listings', value: '1,200+', icon: 'list_alt', color: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
                        { label: 'Verified Sellers', value: '800+', icon: 'verified_user', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' },
                        { label: 'Districts Covered', value: '150+', icon: 'location_on', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
                        { label: 'Avg Price/Acre', value: '₹8L', icon: 'currency_rupee', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-gray-800 text-center">
                            <div className={`w-8 md:w-10 h-8 md:h-10 mx-auto mb-1.5 md:mb-2 rounded-lg md:rounded-xl ${stat.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-base md:text-lg">{stat.icon}</span>
                            </div>
                            <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] md:text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-2">
                        {landTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                                    selectedType === type
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 md:px-4 py-2 rounded-lg md:rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="area">Area: Largest First</option>
                    </select>
                </div>

                {/* Results Count */}
                <p className="text-xs md:text-sm text-gray-500 mb-4">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{filteredListings.length}</span> listings
                </p>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredListings.map((listing) => (
                        <div key={listing.id} className="group bg-white dark:bg-[#1a231a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            {/* Image */}
                            <div className="relative h-40 md:h-48 overflow-hidden">
                                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                {listing.featured && (
                                    <span className="absolute top-2 md:top-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-amber-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md">
                                        Featured
                                    </span>
                                )}
                                {listing.verified && (
                                    <span className="absolute top-2 md:top-3 right-2 md:right-3 px-2 py-0.5 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-md md:rounded-lg shadow-md flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">verified</span>
                                        Verified
                                    </span>
                                )}
                                <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg">
                                    {listing.type}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3 md:p-5">
                                <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {listing.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 mb-2 md:mb-3">
                                    <span className="material-symbols-outlined text-sm md:text-base">location_on</span>
                                    {listing.location}
                                </div>

                                {/* Details Row */}
                                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm">square_foot</span>
                                        {listing.area}
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        {listing.seller}
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                                    {listing.amenities.map((amenity, i) => (
                                        <span key={i} className="px-1.5 md:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs rounded-md font-medium">
                                            {amenity}
                                        </span>
                                    ))}
                                </div>

                                {/* Price & Action */}
                                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="text-base md:text-xl font-bold text-primary">{listing.price}</p>
                                        <p className="text-[10px] md:text-xs text-gray-500">{listing.pricePerAcre}</p>
                                    </div>
                                    <button className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors">
                                        Contact Seller
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-8 md:mt-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl md:rounded-2xl p-6 md:p-10 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Can&apos;t Find What You&apos;re Looking For?</h2>
                    <p className="text-sm md:text-base text-white/80 mb-4 md:mb-6">Post your requirements and let verified sellers reach out to you</p>
                    <Link href="/home/land/sell" className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white text-green-700 font-bold text-sm md:text-base rounded-lg md:rounded-xl hover:bg-green-50 transition-colors">
                        <span className="material-symbols-outlined text-base md:text-lg">post_add</span>
                        Post Requirement
                    </Link>
                </div>
            </div>
        </div>
    );
}
