import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Farm Services – Borewell, Fencing, CCTV & More',
    description: 'Essential farm services including borewell drilling, fencing, CCTV surveillance, solar setup, and labor booking. Professional service providers on Miraitu.',
    // canonical removed from layout — set per-page to avoid children inheriting it
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Services – Professional Agricultural Support',
        description: 'Book farm services like borewell, fencing, CCTV, and more.',
        url: 'https://miraitu.in/home/services',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Farm Services – Professional Agricultural Support',
        description: 'Book farm services like borewell, fencing, CCTV, and more on Miraitu.',
    },
};

export default function ServicesLayout({
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
                            { '@type': 'ListItem', position: 2, name: 'Farm Services', item: 'https://miraitu.in/home/services' },
                        ],
                    }),
                }}
            />
            <Header />
            <main className="py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
}
