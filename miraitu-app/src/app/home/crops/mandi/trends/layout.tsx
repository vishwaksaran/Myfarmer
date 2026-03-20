import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mandi Price Trends – Crop Price Analysis | Miraitu',
    description: 'Analyze historical crop price trends across Indian mandis. View charts, compare commodities, and make informed selling decisions.',
    alternates: { canonical: 'https://www.miraitu.in/home/crops/mandi/trends' },
    openGraph: {
        title: 'Mandi Price Trends – Crop Price Analysis | Miraitu',
        description: 'Analyze historical crop price trends across Indian mandis.',
        url: 'https://www.miraitu.in/home/crops/mandi/trends',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function MandiTrendsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
