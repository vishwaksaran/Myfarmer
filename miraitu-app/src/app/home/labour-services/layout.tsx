import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/labour-services',
    title: 'Farm Labour & Services – Offer Your Work',
    description: 'Offer your farm labour or services through Miraitu. Register the work you do and your rates, and the Miraitu team will review your details and get in touch.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Labour & Services', path: '/home/labour-services' },
]);

export default function LabourServicesLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
