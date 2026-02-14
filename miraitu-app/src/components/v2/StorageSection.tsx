'use client';

import Link from 'next/link';

const storageServices = [
    {
        name: 'Cold Storage',
        icon: 'ac_unit',
        desc: 'Climate-controlled storage for perishables',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/services/storage-godown',
        badge: 'Popular'
    },
    {
        name: 'Dry Godowns',
        icon: 'warehouse',
        desc: 'Secure storage for grains & heavy goods',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/services/storage-godown',
        badge: ''
    },
    {
        name: 'Grain Silos',
        icon: 'archive',
        desc: 'Bulk storage solutions for harvest',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/services/storage-godown',
        badge: ''
    },
    {
        name: 'Warehouse Leasing',
        icon: 'real_estate_agent',
        desc: 'Rent spaces for long-term storage',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        href: '/home/services/storage-godown',
        badge: 'New'
    }
];

export default function StorageSection() {
    return (
        <section className="py-12 md:py-16 bg-white dark:bg-[#121811] relative overflow-hidden border-t border-gray-100 dark:border-gray-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#0891b2 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            Storage Solutions
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            Cold Storage & Godowns
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            Find verify local storage facilities to keep your produce fresh and secure until you get the best price.
                        </p>
                    </div>

                    <Link
                        href="/home/services/storage-godown"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        View All Facilities <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {storageServices.map((service, index) => (
                        <Link
                            href={service.href}
                            key={index}
                            className="group relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a231a] hover:bg-white dark:hover:bg-[#222d21] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {service.badge && (
                                <div className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-white dark:bg-black/20 text-gray-500 border border-gray-200 dark:border-gray-700">
                                    {service.badge}
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined text-3xl ${service.color}`}>
                                    {service.icon}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {service.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                {service.desc}
                            </p>

                            <div className="mt-4 flex items-center text-xs font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                                Check Availability <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <Link
                        href="/home/services/storage-godown"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                    >
                        Find Storage Nearby <span className="material-symbols-outlined">search</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
