'use client';

import Link from 'next/link';
import type { TractorBrand } from '@/lib/machinery-db';

interface BrandLogoGridProps {
    brands: TractorBrand[];
}

export default function BrandLogoGrid({ brands }: BrandLogoGridProps) {
    if (!brands.length) return null;

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Popular Tractor Brands
                </h2>
                <Link
                    href="/home/machinery/tractors/brands"
                    className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
                >
                    View All →
                </Link>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {brands.map((brand) => (
                    <Link
                        key={brand.id}
                        href={`/home/machinery/tractors/brand/${brand.slug}`}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                            {brand.logo_url ? (
                                <img
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    className="w-10 h-10 object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-lg rounded-full"
                                    style={{ backgroundColor: brand.brand_color || '#16a34a' }}
                                >
                                    {brand.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {brand.name}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
