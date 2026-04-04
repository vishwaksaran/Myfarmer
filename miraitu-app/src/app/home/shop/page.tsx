'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

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

const POPULAR_CITIES = [
    'Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi', 'Pune',
    'Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Warangal',
    'Nagpur', 'Jaipur', 'Lucknow', 'Kolkata', 'Ahmedabad',
    'Coimbatore', 'Madurai', 'Mysore', 'Hubli', 'Belgaum',
];

export default function ShopPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const { quantities, addItem, removeItem } = useCart();
    const [locationInput, setLocationInput] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    const filteredCities = locationInput.trim()
        ? POPULAR_CITIES.filter(city => city.toLowerCase().includes(locationInput.toLowerCase()))
        : POPULAR_CITIES;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/user-login?redirect=/home/shop');
        }
    }, [loading, user, router]);

    const handleSelectCity = (city: string) => {
        setSelectedLocation(city);
        setLocationInput(city);
        setShowLocationDropdown(false);
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d] flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d110d]">
            <Header />

            <main className="py-8">
                <div className="mx-auto max-w-[1280px] px-6">

                    {/* Delivery Location Bar */}
                    <div className="mb-6 flex items-center gap-3 bg-white dark:bg-[#1a231a] rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm" data-no-auth>
                        <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                        <div className="relative flex-1" ref={locationRef}>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Deliver to:</span>
                                <input
                                    type="text"
                                    placeholder="Enter your area, city or pincode..."
                                    value={locationInput}
                                    onChange={(e) => { setLocationInput(e.target.value); setShowLocationDropdown(true); }}
                                    onFocus={() => setShowLocationDropdown(true)}
                                    className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                                />
                                {selectedLocation && (
                                    <button onClick={() => { setSelectedLocation(''); setLocationInput(''); }} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                )}
                            </div>
                            {showLocationDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a231a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {/* Use current location */}
                                    <button
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    async (pos) => {
                                                        try {
                                                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                                                            const data = await res.json();
                                                            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
                                                            handleSelectCity(city);
                                                        } catch { handleSelectCity('Current Location'); }
                                                    },
                                                    () => handleSelectCity('Current Location')
                                                );
                                            }
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary font-bold hover:bg-green-50 dark:hover:bg-green-900/20 border-b border-gray-100 dark:border-gray-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">my_location</span>
                                        Use current location
                                    </button>
                                    {/* City list */}
                                    {filteredCities.length > 0 ? (
                                        <div className="py-1">
                                            <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Popular Cities</p>
                                            {filteredCities.map(city => (
                                                <button
                                                    key={city}
                                                    onClick={() => handleSelectCity(city)}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-gray-400 text-base">location_city</span>
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-sm text-gray-400">
                                            <span className="material-symbols-outlined text-2xl mb-1 block">search_off</span>
                                            No matching city found. You can still type your area.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedLocation && (
                            <span className="hidden md:flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold whitespace-nowrap">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {selectedLocation}
                            </span>
                        )}
                    </div>

                    {/* Hero Banner */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12 mb-10">
                        {/* Decorative dot pattern */}
                        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm text-white font-medium mb-4">
                                🌾 Special Offer
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                Farm Essentials Sale
                            </h1>
                            <p className="text-white/80 text-lg mb-6 max-w-xl">
                                Get up to 40% off on seeds, fertilizers, and farming equipment.
                                {selectedLocation ? ` Delivering to ${selectedLocation}.` : ' Limited time offer!'}
                            </p>
                            <Link href="/home/shop/all" className="inline-block px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg" data-no-auth>
                                Shop Now
                            </Link>
                        </div>
                        {/* Decorative plant SVG */}
                        <div className="absolute right-4 md:right-10 bottom-0 opacity-20 w-40 h-40 md:w-64 md:h-64">
                            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path d="M100 180V100" stroke="white" strokeWidth="6" strokeLinecap="round" />
                                <path d="M100 140C80 140 60 120 60 100C60 80 80 70 100 80" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                                <path d="M100 120C120 120 140 100 140 80C140 60 120 50 100 60" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                                <path d="M100 100C80 100 55 80 55 55C55 35 75 25 100 40" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                                <path d="M100 80C120 75 145 55 145 35C145 15 125 10 100 25" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                                <ellipse cx="85" cy="185" rx="25" ry="5" fill="white" opacity="0.3" />
                            </svg>
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

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {shopCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={category.path}
                                    className="group bg-white dark:bg-[#1a231a] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                                        {category.isMatIcon ? (
                                            <span className="material-symbols-outlined text-3xl text-gray-700 dark:text-gray-300">{category.icon}</span>
                                        ) : (
                                            category.icon
                                        )}
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

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                        {('weight' in product) && (product as any).weight && (
                                            <span className="absolute bottom-2 left-2 px-2.5 py-1 text-[11px] font-extrabold rounded-full backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
                                                {(product as any).weight}
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
                                    <Link href="/home/shop/seeds" className="inline-block px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                                        Explore
                                    </Link>
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
                                    <Link href="/home/machinery" className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                                        View Options
                                    </Link>
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

