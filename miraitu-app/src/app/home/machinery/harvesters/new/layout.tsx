import { jsonLdString, machineryModeBreadcrumb, machineryModeMetadata } from '@/lib/seo';

export const metadata = machineryModeMetadata('harvesters', 'new');

export default function HarvestersNewLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(machineryModeBreadcrumb('harvesters', 'new')) }}
            />
            {children}
        </>
    );
}
