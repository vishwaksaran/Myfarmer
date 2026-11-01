import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/livestock/fish',
    title: 'Fish & Aquaculture Marketplace – Buy & Sell Fish',
    description: 'Browse fish and aquaculture listings posted by sellers on Miraitu. Filter ads by location and view listing details to buy fish and aqua produce from sellers near you.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Livestock Marketplace', path: '/home/livestock' },
    { name: 'Fish & Aquaculture', path: '/home/livestock/fish' },
]);

export default function FishLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
