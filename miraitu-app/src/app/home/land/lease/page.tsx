'use client';

import { useState } from 'react';
import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';

type TabType = 'browse' | 'list';

const leaseListings = [
    {
        id: 1,
        title: '12 Acres Prime Agriculture Land for Lease',
        location: 'Bellary, Karnataka',
        area: '12 Acres',
        leasePrice: '₹60,000/acre/year',
        duration: '5 Years',
        type: 'Agriculture',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['Canal Irrigation', 'Road Access', 'Electricity'],
        owner: 'Basavaraj M',
        postedDate: '1 day ago',
    },
    {
        id: 2,
        title: '6 Acres Paddy Land with Borewell',
        location: 'Shimoga, Karnataka',
        area: '6 Acres',
        leasePrice: '₹50,000/acre/year',
        duration: '3 Years',
        type: 'Irrigated',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
        verified: true,
        featured: false,
        amenities: ['Borewell', 'Paddy Fields', 'Storage Room'],
        owner: 'Nagaraj K',
        postedDate: '3 days ago',
    },
    {
        id: 3,
        title: '20 Acres Dry Land for Long Term Lease',
        location: 'Chitradurga, Karnataka',
        area: '20 Acres',
        leasePrice: '₹30,000/acre/year',
        duration: '10 Years',
        type: 'Dry Land',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
        verified: false,
        featured: false,
        amenities: ['Open Well', 'Fencing', 'Wide Road'],
        owner: 'Siddappa T',
        postedDate: '1 week ago',
    },
    {
        id: 4,
        title: '4 Acres Mango Orchard Lease',
        location: 'Ramanagara, Karnataka',
        area: '4 Acres',
        leasePrice: '₹80,000/acre/year',
        duration: '5 Years',
        type: 'Orchard',
        image: 'https://images.unsplash.com/photo-1591543620767-582b2e76369e?w=400&h=300&fit=crop',
        verified: true,
        featured: true,
        amenities: ['100+ Mango Trees', 'Drip Irrigation', 'Guard Room'],
        owner: 'Rajshekar P',
        postedDate: '2 days ago',
    },
];

export default function LeaseLandPage() {
    const [activeTab, setActiveTab] = useState<TabType>('browse');
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        area: '',
        leasePrice: '',
        duration: '',
        description: '',
        contactName: '',
        contactPhone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your lease listing has been submitted! 🎉');
    };

    return (
        <div className="px-3 md:px-6 pb-8 md:pb-12 py-6 md:py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                    <Link href="/home" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/home/land" className="hover:text-primary transition-colors">Land</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-gray-900 dark:text-white font-semibold">Lease</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Lease Farm Land
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                            Long-term leasing opportunities for productive farming
                        </p>
                    </div>
                    <NearbyLocation />
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                    {[
                        { id: 'browse' as TabType, title: 'Find Land to Lease', icon: 'search', bgColor: 'bg-teal-500' },
                        { id: 'list' as TabType, title: 'List Your Land for Lease', icon: 'add_circle', bgColor: 'bg-emerald-500' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 p-3 md:p-4 rounded-lg md:rounded-2xl font-bold transition-all text-center md:text-left ${
                                activeTab === tab.id
                                    ? `${tab.bgColor} text-white shadow-lg`
                                    : 'bg-white dark:bg-[#1a231a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary/30'
                            }`}
                        >
                            <div className={`w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl mx-auto md:mx-0 flex items-center justify-center ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <span className="material-symbols-outlined text-lg md:text-xl">{tab.icon}</span>
                            </div>
                            <span className="text-xs md:text-sm">{tab.title}</span>
                        </button>
                    ))}
                </div>

                {/* Browse Tab */}
                {activeTab === 'browse' && (
                    <div className="animate-fadeIn">
                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-lg md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-teal-100 dark:border-teal-900/30">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-teal-600 text-xl md:text-2xl mt-0.5">info</span>
                                <div>
                                    <h3 className="text-sm md:text-base font-bold text-teal-800 dark:text-teal-300 mb-1">How Land Leasing Works</h3>
                                    <p className="text-xs md:text-sm text-teal-700/80 dark:text-teal-400/80">
                                        Lease agricultural land for 3-10 years. You get full farming rights with a yearly rental fee. All agreements are registered and legally binding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <p className="text-xs md:text-sm text-gray-500 mb-4">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{leaseListings.length}</span> lease opportunities
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {leaseListings.map((listing) => (
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
                                        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 px-2 py-0.5 md:py-1 bg-teal-600/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-semibold rounded-md md:rounded-lg">
                                            {listing.duration} Lease
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

                                        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-sm">square_foot</span>
                                                {listing.area}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                                {listing.owner}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3 md:mb-4">
                                            {listing.amenities.map((amenity, i) => (
                                                <span key={i} className="px-1.5 md:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs rounded-md font-medium">
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-base md:text-xl font-bold text-primary">{listing.leasePrice}</p>
                                                <p className="text-[10px] md:text-xs text-gray-500">{listing.type}</p>
                                            </div>
                                            <button className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors">
                                                Contact Owner
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* List Your Land Tab */}
                {activeTab === 'list' && (
                    <div className="animate-fadeIn max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a231a] rounded-lg md:rounded-2xl p-4 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold text-primary text-center mb-2">List Your Land for Lease</h2>
                            <p className="text-sm md:text-base text-gray-500 text-center mb-6 md:mb-8">Connect with farmers looking for land to lease</p>

                            <div className="space-y-4 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Land Title</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 10 Acres Paddy Land" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bellary, Karnataka" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Area (Acres)</label>
                                        <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. 10" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lease Price (₹/acre/year)</label>
                                        <input type="text" name="leasePrice" value={formData.leasePrice} onChange={handleChange} placeholder="e.g. 50000" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Lease Duration</label>
                                        <select name="duration" value={formData.duration} onChange={handleChange} className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base">
                                            <option value="">Select Duration</option>
                                            <option>1 Year</option>
                                            <option>2 Years</option>
                                            <option>3 Years</option>
                                            <option>5 Years</option>
                                            <option>10 Years</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe your land, soil type, water sources, current crops..." className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base resize-none" />
                                </div>

                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg md:rounded-2xl p-4 md:p-8 text-center cursor-pointer hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined text-2xl md:text-4xl text-gray-400 mb-1 md:mb-2 block">add_a_photo</span>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium">Upload land photos</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                                        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Full Name" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                    <div>
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                        <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm md:text-base" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-lg rounded-lg md:rounded-xl hover:bg-primary/90 transition-colors shadow-lg flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-lg md:text-xl">publish</span>
                                    Submit Lease Listing
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
