import { breadcrumbJsonLd, jsonLdString, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
    path: '/home/privacy-policy',
    title: 'Privacy Policy',
    description: 'Read the Miraitu privacy policy: what information we collect, how we use and protect it, and the choices you have about your data.',
});

const breadcrumb = breadcrumbJsonLd([
    { name: 'Privacy Policy', path: '/home/privacy-policy' },
]);

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
            {children}
        </>
    );
}
