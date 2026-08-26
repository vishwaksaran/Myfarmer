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
    /** i18n key for the title — resolve with t(titleKey) in components. */
    titleKey: string;
    icon: string;
    /** Category thumbnail used in the "All Categories" chip row. */
    image: string;
    blurb: string;
    /**
     * i18n key for the stepper's label. "Quantity" is meaningless next to a
     * price like ₹1,300/day — what the farmer is actually counting differs per
     * category (operators, acres, workers, samples). Falls back to
     * 'catalog.quantity' when a category has nothing better to say.
     */
    quantityLabelKey?: string;
    maxQuantity?: number;
    questions: ServiceQuestion[];
    items: ServiceItem[];
}

// ── Catalog ─────────────────────────────────────────────────────────────────
export const serviceCatalog: Record<string, ServiceCategory> = {
    'drivers-operators': {
        slug: 'drivers-operators',
        title: 'Drivers / Operators',
        titleKey: 'cat.driversOperators',
        icon: 'engineering',
        image: '/images/services/categories/Driveroperator.png',
        blurb: 'Hire experienced machine operators and drivers on demand.',
        quantityLabelKey: 'catalog.numberOfOperators',
        maxQuantity: 5,
        questions: [
            { id: 'duration', label: 'How many days?', type: 'select', options: ['1 day', '2–3 days', 'Weekly', 'Monthly'], required: true },
            { id: 'shift', label: 'Preferred shift', type: 'select', options: ['Day shift', 'Night shift', 'Full day'], required: true },
            { id: 'notes', label: 'Work details (optional)', type: 'text', placeholder: 'e.g. levelling 2 acres near the canal' },
        ],
        items: [
            { id: 'jcb-operator', name: 'JCB Driver / Operator', price: 1300, unit: 'day', image: '/images/services/drivers-operators/Jcboperator.png', description: 'Certified backhoe / excavator operator.', tags: ['Certified'] },
            { id: 'harvester-operator', name: 'Harvester Operator / Driver', price: 1000, unit: 'day', image: '/images/services/drivers-operators/harvesterdriver.png', description: 'Experienced combine harvester operator.', tags: ['Experienced'] },
            { id: 'tractor-driver', name: 'Tractor Driver', price: 800, unit: 'day', image: '/images/services/drivers-operators/tractordriver.png', description: 'Skilled tractor driver for tillage and haulage.', tags: ['Skilled'] },
        ],
    },
    'drone-spray': {
        slug: 'drone-spray',
        title: 'Drone Spray',
        titleKey: 'cat.droneSpray',
        icon: 'flight',
        image: '/images/services/categories/Dronespray.png',
        blurb: 'Precision aerial spraying for pesticides and liquid fertilizers.',
        quantityLabelKey: 'catalog.numberOfAcres',
        maxQuantity: 50,
        questions: [
            { id: 'spray', label: 'What to spray?', type: 'select', options: ['Pesticide', 'Fungicide', 'Liquid fertilizer', 'Herbicide'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 10', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Chemical name, crop stage, etc.' },
        ],
        items: [
            { id: 'drone-10l', name: 'Agri Spraying Drone (10L)', price: 400, unit: 'acre', image: '/images/services/drone-spray/Agridrones.png', description: '10L tank, ~7 acres/hour with trained pilot.', tags: ['10L', 'Pilot included'] },
            { id: 'drone-25l', name: 'Heavy Spraying Drone (25L)', price: 500, unit: 'acre', image: '/images/services/drone-spray/harddrones.png', description: '25L tank for large fields, ~12 acres/hour.', tags: ['25L', 'Pilot included'] },
        ],
    },
    'manual-labour': {
        slug: 'manual-labour',
        title: 'Manual Labour',
        titleKey: 'cat.manualLabour',
        icon: 'groups',
        image: '/images/services/categories/Labour.png',
        blurb: 'Reliable workers for general tasks and skilled farm operations.',
        quantityLabelKey: 'catalog.numberOfWorkers',
        maxQuantity: 50,
        questions: [
            { id: 'workers', label: 'How many workers?', type: 'number', placeholder: 'e.g. 4', required: true },
            { id: 'days', label: 'How many days?', type: 'number', placeholder: 'e.g. 2', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Any special requirement' },
        ],
        items: [
            { id: 'farm-bunds', name: 'Farm Bunds Making (Manual)', price: 550, unit: 'day', image: '/images/services/manual-labour/Bunds.png', description: 'Manual construction and repair of field bunds.', tags: ['Field work'] },
            { id: 'hamali', name: 'HAMALI Worker', price: 500, unit: 'day', image: '/images/services/manual-labour/Hamaliworker.png', description: 'Loading, unloading and bagging labour.', tags: ['Loading'] },
            { id: 'chilli-harvest', name: 'Chilli Harvest', price: 450, unit: 'day', image: '/images/services/manual-labour/ChilliHarvest.png', description: 'Skilled hands for chilli picking.', tags: ['Harvest'] },
            { id: 'weeding', name: 'Weeding', price: 400, unit: 'day', image: '/images/services/manual-labour/Weeding.png', description: 'Manual weeding and field cleaning.', tags: ['Weeding'] },
            { id: 'power-spray', name: 'Power Spray Operator', price: 600, unit: 'day', image: '/images/services/manual-labour/Farmspray.png', description: 'Operator for knapsack / power sprayers.', tags: ['Spraying'] },
            { id: 'fertilizer-broadcaster', name: 'Fertilizer Broadcaster', price: 500, unit: 'day', image: '/images/services/manual-labour/Farmbroadcaster.png', description: 'Manual fertilizer broadcasting across fields.', tags: ['Fertilizer'] },
        ],
    },
    'soil-testing': {
        slug: 'soil-testing',
        title: 'Soil Testing & Analysis',
        titleKey: 'cat.soilTesting',
        icon: 'science',
        image: '/images/services/categories/SoilTtesting.png',
        blurb: 'Accurate soil health reports and fertilizer recommendations.',
        quantityLabelKey: 'catalog.numberOfSamples',
        maxQuantity: 20,
        questions: [
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 5', required: true },
            { id: 'collection', label: 'Sample collection', type: 'select', options: ['Agent visits my farm', 'I will drop the sample'], required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Crop grown, past issues, etc.' },
        ],
        items: [
            { id: 'basic-test', name: 'Basic Soil Analysis', price: 500, unit: 'sample', image: '/images/services/soil-testing/soilTesting.png', description: 'pH, EC, organic carbon and texture.', tags: ['Essential'] },
            { id: 'comprehensive-test', name: 'Comprehensive Package', price: 1200, unit: 'sample', image: '/images/services/soil-testing/ComphrensivePackage.png', description: 'Macro + micro nutrients with recommendations.', tags: ['Popular'] },
            { id: 'micro-test', name: 'Micro-Nutrient Test', price: 800, unit: 'sample', image: '/images/services/soil-testing/Micronutirent.png', description: 'Zinc, boron, iron and sulphur analysis.', tags: ['Add-on'] },
        ],
    },
    transplanting: {
        slug: 'transplanting',
        title: 'Transplanting',
        titleKey: 'cat.transplanting',
        icon: 'grass',
        image: '/images/services/categories/Transplanting.png',
        blurb: 'Paddy and vegetable transplanting by crew or machine.',
        quantityLabelKey: 'catalog.numberOfAcres',
        maxQuantity: 50,
        questions: [
            { id: 'crop', label: 'Which crop?', type: 'select', options: ['Paddy / Rice', 'Vegetables', 'Sugarcane', 'Other'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 3', required: true },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Seedling readiness, field condition, etc.' },
        ],
        items: [
            { id: 'manual-transplant', name: 'Manual Transplanting Crew', price: 500, unit: 'acre', image: '/images/services/transplanting/ManualTransplating.png', description: 'Trained crew for hand transplanting.', tags: ['Crew'] },
            { id: 'machine-transplant', name: 'Paddy Transplanter (Machine)', price: 900, unit: 'acre', image: '/images/services/transplanting/Ricetransplanting.png', description: 'Rice transplanter machine with operator.', tags: ['Machine'] },
        ],
    },
    'machinery-tools': {
        slug: 'machinery-tools',
        title: 'Machinery & Tools',
        titleKey: 'cat.machineryTools',
        icon: 'agriculture',
        image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=200&h=200&fit=crop',
        blurb: 'Rent farm machines and tools with or without an operator.',
        quantityLabelKey: 'catalog.numberOfMachines',
        maxQuantity: 5,
        questions: [
            { id: 'operator', label: 'Operator needed?', type: 'select', options: ['With operator', 'Without operator'], required: true },
            { id: 'requirement', label: 'Area / duration', type: 'text', placeholder: 'e.g. 3 acres or 4 hours' },
            { id: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Work details' },
        ],
        items: [
            { id: 'bund-maker', name: 'Bund Maker Machine', price: 600, unit: 'acre', image: '/images/services/machinery-tools/BundMaker.png', description: 'Tractor-drawn bund forming machine.', tags: ['Bunds'] },
            { id: 'tractor-trolley', name: 'Tractor Trolley', price: 800, unit: 'day', image: '/images/services/machinery-tools/tractortrolley.png', description: 'Tractor with trolley for haulage and transport.', tags: ['Haulage'] },
            { id: 'baler', name: 'Baler', price: 1200, unit: 'acre', image: '/images/services/machinery-tools/Baler.png', description: 'Straw / hay baler for residue management.', tags: ['Baling'] },
            { id: 'harvester', name: 'Harvester', price: 1500, unit: 'acre', image: '/images/services/machinery-tools/Harvesterservice.png', description: 'Combine harvester for wheat and paddy.', tags: ['Harvest'] },
            { id: 'tractor-service', name: 'Tractor Service', price: 800, unit: 'hour', image: '/images/services/machinery-tools/tractorservice.png', description: 'Tractor with driver for tillage and field work.', tags: ['Tractor'] },
        ],
    },
};

export const serviceCategoryList: ServiceCategory[] = Object.values(serviceCatalog);

export function getServiceCategory(slug: string): ServiceCategory | undefined {
    return serviceCatalog[slug];
}
