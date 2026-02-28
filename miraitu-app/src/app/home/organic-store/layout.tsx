import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Organic Store – Natural Farming Products & Supplies',
    description: 'Shop organic and natural farming products. Organic fertilizers, pesticides, seeds, and farm supplies delivered to your doorstep on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/organic-store',
    },
    openGraph: {
        title: 'Organic Farm Store – Natural Products & Supplies',
        description: 'Shop organic fertilizers, pesticides, seeds, and farm supplies.',
        url: 'https://miraitu.in/home/organic-store',
    },
};

export default function OrganicStoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
