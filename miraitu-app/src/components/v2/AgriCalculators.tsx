'use client';

import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

// Agri calculators — same tools, icons and routes as the Toolbox page,
// surfaced on the home page right after Top Categories.
const calculators = [
    {
        id: 'interest-calculator',
        tName: 'toolboxPage.interestCalc',
        tDesc: 'toolboxPage.interestCalcDesc',
        tButton: 'toolboxPage.openTool',
        icon: 'calculate',
        bgColor: 'bg-primary/10',
        textColor: 'text-primary',
        buttonBg: 'bg-primary/5',
        hoverBg: 'group-hover:bg-primary',
        path: '/home/toolbox/interest-calculator',
    },
    {
        id: 'land-area',
        tName: 'toolboxPage.landAreaTool',
        tDesc: 'toolboxPage.landAreaToolDesc',
        tButton: 'toolboxPage.startMapping',
        icon: 'map',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600',
        buttonBg: 'bg-blue-500/5',
        hoverBg: 'group-hover:bg-blue-600',
        path: '/home/toolbox/land-area',
    },
    {
        id: 'crop-costing',
        tName: 'toolboxPage.cropCosting',
        tDesc: 'toolboxPage.cropCostingDesc',
        tButton: 'toolboxPage.calculateROI',
        icon: 'inventory_2',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600',
        buttonBg: 'bg-amber-500/5',
        hoverBg: 'group-hover:bg-amber-600',
        path: '/home/toolbox/crop-costing',
    },
    {
        id: 'unit-converter',
        tName: 'toolboxPage.unitConverter',
        tDesc: 'toolboxPage.unitConverterDesc',
        tButton: 'toolboxPage.convertUnits',
        icon: 'swap_horiz',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-600',
        buttonBg: 'bg-orange-500/5',
        hoverBg: 'group-hover:bg-orange-600',
        path: '/home/toolbox/unit-converter',
    },
];

export default function AgriCalculators() {
    const { t } = useLanguage();

    return (
        <section className="px-4 md:px-6 pt-4 pb-8">
            <div className="mx-auto max-w-[1400px]">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#121811] dark:text-white">
                        Agri Calculators
                    </h2>
                    <Link href="/home/toolbox" className="text-sm md:text-base font-bold text-primary hover:underline">
                        View all
                    </Link>
                </div>

                {/* Cards — 2x2 on mobile, 4-up on desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                    {calculators.map((c) => (
                        <Link
                            key={c.id}
                            href={c.path}
                            className="skeuo-card group rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center text-center border border-white/40 dark:border-gray-700/40 transition-all hover:-translate-y-1"
                        >
                            <div className={`mb-3 md:mb-4 h-14 w-14 md:h-16 md:w-16 rounded-full ${c.bgColor} flex items-center justify-center ${c.textColor} group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-outlined text-2xl md:text-3xl">{c.icon}</span>
                            </div>
                            <h3 className="text-sm md:text-lg font-bold mb-1 text-gray-900 dark:text-white leading-tight">{t(c.tName)}</h3>
                            <p className="hidden md:block text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{t(c.tDesc)}</p>
                            <div className={`mt-auto w-full py-2 md:py-2.5 ${c.buttonBg} rounded-lg md:rounded-xl font-bold text-xs md:text-sm ${c.textColor} ${c.hoverBg} group-hover:text-white transition-colors`}>
                                {t(c.tButton)}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
