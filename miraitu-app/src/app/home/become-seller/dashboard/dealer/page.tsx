'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';

const sidebarLinks = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'products', icon: 'inventory_2', label: 'My Products' },
    { id: 'orders', icon: 'shopping_bag', label: 'Orders' },
    { id: 'analytics', icon: 'analytics', label: 'Analytics' },
    { id: 'customers', icon: 'groups', label: 'Customers' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
];

const statsData = [
    { label: 'Total Products', value: '0', icon: 'inventory_2', change: '+0 this week', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-950/20', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Pending Orders', value: '0', icon: 'pending_actions', change: 'No new orders', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-950/20', textColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Revenue', value: '₹0', icon: 'currency_rupee', change: 'Start listing to earn', color: 'bg-green-500', lightBg: 'bg-green-50 dark:bg-green-950/20', textColor: 'text-green-600 dark:text-green-400' },
    { label: 'Customer Enquiries', value: '0', icon: 'forum', change: 'No enquiries yet', color: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-950/20', textColor: 'text-purple-600 dark:text-purple-400' },
];

const quickActions = [
    { icon: 'add_circle', label: 'Add Product', desc: 'List a new product for sale', color: 'from-blue-500 to-indigo-600' },
    { icon: 'local_offer', label: 'Create Offer', desc: 'Set up seasonal discounts', color: 'from-orange-500 to-amber-500' },
    { icon: 'campaign', label: 'Promote', desc: 'Boost your product visibility', color: 'from-purple-500 to-pink-500' },
    { icon: 'support_agent', label: 'Get Support', desc: 'Contact Miraitu support team', color: 'from-green-500 to-emerald-600' },
];

const recentOrders = [
    { id: '#MRT-0000', product: 'No orders yet', status: 'pending', date: '-', amount: '-' },
];

export default function DealerDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9]">
            <div className="fixed top-0 left-0 right-0 z-50 [&>header]:static [&>header]:z-auto">
                <Header />
            </div>

            <div className="flex flex-1 pt-20">
                {/* Mobile Sidebar Toggle */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed bottom-6 left-6 z-50 md:hidden w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">{sidebarOpen ? 'close' : 'menu'}</span>
                </button>

                {/* Sidebar */}
                <aside className={`fixed md:sticky top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white dark:bg-[#1a251a] border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-2xl">store</span>
                            </div>
                            <div>
                                <h2 className="font-black text-sm text-gray-900 dark:text-white">Dealer Dashboard</h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[10px]">schedule</span>Verification Pending
                                </span>
                            </div>
                        </div>
                    </div>
                    <nav className="p-3">
                        {sidebarLinks.map(link => (
                            <button key={link.id} onClick={() => { setActiveTab(link.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold mb-1 transition-all ${activeTab === link.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'}`}>
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
                    <div className="rounded-2xl md:rounded-[2rem] bg-gradient-to-r from-blue-500 to-indigo-600 p-5 md:p-8 text-white mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">waving_hand</span>Welcome back
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black mb-2">Your Dealer Dashboard</h1>
                            <p className="text-sm md:text-base text-white/80 mb-4 max-w-xl">Your application is being reviewed. Once verified, you can start listing products and receiving orders. Typical verification takes 24-48 hours.</p>
                            <div className="flex flex-wrap gap-2">
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all">
                                    <span className="material-symbols-outlined text-lg">add_circle</span>Add First Product
                                </button>
                                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl font-bold text-sm border border-white/30 hover:bg-white/25 transition-all">
                                    <span className="material-symbols-outlined text-lg">help</span>Setup Guide
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

                    {/* Recent Orders / Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white">Recent Orders</h3>
                                <button className="text-xs font-bold text-blue-500 hover:text-blue-600">View All</button>
                            </div>
                            <div className="p-6 md:p-10 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">shopping_cart</span>
                                <p className="text-sm font-bold text-gray-400">No orders yet</p>
                                <p className="text-xs text-gray-400 mt-1">Start by listing your products</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a251a] rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="font-black text-sm text-gray-900 dark:text-white">Performance</h3>
                                <span className="text-xs font-bold text-gray-400">Last 30 days</span>
                            </div>
                            <div className="p-5">
                                <div className="space-y-4">
                                    {[
                                        { label: 'Profile Views', value: 0, max: 100, color: 'bg-blue-500' },
                                        { label: 'Product Clicks', value: 0, max: 100, color: 'bg-green-500' },
                                        { label: 'Enquiries', value: 0, max: 50, color: 'bg-purple-500' },
                                        { label: 'Conversion Rate', value: 0, max: 100, color: 'bg-amber-500' },
                                    ].map(item => (
                                        <div key={item.label}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-gray-500">{item.label}</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{item.value}{item.label === 'Conversion Rate' ? '%' : ''}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${(item.value / item.max) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Helpful Tips */}
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl md:rounded-2xl p-5 md:p-6 border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-black text-sm text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">tips_and_updates</span>Getting Started Tips
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: 'camera_alt', tip: 'Add high-quality product photos for 3x more enquiries' },
                                { icon: 'edit_note', tip: 'Write detailed descriptions with specs and pricing' },
                                { icon: 'verified', tip: 'Complete verification to get a trusted seller badge' },
                                { icon: 'schedule', tip: 'Respond to enquiries within 1 hour for better ranking' },
                            ].map(item => (
                                <div key={item.tip} className="flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">{item.icon}</span>
                                    <p className="text-xs text-blue-700 dark:text-blue-300/80 leading-relaxed">{item.tip}</p>
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
