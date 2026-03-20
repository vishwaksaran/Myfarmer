import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cattle Marketplace – Buy & Sell Cows, Bulls & Buffalo',
    description: 'Buy and sell cattle including cows, bulls, and buffalo from verified sellers. Browse livestock listings with photos, breed info and pricing on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/livestock/cattle',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Cattle for Sale – Cows, Bulls & Buffalo',
        description: 'Buy and sell cattle from verified sellers across India.',
        url: 'https://www.miraitu.in/home/livestock/cattle',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function CattleLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
