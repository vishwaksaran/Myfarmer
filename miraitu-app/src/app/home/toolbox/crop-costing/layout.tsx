import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crop Costing Calculator – Estimate Farming Expenses',
    description: 'Calculate your crop production costs including seeds, fertilizers, labor, and irrigation. Plan your budget and maximize profit on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/crop-costing' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Crop Costing Calculator',
        description: 'Estimate farming expenses and plan your crop budget.',
        url: 'https://www.miraitu.in/home/toolbox/crop-costing',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function CropCostingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
