import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sell Agricultural Land – List Your Farm Land for Sale',
    description: 'List your agricultural land for sale on Miraitu. Reach verified buyers, set your price, and sell farm land with location details and documentation.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/land/sell',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Sell Farm Land – List Agricultural Property',
        description: 'List and sell your agricultural land to verified buyers.',
        url: 'https://www.miraitu.in/home/land/sell',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function LandSellLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
