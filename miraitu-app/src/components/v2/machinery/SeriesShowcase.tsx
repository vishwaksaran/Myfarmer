'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { MachineryModel } from '@/lib/machinery-db';
import { getTractorImageUrl } from '@/lib/tractor-images';

/* ─── Series spec highlights shown in the hero banner ─── */
interface SeriesHighlight {
    label: string;
    value: string;
    icon: string;
}

function getSeriesHighlights(seriesModels: MachineryModel[]): SeriesHighlight[] {
    if (seriesModels.length === 0) return [];
    const hps = seriesModels.map((m) => m.hp).filter(Boolean);
    const minHP = Math.min(...hps);
    const maxHP = Math.max(...hps);
    const drives = [...new Set(seriesModels.map((m) => m.drive_type).filter(Boolean))];
    const cylinders = [...new Set(seriesModels.map((m) => m.cylinders).filter(Boolean))];

    const highlights: SeriesHighlight[] = [];
    if (hps.length) {
        highlights.push({
            label: 'Power Range',
            value: minHP === maxHP ? `${minHP} HP` : `${minHP}–${maxHP} HP`,
            icon: 'bolt',
        });
    }
    highlights.push({ label: 'Variants', value: `${seriesModels.length}`, icon: 'apps' });
    if (drives.length) highlights.push({ label: 'Drive', value: drives.join(' / '), icon: 'settings' });
    if (cylinders.length) highlights.push({ label: 'Cylinders', value: cylinders.join(', '), icon: 'manufacturing' });
    return highlights.slice(0, 4);
}

/* ─── Color theme per brand ─── */
function getSeriesTheme(brandName: string) {
    const n = brandName.toLowerCase();
    if (['mahindra', 'massey ferguson', 'tafe', 'eicher', 'indo farm', 'captain', 'standard', 'powertrac', 'swaraj'].includes(n))
        return {
            accent: '#ef4444',
            accentLight: '#fca5a5',
            gradientFrom: 'from-red-950',
            gradientVia: 'via-red-900/80',
            gradientTo: 'to-zinc-950',
            accentBorder: 'border-red-500',
            accentText: 'text-red-400',
            accentBg: 'bg-red-500',
            accentBgHover: 'hover:bg-red-400',
            glowColor: 'bg-red-500/20',
            chipActive: 'bg-red-500 text-white',
            chipInactive: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            statBg: 'bg-red-500/10 border-red-500/20',
        };
    if (['john deere', 'sonalika', 'preet', 'digitrac'].includes(n))
        return {
            accent: '#22c55e',
            accentLight: '#86efac',
            gradientFrom: 'from-green-950',
            gradientVia: 'via-green-900/80',
            gradientTo: 'to-zinc-950',
            accentBorder: 'border-green-500',
            accentText: 'text-green-400',
            accentBg: 'bg-green-500',
            accentBgHover: 'hover:bg-green-400',
            glowColor: 'bg-green-500/20',
            chipActive: 'bg-green-500 text-white',
            chipInactive: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            statBg: 'bg-green-500/10 border-green-500/20',
        };
    if (['new holland', 'force', 'farmtrac', 'escorts'].includes(n))
        return {
            accent: '#3b82f6',
            accentLight: '#93c5fd',
            gradientFrom: 'from-blue-950',
            gradientVia: 'via-blue-900/80',
            gradientTo: 'to-zinc-950',
            accentBorder: 'border-blue-500',
            accentText: 'text-blue-400',
            accentBg: 'bg-blue-500',
            accentBgHover: 'hover:bg-blue-400',
            glowColor: 'bg-blue-500/20',
            chipActive: 'bg-blue-500 text-white',
            chipInactive: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            statBg: 'bg-blue-500/10 border-blue-500/20',
        };
    if (['kubota', 'ace', 'vst'].includes(n))
        return {
            accent: '#f97316',
            accentLight: '#fdba74',
            gradientFrom: 'from-orange-950',
            gradientVia: 'via-orange-900/80',
            gradientTo: 'to-zinc-950',
            accentBorder: 'border-orange-500',
            accentText: 'text-orange-400',
            accentBg: 'bg-orange-500',
            accentBgHover: 'hover:bg-orange-400',
            glowColor: 'bg-orange-500/20',
            chipActive: 'bg-orange-500 text-white',
            chipInactive: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
            statBg: 'bg-orange-500/10 border-orange-500/20',
        };
    return {
        accent: '#10b981',
        accentLight: '#6ee7b7',
        gradientFrom: 'from-emerald-950',
        gradientVia: 'via-emerald-900/80',
        gradientTo: 'to-zinc-950',
        accentBorder: 'border-emerald-500',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        accentBgHover: 'hover:bg-emerald-400',
        glowColor: 'bg-emerald-500/20',
        chipActive: 'bg-emerald-500 text-white',
        chipInactive: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700',
        statBg: 'bg-emerald-500/10 border-emerald-500/20',
    };
}

/* ─── Taglines per series (Mahindra-specific, fallback for others) ─── */
const SERIES_TAGLINES: Record<string, string> = {
    'OJA': 'Compact Powerhouse for Every Field',
    'Yuvraj': 'Built for the Bold Farmer',
    'Jivo': 'Smart Farming, Smarter Tractor',
    'XP Plus': 'Extra Power, Extra Performance',
    'SP Plus': 'Strength Meets Precision',
    'Yuvo Tech+': 'Technology-Driven Agriculture',
    'Arjun': 'Engineered for Power',
    'Novo': 'Next-Gen Performance',
    'Yuvo': 'Versatile & Reliable',
};

function getSeriesTagline(series: string): string {
    return SERIES_TAGLINES[series] || `Precision. Power. Performance.`;
}

/* ─── Main Component ─── */
interface SeriesShowcaseProps {
    brandName: string;
    seriesList: string[];
    models: MachineryModel[];
    activeSeries: string | null;
    onSeriesChange: (series: string | null) => void;
    onCheckPrice: (tractorName: string) => void;
}

export default function SeriesShowcase({
    brandName,
    seriesList,
    models,
    activeSeries,
    onSeriesChange,
    onCheckPrice,
}: SeriesShowcaseProps) {
    const theme = getSeriesTheme(brandName);
    const [expandedModel, setExpandedModel] = useState<string | null>(null);

    const seriesModels = useMemo(
        () => (activeSeries ? models.filter((m) => m.series === activeSeries) : []),
        [activeSeries, models]
    );

    const highlights = useMemo(() => getSeriesHighlights(seriesModels), [seriesModels]);

    // Get a hero image from the first model in series (or brand fallback)
    const heroModel = seriesModels[0];
    const heroImage = heroModel
        ? getTractorImageUrl(heroModel.image_url, heroModel.brand, heroModel.model_name, heroModel.slug)
        : undefined;

    return (
        <section className="mb-6">
            {/* Section heading */}
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                {brandName} Tractor Series
            </h2>

            {/* Series Pills */}
            <div className="flex flex-wrap gap-2 pb-3">
                <button
                    onClick={() => onSeriesChange(null)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                        !activeSeries
                            ? `${theme.chipActive} border-transparent shadow-lg`
                            : `${theme.chipInactive} border-zinc-700`
                    }`}
                >
                    All Models ({models.length})
                </button>
                {seriesList.map((s) => {
                    const count = models.filter((m) => m.series === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => onSeriesChange(s)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                                activeSeries === s
                                    ? `${theme.chipActive} border-transparent shadow-lg`
                                    : `${theme.chipInactive} border-zinc-700`
                            }`}
                        >
                            {s} Series {count > 0 && `(${count})`}
                        </button>
                    );
                })}
            </div>

            {/* Cinematic Series Banner — shown when a series is selected */}
            {activeSeries && seriesModels.length > 0 && (
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo} shadow-2xl mt-2`}>
                    {/* Background hero image */}
                    {heroImage && (
                        <div className="absolute inset-0 z-0">
                            <img
                                src={heroImage}
                                alt={`${brandName} ${activeSeries}`}
                                className="w-full h-full object-cover opacity-20"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
                        </div>
                    )}

                    {/* Decorative glows */}
                    <div className={`absolute -right-16 -top-16 w-48 h-48 ${theme.glowColor} rounded-full blur-3xl`} />
                    <div className={`absolute -left-10 -bottom-10 w-36 h-36 ${theme.glowColor} rounded-full blur-2xl opacity-50`} />
                    <div className="absolute right-1/3 top-1/2 w-20 h-20 bg-white/5 rounded-full blur-xl" />

                    {/* Watermark letter */}
                    <span className="absolute -top-8 -right-4 text-[12rem] font-black text-white/[0.03] leading-none pointer-events-none select-none">
                        {activeSeries.charAt(0)}
                    </span>

                    <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
                        {/* Series Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <div className={`inline-flex items-center gap-2 border-l-4 ${theme.accentBorder} pl-3 py-0.5 mb-2`}>
                                    <span className={`${theme.accentText} text-xs font-bold tracking-[0.15em] uppercase`}>
                                        {getSeriesTagline(activeSeries)}
                                    </span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-none">
                                    {brandName}{' '}
                                    <span style={{ color: theme.accent }}>{activeSeries}</span>{' '}
                                    Series
                                </h3>
                                <p className="text-sm text-zinc-400 mt-2 max-w-lg">
                                    {seriesModels.length} variant{seriesModels.length !== 1 ? 's' : ''} available.
                                    Explore the complete lineup below.
                                </p>
                            </div>

                            {/* Stat pills in banner */}
                            <div className="flex flex-wrap gap-2">
                                {highlights.map((h) => (
                                    <div
                                        key={h.label}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme.statBg} backdrop-blur-sm`}
                                    >
                                        <span className={`material-symbols-outlined text-base ${theme.accentText}`}>{h.icon}</span>
                                        <div>
                                            <span className="block text-white font-bold text-sm leading-tight">{h.value}</span>
                                            <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{h.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Models Grid Inside Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {seriesModels.map((m) => {
                                const isExpanded = expandedModel === m.id;
                                return (
                                    <div
                                        key={m.id}
                                        className="group bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-xl"
                                    >
                                        {/* Model image */}
                                        <Link href={`/home/machinery/tractors/${m.slug || m.id}`}>
                                            <div className="aspect-[16/10] relative overflow-hidden">
                                                <img
                                                    src={getTractorImageUrl(m.image_url, m.brand, m.model_name, m.slug)}
                                                    alt={`${m.brand} ${m.model_name}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                                                {/* Badges */}
                                                <div className="absolute top-2 left-2 flex gap-1.5">
                                                    {m.is_popular && (
                                                        <span className={`${theme.accentBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>Popular</span>
                                                    )}
                                                    {m.drive_type === '4WD' && (
                                                        <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4WD</span>
                                                    )}
                                                </div>

                                                {/* HP badge bottom-right */}
                                                <div className="absolute bottom-2 right-2">
                                                    <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/10">
                                                        {m.hp} HP
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Model info */}
                                        <div className="p-3">
                                            <Link href={`/home/machinery/tractors/${m.slug || m.id}`}>
                                                <h4 className="font-bold text-sm text-white truncate group-hover:text-zinc-100 transition-colors">
                                                    {m.brand} {m.model_name}
                                                </h4>
                                                <p className="text-xs text-zinc-500 mt-0.5 truncate">{m.specs}</p>
                                            </Link>

                                            {/* Quick specs row */}
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                                                {m.drive_type && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">settings</span>
                                                        {m.drive_type}
                                                    </span>
                                                )}
                                                {m.cylinders && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">manufacturing</span>
                                                        {m.cylinders} Cyl
                                                    </span>
                                                )}
                                                {m.engine_cc && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">speed</span>
                                                        {m.engine_cc} cc
                                                    </span>
                                                )}
                                            </div>

                                            {/* Expandable details */}
                                            <button
                                                onClick={() => setExpandedModel(isExpanded ? null : m.id)}
                                                className={`w-full mt-2 py-1 text-[11px] font-medium ${theme.accentText} flex items-center justify-center gap-1 transition-colors`}
                                            >
                                                <span className="material-symbols-outlined text-sm" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                    expand_more
                                                </span>
                                                {isExpanded ? 'Less Details' : 'Quick Specs'}
                                            </button>

                                            {isExpanded && (
                                                <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1.5 text-xs">
                                                    {m.fuel_type && (
                                                        <div className="flex justify-between">
                                                            <span className="text-zinc-500">Fuel</span>
                                                            <span className="text-zinc-300 font-medium">{m.fuel_type}</span>
                                                        </div>
                                                    )}
                                                    {m.warranty_years > 0 && (
                                                        <div className="flex justify-between">
                                                            <span className="text-zinc-500">Warranty</span>
                                                            <span className="text-zinc-300 font-medium">{m.warranty_years} Years</span>
                                                        </div>
                                                    )}
                                                    {m.launch_year && (
                                                        <div className="flex justify-between">
                                                            <span className="text-zinc-500">Launch Year</span>
                                                            <span className="text-zinc-300 font-medium">{m.launch_year}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* CTA buttons */}
                                            <div className="flex gap-2 mt-3">
                                                <Link
                                                    href={`/home/machinery/tractors/${m.slug || m.id}`}
                                                    className="flex-1 py-2 text-center text-xs font-bold text-white border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => onCheckPrice(`${m.brand} ${m.model_name}`)}
                                                    className={`flex-1 py-2 text-center text-xs font-bold text-white ${theme.accentBg} ${theme.accentBgHover} rounded-lg transition-colors`}
                                                >
                                                    Check Price
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
