import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm CCTV Surveillance – Security Camera Installation',
    description: 'Protect your farm with professional CCTV surveillance systems. Get camera installation, monitoring, and security solutions for agricultural properties on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/cctv',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm CCTV & Security Solutions',
        description: 'Professional CCTV surveillance and security camera installation for farms.',
        url: 'https://www.miraitu.in/home/cctv',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Farm CCTV & Security Solutions',
        description: 'Professional CCTV surveillance and security camera installation for farms.',
    },
};

export default function CCTVLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Miraitu', item: 'https://www.miraitu.in' },
                            { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.miraitu.in/home/services' },
                            { '@type': 'ListItem', position: 3, name: 'CCTV Surveillance', item: 'https://www.miraitu.in/home/cctv' },
                        ],
                    }),
                }}
            />
            {children}
        </>
    );
}
