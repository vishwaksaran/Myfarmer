import type { Metadata } from 'next';
import { cache } from 'react';
import { getModelBySlug, type MachineryModel } from '@/lib/machinery-db';
import { absoluteUrl, breadcrumbJsonLd, jsonLdString, pageMetadata, SITE_URL } from '@/lib/seo';

// The model page renders on the client, so its title, description, canonical
// and structured data come from here. Everything is built from the model's own
// row in machinery_models — no field is filled in when the database has none.
// (The page is published as an ItemPage, not a Product — see below.)

interface Props {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

const loadModel = cache((slug: string) => getModelBySlug(slug));

const brandSlug = (brand: string) => brand.toLowerCase().replace(/\s+/g, '-');

function specSummary(m: MachineryModel): string {
    const parts = [
        m.hp ? `${m.hp} HP` : null,
        m.cylinders ? `${m.cylinders}-cylinder` : null,
        m.engine_cc ? `${m.engine_cc} cc engine` : null,
        m.drive_type ? m.drive_type : null,
        m.fuel_type ? m.fuel_type.toLowerCase() : null,
        m.warranty_years ? `${m.warranty_years}-year warranty` : null,
    ].filter(Boolean);
    return parts.join(', ');
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
    const { slug } = await params;
    const model = await loadModel(slug);
    const path = `/home/machinery/tractors/${slug}`;

    if (!model) {
        return pageMetadata({
            path,
            title: 'Tractor Not Found',
            description: 'This tractor model is not available on Miraitu. Browse all tractor models, prices and specifications.',
            noindex: true,
        });
    }

    const name = `${model.brand} ${model.model_name}`;
    const specs = specSummary(model);
    return pageMetadata({
        path,
        title: `${name}${model.hp ? ` ${model.hp} HP` : ''} Tractor – Specifications & Price`,
        description: `${name} tractor${specs ? `: ${specs}` : ''}. See full specifications, compare with similar ${model.brand} models and check the latest price on Miraitu.`,
        socialTitle: `${name} Tractor`,
    });
}

export default async function TractorModelLayout({ params, children }: Props) {
    const { slug } = await params;
    const model = await loadModel(slug);
    if (!model) return <>{children}</>;

    const name = `${model.brand} ${model.model_name}`;
    const url = absoluteUrl(`/home/machinery/tractors/${slug}`);
    const specs = specSummary(model);

    // ItemPage, not Product. Google treats any Product as a candidate for
    // product rich results and flags it invalid without "offers", "review" or
    // "aggregateRating". This page shows none of those (price is on request via
    // "Check Price") and structured data must match what the page shows, so
    // publishing a Product would only produce an error on every model page.
    // Switch to Product + offers if the page starts displaying a price.
    const itemPage = {
        '@context': 'https://schema.org',
        '@type': 'ItemPage',
        '@id': `${url}#webpage`,
        name: `${name} Tractor`,
        url,
        description: model.description || `${name} tractor${specs ? `: ${specs}` : ''}.`,
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@type': 'Brand', name: model.brand },
        ...(model.image_url ? { primaryImageOfPage: { '@type': 'ImageObject', url: model.image_url } } : {}),
    };

    const breadcrumb = breadcrumbJsonLd([
        { name: 'Machinery', path: '/home/machinery' },
        { name: 'Tractors', path: '/home/machinery/tractors' },
        { name: `${model.brand} Tractors`, path: `/home/machinery/tractors/brand/${brandSlug(model.brand)}` },
        { name, path: `/home/machinery/tractors/${slug}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemPage) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
