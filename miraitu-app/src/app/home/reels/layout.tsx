import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/reels',
    title: 'Farmer Reels – Short Farming Videos',
    description: 'Watch short farming videos shared by the Miraitu community: farm tips, machinery, livestock and harvest moments from farmers across India.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Reels', path: '/home/reels' },
]);

export default function ReelsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
