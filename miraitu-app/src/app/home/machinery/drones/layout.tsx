import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Agricultural Drones – Spray Drones & Precision Farming',
    description: 'Browse agricultural drones for crop spraying, mapping, and precision farming. Compare drone specs, pricing, and service providers on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/drones',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Drones – Spraying & Precision Farming',
        description: 'Agricultural drones for crop spraying and precision farming.',
        url: 'https://www.miraitu.in/home/machinery/drones',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function DronesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
