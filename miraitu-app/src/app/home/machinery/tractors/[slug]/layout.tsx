import type { Metadata } from 'next';
import { cache } from 'react';
import { getModelBySlug, type MachineryModel } from '@/lib/machinery-db';
import { absoluteUrl, breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

// The model page renders on the client, so its title, description, canonical
// and structured data come from here. Everything is built from the model's own
// row in machinery_models — no field is filled in when the database has none.

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
    const properties = [
        model.hp ? { name: 'Engine power', value: model.hp, unitText: 'HP' } : null,
        model.engine_cc ? { name: 'Engine displacement', value: model.engine_cc, unitText: 'cc' } : null,
        model.cylinders ? { name: 'Cylinders', value: model.cylinders } : null,
        model.drive_type ? { name: 'Drive type', value: model.drive_type } : null,
        model.fuel_type ? { name: 'Fuel type', value: model.fuel_type } : null,
        model.warranty_years ? { name: 'Warranty', value: model.warranty_years, unitText: 'years' } : null,
    ].filter(Boolean).map((p) => ({ '@type': 'PropertyValue', ...p }));

    const product = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${url}#product`,
        name,
        url,
        category: 'Tractor',
        brand: { '@type': 'Brand', name: model.brand },
        model: model.model_name,
        ...(model.description ? { description: model.description } : {}),
        ...(model.image_url ? { image: model.image_url } : {}),
        ...(properties.length ? { additionalProperty: properties } : {}),
    };

    const breadcrumb = breadcrumbJsonLd([
        { name: 'Machinery', path: '/home/machinery' },
        { name: 'Tractors', path: '/home/machinery/tractors' },
        { name: `${model.brand} Tractors`, path: `/home/machinery/tractors/brand/${brandSlug(model.brand)}` },
        { name, path: `/home/machinery/tractors/${slug}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(product) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
