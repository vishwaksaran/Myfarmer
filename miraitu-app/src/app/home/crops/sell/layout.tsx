import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sell Crops Online – List Your Harvest for Direct Sale',
    description: 'Sell your crops directly to buyers at the best prices. List your harvest, set your price, and connect with verified buyers across India on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops/sell',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Sell Crops – Direct Farmer to Buyer',
        description: 'List and sell your harvest directly to verified buyers.',
        url: 'https://www.miraitu.in/home/crops/sell',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function CropsSellLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
