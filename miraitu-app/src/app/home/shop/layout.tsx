import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm Shop – Seeds, Fertilizers, Pesticides & Equipment',
    description: 'Shop for all farming needs. Seeds, fertilizers, pesticides, farm equipment, and agricultural supplies at competitive prices on Miraitu.',
    // canonical removed from layout — set per-page to avoid children inheriting it
    openGraph: {
        title: 'Farm Shop – All Agricultural Supplies',
        description: 'Buy seeds, fertilizers, pesticides, and farm equipment online.',
        url: 'https://www.miraitu.in/home/shop',
    },
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
