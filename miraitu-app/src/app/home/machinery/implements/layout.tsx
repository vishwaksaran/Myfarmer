import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farm Implements – Ploughs, Cultivators & Attachments',
    description: 'Browse tractor implements including ploughs, cultivators, rotavators, seeders, and other attachments from verified sellers on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/implements',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'Farm Implements & Tractor Attachments',
        description: 'Buy and sell farm implements and tractor attachments.',
        url: 'https://www.miraitu.in/home/machinery/implements',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function ImplementsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
