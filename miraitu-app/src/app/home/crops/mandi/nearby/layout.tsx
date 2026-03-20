import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nearby Mandis – Find Markets Near You | Miraitu',
    description: 'Locate the nearest agricultural mandis and markets around your area. Get directions, crop prices, and market details.',
    alternates: { canonical: 'https://www.miraitu.in/home/crops/mandi/nearby' },
    openGraph: {
        title: 'Nearby Mandis – Find Markets Near You | Miraitu',
        description: 'Locate the nearest agricultural mandis and markets around your area.',
        url: 'https://www.miraitu.in/home/crops/mandi/nearby',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function NearbyMandiLayout({ children }: { children: React.ReactNode }) {
    return children;
}
