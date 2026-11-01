import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/buy-sell',
    title: 'Buy & Sell – Machinery, Vehicles, Animals, Land & Crops',
    description: 'Browse everything listed for sale on Miraitu: farm machinery, vehicles, animals, land, crops and more. Post your own ad and reach buyers across India.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Buy & Sell', path: '/home/buy-sell' },
]);

export default function BuySellLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
