import { jsonLdString, machineryModeBreadcrumb, machineryModeMetadata } from '@/lib/seo';

export const metadata = machineryModeMetadata('drones', 'rent');

export default function DronesRentLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdString(machineryModeBreadcrumb('drones', 'rent')) }}
            />
            {children}
        </>
    );
}
