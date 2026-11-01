import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/services/soil-testing',
    title: 'Soil Testing Labs – Test Your Farm Soil',
    description: 'Find soil testing labs through Miraitu. Get your farm soil tested to understand its nutrients and plan the right fertilizer and crop choices.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Farm Services', path: '/home/services' },
    { name: 'Soil Testing Labs', path: '/home/services/soil-testing' },
]);

export default function SoilTestingServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
