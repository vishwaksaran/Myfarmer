import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Livestock Marketplace – Buy & Sell Cattle, Goats, Poultry',
    description: 'India\'s largest livestock marketplace. Buy and sell cattle, goats, sheep, poultry, fish and more from verified sellers. Contact directly on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/livestock',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Livestock Marketplace – Cattle, Goats, Poultry & More',
        description: 'Buy and sell livestock from verified sellers across India.',
        url: 'https://miraitu.in/home/livestock',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Livestock Marketplace – Cattle, Goats, Poultry & More',
        description: 'Buy and sell livestock from verified sellers across India.',
    },
};

export default function LivestockLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Miraitu', item: 'https://miraitu.in' },
                            { '@type': 'ListItem', position: 2, name: 'Livestock Marketplace', item: 'https://miraitu.in/home/livestock' },
                        ],
                    }),
                }}
            />
            <Header />
            <main className="py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
