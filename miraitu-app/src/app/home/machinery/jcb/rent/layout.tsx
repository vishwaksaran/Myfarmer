import { jsonLdString, machineryModeBreadcrumb, machineryModeMetadata } from '@/lib/seo';

export const metadata = machineryModeMetadata('jcb', 'rent');

export default function JcbRentLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(machineryModeBreadcrumb('jcb', 'rent')) }}
            />
            {children}
        </>
    );
}
