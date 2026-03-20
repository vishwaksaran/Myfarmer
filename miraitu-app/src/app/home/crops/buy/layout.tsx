import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Buy Crops Online – Fresh Produce Direct from Farmers',
    description: 'Buy fresh crops directly from verified farmers across India. Rice, wheat, vegetables, fruits, and more at competitive prices on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/crops/buy',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Buy Crops – Direct from Farmers',
        description: 'Purchase fresh produce directly from verified farmers across India.',
        url: 'https://www.miraitu.in/home/crops/buy',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function CropsBuyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
