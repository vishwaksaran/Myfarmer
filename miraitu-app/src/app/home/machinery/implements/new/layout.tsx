import { jsonLdString, machineryModeBreadcrumb, machineryModeMetadata } from '@/lib/seo';

export const metadata = machineryModeMetadata('implements', 'new');

export default function ImplementsNewLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(machineryModeBreadcrumb('implements', 'new')) }}
            />
            {children}
        </>
    );
}
