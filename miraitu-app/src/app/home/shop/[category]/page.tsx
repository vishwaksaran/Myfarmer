import type { Metadata } from 'next';
import { categoryMeta } from '../categoryData';
import CategoryPageClient from './CategoryPageClient';

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
    const url = `https://miraitu.in/home/shop/${category}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website', siteName: 'Miraitu' },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default function ShopCategoryPage() {
    return <CategoryPageClient />;
}
