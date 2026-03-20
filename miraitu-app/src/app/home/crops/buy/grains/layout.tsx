import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Buy Grains – Wheat, Rice, Millets & More | Miraitu',
    description: 'Browse and buy quality grains directly from farmers. Wheat, rice, millets, bajra, jowar and more at best prices.',
    alternates: { canonical: 'https://www.miraitu.in/home/crops/buy/grains' },
    openGraph: {
        title: 'Buy Grains – Wheat, Rice, Millets & More | Miraitu',
        description: 'Browse and buy quality grains directly from farmers.',
        url: 'https://www.miraitu.in/home/crops/buy/grains',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function BuyGrainsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
