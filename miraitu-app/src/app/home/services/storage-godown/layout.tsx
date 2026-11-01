import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/services/storage-godown',
    title: 'Agricultural Storage & Godowns – Crop Storage',
    description: 'Find agricultural storage and godowns for your harvest through Miraitu. Store grains and produce safely until you are ready to sell.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Farm Services', path: '/home/services' },
    { name: 'Storage & Godowns', path: '/home/services/storage-godown' },
]);

export default function StorageGodownLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
