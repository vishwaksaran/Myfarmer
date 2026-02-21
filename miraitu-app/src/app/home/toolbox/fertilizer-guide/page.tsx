'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FertilizerRec {
    name: string;
    type: 'organic' | 'chemical' | 'bio';
    dosage: string;
    timing: string;
    method: string;
    npk: string;
    notes: string;
}

interface CropGuide {
    crop: string;
    icon: string;
    season: string;
    soilPh: string;
    fertilizers: FertilizerRec[];
    schedule: { stage: string; daysAfterSowing: string; action: string }[];
    tips: string[];
}

const cropGuides: CropGuide[] = [
    {
        crop: 'Wheat',
        icon: '🌾',
        season: 'Rabi (Oct-Nov)',
        soilPh: '6.0 – 7.5',
        fertilizers: [
            { name: 'DAP (18-46-0)', type: 'chemical', dosage: '100 kg/acre', timing: 'Basal (at sowing)', method: 'Mix in soil before sowing', npk: 'N: 18kg, P: 46kg', notes: 'Best phosphorus source for wheat.' },
            { name: 'Urea (46-0-0)', type: 'chemical', dosage: '65 kg/acre (split)', timing: '1st: 21 DAS, 2nd: 45 DAS', method: 'Top dressing near roots', npk: 'N: 30kg per split', notes: 'Always apply with irrigation for best absorption.' },
            { name: 'MOP (0-0-60)', type: 'chemical', dosage: '25 kg/acre', timing: 'Basal', method: 'Broadcast and mix', npk: 'K: 15kg', notes: 'Improves grain quality and disease resistance.' },
            { name: 'Zinc Sulphate', type: 'chemical', dosage: '10 kg/acre', timing: 'Basal', method: 'Mix with DAP', npk: 'Zn: 3.3kg', notes: 'Essential in zinc-deficient soils (common in Indo-Gangetic plains).' },
            { name: 'FYM / Compost', type: 'organic', dosage: '4-5 tonnes/acre', timing: '15-20 days before sowing', method: 'Spread and plough into soil', npk: 'Varies', notes: 'Improves soil structure and water-holding capacity.' },
            { name: 'PSB (Phosphate Solubilizing Bacteria)', type: 'bio', dosage: '200g per acre seed treatment', timing: 'Before sowing', method: 'Seed treatment', npk: 'Helps P availability', notes: 'Use in shade, avoid mixing with chemical fertilizers.' },
        ],
        schedule: [
            { stage: 'Land Preparation', daysAfterSowing: '-20 to -15', action: 'Apply FYM/compost, plough well' },
            { stage: 'Sowing', daysAfterSowing: '0', action: 'Apply DAP + MOP + ZnSO4 as basal dose' },
            { stage: 'Crown Root (CRI)', daysAfterSowing: '20-25', action: '1st Urea top dressing + 1st irrigation' },
            { stage: 'Tillering', daysAfterSowing: '40-45', action: '2nd Urea top dressing + 2nd irrigation' },
            { stage: 'Booting', daysAfterSowing: '60-65', action: '3rd irrigation, foliar micronutrient spray if needed' },
            { stage: 'Flowering', daysAfterSowing: '80-85', action: '4th irrigation, no nitrogen at this stage' },
            { stage: 'Grain Filling', daysAfterSowing: '100-110', action: 'Light irrigation if soil dry, stop nitrogen' },
        ],
        tips: [
            'Get soil tested every 2 years to avoid over/under-fertilization.',
            'Split Urea application gives 20-25% better nitrogen use efficiency.',
            'Never apply urea in standing water – it causes nitrogen loss.',
            'Use neem-coated urea for slow release and reduced losses.',
            'Combine DAP + ZnSO4 in the same row for better root zone availability.',
        ],
    },
    {
        crop: 'Rice (Paddy)',
        icon: '🍚',
        season: 'Kharif (Jun-Jul)',
        soilPh: '5.5 – 6.5',
        fertilizers: [
            { name: 'DAP (18-46-0)', type: 'chemical', dosage: '100 kg/acre', timing: 'Basal (puddling)', method: 'Apply before last puddling', npk: 'N: 18kg, P: 46kg', notes: 'Preferred P source for transplanted paddy.' },
            { name: 'Urea (46-0-0)', type: 'chemical', dosage: '90 kg/acre (3 splits)', timing: '15, 30, 55 DAT', method: 'Standing water, broadcast', npk: 'N: ~14kg per split', notes: 'Drain water 1 day before, apply, then re-flood.' },
            { name: 'MOP (0-0-60)', type: 'chemical', dosage: '35 kg/acre', timing: 'Basal + topdress at panicle', method: 'Split 50:50', npk: 'K: 21kg', notes: 'Critical for grain filling and disease resistance.' },
            { name: 'FYM / Vermicompost', type: 'organic', dosage: '5 tonnes/acre', timing: '2-3 weeks before puddling', method: 'Incorporate into soil', npk: 'Varies', notes: 'Reduces chemical fertilizer need by 25-30%.' },
            { name: 'Azospirillum', type: 'bio', dosage: '200g per acre', timing: 'Root dip before transplanting', method: 'Dip seedling roots 30 min', npk: 'Fixes 20-25 kg N/ha', notes: 'Reduces urea requirement by ~25%.' },
        ],
        schedule: [
            { stage: 'Nursery', daysAfterSowing: '-25 to -20', action: 'Prepare nursery beds, seed treatment' },
            { stage: 'Puddling', daysAfterSowing: '-3 to 0', action: 'Apply DAP + half MOP as basal' },
            { stage: 'Transplanting', daysAfterSowing: '0', action: 'Transplant seedlings, maintain water level' },
            { stage: 'Active Tillering', daysAfterSowing: '15-20', action: '1st Urea dose' },
            { stage: 'Maximum Tillering', daysAfterSowing: '30-35', action: '2nd Urea dose' },
            { stage: 'Panicle Initiation', daysAfterSowing: '50-55', action: '3rd Urea + remaining MOP' },
            { stage: 'Flowering', daysAfterSowing: '70-80', action: 'No fertilizer, maintain water' },
            { stage: 'Maturity', daysAfterSowing: '110-130', action: 'Drain field 2 weeks before harvest' },
        ],
        tips: [
            'Leaf Color Chart (LCC) helps decide urea timing – saves 15-20% nitrogen.',
            'Alternate wetting & drying (AWD) saves 25% water with same yield.',
            'Avoid urea broadcasting in wet field – causes ammonia loss.',
            'Green manuring with Dhaincha before puddling adds 60-80 kg N/ha.',
            'Apply zinc sulphate at 10 kg/acre if soil Zn < 0.6 ppm.',
        ],
    },
    {
        crop: 'Cotton',
        icon: '🏵️',
        season: 'Kharif (May-Jun)',
        soilPh: '6.0 – 8.0',
        fertilizers: [
            { name: 'DAP', type: 'chemical', dosage: '75 kg/acre', timing: 'Basal', method: 'Band placement near rows', npk: 'N: 13.5kg, P: 34.5kg', notes: 'Place 5-7 cm away from seed line.' },
            { name: 'Urea', type: 'chemical', dosage: '80 kg/acre (3 splits)', timing: '30, 60, 90 DAS', method: 'Ring around plant base', npk: 'N: ~12kg per split', notes: 'Do not over-apply – causes excessive vegetative growth.' },
            { name: 'MOP', type: 'chemical', dosage: '50 kg/acre', timing: 'Basal + 50 DAS', method: 'Broadcast + top dress', npk: 'K: 30kg', notes: 'Potassium is critical for boll development and fiber quality.' },
            { name: 'Single Super Phosphate', type: 'chemical', dosage: '100 kg/acre', timing: 'Basal', method: 'Broadcast', npk: 'P: 16kg, S: 11kg', notes: 'Also supplies sulphur which cotton needs.' },
            { name: 'FYM', type: 'organic', dosage: '5 tonnes/acre', timing: 'Before sowing', method: 'Incorporate', npk: 'Varies', notes: 'Improves soil health and water retention in black cotton soils.' },
        ],
        schedule: [
            { stage: 'Pre-sowing', daysAfterSowing: '-15', action: 'Apply FYM, deep ploughing' },
            { stage: 'Sowing', daysAfterSowing: '0', action: 'Basal DAP + SSP + half MOP' },
            { stage: 'Vegetative', daysAfterSowing: '30', action: '1st Urea top dress' },
            { stage: 'Square Formation', daysAfterSowing: '50-60', action: '2nd Urea + remaining MOP' },
            { stage: 'Flowering', daysAfterSowing: '70-80', action: 'Foliar spray of 2% DAP if needed' },
            { stage: 'Boll Development', daysAfterSowing: '90', action: '3rd Urea (light dose)' },
            { stage: 'Picking', daysAfterSowing: '130-180', action: 'No fertilizer, pick ripe bolls' },
        ],
        tips: [
            'Potassium deficiency causes premature boll shedding – ensure adequate K.',
            'Use neem cake at 100 kg/acre to reduce pest load naturally.',
            'Foliar spray of KNO3 (1%) during boll formation improves lint quality.',
            'Intercrop with moong/urad to add nitrogen to soil.',
            'Avoid excess nitrogen – it promotes sucking pest attacks.',
        ],
    },
];

type FertType = 'all' | 'chemical' | 'organic' | 'bio';

export default function FertilizerGuidePage() {
    const [selectedCrop, setSelectedCrop] = useState(0);
    const [filterType, setFilterType] = useState<FertType>('all');

    const guide = cropGuides[selectedCrop];
    const fertFiltered = filterType === 'all'
        ? guide.fertilizers
        : guide.fertilizers.filter(f => f.type === filterType);

    const typeColors: Record<string, { bg: string; text: string }> = {
        chemical: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
        organic: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
        bio: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' },
    };

    return (
        <div className="agri-grid-bg min-h-screen">
            <section className="px-4 md:px-6 pt-6 md:pt-10 pb-12">
                <div className="mx-auto max-w-[1280px]">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 mb-6 text-xs md:text-sm">
                        <Link href="/home" className="text-gray-500 hover:text-primary font-medium">Home</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <Link href="/home/toolbox" className="text-gray-500 hover:text-primary font-medium">Agri Calculators</Link>
                        <span className="material-symbols-outlined text-gray-400 text-xs">chevron_right</span>
                        <span className="text-primary font-bold">Fertilizer Guide</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <span className="material-symbols-outlined text-2xl">compost</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white">Fertilizer Guide</h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-500">Crop-specific fertilizer recommendations, dosage, timing, and application schedule.</p>
                    </div>

                    {/* Crop Selector */}
                    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {cropGuides.map((g, i) => (
                            <button
                                key={g.crop}
                                onClick={() => { setSelectedCrop(i); setFilterType('all'); }}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedCrop === i
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="text-xl">{g.icon}</span>
                                {g.crop}
                            </button>
                        ))}
                    </div>

                    {/* Crop Info Bar */}
                    <div className="skeuo-card rounded-2xl p-4 md:p-5 mb-6 flex flex-wrap gap-4 md:gap-8">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Sowing Season</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.season}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-lg">science</span>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Ideal Soil pH</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.soilPh}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600 text-lg">inventory_2</span>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Fertilizers</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.fertilizers.length} recommended</p>
                            </div>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 mb-6">
                        {(['all', 'chemical', 'organic', 'bio'] as FertType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filterType === t
                                    ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-primary/30 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
                                    }`}
                            >
                                {t === 'all' ? 'All Types' : t === 'bio' ? 'Bio-fertilizer' : t}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Fertilizer Cards */}
                        <div className="lg:col-span-2 space-y-4">
                            {fertFiltered.map((f, i) => {
                                const tc = typeColors[f.type] || typeColors.chemical;
                                return (
                                    <div key={i} className="skeuo-card rounded-2xl p-5 md:p-6">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{f.name}</h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${tc.bg} ${tc.text}`}>{f.type === 'bio' ? 'Bio-fertilizer' : f.type}</span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Dosage</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{f.dosage}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">NPK</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{f.npk}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Timing</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{f.timing}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Method</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{f.method}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 flex items-start gap-1.5">
                                            <span className="material-symbols-outlined text-sm text-amber-500 mt-0.5">tips_and_updates</span>
                                            {f.notes}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Schedule + Tips */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Schedule */}
                            <div className="skeuo-card rounded-2xl md:rounded-3xl p-5 md:p-6">
                                <h3 className="font-black text-base mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">timeline</span>
                                    Application Schedule
                                </h3>
                                <div className="relative">
                                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/20" />
                                    <div className="space-y-4">
                                        {guide.schedule.map((s, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 z-10">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                                </div>
                                                <div className="pb-2">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{s.stage}</p>
                                                    <p className="text-[10px] text-primary font-bold">{s.daysAfterSowing} DAS</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{s.action}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="skeuo-card rounded-2xl p-5 md:p-6 border-l-4 border-green-400">
                                <h4 className="font-bold text-sm mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-lg">eco</span>
                                    Expert Tips for {guide.crop}
                                </h4>
                                <ul className="space-y-2">
                                    {guide.tips.map((tip, i) => (
                                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <span className="text-green-500 font-bold mt-0.5">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
