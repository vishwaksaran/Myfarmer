import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import Footer from '@/components/v2/Footer';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Smart Farm Toolbox – Soil Testing, Weather & Calculators',
    description: 'Smart farming tools including soil testing, weather forecasts, crop calculators, and agricultural planning utilities on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/toolbox',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Toolbox – Smart Testing & Planning Tools',
        description: 'Access smart farming tools for soil testing, weather, and crop planning.',
        url: 'https://miraitu.in/home/toolbox',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Farm Toolbox – Smart Testing & Planning Tools',
        description: 'Smart farming tools for soil testing, weather, and crop planning on Miraitu.',
    },
};

export default function ToolboxLayout({
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
                            { '@type': 'ListItem', position: 2, name: 'Farm Toolbox', item: 'https://miraitu.in/home/toolbox' },
                        ],
                    }),
                }}
            />
            <Header />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
