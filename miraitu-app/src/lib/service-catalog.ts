// ============================================================================
// SERVICE CATALOG
// ----------------------------------------------------------------------------
// Drives the "Top Categories" booking flow (Drivers/Operators, Drone Spray,
// Manual Labour, Soil Testing, Transplanting). Each category lists priced
// items. Tapping an item opens a sheet that asks a few questions + quantity,
// then adds it to the service cart. The cart collects Date / Time / Location
// and creates a booking.
//
// Fully data-driven — add/remove categories, items or questions here with no
// component changes.
// ============================================================================

export type ServiceUnit = 'day' | 'hour' | 'acre' | 'sample' | 'job' | 'worker';

export const serviceUnitLabel: Record<ServiceUnit, string> = {
    day: '/day',
    hour: '/hr',
    acre: '/acre',
    sample: '/sample',
    job: '/job',
    worker: '/worker',
};

export interface ServiceQuestion {
    id: string;
    label: string;
    type: 'select' | 'text' | 'number';
    options?: string[];
    required?: boolean;
    placeholder?: string;
}

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    unit: ServiceUnit;
    image: string;
    description?: string;
    tags?: string[];
}

export interface ServiceCategory {
    slug: string;
    title: string;
    icon: string;
    /** Category thumbnail used in the "All Categories" chip row. */
    image: string;
    blurb: string;
    maxQuantity?: number;
    questions: ServiceQuestion[];
    items: ServiceItem[];
}

// ── Catalog ─────────────────────────────────────────────────────────────────
export const serviceCatalog: Record<string, ServiceCategory> = {
    'drivers-operators': {
        slug: 'drivers-operators',
        title: 'Drivers / Operators',
        icon: 'engineering',
        image: '/images/DriversOperators.png',
        blurb: 'Hire experienced machine operators and drivers on demand.',
        maxQuantity: 5,
        questions: [
            { id: 'duration', label: 'How many days?', type: 'select', options: ['1 day', '2–3 days', 'Weekly', 'Monthly'], required: true },
            { id: 'shift', label: 'Preferred shift', type: 'select', options: ['Day shift', 'Night shift', 'Full day'], required: true },
            { id: 'notes', label: 'Work details (optional)', type: 'text', placeholder: 'e.g. levelling 2 acres near the canal' },
        ],
        items: [
            { id: 'jcb-operator', name: 'JCB Driver / Operator', price: 1300, unit: 'day', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop', description: 'Certified backhoe / excavator operator.', tags: ['Certified'] },
            { id: 'harvester-operator', name: 'Harvester Operator / Driver', price: 1000, unit: 'day', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', description: 'Experienced combine harvester operator.', tags: ['Experienced'] },
            { id: 'tractor-driver', name: 'Tractor Driver', price: 800, unit: 'day', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop', description: 'Skilled tractor driver for tillage and haulage.', tags: ['Skilled'] },
        ],
    },
    'drone-spray': {
        slug: 'drone-spray',
        title: 'Drone Spray',
        icon: 'flight',
        image: '/images/Dronespray.png',
        blurb: 'Precision aerial spraying for pesticides and liquid fertilizers.',
        maxQuantity: 50,
        questions: [
            { id: 'spray', label: 'What to spray?', type: 'select', options: ['Pesticide', 'Fungicide', 'Liquid fertilizer', 'Herbicide'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 10', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Chemical name, crop stage, etc.' },
        ],
        items: [
            { id: 'drone-10l', name: 'Agri Spraying Drone (10L)', price: 400, unit: 'acre', image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&h=400&fit=crop', description: '10L tank, ~7 acres/hour with trained pilot.', tags: ['10L', 'Pilot included'] },
            { id: 'drone-25l', name: 'Heavy Spraying Drone (25L)', price: 500, unit: 'acre', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop', description: '25L tank for large fields, ~12 acres/hour.', tags: ['25L', 'Pilot included'] },
        ],
    },
    'manual-labour': {
        slug: 'manual-labour',
        title: 'Manual Labour',
        icon: 'groups',
        image: '/images/Labour.png',
        blurb: 'Reliable workers for general tasks and skilled farm operations.',
        maxQuantity: 50,
        questions: [
            { id: 'workers', label: 'How many workers?', type: 'number', placeholder: 'e.g. 4', required: true },
            { id: 'days', label: 'How many days?', type: 'number', placeholder: 'e.g. 2', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Any special requirement' },
        ],
        items: [
            { id: 'farm-bunds', name: 'Farm Bunds Making (Manual)', price: 550, unit: 'day', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop', description: 'Manual construction and repair of field bunds.', tags: ['Field work'] },
            { id: 'hamali', name: 'HAMALI Worker', price: 500, unit: 'day', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop', description: 'Loading, unloading and bagging labour.', tags: ['Loading'] },
            { id: 'chilli-harvest', name: 'Chilli Harvest', price: 450, unit: 'day', image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&h=400&fit=crop', description: 'Skilled hands for chilli picking.', tags: ['Harvest'] },
            { id: 'weeding', name: 'Weeding', price: 400, unit: 'day', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop', description: 'Manual weeding and field cleaning.', tags: ['Weeding'] },
            { id: 'power-spray', name: 'Power Spray Operator', price: 600, unit: 'day', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', description: 'Operator for knapsack / power sprayers.', tags: ['Spraying'] },
            { id: 'fertilizer-broadcaster', name: 'Fertilizer Broadcaster', price: 500, unit: 'day', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop', description: 'Manual fertilizer broadcasting across fields.', tags: ['Fertilizer'] },
        ],
    },
    'soil-testing': {
        slug: 'soil-testing',
        title: 'Soil Testing & Analysis',
        icon: 'science',
        image: '/images/SoilTtesting.png',
        blurb: 'Accurate soil health reports and fertilizer recommendations.',
        maxQuantity: 20,
        questions: [
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 5', required: true },
            { id: 'collection', label: 'Sample collection', type: 'select', options: ['Agent visits my farm', 'I will drop the sample'], required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Crop grown, past issues, etc.' },
        ],
        items: [
            { id: 'basic-test', name: 'Basic Soil Analysis', price: 500, unit: 'sample', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop', description: 'pH, EC, organic carbon and texture.', tags: ['Essential'] },
            { id: 'comprehensive-test', name: 'Comprehensive Package', price: 1200, unit: 'sample', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', description: 'Macro + micro nutrients with recommendations.', tags: ['Popular'] },
            { id: 'micro-test', name: 'Micro-Nutrient Test', price: 800, unit: 'sample', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop', description: 'Zinc, boron, iron and sulphur analysis.', tags: ['Add-on'] },
        ],
    },
    transplanting: {
        slug: 'transplanting',
        title: 'Transplanting',
        icon: 'grass',
        image: '/images/Transplanting.png',
        blurb: 'Paddy and vegetable transplanting by crew or machine.',
        maxQuantity: 50,
        questions: [
            { id: 'crop', label: 'Which crop?', type: 'select', options: ['Paddy / Rice', 'Vegetables', 'Sugarcane', 'Other'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 3', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Seedling readiness, field condition, etc.' },
        ],
        items: [
            { id: 'manual-transplant', name: 'Manual Transplanting Crew', price: 500, unit: 'acre', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop', description: 'Trained crew for hand transplanting.', tags: ['Crew'] },
            { id: 'machine-transplant', name: 'Paddy Transplanter (Machine)', price: 900, unit: 'acre', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', description: 'Rice transplanter machine with operator.', tags: ['Machine'] },
        ],
    },
    'machinery-tools': {
        slug: 'machinery-tools',
        title: 'Machinery & Tools',
        icon: 'agriculture',
        image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=200&h=200&fit=crop',
        blurb: 'Rent farm machines and tools with or without an operator.',
        maxQuantity: 5,
        questions: [
            { id: 'operator', label: 'Operator needed?', type: 'select', options: ['With operator', 'Without operator'], required: true },
            { id: 'requirement', label: 'Area / duration', type: 'text', placeholder: 'e.g. 3 acres or 4 hours' },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Work details' },
        ],
        items: [
            { id: 'bund-maker', name: 'Bund Maker Machine', price: 600, unit: 'acre', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop', description: 'Tractor-drawn bund forming machine.', tags: ['Bunds'] },
            { id: 'tractor-trolley', name: 'Tractor Trolley', price: 800, unit: 'day', image: 'https://images.unsplash.com/photo-1605338198618-ec3e0e0e0e0e?w=600&h=400&fit=crop', description: 'Tractor with trolley for haulage and transport.', tags: ['Haulage'] },
            { id: 'baler', name: 'Baler', price: 1200, unit: 'acre', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&h=400&fit=crop', description: 'Straw / hay baler for residue management.', tags: ['Baling'] },
            { id: 'harvester', name: 'Harvester', price: 1500, unit: 'acre', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop', description: 'Combine harvester for wheat and paddy.', tags: ['Harvest'] },
            { id: 'tractor-service', name: 'Tractor Service', price: 800, unit: 'hour', image: 'https://images.unsplash.com/photo-1533603208986-24fd819e718f?w=600&h=400&fit=crop', description: 'Tractor with driver for tillage and field work.', tags: ['Tractor'] },
        ],
    },
};

export const serviceCategoryList: ServiceCategory[] = Object.values(serviceCatalog);

export function getServiceCategory(slug: string): ServiceCategory | undefined {
    return serviceCatalog[slug];
}
