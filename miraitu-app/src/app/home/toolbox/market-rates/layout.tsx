import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Market Rates – Live Commodity Prices Today',
    description: 'Check live market rates for crops, vegetables, fruits, and agricultural commodities. Daily price updates from mandis across India on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/market-rates' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Live Market Rates – Commodity Prices',
        description: 'Daily market rates for crops and agricultural commodities.',
        url: 'https://www.miraitu.in/home/toolbox/market-rates',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function MarketRatesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
