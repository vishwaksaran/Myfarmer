import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/veterinary/semen-finder',
    title: 'Semen Finder – Cow, Buffalo & Goat Breeds',
    description: 'Find breeding semen by species and breed on Miraitu: cow breeds like Gir, Sahiwal and Holstein Friesian, buffalo breeds like Murrah and goat breeds like Boer and Sirohi.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Veterinary Services', path: '/home/veterinary' },
    { name: 'Semen Finder', path: '/home/veterinary/semen-finder' },
]);

export default function SemenFinderLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
