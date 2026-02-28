import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm Fencing – Professional Fencing Solutions for Agriculture',
    description: 'Protect your farm with professional fencing solutions. Wire fencing, chain link, barbed wire, and compound wall services for agricultural land on Miraitu.',
    alternates: {
        canonical: 'https://miraitu.in/home/fencing',
    },
    openGraph: {
        title: 'Farm Fencing Solutions',
        description: 'Professional fencing installation services for agricultural land.',
        url: 'https://miraitu.in/home/fencing',
    },
};

export default function FencingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
