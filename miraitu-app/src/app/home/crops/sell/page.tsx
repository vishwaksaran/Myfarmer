'use client';

import Link from 'next/link';

const cropTypes = [
    { name: 'Grains & Cereals', icon: 'grain', examples: 'Wheat, Rice, Maize, Jowar, Bajra' },
    { name: 'Pulses & Legumes', icon: 'spa', examples: 'Chana, Moong, Urad, Toor, Masoor' },
    { name: 'Vegetables', icon: 'eco', examples: 'Onion, Potato, Tomato, Cauliflower' },
    { name: 'Fruits', icon: 'nutrition', examples: 'Mango, Banana, Grapes, Orange, Pomegranate' },
    { name: 'Oilseeds', icon: 'water_drop', examples: 'Soybean, Groundnut, Mustard, Sunflower' },
    { name: 'Spices', icon: 'local_fire_department', examples: 'Turmeric, Chilli, Coriander, Cumin' },
];

const benefits = [
    { icon: 'handshake', title: 'No Middlemen', desc: 'Connect directly with buyers and get better prices for your produce' },
    { icon: 'verified', title: 'Verified Buyers', desc: '8,000+ verified buyers actively looking for quality farm produce' },
    { icon: 'trending_up', title: 'Best Prices', desc: 'Earn 10–15% more than mandi rates with direct-to-buyer selling' },
    { icon: 'speed', title: 'Quick Listing', desc: 'Create your produce listing in under 5 minutes and start receiving offers' },
];

export default function SellCropsPage() {
    return (
        <div className="px-3 md:px-6">
            <div className="mx-auto max-w-[1280px]">
                {/* Page Header */}
                <div className="mb-6 md:mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                        Sell <span className="text-primary">Crops</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 max-w-2xl">
                        List your harvest and connect with buyers directly. No middlemen, better prices.
                    </p>
                </div>

                {/* Primary CTA — List Your Produce */}
                <Link
                    href="/home/crops/sell/list"
                    className="group flex items-center gap-4 p-5 md:p-8 mb-6 md:mb-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all hover:shadow-xl"
                >
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg md:text-xl font-bold mb-0.5">List Your Produce</h2>
                        <p className="text-white/80 text-sm md:text-base">Create a new listing and start getting buyer enquiries</p>
                    </div>
                    <span className="material-symbols-outlined text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 text-2xl">arrow_forward</span>
                </Link>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
                    {benefits.map((b) => (
                        <div key={b.title} className="p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-1">{b.title}</h3>
                            <p className="text-xs md:text-sm text-gray-500 leading-snug">{b.desc}</p>
                        </div>
                    ))}
                </div>

                {/* What You Can Sell */}
                <div className="mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">What you can sell</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        {cropTypes.map((crop) => (
                            <div
                                key={crop.name}
                                className="p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            >
                                <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{crop.icon}</span>
                                <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white">{crop.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{crop.examples}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">12,500+</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Active Listings</p>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">8,000+</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Verified Buyers</p>
                    </div>
                    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-2xl md:text-3xl font-bold text-primary">15%</p>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Better Prices Avg.</p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { step: '1', icon: 'edit_note', title: 'Create Listing', desc: 'Add your crop details, quantity, photos and expected price' },
                            { step: '2', icon: 'notifications_active', title: 'Get Enquiries', desc: 'Verified buyers will contact you with offers' },
                            { step: '3', icon: 'payments', title: 'Sell & Earn', desc: 'Negotiate, finalize the deal and get paid directly' },
                        ].map((s) => (
                            <div key={s.step} className="flex items-start gap-4 p-4 md:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-bold">{s.step}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{s.title}</h3>
                                    <p className="text-sm text-gray-500">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white text-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Ready to sell your harvest?</h2>
                    <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">Create your first listing in under 5 minutes</p>
                    <Link
                        href="/home/crops/sell/list"
                        className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-primary rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                        Create Listing
                    </Link>
                </div>
            </div>
        </div>
    );
}
