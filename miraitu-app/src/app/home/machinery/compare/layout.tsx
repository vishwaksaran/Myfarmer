import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Compare Machinery – Side-by-Side Comparison | Miraitu',
    description: 'Compare tractors, harvesters, JCBs and other farm machinery side by side. Compare specs, prices, and features to find the best equipment.',
    alternates: { canonical: 'https://www.miraitu.in/home/machinery/compare' },
    openGraph: {
        title: 'Compare Machinery – Side-by-Side Comparison | Miraitu',
        description: 'Compare farm machinery side by side — specs, prices, and features.',
        url: 'https://www.miraitu.in/home/machinery/compare',
        type: 'website',
        siteName: 'Miraitu',
    },
};

export default function MachineryCompareLayout({ children }: { children: React.ReactNode }) {
    return children;
}
