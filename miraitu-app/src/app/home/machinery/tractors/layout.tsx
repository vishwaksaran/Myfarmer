import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tractors – Buy, Sell & Rent New & Used Tractors',
    description: 'Browse tractors for sale, rental and purchase across India. Compare tractor models, prices, HP ratings, and connect with verified dealers on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/tractors',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Tractors for Sale & Rent',
        description: 'Buy, sell or rent tractors from verified dealers across India.',
        url: 'https://www.miraitu.in/home/machinery/tractors',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function TractorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
