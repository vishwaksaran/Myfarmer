import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JCB & Earthmovers – Rent & Buy Construction Equipment',
    description: 'Rent or buy JCB backhoe loaders and earthmovers for farm construction, land leveling, and excavation work across India on Miraitu.',
    alternates: {
        canonical: 'https://www.miraitu.in/home/machinery/jcb',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
    openGraph: {
        title: 'JCB & Earthmovers – Rent & Buy',
        description: 'Rent or buy JCB and earthmoving equipment for farm use.',
        url: 'https://www.miraitu.in/home/machinery/jcb',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function JCBLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
