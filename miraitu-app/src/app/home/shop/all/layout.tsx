import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'All Farm Products – Complete Agricultural Store',
    description: 'Browse all farming products in one place. Seeds, fertilizers, pesticides, tools, organic products, and more at competitive prices on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/shop/all',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'All Farm Products – Complete Store',
        description: 'Browse all agricultural products and farming supplies.',
        url: 'https://www.miraitu.in/home/shop/all',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function ShopAllLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
