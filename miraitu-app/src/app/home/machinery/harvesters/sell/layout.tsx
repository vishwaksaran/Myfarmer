import { jsonLdString, machineryModeBreadcrumb, machineryModeMetadata } from '@/lib/seo';

export const metadata = machineryModeMetadata('harvesters', 'sell');

export default function HarvestersSellLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(machineryModeBreadcrumb('harvesters', 'sell')) }}
            />
            {children}
        </>
    );
}
