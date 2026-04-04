import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Organic Store – Natural Farming Products & Supplies',
    description: 'Shop organic and natural farming products. Organic fertilizers, pesticides, seeds, and farm supplies delivered to your doorstep on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/organic-store',
    },
    openGraph: {
        title: 'Organic Farm Store – Natural Products & Supplies',
        description: 'Shop organic fertilizers, pesticides, seeds, and farm supplies.',
        url: 'https://www.miraitu.in/home/organic-store',
    },
};

export default function OrganicStoreLayout({
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
