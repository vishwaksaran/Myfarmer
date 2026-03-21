import type { Metadata } from 'next';
import { categoryMeta } from '../categoryData';
import CategoryPageClient from '../[category]/CategoryPageClient';

const meta = categoryMeta['solar-dry-products'];

export const metadata: Metadata = {
    title: meta ? `${meta.title} - Farm Shop` : 'Solar Dry Products - Farm Shop',
    description: meta?.description ?? 'Shop solar-dried and dehydrated farm products on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/shop/solar-dry-products' },
    openGraph: {
        title: meta ? `${meta.title} - Farm Shop` : 'Solar Dry Products - Farm Shop',
        description: meta?.description ?? 'Shop solar-dried and dehydrated farm products on Miraitu.',
        url: 'https://www.miraitu.in/home/shop/solar-dry-products',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: meta ? `${meta.title} - Farm Shop` : 'Solar Dry Products - Farm Shop',
        description: meta?.description ?? 'Shop solar-dried and dehydrated farm products on Miraitu.',
    },
};

export default function SolarDryProductsPage() {
    return <CategoryPageClient categorySlug="solar-dry-products" />;
}
