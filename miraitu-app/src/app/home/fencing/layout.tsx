import type { Metadata } from 'next';
import Header from '@/components/v2/Header';
import '../globals-v2.css';

export const metadata: Metadata = {
    title: 'Farm Fencing – Professional Fencing Solutions for Agriculture',
    description: 'Protect your farm with professional fencing solutions. Wire fencing, chain link, barbed wire, and compound wall services for agricultural land on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/fencing',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Fencing Solutions',
        description: 'Professional fencing installation services for agricultural land.',
        url: 'https://www.miraitu.in/home/fencing',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Farm Fencing Solutions',
        description: 'Professional fencing installation services for agricultural land.',
    },
};

export default function FencingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#f8f9f7] dark:bg-[#161d15]">
            <Header />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Miraitu', item: 'https://www.miraitu.in' },
                            { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.miraitu.in/home/services' },
                            { '@type': 'ListItem', position: 3, name: 'Fencing', item: 'https://www.miraitu.in/home/fencing' },
                        ],
                    }),
                }}
            />
            <main className="relative z-10">
                {children}
            </main>
        </div>
    );
}
