import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Borewell Services – Professional Drilling & Pump Installation',
    description: 'Professional borewell drilling up to 1000ft and submersible pump installation services. Get expert consultation and water quality testing on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/borewell',
    },
    openGraph: {
        title: 'Borewell & Water Solutions for Farms',
        description: 'Professional borewell drilling and pump installation for sustainable farm irrigation.',
        url: 'https://www.miraitu.in/home/borewell',
    },
};

export default function BorewellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
