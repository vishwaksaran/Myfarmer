import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Harvesters – Buy, Sell & Rent Combine Harvesters',
    description: 'Browse combine harvesters for sale and rental. Compare harvester models, capacity, and pricing from verified dealers across India on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/harvesters',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Harvesters for Sale & Rent',
        description: 'Buy, sell or rent combine harvesters from verified dealers.',
        url: 'https://www.miraitu.in/home/machinery/harvesters',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function HarvestersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
