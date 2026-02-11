'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SemenFinderPage() {
    const [species, setSpecies] = useState('Cow');
    const [breed, setBreed] = useState('');
    const [location, setLocation] = useState('');

    const breeds: Record<string, string[]> = {
        'Cow': ['Jersey', 'Holstein Friesian', 'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar'],
        'Buffalo': ['Murrah', 'Surti', 'Jaffrabadi', 'Mehsana', 'Nili-Ravi'],
        'Goat': ['Boer', 'Beetal', 'Jamnapari', 'Sirohi', 'Osmanabadi'],
        'Sheep': ['Merino', 'Rambouillet', 'Suffolk', 'Dorset', 'Corriedale']
    };

    return (
        <div className="px-6 py-8">
            <div className="mx-auto max-w-[1280px]">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-4 border border-blue-200 shadow-sm">
                        Advanced Genetics
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                        Find Premium <span className="text-primary relative inline-block">
                            Semen
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-10 rounded-full"></span>
                        </span> for Your Breed
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Improve your herd's genetics with high-quality semen from top-rated breeders and government centers.
                    </p>
                </div>

                {/* Finder Card */}
                <div className="max-w-4xl mx-auto bg-white dark:bg-[#121811] rounded-[2.5rem] p-8 md:p-12 border border-blue-100 dark:border-blue-900 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-64 bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-end">
                        {/* Species Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Species</label>
                            <div className="skeuo-inset rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700">
                                <select
                                    value={species}
                                    onChange={(e) => {
                                        setSpecies(e.target.value);
                                        setBreed('');
                                    }}
                                    className="w-full bg-transparent border-none text-gray-900 dark:text-white font-bold focus:ring-0 cursor-pointer"
                                >
                                    {Object.keys(breeds).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Breed Select */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Select Breed</label>
                            <div className="skeuo-inset rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700">
                                <select
                                    value={breed}
                                    onChange={(e) => setBreed(e.target.value)}
                                    className="w-full bg-transparent border-none text-gray-900 dark:text-white font-bold focus:ring-0 cursor-pointer"
                                    disabled={!species}
                                >
                                    <option value="">Select Breed</option>
                                    {species && breeds[species]?.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button className="h-[52px] rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">search</span>
                            Find Now
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 justify-center">
                        <span className="text-sm font-medium text-gray-500 mr-2 self-center">Popular:</span>
                        {['High Milk Yield', 'Disease Resistant', 'Fast Growth', 'Climate Resilient'].map(tag => (
                            <button key={tag} className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Features / Benefits */}
                <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
                    {[
                        { title: 'Certified Genetics', icon: 'verified', desc: 'Sourced from government-approved breeding centers.' },
                        { title: 'Home Delivery', icon: 'local_shipping', desc: 'Frozen semen straws delivered safely in LN2 containers.' },
                        { title: 'Expert Guidance', icon: 'psychology', desc: 'Get AI technician assistance for successful insemination.' }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-500">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
