import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Small Farm Machinery – Power Tillers, Sprayers & More',
    description: 'Browse small farm machinery including power tillers, sprayers, weeders, and portable equipment for small and medium farms on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/small-machineries',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Small Farm Machinery & Equipment',
        description: 'Power tillers, sprayers, weeders, and portable farm equipment.',
        url: 'https://www.miraitu.in/home/machinery/small-machineries',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function SmallMachineriesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
