import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Farm Services – Borewell, Fencing, CCTV & More',
    description: 'Essential farm services including borewell drilling, fencing, CCTV surveillance, solar setup, and labor booking. Professional service providers on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/services',
    },
    openGraph: {
        title: 'Farm Services – Professional Agricultural Support',
        description: 'Book farm services like borewell, fencing, CCTV, and more.',
        url: 'https://miraitu.in/home/services',
    },
};

export default function ServicesLayout({
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
