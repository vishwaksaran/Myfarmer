import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/rent',
    title: 'Rent Farm Equipment, Vehicles, Land & Labour',
    description: 'Find farm equipment, vehicles, land and labour offered for rent on Miraitu, priced by the hour, day or acre. Post what you have for rent and reach farmers near you.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Rent', path: '/home/rent' },
]);

export default function RentLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
