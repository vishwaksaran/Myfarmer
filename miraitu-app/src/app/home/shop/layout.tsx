import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm Shop – Seeds, Fertilizers, Pesticides & Equipment',
    description: 'Shop for all farming needs. Seeds, fertilizers, pesticides, farm equipment, and agricultural supplies at competitive prices on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/shop',
    },
    openGraph: {
        title: 'Farm Shop – All Agricultural Supplies',
        description: 'Buy seeds, fertilizers, pesticides, and farm equipment online.',
        url: 'https://miraitu.in/home/shop',
    },
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
