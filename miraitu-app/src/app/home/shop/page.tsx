'use client';

import Link from 'next/link';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useCart } from '@/context/CartContext';

import { shopCategories, featuredProducts } from './data';

// Deals of the day
const dealsOfTheDay = [
    {
        id: 1,
        name: 'Cotton Seeds Premium Pack',
        price: '₹999',
        originalPrice: '₹1,499',
        discount: '33% OFF',
        image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=200&h=200&fit=crop',
        endsIn: '12:45:30',
    },
    {
        id: 2,
        name: 'Drip Irrigation Kit',
        price: '₹2,499',
        originalPrice: '₹3,999',
        discount: '38% OFF',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
        endsIn: '08:22:15',
    },
    {
        id: 3,
        name: 'Solar Water Pump',
        price: '₹18,999',
        originalPrice: '₹24,999',
        discount: '24% OFF',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&h=200&fit=crop',
        endsIn: '05:10:45',
    },
];

export default function ShopPage() {
    const { quantities, addItem, removeItem } = useCart();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-8">
                <div className="mx-auto max-w-[1280px] px-6">
                    {/* Hero Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12 mb-10">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium mb-4">
                                🌾 Special Offer
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                Farm Essentials Sale
                            </h1>
                            <p className="text-white/80 text-lg mb-6 max-w-xl">
                                Get up to 40% off on seeds, fertilizers, and farming equipment. Limited time offer!
                            </p>
                            <button className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                                Shop Now
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-20">
                            <span className="text-[200px]">🌾</span>
                        </div>
                    </div>

                    {/* Shop By Category */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Shop By Category
                            </h2>
                            <Link href="/home/shop/all" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                                View All
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {shopCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={category.path}
                                    className="group bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                                        {category.icon}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-center text-sm leading-tight">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 text-center mt-1">
                                        {category.count} products
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Deals of the Day */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Deals of the Day
                                </h2>
                                <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                                    <span className="material-symbols-outlined text-lg">timer</span>
                                    Limited Time
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dealsOfTheDay.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex gap-4"
                                >
                                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                                        <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold rounded mb-2">
                                            {deal.discount}
                                        </span>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                            {deal.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-primary">{deal.price}</span>
                                            <span className="text-xs text-gray-400 line-through">{deal.originalPrice}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            Ends in {deal.endsIn}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Featured Products */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Featured Products
                            </h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.badge && (
                                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">
                                                {product.badge}
                                            </span>
                                        )}
                                        <button
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-lg">favorite</span>
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-3">
                                        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 min-h-[40px]">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
                                            <span className="text-xs text-gray-400">({product.reviews})</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                <span className="font-bold text-primary">{product.price}</span>
                                                <span className="text-xs text-gray-400 line-through ml-1">{product.originalPrice}</span>
                                            </div>
                                        </div>
                                        {(quantities[product.id] || 0) > 0 ? (
                                            <div className="w-full mt-3 flex items-center justify-between rounded-lg bg-primary text-white overflow-hidden">
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                                >
                                                    −
                                                </button>
                                                <span className="font-black text-sm">{quantities[product.id]}</span>
                                                <button
                                                    onClick={() => addItem(product.id)}
                                                    className="px-4 py-2 hover:bg-primary-dark transition-colors font-bold text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addItem(product.id)}
                                                className="w-full mt-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Promotional Banners */}
                    <section className="mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 p-6 flex items-center gap-6">
                                <div className="text-5xl">🌱</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                        Organic Seeds Collection
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Premium quality certified organic seeds
                                    </p>
                                    <button className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                                        Explore
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 p-6 flex items-center gap-6">
                                <div className="text-5xl">🚜</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                        Farm Equipment Rentals
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Affordable daily & monthly rentals
                                    </p>
                                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                                        View Options
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Popular Brands */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Popular Brands
                        </h2>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {['Mahindra', 'Tata Rallis', 'Bayer', 'Syngenta', 'UPL', 'IFFCO'].map((brand) => (
                                <div
                                    key={brand}
                                    className="bg-white dark:bg-[#1a231a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{brand}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Why Shop With Us */}
                    <section className="mb-12">
                        <div className="bg-white dark:bg-[#1a231a] rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                                Why Shop With Miraitu?
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { icon: 'verified', title: 'Genuine Products', desc: '100% authentic items' },
                                    { icon: 'local_shipping', title: 'Fast Delivery', desc: 'Pan-India shipping' },
                                    { icon: 'support_agent', title: 'Expert Support', desc: '24/7 farmer helpline' },
                                    { icon: 'payments', title: 'Easy Payments', desc: 'Multiple payment options' },
                                ].map((item) => (
                                    <div key={item.title} className="text-center">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />

        </div>
    );
}

