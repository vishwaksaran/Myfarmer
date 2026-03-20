import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Soil Testing Guide – How to Test Your Farm Soil',
    description: 'Learn about soil testing procedures, lab locations, and how to interpret soil health reports. Optimize fertilizer use based on soil analysis on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/soil-testing' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Soil Testing Guide for Farmers',
        description: 'Complete guide to soil testing and health analysis.',
        url: 'https://www.miraitu.in/home/toolbox/soil-testing',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function SoilTestingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
