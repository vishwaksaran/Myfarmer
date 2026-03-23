'use client';

import Link from 'next/link';
import HeroSearch from '@/components/v2/machinery/HeroSearch';
import BrandLogoGrid from '@/components/v2/machinery/BrandLogoGrid';
import TractorCardCarousel from '@/components/v2/machinery/TractorCardCarousel';
import BudgetFilter from '@/components/v2/machinery/BudgetFilter';
import StateGrid from '@/components/v2/machinery/StateGrid';
import ComparisonCards from '@/components/v2/machinery/ComparisonCards';
import PromoBanner from '@/components/v2/machinery/PromoBanner';
import type { TractorBrand, MachineryModel, TractorComparison, PromoBanner as PromoBannerType } from '@/lib/machinery-db';

interface TractorHubPageProps {
    brands: TractorBrand[];
    popularModels: MachineryModel[];
    latestModels: MachineryModel[];
    allModels: MachineryModel[];
    comparisons: TractorComparison[];
    banners: PromoBannerType[];
}

export default function TractorHubPage({ brands, popularModels, latestModels, allModels, comparisons, banners }: TractorHubPageProps) {
    const miniTractors = allModels.filter((m) => m.category_type === 'mini');
    const fourWdTractors = allModels.filter((m) => m.drive_type === '4WD');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Link href="/home" className="hover:text-emerald-600">Home</Link>
                <span>/</span>
                <Link href="/home/machinery" className="hover:text-emerald-600">Machinery</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium">Tractors</span>
            </nav>

            {/* 1. Hero Search */}
            <HeroSearch models={allModels} brands={brands} />

            {/* Quick Action Tabs */}
            <div className="flex gap-2 -mt-2 mb-4 overflow-x-auto scrollbar-hide">
                <Link href="/home/machinery/tractors/new" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium whitespace-nowrap hover:bg-emerald-100 transition-colors">
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    New Tractors
                </Link>
                <Link href="/home/machinery/tractors/buy" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium whitespace-nowrap hover:bg-blue-100 transition-colors">
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    Buy Used
                </Link>
                <Link href="/home/machinery/tractors/sell" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium whitespace-nowrap hover:bg-orange-100 transition-colors">
                    <span className="material-symbols-outlined text-base">sell</span>
                    Sell Tractor
                </Link>
                <Link href="/home/machinery/tractors/compare" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium whitespace-nowrap hover:bg-purple-100 transition-colors">
                    <span className="material-symbols-outlined text-base">compare_arrows</span>
                    Compare
                </Link>
            </div>

            {/* 2. Popular Brands */}
            <BrandLogoGrid brands={brands} />

            {/* 3. Tractors in India 2025 — Popular / Latest / Mini / 4WD */}
            <TractorCardCarousel
                title="Tractors in India 2025"
                tabs={[
                    { label: 'Popular', key: 'popular' },
                    { label: 'Latest', key: 'latest' },
                    { label: 'Mini Tractors', key: 'mini' },
                    { label: '4WD Tractors', key: '4wd' },
                ]}
                models={{
                    popular: popularModels,
                    latest: latestModels,
                    mini: miniTractors,
                    '4wd': fourWdTractors,
                }}
                defaultTab="popular"
            />

            {/* 4. Banner: Loan */}
            {banners[0] && <PromoBanner banner={banners[0]} />}

            {/* 5. Tractors by Budget */}
            <BudgetFilter />

            {/* 6. State Grid */}
            <StateGrid />

            {/* 7. Banner: Sell */}
            {banners[1] && <PromoBanner banner={banners[1]} />}

            {/* 8. Popular Comparisons */}
            <ComparisonCards comparisons={comparisons} />

            {/* 9. Brand-wise Quick Browse */}
            <section className="py-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Browse Tractors by Brand
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brands.slice(0, 9).map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/home/machinery/tractors/brand/${brand.slug}`}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-white dark:bg-gray-700">
                                {brand.logo_url ? (
                                    <img
                                        src={brand.logo_url}
                                        alt={brand.name}
                                        className="w-full h-full object-contain p-1"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-full"
                                        style={{ backgroundColor: brand.brand_color || '#16a34a' }}
                                    >
                                        {brand.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{brand.name} Tractors</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {brand.hp_range_min}-{brand.hp_range_max} HP • {brand.total_models}+ Models
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 group-hover:text-emerald-500 transition-colors">chevron_right</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 10. Banner: Get Quote */}
            {banners[2] && <PromoBanner banner={banners[2]} />}

            {/* 11. Quick Links */}
            <section className="py-6 mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Quick Links
                </h2>
                <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                        <Link
                            key={b.id}
                            href={`/home/machinery/tractors/brand/${b.slug}`}
                            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors"
                        >
                            {b.name} Tractors
                        </Link>
                    ))}
                    <Link href="/home/machinery/tractors/compare" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        Compare Tractors
                    </Link>
                    <Link href="/home/machinery/tractors/new" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        New Tractors
                    </Link>
                    <Link href="/home/machinery/tractors/buy" className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                        Used Tractors
                    </Link>
                </div>
            </section>
        </div>
    );
}
