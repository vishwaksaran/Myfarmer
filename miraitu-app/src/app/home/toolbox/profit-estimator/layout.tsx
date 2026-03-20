import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profit Estimator – Crop Profit & ROI Calculator',
    description: 'Estimate your crop profit, return on investment, and revenue potential. Calculate net income from farming with the Miraitu profit estimator.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/profit-estimator' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Crop Profit Estimator & ROI Calculator',
        description: 'Estimate crop profit and farming return on investment.',
        url: 'https://www.miraitu.in/home/toolbox/profit-estimator',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function ProfitEstimatorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
