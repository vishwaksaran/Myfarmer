import type { Metadata } from 'next';
import { cache } from 'react';
import { getBrandBySlug } from '@/lib/machinery-db';
import { absoluteUrl, breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

// The brand page renders on the client, so its title, description, canonical
// and structured data come from here, built from the brand's tractor_brands row.

interface Props {
    params: Promise<{ slug: string }>;
    children: React.ReactNode;
}

const loadBrand = cache((slug: string) => getBrandBySlug(slug));

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
    const { slug } = await params;
    const brand = await loadBrand(slug);
    const path = `/home/machinery/tractors/brand/${slug}`;

    if (!brand) {
        return pageMetadata({
            path,
            title: 'Tractor Brand Not Found',
            description: 'This tractor brand is not available on Miraitu. Browse all tractor brands, models and specifications.',
            noindex: true,
        });
    }

    const facts = [
        brand.total_models ? `${brand.total_models}+ models` : null,
        brand.hp_range_min && brand.hp_range_max ? `${brand.hp_range_min}–${brand.hp_range_max} HP` : null,
    ].filter(Boolean).join(', ');

    return pageMetadata({
        path,
        title: `${brand.name} Tractors – All Models, Price List & Specifications`,
        description: `Explore ${brand.name} tractors${facts ? ` (${facts})` : ''} on Miraitu. Compare ${brand.name} tractor models, check specifications and get the latest price.`,
        socialTitle: `${brand.name} Tractors`,
    });
}

export default async function TractorBrandLayout({ params, children }: Props) {
    const { slug } = await params;
    const brand = await loadBrand(slug);
    if (!brand) return <>{children}</>;

    const brandLd = {
        '@context': 'https://schema.org',
        '@type': 'Brand',
        '@id': `${absoluteUrl(`/home/machinery/tractors/brand/${slug}`)}#brand`,
        name: brand.name,
        url: absoluteUrl(`/home/machinery/tractors/brand/${slug}`),
        ...(brand.description ? { description: brand.description } : {}),
        ...(brand.logo_url
            ? { logo: brand.logo_url.startsWith('/') ? absoluteUrl(brand.logo_url) : brand.logo_url }
            : {}),
        ...(brand.tagline ? { slogan: brand.tagline } : {}),
        ...(brand.website_url ? { sameAs: [brand.website_url] } : {}),
    };

    const breadcrumb = breadcrumbJsonLd([
        { name: 'Machinery', path: '/home/machinery' },
        { name: 'Tractors', path: '/home/machinery/tractors' },
        { name: `${brand.name} Tractors`, path: `/home/machinery/tractors/brand/${slug}` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(brandLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
