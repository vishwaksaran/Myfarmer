'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { MachineryModel, TractorBrand } from '@/lib/machinery-db';

interface HeroSearchProps {
    models: MachineryModel[];
    brands: TractorBrand[];
}

export default function HeroSearch({ models, brands }: HeroSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Array<{ type: 'model' | 'brand'; label: string; href: string }>>([]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }

        const q = query.toLowerCase();
        const matched: typeof results = [];

        for (const b of brands) {
            if (b.name.toLowerCase().includes(q)) {
                matched.push({ type: 'brand', label: `${b.name} Tractors`, href: `/home/machinery/tractors/brand/${b.slug}` });
            }
            if (matched.length >= 8) break;
        }

        for (const m of models) {
            if (matched.length >= 8) break;
            const name = `${m.brand} ${m.model_name}`.toLowerCase();
            if (name.includes(q)) {
                matched.push({ type: 'model', label: `${m.brand} ${m.model_name}`, href: `/home/machinery/tractors/${m.slug || m.id}` });
            }
        }

        setResults(matched);
        setOpen(matched.length > 0);
    }, [query, models, brands]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <section className="py-6">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl px-5 py-8 sm:px-8 sm:py-10 text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                    Find Your Perfect Tractor
                </h1>
                <p className="text-sm text-emerald-100 mb-5">
                    Compare prices, specs & features of 50+ tractor models from 29 brands
                </p>

                <div className="max-w-xl mx-auto relative" ref={ref}>
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        <span className="material-symbols-outlined text-gray-400 pl-4">search</span>
                        <input
                            type="text"
                            placeholder="Search by brand or model name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 px-3 py-3.5 text-sm bg-transparent text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {open && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                            {results.map((r, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setOpen(false); setQuery(''); router.push(r.href); }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm text-gray-400">
                                        {r.type === 'brand' ? 'factory' : 'agriculture'}
                                    </span>
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{r.label}</span>
                                    <span className="ml-auto text-[10px] text-gray-400 uppercase">{r.type}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
