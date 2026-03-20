import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crop Insurance – PMFBY & Weather-Based Insurance',
    description: 'Get crop insurance under PM Fasal Bima Yojana (PMFBY) and weather-based crop insurance. Protect your harvest from natural disasters on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/finance/insurance',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Crop Insurance – Protect Your Harvest',
        description: 'PMFBY and weather-based crop insurance for Indian farmers.',
        url: 'https://www.miraitu.in/home/finance/insurance',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function InsuranceLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
