import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Veterinary Services – Animal Healthcare On Demand',
    description: 'Book veterinary services for treatment, vaccination, artificial insemination, and deworming. Expert animal healthcare providers on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/veterinary',
    },
    openGraph: {
        title: 'Veterinary Services – Expert Animal Healthcare',
        description: 'Book veterinary services including treatment, vaccination, and AI.',
        url: 'https://miraitu.in/home/veterinary',
    },
};

export default function VeterinaryLayout({
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
