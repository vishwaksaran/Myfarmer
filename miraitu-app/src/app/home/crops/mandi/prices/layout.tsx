import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mandi Price Comparison – Daily Crop Rates by Market',
    description: 'Compare daily crop prices across mandis. Track price trends, minimum & maximum rates for all agricultural commodities on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops/mandi/prices',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Daily Mandi Price Comparison',
        description: 'Compare crop prices across mandis and track daily trends.',
        url: 'https://www.miraitu.in/home/crops/mandi/prices',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function MandiPricesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
