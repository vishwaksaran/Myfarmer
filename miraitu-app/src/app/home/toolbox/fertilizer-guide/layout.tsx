import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fertilizer Guide – Crop-wise Fertilizer Recommendations',
    description: 'Get crop-specific fertilizer recommendations, dosage charts, and application schedules. Science-based nutrient management on Miraitu.',
    alternates: { canonical: 'https://www.miraitu.in/home/toolbox/fertilizer-guide' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
        title: 'Fertilizer Guide – Crop Recommendations',
        description: 'Crop-specific fertilizer dosage and application schedules.',
        url: 'https://www.miraitu.in/home/toolbox/fertilizer-guide',
        type: 'website', siteName: 'Miraitu',
    },
};

export default function FertilizerGuideLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
