import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/services/rent-machinery',
    title: 'Farm Machinery Rentals – Rent Tractors & Equipment',
    description: 'Rent farm machinery through Miraitu. Find tractors and agricultural equipment available for hire and book the machine you need for ploughing, sowing or harvesting.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Farm Services', path: '/home/services' },
    { name: 'Farm Machinery Rentals', path: '/home/services/rent-machinery' },
]);

export default function RentMachineryServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
