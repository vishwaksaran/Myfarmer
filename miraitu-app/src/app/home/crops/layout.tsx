import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Crops Market – Live Mandi Prices, Buy & Sell Produce',
    description: 'Check live mandi prices, buy directly from farmers, or sell your harvest at the best rates. Real-time crop market data across India on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Crop Marketplace – Live Prices & Direct Trading',
        description: 'Buy and sell crops directly. Get live mandi prices from across India.',
        url: 'https://www.miraitu.in/home/crops',
    },
};

export default function CropsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <main className="py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
