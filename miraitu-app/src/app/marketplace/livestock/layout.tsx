import { pageMetadata } from '@/lib/seo';

// Older portal reachable from the dashboard sidebar; the public versions of
// these boards live under /home, so this copy is kept out of search results.
export const metadata = pageMetadata({
    path: '/marketplace/livestock',
    title: 'Livestock Market',
    description: 'Buy and sell livestock on Miraitu.',
    noindex: true,
});

export default function MarketplaceLivestockLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
