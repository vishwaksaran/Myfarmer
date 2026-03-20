import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rent Agricultural Land – Farm Land for Rent in India',
    description: 'Find agricultural land available for rent across India. Short-term seasonal and annual farm land rental with verified landlords on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/land/rent',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Rent Farm Land – Agricultural Land for Rent',
        description: 'Agricultural land available for rent from verified landlords.',
        url: 'https://www.miraitu.in/home/land/rent',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function LandRentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
