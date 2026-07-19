// ============================================================================
// MACHINERY RENTAL CATALOG
// ----------------------------------------------------------------------------
// This is the single source of truth for the machinery "rent / hire" flow.
// Each category shows a list of priced items. Tapping an item opens a detail
// sheet where the user picks a quantity and answers a few "relevant questions",
// then adds it to the booking cart.
//
// 👉 REPLACE THE PLACEHOLDER DATA BELOW WITH YOUR REAL ITEMS / PRICES /
//    QUESTIONS. The shape is all that matters — the UI is fully data-driven,
//    so adding/removing items or questions requires no code changes.
// ============================================================================

export type RentalUnit = 'day' | 'hour' | 'acre' | 'trip' | 'job';

export const unitLabel: Record<RentalUnit, string> = {
    day: '/day',
    hour: '/hr',
    acre: '/acre',
    trip: '/trip',
    job: '/job',
};

export interface RentalQuestion {
    /** Unique within the category. Stored as the answer key on each cart line. */
    id: string;
    label: string;
    type: 'select' | 'text' | 'number';
    /** Required for type: 'select'. */
    options?: string[];
    required?: boolean;
    placeholder?: string;
}

export interface RentalItem {
    /** Unique within the category. */
    id: string;
    name: string;
    /** Price in ₹ for one unit (see `unit`). */
    price: number;
    unit: RentalUnit;
    image: string;
    description?: string;
    tags?: string[];
}

export interface RentalCategory {
    /** Must match the route segment: jcb, harvesters, drones, implements, small-machineries, tractors. */
    slug: string;
    title: string;
    /** Material Symbols icon name. */
    icon: string;
    blurb: string;
    /** Max "quantity per day" a user can pick. Defaults to 5. */
    maxQuantity?: number;
    /** Questions asked on the item detail sheet before adding to cart. */
    questions: RentalQuestion[];
    items: RentalItem[];
}

// ── Questions reused across most categories ─────────────────────────────────
const commonQuestions: RentalQuestion[] = [
    {
        id: 'operator',
        label: 'Do you need an operator?',
        type: 'select',
        options: ['With operator', 'Without operator'],
        required: true,
    },
    {
        id: 'fuel',
        label: 'Fuel arrangement',
        type: 'select',
        options: ['Fuel included', 'Fuel by me'],
        required: true,
    },
    {
        id: 'notes',
        label: 'Work details / notes (optional)',
        type: 'text',
        placeholder: 'e.g. levelling 2 acres near the canal',
    },
];

// ── Catalog ─────────────────────────────────────────────────────────────────
export const machineryRentalCatalog: Record<string, RentalCategory> = {
    jcb: {
        slug: 'jcb',
        title: 'JCB & Excavators',
        icon: 'front_loader',
        blurb: 'Hire backhoe loaders and excavators with certified operators.',
        maxQuantity: 5,
        questions: commonQuestions,
        items: [
            { id: 'jcb-3dx', name: 'JCB 3DX Backhoe Loader', price: 1300, unit: 'hour', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop', description: '76 HP backhoe loader for digging, loading and levelling.', tags: ['Backhoe', '76 HP'] },
            { id: 'jcb-4dx', name: 'JCB 4DX Xtra Super', price: 1600, unit: 'hour', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', description: '92 HP heavy-duty loader with extended reach.', tags: ['Backhoe', '92 HP'] },
            { id: 'excavator-pc130', name: 'Komatsu PC130 Excavator', price: 1800, unit: 'hour', image: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=600&h=400&fit=crop', description: '95 HP crawler excavator for trenching and pond work.', tags: ['Excavator', '95 HP'] },
        ],
    },
    harvesters: {
        slug: 'harvesters',
        title: 'Harvesters',
        icon: 'agriculture',
        blurb: 'Book combine harvesters for wheat, paddy and sugarcane.',
        maxQuantity: 5,
        questions: [
            { id: 'crop', label: 'Which crop?', type: 'select', options: ['Wheat', 'Paddy / Rice', 'Sugarcane', 'Maize', 'Other'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 5', required: true },
            ...commonQuestions.slice(1),
        ],
        items: [
            { id: 'combine-wheat', name: 'Wheat / Paddy Combine Harvester', price: 1000, unit: 'acre', image: 'https://images.unsplash.com/photo-1595339589269-2b3f0f6b8b1f?w=600&h=400&fit=crop', description: 'Self-propelled combine for wheat and paddy.', tags: ['Combine'] },
            { id: 'sugarcane', name: 'Sugarcane Harvester', price: 1500, unit: 'acre', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop', description: 'Chops and loads sugarcane in a single pass.', tags: ['Sugarcane'] },
        ],
    },
    drones: {
        slug: 'drones',
        title: 'Agri Drones',
        icon: 'flight',
        blurb: 'Precision aerial spraying for pesticides and liquid fertilizers.',
        maxQuantity: 10,
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
    implements: {
        slug: 'implements',
        title: 'Implements',
        icon: 'agriculture',
        blurb: 'Rent ploughs, rotavators, seed drills and more with a tractor.',
        maxQuantity: 5,
        questions: [
            { id: 'tractor', label: 'Tractor needed?', type: 'select', options: ['With tractor', 'Implement only'], required: true },
            { id: 'area', label: 'Approx. area (acres)', type: 'number', placeholder: 'e.g. 3' },
            ...commonQuestions.slice(2),
        ],
        items: [
            { id: 'rotavator', name: 'Rotavator', price: 600, unit: 'acre', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&h=400&fit=crop', description: 'Seedbed preparation and soil pulverising.', tags: ['Tillage'] },
            { id: 'seed-drill', name: 'Seed Drill', price: 500, unit: 'acre', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop', description: 'Uniform seed and fertilizer placement.', tags: ['Sowing'] },
            { id: 'cultivator', name: 'Cultivator', price: 450, unit: 'acre', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfa9?w=600&h=400&fit=crop', description: 'Secondary tillage and weed control.', tags: ['Tillage'] },
        ],
    },
    'small-machineries': {
        slug: 'small-machineries',
        title: 'Small Machineries',
        icon: 'yard',
        blurb: 'Power tillers, weeders, sprayers and pumps on daily rent.',
        maxQuantity: 5,
        questions: commonQuestions,
        items: [
            { id: 'power-tiller', name: 'Power Tiller', price: 800, unit: 'day', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfa9?w=600&h=400&fit=crop', description: 'Compact tiller for small and terraced fields.', tags: ['Tillage'] },
            { id: 'brush-cutter', name: 'Brush Cutter / Weeder', price: 400, unit: 'day', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop', description: 'Petrol brush cutter for weeding and trimming.', tags: ['Weeding'] },
            { id: 'water-pump', name: 'Diesel Water Pump', price: 500, unit: 'day', image: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?w=600&h=400&fit=crop', description: 'High-flow pump for irrigation and dewatering.', tags: ['Irrigation'] },
        ],
    },
    tractors: {
        slug: 'tractors',
        title: 'Tractors',
        icon: 'agriculture',
        blurb: 'Hire tractors with or without implements and operator.',
        maxQuantity: 5,
        questions: [
            { id: 'hp', label: 'Preferred power', type: 'select', options: ['Up to 40 HP', '40–50 HP', '50+ HP', 'Any'], required: true },
            ...commonQuestions,
        ],
        items: [
            { id: 'tractor-45hp', name: 'Tractor (45 HP)', price: 700, unit: 'hour', image: 'https://images.unsplash.com/photo-1605338198618-ec3e0e0e0e0e?w=600&h=400&fit=crop', description: 'All-purpose 45 HP tractor for haulage and tillage.', tags: ['45 HP'] },
            { id: 'tractor-50hp', name: 'Tractor (50 HP)', price: 850, unit: 'hour', image: 'https://images.unsplash.com/photo-1533603208986-24fd819e718f?w=600&h=400&fit=crop', description: '50 HP tractor suited to heavy implements.', tags: ['50 HP'] },
        ],
    },
};

export function getRentalCategory(slug: string): RentalCategory | undefined {
    return machineryRentalCatalog[slug];
}
