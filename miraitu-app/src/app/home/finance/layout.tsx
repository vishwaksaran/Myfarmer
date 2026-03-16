import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Farm Finance – Agricultural Loans & Crop Insurance',
    description: 'Access low-interest agricultural loans, crop insurance, KCC, PM-KISAN and government schemes. Quick approval with flexible repayment for Indian farmers.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/finance',
    },
    openGraph: {
        title: 'Farm Finance – Loans, Insurance & Government Schemes',
        description: 'Agricultural loans starting 4% p.a., crop insurance, and government schemes for farmers.',
        url: 'https://www.miraitu.in/home/finance',
    },
};

export default function FinanceLayout({
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
