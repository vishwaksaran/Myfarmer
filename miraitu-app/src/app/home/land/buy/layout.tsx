import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Buy Agricultural Land – Farm Land for Sale Across India',
    description: 'Browse verified agricultural land listings for sale across India. Find farm land with location details, pricing, and direct seller contact on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/land/buy',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Buy Farm Land – Agricultural Land for Sale',
        description: 'Verified agricultural land listings for sale across India.',
        url: 'https://www.miraitu.in/home/land/buy',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function LandBuyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
