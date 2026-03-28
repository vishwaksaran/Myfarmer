'use client';

import { useVendorAuth } from '@/context/VendorAuthContext';

export default function VendorDashboard() {
    const { vendor, shop } = useVendorAuth();

    const stats = [
        { label: 'Total Products', value: '0', icon: 'inventory_2', color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
        { label: 'Active Orders', value: '0', icon: 'receipt_long', color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50' },
        { label: 'Revenue', value: '₹0', icon: 'currency_rupee', color: 'from-green-500 to-emerald-600', bgLight: 'bg-green-50' },
        { label: 'Pending', value: '0', icon: 'pending_actions', color: 'from-red-500 to-rose-600', bgLight: 'bg-red-50' },
    ];

    return (
        <div>
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                    Welcome back, {vendor?.displayName || 'Vendor'} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Here&apos;s what&apos;s happening with <strong>{shop?.name}</strong> today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-150"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`bg-gradient-to-br ${stat.color} size-10 rounded-xl flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white text-xl">{stat.icon}</span>
                            </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: 'add_circle', label: 'Add Product', href: 'products?action=new', color: 'text-green-600 bg-green-50' },
                        { icon: 'local_shipping', label: 'View Orders', href: 'orders', color: 'text-blue-600 bg-blue-50' },
                        { icon: 'warehouse', label: 'Inventory', href: 'inventory', color: 'text-amber-600 bg-amber-50' },
                        { icon: 'analytics', label: 'Analytics', href: 'analytics', color: 'text-indigo-600 bg-indigo-50' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}
                        >
                            <span className="material-symbols-outlined text-2xl">{action.icon}</span>
                            <span className="text-xs font-bold">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Orders (Placeholder) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">receipt_long</span>
                    <p className="text-sm font-medium">No orders yet</p>
                    <p className="text-xs mt-1">Orders will appear here once customers start buying</p>
                </div>
            </div>
        </div>
    );
}
