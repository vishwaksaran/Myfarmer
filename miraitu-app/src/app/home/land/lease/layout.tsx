import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lease Agricultural Land – Farm Land for Lease in India',
    description: 'Find agricultural land available for lease across India. Long-term and short-term farm land lease options with verified landowners on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/land/lease',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Lease Farm Land – Agricultural Land for Lease',
        description: 'Agricultural land available for lease from verified landowners.',
        url: 'https://www.miraitu.in/home/land/lease',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function LandLeaseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
