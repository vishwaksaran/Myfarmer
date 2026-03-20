import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Unit Converter – Agricultural Measurement Converter',
    description: 'Convert agricultural units including weight (kg, quintal, ton), area (acres, hectares), and volume measurements for farming on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/unit-converter' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Agricultural Unit Converter',
        description: 'Convert farming units for weight, area, and volume.',
        url: 'https://www.miraitu.in/home/toolbox/unit-converter',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function UnitConverterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
