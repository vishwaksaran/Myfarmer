import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mandi Prices – Live Crop Market Rates Across India',
    description: 'Check live mandi prices for all crops across government-regulated agricultural markets in India. Real-time updates on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops/mandi',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Live Mandi Prices – Crop Market Rates',
        description: 'Real-time mandi prices for crops across Indian markets.',
        url: 'https://www.miraitu.in/home/crops/mandi',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function MandiLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
