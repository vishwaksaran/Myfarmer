import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Farm Land – Buy, Sell, Lease & Rent Agricultural Land',
    description: 'Find agricultural land for buy, sell, lease or rent across India. Verified listings with location details and pricing on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/land',
    },
    openGraph: {
        title: 'Agricultural Land – Buy, Sell & Lease',
        description: 'Browse verified agricultural land listings across India.',
        url: 'https://www.miraitu.in/home/land',
    },
};

export default function LandLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <main className="py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
