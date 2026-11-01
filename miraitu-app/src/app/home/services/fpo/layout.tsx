import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/services/fpo',
    title: 'FPO – Farmer Producer Organization Registration',
    description: 'Learn how a Farmer Producer Organization (FPO) helps small farmers buy inputs and sell produce together, and register your interest in joining an FPO through Miraitu.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Farm Services', path: '/home/services' },
    { name: 'FPO', path: '/home/services/fpo' },
]);

export default function FpoLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
