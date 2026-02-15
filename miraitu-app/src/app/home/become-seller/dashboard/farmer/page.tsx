'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';

const sidebarLinks = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'listings', icon: 'storefront', label: 'My Listings' },
    { id: 'buyers', icon: 'person_search', label: 'Buyer Requests' },
    { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
    { id: 'harvest', icon: 'grass', label: 'Harvest Calendar' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
];

const statsData = [
    { label: 'Active Listings', value: '0', icon: 'storefront', change: 'List your produce', color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-950/20', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Buyer Connections', value: '0', icon: 'handshake', change: 'No buyers yet', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-950/20', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Earnings', value: '₹0', icon: 'currency_rupee', change: 'Start selling to earn', color: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/20', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Farm Rating', value: '-', icon: 'star', change: 'Complete first sale', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-950/20', textColor: 'text-amber-600 dark:text-amber-400' },
];

const quickActions = [
    { icon: 'add_circle', label: 'List Produce', desc: 'Add crops, vegetables, or fruits', color: 'from-green-500 to-emerald-600' },
    { icon: 'pets', label: 'List Livestock', desc: 'Add cattle, goats, or poultry', color: 'from-amber-500 to-orange-500' },
    { icon: 'eco', label: 'Organic Badge', desc: 'Apply for organic certification', color: 'from-lime-500 to-green-500' },
    { icon: 'local_shipping', label: 'Delivery Setup', desc: 'Configure delivery options', color: 'from-blue-500 to-cyan-500' },
];

const cropSeasons = [
    { crop: 'Rice (Kharif)', sow: 'Jun-Jul', harvest: 'Oct-Nov', icon: '🌾', status: 'upcoming' },
    { crop: 'Wheat (Rabi)', sow: 'Nov-Dec', harvest: 'Mar-Apr', icon: '🌿', status: 'active' },
    { crop: 'Cotton', sow: 'Apr-May', harvest: 'Oct-Dec', icon: '🏵️', status: 'upcoming' },
    { crop: 'Sugarcane', sow: 'Feb-Mar', harvest: 'Jan-Mar', icon: '🎋', status: 'upcoming' },
];

export default function FarmerDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            <div className="fixed top-0 left-0 right-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
            </div>

            <div className="flex flex-1 pt-20">
                {/* Mobile Sidebar Toggle */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed bottom-6 left-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{sidebarOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Sidebar */}
                <aside className={`fixed md:sticky top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-[#1a251a] border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-2xl">agriculture</span>
                            </div>
                            <div>
                                <h2 className="font-black text-sm text-gray-900 dark:text-white">Farmer Dashboard</h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[10px]">schedule</span>Verification Pending
                                </span>
                            </div>
                        </div>
                    </div>
                    <nav className="p-3">
                        {sidebarLinks.map(link => (
                            <button key={link.id} onClick={() => { setActiveTab(link.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold mb-1 transition-all ${activeTab === link.id ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                <span className="material-symbols-outlined text-xl">{link.icon}</span>{link.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 mt-auto">
                        <Link href="/home/become-seller" className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>Back to Seller Page
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-green-500 to-emerald-600 p-5 md:p-8 text-white mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">waving_hand</span>Namaskaram, Farmer!
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-2">Your Farmer Dashboard 🌾</h1>
                            <p className="text-sm md:text-base text-white/80 mb-4 max-w-xl">Your application is being reviewed. Once verified, you can list your crops, livestock, and organic produce directly to buyers. Zero commission on first 3 months!</p>
                            <div className="flex flex-wrap gap-2">
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>List First Produce
                                </button>
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl font-bold text-sm border border-white/30 hover:bg-white/25 transition-all">
                                    <span className="material-symbols-outlined text-lg">play_circle</span>Watch Tutorial
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                        {statsData.map(stat => (
                            <div key={stat.label} className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${stat.lightBg} rounded-xl flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined ${stat.textColor} text-xl`}>{stat.icon}</span>
                                    </div>
                                </div>
                                <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">{stat.label}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{stat.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {quickActions.map(action => (
                                <button key={action.label} className="group bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800 text-left hover:shadow-lg hover:-translate-y-1 transition-all">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <span className="material-symbols-outlined text-white text-xl">{action.icon}</span>
                                    </div>
                                    <p className="font-black text-sm text-gray-900 dark:text-white">{action.label}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{action.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listings + Harvest Calendar side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white">My Listings</h3>
                                <button className="text-xs font-bold text-green-500 hover:text-green-600">Add New</button>
                            </div>
                            <div className="p-6 md:p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">inventory_2</span>
                                <p className="text-sm font-bold text-gray-400">No listings yet</p>
                                <p className="text-xs text-gray-400 mt-1">List your crops, vegetables, or livestock to start selling</p>
                                <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                                    <span className="material-symbols-outlined text-sm">add</span>Create First Listing
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white">🗓 Harvest Calendar</h3>
                                <span className="text-xs font-bold text-gray-400">Season Guide</span>
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {cropSeasons.map(item => (
                                        <div key={item.crop} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.crop}</p>
                                                <p className="text-[10px] text-gray-400">Sow: {item.sow} → Harvest: {item.harvest}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                                {item.status === 'active' ? 'Active' : 'Upcoming'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Mandi Prices */}
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl md:rounded-2xl p-5 md:p-6 border border-green-100 dark:border-green-900/30">
                        <h3 className="font-black text-sm text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">monitoring</span>Today&apos;s Mandi Prices (Indicative)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { crop: 'Rice', price: '₹2,150/qtl', trend: 'up' },
                                { crop: 'Wheat', price: '₹2,275/qtl', trend: 'up' },
                                { crop: 'Cotton', price: '₹6,800/qtl', trend: 'down' },
                                { crop: 'Soybean', price: '₹4,500/qtl', trend: 'up' },
                            ].map(item => (
                                <div key={item.crop} className="bg-white dark:bg-[#1a251a] rounded-xl p-3 text-center">
                                    <p className="text-xs font-bold text-gray-400">{item.crop}</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{item.price}</p>
                                    <span className={`material-symbols-outlined text-sm ${item.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>{item.trend === 'up' ? 'trending_up' : 'trending_down'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
