'use client';

import Link from 'next/link';

const STATES = [
    { name: 'Maharashtra', slug: 'maharashtra', icon: '🏛️' },
    { name: 'Uttar Pradesh', slug: 'uttar-pradesh', icon: '🕌' },
    { name: 'Madhya Pradesh', slug: 'madhya-pradesh', icon: '🐅' },
    { name: 'Punjab', slug: 'punjab', icon: '🌾' },
    { name: 'Rajasthan', slug: 'rajasthan', icon: '🏰' },
    { name: 'Haryana', slug: 'haryana', icon: '🏗️' },
    { name: 'Gujarat', slug: 'gujarat', icon: '🦁' },
    { name: 'Karnataka', slug: 'karnataka', icon: '🏯' },
    { name: 'Tamil Nadu', slug: 'tamil-nadu', icon: '🛕' },
    { name: 'Bihar', slug: 'bihar', icon: '📿' },
    { name: 'Andhra Pradesh', slug: 'andhra-pradesh', icon: '⛵' },
    { name: 'Telangana', slug: 'telangana', icon: '🏙️' },
];

export default function StateGrid() {
    return (
        <section className="py-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Tractor Prices by State
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Check on-road prices of tractors in your state
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {STATES.map((state) => (
                    <Link
                        key={state.slug}
                        href={`/home/machinery/tractors?state=${state.slug}`}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all group"
                    >
                        <span className="text-2xl">{state.icon}</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {state.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
