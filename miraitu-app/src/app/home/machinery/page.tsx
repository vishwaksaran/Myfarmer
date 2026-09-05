'use client';

import Link from 'next/link';
import NearbyLocation from '@/components/v2/NearbyLocation';
import { useLanguage } from '@/i18n/LanguageContext';
import PeerRentalStrip from '@/components/v2/machinery/PeerRentalStrip';

// Category data with real images
const categories = [
    {
        id: 'tractors',
        name: 'Tractors',
        cardTitle: 'Tractors',
        cardSubtitle: '450+ Units Available',
        description: 'Powerful farming tractors for all field operations',
        image: '/images/machinery/tractor-real.jpg',
        count: 245,
        path: '/home/machinery/tractors',
    },
    {
        id: 'jcb',
        name: 'JCB',
        cardTitle: 'JCBs',
        cardSubtitle: '120+ Heavy Duty',
        description: 'Heavy-duty construction & earthmoving equipment',
        image: '/images/machinery/jcb-real.png',
        count: 78,
        path: '/home/machinery/jcb',
    },
    {
        id: 'small-machineries',
        name: 'Small Machineries',
        cardTitle: 'Small Machineries',
        cardSubtitle: 'Versatile Solutions',
        description: 'Compact power tillers & cultivators',
        image: '/images/machinery/small-machinery-real.png',
        count: 156,
        path: '/home/machinery/small-machineries',
    },
    {
        id: 'implements',
        name: 'Implements',
        cardTitle: 'Implements',
        cardSubtitle: 'Soil Management',
        description: 'Ploughs, harrows & tractor attachments',
        image: '/images/machinery/implants-real.png',
        count: 312,
        path: '/home/machinery/implements',
    },
    {
        id: 'harvesters',
        name: 'Harvesters',
        cardTitle: 'Harvesters',
        cardSubtitle: 'Harvest Tech',
        description: 'Combine harvesters for efficient crop harvesting',
        image: '/images/machinery/harvester-real.png',
        count: 64,
        path: '/home/machinery/harvesters',
    },
    {
        id: 'drones',
        name: 'Agri Drones',
        cardTitle: 'Agri-Drones',
        cardSubtitle: 'Next-Gen Spraying',
        description: 'Agricultural drones for spraying & monitoring',
        image: '/images/machinery/drone-real.png',
        count: 42,
        path: '/home/machinery/drones',
    },
];

/**
 * This page is the category picker, and only that.
 *
 * It used to carry an "Available Machinery" panel below the cards — a filter
 * sidebar, a grid/list toggle, a results count and an inline sell form — all
 * driven by a `featuredMachinery` array that was deliberately left empty once
 * its seeded demo tractors were removed. So it permanently read "(0 results)"
 * with filters that filtered nothing and a toggle over an empty grid.
 *
 * The real listings live one tap away, per category, at
 * /home/machinery/<category>/buy, which has its own filters and its own
 * "Post an Ad" button.
 */
export default function MachineryPage() {
    const { t } = useLanguage();

    // Translated category card titles/subtitles keyed by category id
    const catTitle: Record<string, string> = {
        tractors: t('machineryPage.cat.tractors'),
        jcb: t('machineryPage.cat.jcbs'),
        'small-machineries': t('machineryPage.cat.smallMachineries'),
        implements: t('machineryPage.cat.implements'),
        harvesters: t('machineryPage.cat.harvesters'),
        drones: t('machineryPage.cat.agriDrones'),
    };
    const catSubtitle: Record<string, string> = {
        tractors: t('machineryPage.cat.tractorsSub'),
        jcb: t('machineryPage.cat.jcbsSub'),
        'small-machineries': t('machineryPage.cat.smallMachineriesSub'),
        implements: t('machineryPage.cat.implementsSub'),
        harvesters: t('machineryPage.cat.harvestersSub'),
        drones: t('machineryPage.cat.agriDronesSub'),
    };


    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-[#121811] dark:text-[#f9fbf9] transition-colors duration-300">
            <div className="px-3 md:px-6 pb-12 py-6 md:py-8">
                <div className="mx-auto max-w-[1280px]">
                    {/* Hero Section with Category Cards */}
                    <div className="mb-8 md:mb-10">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
                            <div className="min-w-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('machineryPage.title')}
                                </h1>
                                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                                    {t('machineryPage.subtitle')}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 min-w-0">
                                <NearbyLocation />
                            </div>
                        </div>

                        {/* Category Cards */}
                        <div className="pb-2">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                                {/* Every category goes straight to its used listings.
                                    This used to open a modal asking "what would you like
                                    to do?", but with New and Rent behind flags it only
                                    ever offered Buy and Sell — a whole extra tap to pick
                                    between browsing (what people came for) and posting
                                    (now the floating button on the listings page).
                                    Tractors used to link to /home/machinery/tractors;
                                    that landing page is bypassed, so it behaves like the
                                    rest. */}
                                {categories.map((category) => {
                                    return (
                                        <Link
                                            key={category.id}
                                            href={`${category.path}/buy`}
                                            className="group relative aspect-[4/3] md:aspect-[4/5] w-full overflow-hidden rounded-2xl border border-black/15 bg-gray-200 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl block"
                                        >
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                                            <div className="absolute inset-x-0 bottom-1 md:bottom-1.5 z-10 p-3 md:p-4">
                                                <h3 className="text-xl sm:text-2xl md:text-[1.75rem] font-black text-white leading-[1.08] tracking-tight drop-shadow pr-1 line-clamp-2">
                                                    {catTitle[category.id] ?? category.cardTitle}
                                                </h3>
                                                <p className="text-xs md:text-sm text-white/90 leading-tight mt-1 break-words line-clamp-2">
                                                    {catSubtitle[category.id] ?? `${category.count}+ units available`}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Every machinery rental posted on the Rent board, not just
                        the ones that picked a sub-type — those have no category
                        page to sit on, so this is where they are found. */}
                    <PeerRentalStrip />

                </div>

            </div>
        </div>
    );
}

