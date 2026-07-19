import type { Metadata } from 'next';
import ServiceCatalog from '@/components/v2/services/ServiceCatalog';
import { getServiceCategory, serviceCatalog } from '@/lib/service-catalog';

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
    return Object.keys(serviceCatalog).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const cat = getServiceCategory(category);
    const title = cat ? `${cat.title} — Book on Miraitu` : 'Book a Service';
    return {
        title,
        description: cat?.blurb ?? 'Book farm services on Miraitu.',
    };
}

export default async function ServiceBookPage({ params }: Props) {
    const { category } = await params;
    return <ServiceCatalog category={category} />;
}
