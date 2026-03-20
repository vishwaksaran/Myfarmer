import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Land Area Calculator – Convert Acres, Hectares & Bigha',
    description: 'Convert land area units between acres, hectares, bigha, guntha, cents, and square feet. Free land measurement calculator on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/land-area' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Land Area Calculator & Unit Converter',
        description: 'Convert land measurements between acres, hectares, bigha, and more.',
        url: 'https://www.miraitu.in/home/toolbox/land-area',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function LandAreaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
