import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crop Protection – Pest Control & Plant Health Solutions',
    description: 'Protect your crops with professional pest control, plant disease management, and crop protection services on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/protection',
    },
    openGraph: {
        title: 'Crop Protection Services',
        description: 'Professional pest control and crop protection solutions for farmers.',
        url: 'https://www.miraitu.in/home/protection',
    },
};

export default function ProtectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
