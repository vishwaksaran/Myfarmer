import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Agricultural Machinery – Buy, Sell & Rent Farm Equipment',
    description: 'Browse tractors, JCBs, harvesters, power tillers, drones & implements. Buy new, sell used, or rent farm machinery on Miraitu – India\'s #1 farming app.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery',
    },
    openGraph: {
        title: 'Farm Machinery – Tractors, JCB, Harvesters & More',
        description: 'Buy, sell or rent agricultural machinery from verified sellers across India.',
        url: 'https://www.miraitu.in/home/machinery',
    },
};

export default function MachineryLayout({
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
