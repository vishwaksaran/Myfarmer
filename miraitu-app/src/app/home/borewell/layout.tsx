import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Borewell Services – Professional Drilling & Pump Installation',
    description: 'Professional borewell drilling up to 1000ft and submersible pump installation services. Get expert consultation and water quality testing on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/borewell',
    },
    openGraph: {
        title: 'Borewell & Water Solutions for Farms',
        description: 'Professional borewell drilling and pump installation for sustainable farm irrigation.',
        url: 'https://miraitu.in/home/borewell',
    },
};

export default function BorewellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
