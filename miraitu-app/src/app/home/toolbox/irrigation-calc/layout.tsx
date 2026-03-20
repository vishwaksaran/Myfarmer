import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Irrigation Calculator – Water Requirement & Drip Planning',
    description: 'Calculate crop water requirements, plan drip irrigation systems, and optimize water usage for your farm with Miraitu irrigation tools.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/irrigation-calc' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Irrigation Calculator – Water Planning',
        description: 'Calculate water requirements and plan irrigation for your farm.',
        url: 'https://www.miraitu.in/home/toolbox/irrigation-calc',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function IrrigationCalcLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
