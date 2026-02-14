'use client';

import Link from 'next/link';

const shopCategories = [
    {
        name: 'Organic Products',
        icon: 'eco',
        desc: 'Certified organic inputs',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        image: 'https://images.unsplash.com/photo-1594488517510-77a837d995cb?w=400&h=300&fit=crop'
    },
    {
        name: 'Fertilizers',
        icon: 'compost',
        desc: 'Boost crop yield',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&h=300&fit=crop'
    },
    {
        name: 'Pesticides',
        icon: 'pest_control',
        desc: 'Crop protection solutions',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        image: 'https://images.unsplash.com/photo-1595116701754-c9636e8af7a6?w=400&h=300&fit=crop'
    },
    {
        name: 'Seeds & More',
        icon: 'grass',
        desc: 'High-quality seeds',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        image: 'https://images.unsplash.com/photo-1593305841991-05c297365073?w=400&h=300&fit=crop'
    }
];

export default function ShopSection() {
    return (
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-[#0d120d] relative overflow-hidden">
            <div className="mx-auto max-w-[1400px] px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-sm">storefront</span>
                            Agri Store
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-[#121811] dark:text-[#f9fbf9] tracking-tight">
                            Shop for Your Farm
                        </h2>
                        <p className="text-gray-500 mt-2 text-lg max-w-xl">
                            Quality seeds, fertilizers, organic products, and everything your farm needs delivered to your doorstep.
                        </p>
                    </div>

                    <Link
                        href="/home/shop"
                        className="hidden md:flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all"
                    >
                        Visit Store <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {shopCategories.map((item, index) => (
                        <Link
                            href="/home/shop"
                            key={index}
                            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 aspect-[4/5] flex flex-col justify-end"
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            </div>

                            <div className="relative p-4 md:p-6 text-white pb-5 md:pb-8">
                                <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 md:mb-4 text-white border border-white/30">
                                    <span className="material-symbols-outlined text-lg md:text-2xl">{item.icon}</span>
                                </div>
                                <h3 className="text-sm md:text-xl font-bold mb-0.5 md:mb-1 group-hover:text-green-300 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-white/80 text-[11px] md:text-sm font-medium md:mb-4">
                                    {item.desc}
                                </p>
                                <div className="hidden md:flex items-center text-sm font-bold text-green-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Shop Now <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 md:hidden">
                    <Link
                        href="/home/shop"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none"
                    >
                        Go to Shop <span className="material-symbols-outlined">shopping_bag</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
