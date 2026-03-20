import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Goats & Sheep Marketplace – Buy & Sell Small Ruminants',
    description: 'Buy and sell goats and sheep from verified sellers across India. Browse breeds, pricing, and connect directly with livestock sellers on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/livestock/goats-sheep',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Goats & Sheep for Sale',
        description: 'Buy and sell goats and sheep from verified sellers.',
        url: 'https://www.miraitu.in/home/livestock/goats-sheep',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function GoatsSheepLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
