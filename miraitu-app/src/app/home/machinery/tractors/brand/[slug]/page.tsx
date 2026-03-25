'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { TractorBrand, MachineryModel, TractorComparison } from '@/lib/machinery-db';
import {
    fetchBrandBySlug,
    fetchModelsByBrand,
    fetchBrands,
    fetchPopularComparisons,
} from '@/app/actions/tractors';
import CheckPriceModal from '@/components/v2/machinery/CheckPriceModal';
import SeriesShowcase from '@/components/v2/machinery/SeriesShowcase';
import { getTractorImageUrl, getBrandHeroImage } from '@/lib/tractor-images';

export default function BrandPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [brand, setBrand] = useState<TractorBrand | null>(null);
    const [models, setModels] = useState<MachineryModel[]>([]);
    const [allBrands, setAllBrands] = useState<TractorBrand[]>([]);
    const [comparisons, setComparisons] = useState<TractorComparison[]>([]);

    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [activeSeries, setActiveSeries] = useState<string | null>('__pending__');
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [priceModalTractor, setPriceModalTractor] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function load() {
            const b = await fetchBrandBySlug(slug);
            if (cancelled) return;
            if (!b) { setLoading(false); return; }

            const [m, brands, comp] = await Promise.all([
                fetchModelsByBrand(b.name),
                fetchBrands(),
                fetchPopularComparisons(10),
            ]);

            if (!cancelled) {
                setBrand(b);
                setModels(m);
                setAllBrands(brands);
                // Default to first series if available
                const sList: string[] = Array.isArray(b.series) ? b.series : [];
                setActiveSeries(sList.length > 0 ? sList[0] : null);
                setComparisons(comp.filter((c) => {
                    const a = c.model_a;
                    const ab = c.model_b;
                    return a?.brand === b.name || ab?.brand === b.name;
                }));
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

    // Brand-specific color theme for hero gradient & banner
    const brandTheme = (() => {
        const name = brand.name.toLowerCase();
        if (['mahindra', 'massey ferguson', 'tafe', 'eicher', 'indo farm', 'captain', 'standard', 'powertrac'].includes(name))
            return {
                heroGradient: 'from-red-950/85 via-red-900/50 to-transparent',
                heroBottom: 'from-red-950/70 via-transparent to-red-950/20',
                tint: brand.brand_color || '#dc2626',
                accent: 'text-red-300 hover:text-red-200',
                bannerBg: 'from-red-950 via-red-900 to-red-800',
                bannerGlow1: 'bg-red-600/20',
                bannerGlow2: 'bg-amber-400/10',
                bannerGlow3: 'bg-red-400/10',
                bannerLabel: 'text-amber-400',
                bannerHighlight: 'text-red-300',
                ctaBg: 'bg-amber-400 hover:bg-amber-300 text-red-950',
            };
        if (['swaraj'].includes(name))
            return {
                heroGradient: 'from-red-950/85 via-red-900/50 to-transparent',
                heroBottom: 'from-red-950/70 via-transparent to-red-950/20',
                tint: brand.brand_color || '#b91c1c',
                accent: 'text-red-300 hover:text-red-200',
                bannerBg: 'from-red-950 via-red-900 to-orange-900',
                bannerGlow1: 'bg-red-500/20',
                bannerGlow2: 'bg-orange-400/10',
                bannerGlow3: 'bg-red-400/10',
                bannerLabel: 'text-orange-400',
                bannerHighlight: 'text-red-300',
                ctaBg: 'bg-orange-400 hover:bg-orange-300 text-red-950',
            };
        if (['john deere', 'sonalika', 'preet', 'digitrac'].includes(name))
            return {
                heroGradient: 'from-green-950/85 via-green-900/50 to-transparent',
                heroBottom: 'from-green-950/70 via-transparent to-green-950/20',
                tint: brand.brand_color || '#15803d',
                accent: 'text-green-300 hover:text-green-200',
                bannerBg: 'from-green-950 via-green-900 to-green-800',
                bannerGlow1: 'bg-green-600/20',
                bannerGlow2: 'bg-yellow-400/10',
                bannerGlow3: 'bg-green-400/10',
                bannerLabel: 'text-yellow-400',
                bannerHighlight: 'text-green-300',
                ctaBg: 'bg-yellow-400 hover:bg-yellow-300 text-green-950',
            };
        if (['new holland', 'force', 'farmtrac', 'escorts'].includes(name))
            return {
                heroGradient: 'from-blue-950/85 via-blue-900/50 to-transparent',
                heroBottom: 'from-blue-950/70 via-transparent to-blue-950/20',
                tint: brand.brand_color || '#1d4ed8',
                accent: 'text-blue-300 hover:text-blue-200',
                bannerBg: 'from-blue-950 via-blue-900 to-blue-800',
                bannerGlow1: 'bg-blue-600/20',
                bannerGlow2: 'bg-cyan-400/10',
                bannerGlow3: 'bg-blue-400/10',
                bannerLabel: 'text-cyan-400',
                bannerHighlight: 'text-blue-300',
                ctaBg: 'bg-cyan-400 hover:bg-cyan-300 text-blue-950',
            };
        if (['kubota', 'ace', 'vst'].includes(name))
            return {
                heroGradient: 'from-orange-950/85 via-orange-900/50 to-transparent',
                heroBottom: 'from-orange-950/70 via-transparent to-orange-950/20',
                tint: brand.brand_color || '#ea580c',
                accent: 'text-orange-300 hover:text-orange-200',
                bannerBg: 'from-orange-950 via-orange-900 to-amber-900',
                bannerGlow1: 'bg-orange-600/20',
                bannerGlow2: 'bg-yellow-400/10',
                bannerGlow3: 'bg-orange-400/10',
                bannerLabel: 'text-yellow-400',
                bannerHighlight: 'text-orange-300',
                ctaBg: 'bg-yellow-400 hover:bg-yellow-300 text-orange-950',
            };
        // Default emerald theme
        return {
            heroGradient: 'from-emerald-950/85 via-emerald-900/50 to-transparent',
            heroBottom: 'from-emerald-950/70 via-transparent to-emerald-950/20',
            tint: brand.brand_color || '#16a34a',
            accent: 'text-emerald-300 hover:text-emerald-200',
            bannerBg: 'from-emerald-950 via-emerald-900 to-green-900',
            bannerGlow1: 'bg-emerald-600/20',
            bannerGlow2: 'bg-yellow-400/10',
            bannerGlow3: 'bg-emerald-400/10',
            bannerLabel: 'text-yellow-400',
            bannerHighlight: 'text-emerald-300',
            ctaBg: 'bg-yellow-400 hover:bg-yellow-300 text-emerald-950',
        };
    })();

    return (
        <div>
            {/* Hero Header with Tractor Background */}
            <section className="relative overflow-hidden min-h-[340px] sm:min-h-[400px]">
                {/* Background tractor image from the brand's first popular model */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={getBrandHeroImage(brand.name)}
                        alt={`${brand.name} Tractors`}
                        className="w-full h-full object-cover"
                    />
                    {/* Multi-layer gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${brandTheme.heroGradient}`} />
                    <div className={`absolute inset-0 bg-gradient-to-t ${brandTheme.heroBottom}`} />
                    {/* Brand color tint */}
                    <div className="absolute inset-0 opacity-25" style={{ backgroundColor: brandTheme.tint }} />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
                    {/* Breadcrumb */}
                    <nav className="text-xs text-white/60 mb-6 flex items-center gap-1">
                        <Link href="/home" className="hover:text-white/90 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/home/machinery/tractors" className="hover:text-white/90 transition-colors">Tractors</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{brand.name} Tractors</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                        {/* Brand Logo */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/20 shadow-2xl">
                            {brand.logo_url ? (
                                <img src={brand.logo_url} alt={brand.name} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg" />
                            ) : (
                                <span className="text-4xl font-black text-white drop-shadow-lg">{brand.name.charAt(0)}</span>
                            )}
                        </div>

                        <div>
                            {/* Established badge */}
                            {brand.founded_year && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2 border border-white/10">
                                    <span className="material-symbols-outlined text-[10px]">verified</span>
                                    Established {brand.founded_year}
                                </span>
                            )}
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
                                {brand.name} <br className="sm:hidden" />Tractors
                            </h1>
                            {brand.tagline && (
                                <p className="text-base sm:text-lg font-medium text-white/70 mt-1 tracking-tight">{brand.tagline}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                            <p className="text-xl sm:text-2xl font-black text-white">{brand.total_models}+</p>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Models</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                            <p className="text-xl sm:text-2xl font-black text-white">{brand.hp_range_min}-{brand.hp_range_max}</p>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">HP Range</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                            <button
                                onClick={() => { setPriceModalTractor(`${brand.name} Tractors`); setPriceModalOpen(true); }}
                                className={`text-sm font-bold ${brandTheme.accent} transition-colors`}
                            >
                                Check Price
                            </button>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Starting From</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                            <p className="text-xl sm:text-2xl font-black text-white">{brand.founded_year || 'N/A'}</p>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Founded</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">

                {/* Series Showcase with inline cinematic banner */}
                {seriesList.length > 0 && (
                    <SeriesShowcase
                        brandName={brand.name}
                        seriesList={seriesList}
                        models={models}
                        activeSeries={activeSeries}
                        onSeriesChange={setActiveSeries}
                        onCheckPrice={(name) => { setPriceModalTractor(name); setPriceModalOpen(true); }}
                    />
                )}

                {/* All Models Grid — shown when "All Models" is selected (no active series) */}
                {!activeSeries && (
                    <section className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                            All {brand.name} Tractors ({filteredModels.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredModels.map((m) => (
                                <div
                                    key={m.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                                >
                                    <Link href={`/home/machinery/tractors/${m.slug || m.id}`}>
                                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                                            <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                            {m.is_popular && (
                                                <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>
                                            )}
                                            {m.drive_type === '4WD' && (
                                                <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4WD</span>
                                            )}
                                        </div>
                                        <div className="p-3 pb-1">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.brand} {m.model_name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{m.specs}</p>
                                        </div>
                                    </Link>
                                    <div className="px-3 pb-3 pt-1">
                                        <button
                                            onClick={() => { setPriceModalTractor(`${m.brand} ${m.model_name}`); setPriceModalOpen(true); }}
                                            className="w-full py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Check Price
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Stylish Valuation Banner */}
                <section className={`my-6 relative overflow-hidden rounded-2xl bg-gradient-to-br ${brandTheme.bannerBg} shadow-xl`}>
                    {/* Decorative circles */}
                    <div className={`absolute -right-10 -top-10 w-40 h-40 ${brandTheme.bannerGlow1} rounded-full blur-2xl`} />
                    <div className={`absolute -left-6 -bottom-6 w-32 h-32 ${brandTheme.bannerGlow2} rounded-full blur-xl`} />
                    <div className={`absolute right-1/4 bottom-0 w-24 h-24 ${brandTheme.bannerGlow3} rounded-full blur-lg`} />

                    <div className="relative z-10 px-5 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                        <div className="flex-1 min-w-0">
                            <p className={`${brandTheme.bannerLabel} text-xs font-bold uppercase tracking-widest mb-1.5`}>
                                <span className="material-symbols-outlined text-xs align-middle mr-1">verified</span>
                                Trusted Valuation
                            </p>
                            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                Get Unbiased Valuation<br />
                                <span className={brandTheme.bannerHighlight}>For Your Used {brand.name} Tractor</span>
                            </h3>
                            <p className="text-sm text-white/60 mt-2 max-w-md">
                                Get an accurate market price for your tractor from certified experts. Free, instant, and reliable.
                            </p>
                        </div>
                        <button
                            onClick={() => { setPriceModalTractor(`Used ${brand.name} Tractor Valuation`); setPriceModalOpen(true); }}
                            className={`flex-shrink-0 px-6 py-3 ${brandTheme.ctaBg} text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
                        >
                            Try Tractor Valuation →
                        </button>
                    </div>
                </section>

                {/* Popular Models Highlight */}
                {popularModels.length > 0 && (
                    <section className="py-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Popular {brand.name} Tractors</h2>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {popularModels.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex-shrink-0 w-[280px] flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
                                >
                                    <Link href={`/home/machinery/tractors/${m.slug || m.id}`} className="flex items-center gap-3 min-w-0">
                                        <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={m.model_name} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.model_name}</p>
                                            <p className="text-xs text-gray-500">{m.hp} HP • {m.drive_type || '2WD'}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => { setPriceModalTractor(`${m.brand} ${m.model_name}`); setPriceModalOpen(true); }}
                                        className="ml-auto flex-shrink-0 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        Check Price
                                    </button>
                                </div>
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
                                <div
                                    key={m.id}
                                    className="flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                                >
                                    <Link href={`/home/machinery/tractors/${m.slug || m.id}`}>
                                        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                            <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                        </div>
                                        <div className="p-3 pb-1">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.model_name}</h3>
                                            <p className="text-xs text-gray-500">{m.hp} HP • Compact</p>
                                        </div>
                                    </Link>
                                    <div className="px-3 pb-3 pt-1">
                                        <button
                                            onClick={() => { setPriceModalTractor(`${m.brand} ${m.model_name}`); setPriceModalOpen(true); }}
                                            className="w-full py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Check Price
                                        </button>
                                    </div>
                                </div>
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
                                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white dark:bg-gray-700">
                                    {b.logo_url ? (
                                        <img
                                            src={b.logo_url}
                                            alt={b.name}
                                            className="w-full h-full object-contain p-1"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-full"
                                            style={{ backgroundColor: b.brand_color || '#16a34a' }}
                                        >
                                            {b.name.charAt(0)}
                                        </div>
                                    )}
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

                <CheckPriceModal
                    isOpen={priceModalOpen}
                    onClose={() => setPriceModalOpen(false)}
                    tractorName={priceModalTractor}
                />
            </div>
        </div>
    );
}
