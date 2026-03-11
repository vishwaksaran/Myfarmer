import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farmer Community – Connect, Learn & Share with Farmers',
    description: 'Join India\'s largest farmer community. Share farming knowledge, get advice, connect with fellow farmers, and stay updated with agricultural news on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/community',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farmer Community – Connect & Learn',
        description: 'Join India\'s largest farmer community on Miraitu.',
        url: 'https://miraitu.in/home/community',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Farmer Community – Connect & Learn',
        description: 'Join India\'s largest farmer community on Miraitu.',
    },
};

export default function CommunityLayout({
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
                            { '@type': 'ListItem', position: 1, name: 'Miraitu', item: 'https://miraitu.in' },
                            { '@type': 'ListItem', position: 2, name: 'Community', item: 'https://miraitu.in/home/community' },
                        ],
                    }),
                }}
            />
            {children}
        </>
    );
}
