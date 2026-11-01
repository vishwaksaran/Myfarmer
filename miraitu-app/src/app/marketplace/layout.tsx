import { pageMetadata } from '@/lib/seo';

// Older portal reachable from the dashboard sidebar; the public versions of
// these boards live under /home, so this copy is kept out of search results.
export const metadata = pageMetadata({
    path: '/marketplace',
    title: 'Marketplace',
    description: 'Buy, sell and discover farming essentials on Miraitu.',
    noindex: true,
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
