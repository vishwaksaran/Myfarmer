import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm CCTV Surveillance – Security Camera Installation',
    description: 'Protect your farm with professional CCTV surveillance systems. Get camera installation, monitoring, and security solutions for agricultural properties on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/cctv',
    },
    openGraph: {
        title: 'Farm CCTV & Security Solutions',
        description: 'Professional CCTV surveillance and security camera installation for farms.',
        url: 'https://miraitu.in/home/cctv',
    },
};

export default function CCTVLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
