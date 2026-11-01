import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/machinery/tractors/compare',
    title: 'Compare Tractors – Specifications Side by Side',
    description: 'Compare tractor models side by side on Miraitu. Check engine power, specifications and features of two tractors at once to choose the right one for your farm.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Machinery', path: '/home/machinery' },
    { name: 'Tractors', path: '/home/machinery/tractors' },
    { name: 'Compare Tractors', path: '/home/machinery/tractors/compare' },
]);

export default function TractorCompareLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
