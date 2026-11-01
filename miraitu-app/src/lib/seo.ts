import type { Metadata } from 'next';

// Shared builders for per-page metadata and structured data.
//
// Most public pages get their metadata from a layout.tsx. A layout's canonical
// is inherited by every page below it, so a child page without its own layout
// tells search engines it is a duplicate of its parent. pageMetadata() keeps the
// fix for that to a few lines per page: title, description and a self-canonical.

export const SITE_URL = 'https://www.miraitu.in';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.miraitu';

export function absoluteUrl(path: string): string {
    return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

interface PageMetadataInput {
    title: string;
    description: string;
    path: string;
    /** Shorter title for social cards; defaults to `title`. */
    socialTitle?: string;
    /** Set for pages that should stay out of search results. */
    noindex?: boolean;
}

export function pageMetadata({ title, description, path, socialTitle, noindex }: PageMetadataInput): Metadata {
    const url = absoluteUrl(path);
    const social = socialTitle ?? title;
    return {
        title,
        description,
        alternates: { canonical: url },
        robots: noindex
            ? { index: false, follow: true }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },
        openGraph: {
            title: social,
            description,
            url,
            type: 'website',
            siteName: 'Miraitu',
            locale: 'en_IN',
        },
        twitter: {
            card: 'summary_large_image',
            title: social,
            description,
        },
    };
}

export interface Crumb {
    name: string;
    path: string;
}

/** BreadcrumbList JSON-LD. The site root is prepended automatically. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
    const all = [{ name: 'Miraitu', path: '/' }, ...crumbs];
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: absoluteUrl(c.path),
        })),
    };
}

/** Serialises JSON-LD for a <script> tag, escaping `<` so data can't close it. */
export function jsonLdString(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

// ── Machinery category × mode pages ─────────────────────────────────────────
// /home/machinery/<category>/{buy,sell,rent,new}. What each mode shows:
//   buy  — used machines listed for sale (MachineryListing type="used")
//   new  — new models with prices and specs (MachineryListing type="new")
//   sell — the form for listing a used machine
//   rent — the rental catalog for that category

export type MachineryCategory = 'tractors' | 'harvesters' | 'jcb' | 'drones' | 'implements' | 'small-machineries';
export type MachineryMode = 'buy' | 'sell' | 'rent' | 'new';

const MACHINERY_LABELS: Record<MachineryCategory, { plural: string; examples: string }> = {
    tractors: { plural: 'Tractors', examples: 'tractors from Mahindra, Swaraj, Sonalika, John Deere and more' },
    harvesters: { plural: 'Combine Harvesters', examples: 'combine and crop harvesters' },
    jcb: { plural: 'JCB & Earthmovers', examples: 'JCB backhoe loaders and earthmoving equipment' },
    drones: { plural: 'Agricultural Drones', examples: 'agricultural spray drones' },
    implements: { plural: 'Farm Implements', examples: 'ploughs, cultivators, rotavators and other implements' },
    'small-machineries': { plural: 'Small Farm Machinery', examples: 'power tillers, sprayers and small farm machines' },
};

export function machineryModeMetadata(category: MachineryCategory, mode: MachineryMode): Metadata {
    const { plural, examples } = MACHINERY_LABELS[category];
    const path = `/home/machinery/${category}/${mode}`;
    switch (mode) {
        case 'buy':
            return pageMetadata({
                path,
                title: `Used ${plural} for Sale – Second-Hand Prices`,
                description: `Browse used ${examples} listed for sale on Miraitu. Filter by brand, price and location, compare models side by side and find a second-hand machine that fits your budget.`,
            });
        case 'new':
            return pageMetadata({
                path,
                title: `New ${plural} – Models, Prices & Specifications`,
                description: `Explore new ${examples} on Miraitu. Check prices and specifications, compare models side by side and request the latest price for the model you want.`,
            });
        case 'sell':
            return pageMetadata({
                path,
                title: `Sell Used ${plural} Online`,
                description: `List your used ${plural.toLowerCase()} for sale on Miraitu. Add photos, price and location so buyers looking for second-hand ${plural.toLowerCase()} can find your listing.`,
            });
        case 'rent':
            return pageMetadata({
                path,
                title: `${plural} on Rent – Book Farm Machinery Near You`,
                description: `Rent ${examples} on Miraitu. See what is available for hire, compare rental options and book the machine you need for your farm work.`,
            });
    }
}

export function machineryModeBreadcrumb(category: MachineryCategory, mode: MachineryMode) {
    const { plural } = MACHINERY_LABELS[category];
    const modeLabel = { buy: `Used ${plural}`, new: `New ${plural}`, sell: `Sell ${plural}`, rent: `Rent ${plural}` }[mode];
    return breadcrumbJsonLd([
        { name: 'Machinery', path: '/home/machinery' },
        { name: plural, path: `/home/machinery/${category}` },
        { name: modeLabel, path: `/home/machinery/${category}/${mode}` },
    ]);
}
