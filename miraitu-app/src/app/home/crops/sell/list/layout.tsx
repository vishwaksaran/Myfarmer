import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'List Your Produce – Sell Crops Directly to Buyers',
    description: 'Create a free listing to sell your crops directly to verified buyers. Add photos, set your price, and start receiving enquiries on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops/sell/list',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'List Your Produce for Sale',
        description: 'Sell crops directly to buyers. Create your listing in under 5 minutes.',
        url: 'https://www.miraitu.in/home/crops/sell/list',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function SellListLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
