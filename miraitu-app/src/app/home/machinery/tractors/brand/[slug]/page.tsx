'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { TractorBrand, MachineryModel, TractorComparison, PromoBanner as PromoBannerType } from '@/lib/machinery-db';
import {
    fetchBrandBySlug,
    fetchModelsByBrand,
    fetchBrands,
    fetchPopularComparisons,
    fetchBanners,
} from '@/app/actions/tractors';
import PromoBanner from '@/components/v2/machinery/PromoBanner';
import { getTractorImageUrl } from '@/lib/tractor-images';

function formatPrice(price: number): string {
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
}

export default function BrandPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [brand, setBrand] = useState<TractorBrand | null>(null);
    const [models, setModels] = useState<MachineryModel[]>([]);
    const [allBrands, setAllBrands] = useState<TractorBrand[]>([]);
    const [comparisons, setComparisons] = useState<TractorComparison[]>([]);
    const [banners, setBanners] = useState<PromoBannerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeSeries, setActiveSeries] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            const b = await fetchBrandBySlug(slug);
            if (!b || cancelled) { setLoading(false); return; }

            const [m, brands, comp, ban] = await Promise.all([
                fetchModelsByBrand(b.name),
                fetchBrands(),
                fetchPopularComparisons(10),
                fetchBanners('brand-page'),
            ]);

            if (!cancelled) {
                setBrand(b);
                setModels(m);
                setAllBrands(brands);
                setComparisons(comp.filter((c) => {
                    const a = c.model_a;
                    const ab = c.model_b;
                    return a?.brand === b.name || ab?.brand === b.name;
                }));
                setBanners(ban);
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300">error</span>
                <h1 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">Brand Not Found</h1>
                <Link href="/home/machinery/tractors" className="text-sm text-emerald-600 mt-2 inline-block">← Back to Tractors</Link>
            </div>
        );
    }

    const seriesList: string[] = Array.isArray(brand.series) ? brand.series : [];
    const filteredModels = activeSeries
        ? models.filter((m) => m.series === activeSeries)
        : models;
    const popularModels = models.filter((m) => m.is_popular);
    const miniModels = models.filter((m) => m.category_type === 'mini');
    const similarBrands = allBrands.filter((b) => b.slug !== brand.slug).slice(0, 6);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Breadcrumb */}
            <nav className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                <Link href="/home" className="hover:text-emerald-600">Home</Link>
                <span>/</span>
                <Link href="/home/machinery/tractors" className="hover:text-emerald-600">Tractors</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-medium">{brand.name} Tractors</span>
            </nav>

            {/* Brand Header */}
            <section className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: brand.brand_color || '#16a34a' }}>
                <div className="px-5 py-6 sm:px-8 sm:py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                            {brand.logo_url ? (
                                <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 object-contain" />
                            ) : (
                                <span className="text-3xl font-bold text-white">{brand.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">{brand.name} Tractors</h1>
                            {brand.tagline && <p className="text-sm text-white/80 mt-0.5">{brand.tagline}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{brand.total_models}+</p>
                            <p className="text-[10px] text-white/70 uppercase">Models</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{brand.hp_range_min}-{brand.hp_range_max}</p>
                            <p className="text-[10px] text-white/70 uppercase">HP Range</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{brand.price_range_min ? formatPrice(brand.price_range_min) : 'N/A'}</p>
                            <p className="text-[10px] text-white/70 uppercase">Starting From</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-center">
                            <p className="text-lg font-bold text-white">{brand.founded_year || 'N/A'}</p>
                            <p className="text-[10px] text-white/70 uppercase">Founded</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Series Chips */}
            {seriesList.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">{brand.name} Tractor Series</h2>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button
                            onClick={() => setActiveSeries(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!activeSeries
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            All ({models.length})
                        </button>
                        {seriesList.map((s) => {
                            const count = models.filter((m) => m.series === s).length;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setActiveSeries(s)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSeries === s
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                        }`}
                                >
                                    {s} {count > 0 && `(${count})`}
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All Models Grid */}
            <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {activeSeries ? `${brand.name} ${activeSeries} Series` : `All ${brand.name} Tractors`} ({filteredModels.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredModels.map((m) => (
                        <Link
                            key={m.id}
                            href={`/home/machinery/tractors/${m.slug || m.id}`}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                        >
                            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                {m.is_popular && (
                                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                                )}
                                {m.drive_type === '4WD' && (
                                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4WD</span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.brand} {m.model_name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{m.specs}</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatPrice(m.base_price)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Banner */}
            {banners[0] && <PromoBanner banner={banners[0]} />}

            {/* Popular Models Highlight */}
            {popularModels.length > 0 && (
                <section className="py-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Popular {brand.name} Tractors</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {popularModels.map((m) => (
                            <Link
                                key={m.id}
                                href={`/home/machinery/tractors/${m.slug || m.id}`}
                                className="flex-shrink-0 w-[280px] flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                            >
                                <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={m.model_name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.model_name}</p>
                                    <p className="text-xs text-gray-500">{m.hp} HP • {m.drive_type || '2WD'}</p>
                                    <p className="text-sm font-bold text-emerald-600 mt-0.5">{formatPrice(m.base_price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Mini Tractors (if brand has them) */}
            {miniModels.length > 0 && (
                <section className="py-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{brand.name} Mini Tractors</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {miniModels.map((m) => (
                            <Link
                                key={m.id}
                                href={`/home/machinery/tractors/${m.slug || m.id}`}
                                className="flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.model_name}</h3>
                                    <p className="text-xs text-gray-500">{m.hp} HP • Compact</p>
                                    <p className="text-sm font-bold text-emerald-600 mt-1">{formatPrice(m.base_price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Comparisons */}
            {comparisons.length > 0 && (
                <section className="py-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{brand.name} Tractor Comparisons</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {comparisons.map((comp) => {
                            const a = comp.model_a;
                            const b = comp.model_b;
                            if (!a || !b) return null;
                            return (
                                <Link
                                    key={comp.id}
                                    href={`/home/machinery/tractors/compare?a=${a.slug}&b=${b.slug}`}
                                    className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-lg transition-all text-center"
                                >
                                    <div className="flex items-center justify-center gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{a.brand}</p>
                                            <p className="text-[10px] text-gray-500">{a.model_name}</p>
                                        </div>
                                        <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-[9px] font-bold">VS</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{b.brand}</p>
                                            <p className="text-[10px] text-gray-500">{b.model_name}</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-medium mt-2">Compare Now →</p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Similar Brands */}
            <section className="py-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Similar Tractor Brands</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {similarBrands.map((b) => (
                        <Link
                            key={b.id}
                            href={`/home/machinery/tractors/brand/${b.slug}`}
                            className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-emerald-200 transition-all group"
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: b.brand_color || '#16a34a' }}
                            >
                                {b.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-emerald-600 transition-colors">
                                {b.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* About Brand */}
            {brand.description && (
                <section className="py-6 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About {brand.name}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                        <p className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${!showFullDesc && 'line-clamp-3'}`}>
                            {brand.description}
                        </p>
                        {brand.description.length > 200 && (
                            <button
                                onClick={() => setShowFullDesc(!showFullDesc)}
                                className="text-sm text-emerald-600 font-medium mt-2"
                            >
                                {showFullDesc ? 'Show Less' : 'Read More'}
                            </button>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
