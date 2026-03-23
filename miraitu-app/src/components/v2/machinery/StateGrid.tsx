'use client';

import Image from 'next/image';
import Link from 'next/link';

const STATES = [
    { name: 'Maharashtra', slug: 'maharashtra', image: '/images/states/maharashtra.svg' },
    { name: 'Uttar Pradesh', slug: 'uttar-pradesh', image: '/images/states/uttar-pradesh.svg' },
    { name: 'Madhya Pradesh', slug: 'madhya-pradesh', image: '/images/states/madhya-pradesh.svg' },
    { name: 'Punjab', slug: 'punjab', image: '/images/states/punjab.svg' },
    { name: 'Rajasthan', slug: 'rajasthan', image: '/images/states/rajasthan.svg' },
    { name: 'Haryana', slug: 'haryana', image: '/images/states/haryana.svg' },
    { name: 'Gujarat', slug: 'gujarat', image: '/images/states/gujarat.svg' },
    { name: 'Karnataka', slug: 'karnataka', image: '/images/states/karnataka.svg' },
    { name: 'Tamil Nadu', slug: 'tamil-nadu', image: '/images/states/tamil-nadu.svg' },
    { name: 'Bihar', slug: 'bihar', image: '/images/states/bihar.svg' },
    { name: 'Andhra Pradesh', slug: 'andhra-pradesh', image: '/images/states/andhra-pradesh.svg' },
    { name: 'Telangana', slug: 'telangana', image: '/images/states/telangana.svg' },
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
                        <Image
                            src={state.image}
                            alt={state.name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {state.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
