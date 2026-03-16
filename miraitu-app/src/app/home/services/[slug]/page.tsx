import type { Metadata } from 'next';
import GenericServicePage from './ServicePageClient';

const serviceSeo: Record<string, { title: string; description: string }> = {
    harvester: { title: 'Harvester Services - Book Crop Harvesters', description: 'Book modern harvesting machines for efficient crop harvesting. Wheat, rice & sugarcane harvesters available on Miraitu.' },
    'drone-spray': { title: 'Drone Spraying - Precision Aerial Crop Spraying', description: 'Precision aerial spraying for pesticides and liquid fertilizers. 10 acres/hour coverage with uniform application.' },
    'farm-labours': { title: 'Farm Labour - Hire Skilled Workers', description: 'Hire experienced workers for planting, weeding, and harvesting. Verified workers available on daily or contract basis.' },
    transportation: { title: 'Agri-Logistics - Farm Produce Transport', description: 'Reliable transport vehicles for moving your produce to market. Pickup trucks, tractor trolleys, and cold storage vans.' },
    technician: { title: 'Farm Technician - Equipment Repair & Maintenance', description: 'Expert technicians for farm equipment and systems installation, maintenance, and emergency repairs.' },
    plumber: { title: 'Farm Plumber - Irrigation & Water Systems', description: 'Expert plumbing services for irrigation setup, pump repair, pipeline installation, and leak fixes.' },
    electrician: { title: 'Agri-Electrician - Farm Motor & Wiring Services', description: 'Certified electricians for farm motors, panel boards, wiring faults, and solar connections.' },
    mechanic: { title: 'Tractor Mechanic - Engine & Hydraulic Repair', description: 'Specialized mechanics for tractors and farm machinery. Engine overhaul, hydraulic repair, and on-site service.' },
    'milk-vendors': { title: 'Milk Vendors - Fresh Dairy Supply', description: 'Connect with local milk vendors for fresh cow and buffalo milk delivery. Morning and evening delivery available.' },
    'storage-godown': { title: 'Storage & Godowns - Secure Agri Produce Storage', description: 'Secure storage facilities with climate control, pest management, 24/7 security, and insurance coverage.' },
    'register-provider': { title: 'Become a Service Provider on Miraitu', description: 'Register with Miraitu and start earning by offering your farm services to thousands of farmers near you.' },
};

const ALL_SLUGS = Object.keys(serviceSeo);

export function generateStaticParams() {
    return ALL_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const seo = serviceSeo[slug];
    const title = seo?.title ?? 'Farm Services';
    const description = seo?.description ?? 'Professional farm services on Miraitu.';
    const url = `https://www.miraitu.in/home/services/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website', siteName: 'Miraitu' },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default function ServicePage() {
    return <GenericServicePage />;
}
