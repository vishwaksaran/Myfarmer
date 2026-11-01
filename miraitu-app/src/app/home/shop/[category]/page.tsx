import type { Metadata } from 'next';
import { categoryMeta } from '../categoryData';
import CategoryPageClient from './CategoryPageClient';
import { breadcrumbJsonLd, jsonLdString } from '@/lib/seo';

const ALL_CATEGORIES = Object.keys(categoryMeta);

export function generateStaticParams() {
    return ALL_CATEGORIES.map((category) => ({ category }));
}

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const meta = categoryMeta[category];
    const title = meta ? `${meta.title} - Farm Shop` : 'Farm Shop';
    const description = meta?.description ?? 'Shop for all farming needs on Miraitu.';
    const url = `https://www.miraitu.in/home/shop/${category}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website', siteName: 'Miraitu' },
        twitter: { card: 'summary_large_image', title, description },
    };
}

// Breadcrumb only. The catalog in categoryData is sample data (placeholder
// ratings, review counts and stock photos), so it is deliberately not published
// as Product / AggregateRating structured data.
export default async function ShopCategoryPage({ params }: Props) {
    const { category } = await params;
    const meta = categoryMeta[category];
    const breadcrumb = meta
        ? breadcrumbJsonLd([
            { name: 'Farm Shop', path: '/home/shop' },
            { name: meta.title, path: `/home/shop/${category}` },
        ])
        : null;
    return (
        <>
            {breadcrumb && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            )}
            <CategoryPageClient />
        </>
    );
}
