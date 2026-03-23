'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { MachineryModel, TractorBrand } from '@/lib/machinery-db';
import { fetchModelBySlug, fetchSimilarModels, fetchBrandBySlug, fetchBrands } from '@/app/actions/tractors';
import SpecsAccordion from '@/components/v2/machinery/SpecsAccordion';
import CheckPriceModal from '@/components/v2/machinery/CheckPriceModal';
import { getTractorImageUrl } from '@/lib/tractor-images';

export default function TractorDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [model, setModel] = useState<MachineryModel | null>(null);
    const [brand, setBrand] = useState<TractorBrand | null>(null);
    const [similar, setSimilar] = useState<MachineryModel[]>([]);
    const [allBrands, setAllBrands] = useState<TractorBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [priceModalTractor, setPriceModalTractor] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function load() {
            const m = await fetchModelBySlug(slug);
            if (cancelled) return;
            if (!m) { setLoading(false); return; }

            const brandSlug = m.brand.toLowerCase().replace(/\s+/g, '-');
            const [sim, b, brands] = await Promise.all([
                fetchSimilarModels(m.id, m.brand, m.hp, 4),
                fetchBrandBySlug(brandSlug),
                fetchBrands(),
            ]);

            if (!cancelled) {
                setModel(m);
                setSimilar(sim);
                setBrand(b);
                setAllBrands(brands);
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-6" />
                <div className="h-12 w-72 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3].map((n) => <div key={n} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
                    </div>
                    <div className="space-y-4">
                        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300">error</span>
                <h1 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">Tractor Not Found</h1>
                <Link href="/home/machinery/tractors" className="text-sm text-emerald-600 mt-2 inline-block">← Back to Tractors</Link>
            </div>
        );
    }

    const f = model.features || {};
    const brandSlugLink = model.brand.toLowerCase().replace(/\s+/g, '-');

    const specSections = [
        {
            title: 'Engine',
            icon: 'manufacturing',
            rows: [
                ['Cylinders', f.cylinders],
                ['HP', model.hp],
                ['Engine CC', f.engineCc],
                ['Engine Type', f.engineType],
                ['Max RPM', f.rpm],
                ['Torque (Nm)', f.torqueNm],
                ['Air Filter', f.airFilter],
            ] as [string, string | number | undefined][],
        },
        {
            title: 'Transmission',
            icon: 'settings',
            rows: [
                ['Gearbox Type', f.transmission],
                ['Gears', f.gears],
                ['Gear Shift', f.shiftType || f.gearType],
                ['Clutch', f.clutch],
            ] as [string, string | number | undefined][],
        },
        {
            title: 'Steering & Brakes',
            icon: 'sports_motorsports',
            rows: [
                ['Steering Type', f.steeringType],
                ['Brakes', f.brakes],
            ] as [string, string | number | undefined][],
        },
        {
            title: 'PTO & Hydraulics',
            icon: 'hydraulics',
            rows: [
                ['PTO Speed', f.ptoSpeed],
                ['Hydraulics Capacity (kg)', f.hydraulicsCapacity],
                ['Draft Sensing', f.draftSensing],
            ] as [string, string | number | undefined][],
        },
        {
            title: 'Dimensions & Weight',
            icon: 'straighten',
            rows: [
                ['Weight (kg)', f.weightKg],
                ['Ground Clearance (mm)', f.groundClearanceMm],
                ['Wheelbase (mm)', f.wheelbaseMm],
                ['Turning Radius (m)', f.turningRadiusM],
            ] as [string, string | number | undefined][],
        },
        {
            title: 'Fuel & Tyres',
            icon: 'local_gas_station',
            rows: [
                ['Fuel Type', model.fuel_type],
                ['Fuel Tank (L)', f.fuelTankL],
                ['Front Tyre', f.frontTyre],
                ['Rear Tyre', f.rearTyre],
            ] as [string, string | number | undefined][],
        },
    ];

    const applications = Array.isArray(f.applications) ? f.applications as string[] : [];
    const similarBrands = allBrands
        .filter((b) => b.slug !== brandSlugLink)
        .filter((b) => {
            if (!b.hp_range_min || !b.hp_range_max) return false;
            return b.hp_range_min <= model.hp + 15 && b.hp_range_max >= model.hp - 15;
        })
        .slice(0, 6);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Breadcrumb */}
                <nav className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1 flex-wrap">
                    <Link href="/home" className="hover:text-emerald-600">Home</Link>
                    <span>/</span>
                    <Link href="/home/machinery/tractors" className="hover:text-emerald-600">Tractors</Link>
                    <span>/</span>
                    <Link href={`/home/machinery/tractors/brand/${brandSlugLink}`} className="hover:text-emerald-600">{model.brand}</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{model.model_name}</span>
                </nav>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Hero Image */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-4">
                            <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700 relative">
                                <img src={getTractorImageUrl(model.image_url, model.brand, model.model_name, model.slug)} alt={`${model.brand} ${model.model_name}`} className="w-full h-full object-cover" />
                                {model.drive_type === '4WD' && (
                                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">4WD</span>
                                )}
                            </div>

                            <div className="p-4 sm:p-6">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {model.brand} {model.model_name}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{model.specs}</p>

                                <div className="mt-3">
                                    <button
                                        onClick={() => { setPriceModalTractor(`${model.brand} ${model.model_name}`); setPriceModalOpen(true); }}
                                        className="px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        Check Price
                                    </button>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-4 flex-wrap">
                                    <Link
                                        href={`/home/machinery/tractors/compare?model=${model.slug}`}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">compare_arrows</span>
                                        Compare
                                    </Link>
                                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                                        <span className="material-symbols-outlined text-base">contact_phone</span>
                                        Get More Details
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Key Specs Strip */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                            {[
                                { icon: 'speed', label: 'HP', value: `${model.hp} HP` },
                                { icon: 'tire_repair', label: 'Drive', value: model.drive_type || '2WD' },
                                { icon: 'settings', label: 'Gears', value: f.gears as string || 'N/A' },
                                { icon: 'sports_motorsports', label: 'Steering', value: (f.steeringType as string)?.split(' ')[0] || 'Manual' },
                                { icon: 'fitness_center', label: 'Lift (kg)', value: f.hydraulicsCapacity ? `${f.hydraulicsCapacity}` : 'N/A' },
                                { icon: 'verified', label: 'Warranty', value: `${model.warranty_years}Y` },
                            ].map((spec, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg block mx-auto">{spec.icon}</span>
                                    <p className="text-xs text-gray-400 mt-1">{spec.label}</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{spec.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* About */}
                        {model.description && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-2">About {model.brand} {model.model_name}</h2>
                                <p className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${!showFullDesc && 'line-clamp-3'}`}>
                                    {model.description}
                                </p>
                                {model.description.length > 150 && (
                                    <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-sm text-emerald-600 font-medium mt-1">
                                        {showFullDesc ? 'Show Less' : 'Read More'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Application Tags */}
                        {applications.length > 0 && (
                            <div className="mb-4">
                                <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Best For</h2>
                                <div className="flex flex-wrap gap-2">
                                    {applications.map((app, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                            {app}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specifications Accordion */}
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Specifications</h2>
                            <SpecsAccordion sections={specSections} />
                        </div>

                        {/* Similar Models */}
                        {similar.length > 0 && (
                            <section className="py-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Similar Tractors</h2>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {similar.map((m) => (
                                        <Link
                                            key={m.id}
                                            href={`/home/machinery/tractors/${m.slug || m.id}`}
                                            className="flex-shrink-0 w-[200px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                                        >
                                            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={`${m.brand} ${m.model_name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                                            </div>
                                            <div className="p-3 pb-1">
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{m.brand} {m.model_name}</h3>
                                                <p className="text-xs text-gray-500">{m.hp} HP • {m.drive_type || '2WD'}</p>
                                            </div>
                                            <div className="px-3 pb-3 pt-1">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); setPriceModalTractor(`${m.brand} ${m.model_name}`); setPriceModalOpen(true); }}
                                                    className="w-full py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                                >
                                                    Check Price
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Similar Brands */}
                        {similarBrands.length > 0 && (
                            <section className="py-4 mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Similar Brands</h2>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {similarBrands.map((b) => (
                                        <Link
                                            key={b.id}
                                            href={`/home/machinery/tractors/brand/${b.slug}`}
                                            className="flex-shrink-0 flex flex-col items-center gap-2 p-3 w-[90px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
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
                                            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center group-hover:text-emerald-600 transition-colors">
                                                {b.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Quick Specs */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Quick Specs</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {[
                                        ['Brand', model.brand],
                                        ['Model', model.model_name],
                                        ['HP', `${model.hp} HP`],
                                        ['Cylinders', f.cylinders],
                                        ['Drive', model.drive_type || '2WD'],
                                        ['Gearbox', f.transmission],
                                        ['Brakes', f.brakes],
                                        ['Fuel Type', model.fuel_type],
                                        ['Warranty', `${model.warranty_years} Years`],

                                    ].filter(([, v]) => v).map(([label, value], i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : ''}>
                                            <td className="py-2 px-2 text-gray-500 dark:text-gray-400">{String(label)}</td>
                                            <td className="py-2 px-2 text-gray-900 dark:text-white font-medium text-right">{String(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Brand CTA */}
                        {brand && (
                            <Link
                                href={`/home/machinery/tractors/brand/${brandSlugLink}`}
                                className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
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
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{brand.name} Tractors</p>
                                        <p className="text-xs text-gray-500">{brand.total_models}+ Models Available</p>
                                    </div>
                                </div>
                                <p className="text-xs text-emerald-600 font-medium mt-2">View All {brand.name} Tractors →</p>
                            </Link>
                        )}

                        {/* Similar Used Tractors placeholder */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-4">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Used {model.brand} Tractors</h3>
                            <div className="space-y-3">
                                {similar.slice(0, 3).map((m) => (
                                    <Link
                                        key={m.id}
                                        href={`/home/machinery/tractors/${m.slug || m.id}`}
                                        className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-1 -mx-1 transition-colors"
                                    >
                                        <div className="w-14 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)} alt={m.model_name} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{m.brand} {m.model_name}</p>
                                            <p className="text-[10px] text-gray-500">{m.hp} HP • {m.drive_type || '2WD'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link
                                href="/home/machinery/tractors/buy"
                                className="block text-center text-xs text-emerald-600 font-medium mt-3 py-2 border-t border-gray-100 dark:border-gray-700"
                            >
                                View All Used Tractors →
                            </Link>
                        </div>

                        {/* Compare CTA */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-center">
                            <span className="material-symbols-outlined text-white text-3xl">compare_arrows</span>
                            <p className="text-white font-bold text-sm mt-2">Compare Before You Buy</p>
                            <p className="text-white/80 text-xs mt-1">Side-by-side comparison</p>
                            <Link
                                href={`/home/machinery/tractors/compare?model=${model.slug}`}
                                className="inline-block mt-3 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
                            >
                                Compare Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <CheckPriceModal
                isOpen={priceModalOpen}
                onClose={() => setPriceModalOpen(false)}
                tractorName={priceModalTractor}
            />
        </>
    );
}
