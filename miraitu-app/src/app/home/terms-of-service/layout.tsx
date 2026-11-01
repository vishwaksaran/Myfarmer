import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/terms-of-service',
    title: 'Terms of Service',
    description: 'Read the Miraitu terms of service that apply when you use the Miraitu website and app to buy, sell, rent or book farm products and services.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Terms of Service', path: '/home/terms-of-service' },
]);

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
