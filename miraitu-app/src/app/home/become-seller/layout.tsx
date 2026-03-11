import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Become a Seller – Join Miraitu as a Dealer or Service Provider',
    description: 'Register as a seller, dealer, or service provider on Miraitu. Reach thousands of farmers and grow your agricultural business across India.',
    alternates: {
        canonical: 'https://miraitu.in/home/become-seller',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Become a Seller on Miraitu',
        description: 'Join India\'s leading agriculture platform as a seller, dealer, or service provider.',
        url: 'https://miraitu.in/home/become-seller',
        type: 'website',
        siteName: 'Miraitu',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Become a Seller on Miraitu',
        description: 'Register as a seller or dealer on India\'s #1 agriculture super app.',
    },
};

export default function BecomeSellerLayout({
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
                            { '@type': 'ListItem', position: 2, name: 'Become a Seller', item: 'https://miraitu.in/home/become-seller' },
                        ],
                    }),
                }}
            />
            {children}
        </>
    );
}
