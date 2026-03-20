import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Poultry Marketplace – Buy & Sell Chickens, Ducks & Eggs',
    description: 'Buy and sell poultry including broilers, layers, country chickens, ducks, and eggs. Connect with verified poultry farmers across India on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/livestock/poultry',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Poultry for Sale – Chickens, Ducks & Eggs',
        description: 'Buy and sell poultry from verified farmers across India.',
        url: 'https://www.miraitu.in/home/livestock/poultry',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function PoultryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
