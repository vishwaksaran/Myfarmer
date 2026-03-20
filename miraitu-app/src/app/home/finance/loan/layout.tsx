import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agricultural Loans – Low Interest Farm Loans & KCC',
    description: 'Apply for low-interest agricultural loans, Kisan Credit Card (KCC), and NABARD farm finance. Quick approval with flexible EMI options on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/finance/loan',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Loans – Agricultural Finance Solutions',
        description: 'Low-interest agricultural loans and KCC for Indian farmers.',
        url: 'https://www.miraitu.in/home/finance/loan',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function LoanLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
