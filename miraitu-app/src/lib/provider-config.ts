// ─────────────────────────────────────────────────────────────────
// Provider workspace configuration
// Central source of truth for the service-price cap and the
// category-aware terminology that drives the provider dashboard.
// ─────────────────────────────────────────────────────────────────

/**
 * Maximum price a provider can set on a single service (₹).
 * Used for client + server validation. The DB CHECK in migration 019
 * enforces the same 1,000,000 hard ceiling as a safety net.
 * Adjust here to change the app-wide limit.
 */
export const MAX_SERVICE_PRICE = 1_000_000;

export interface ProviderCategoryConfig {
    /** Human label for the category */
    label: string;
    /** Material Symbols icon */
    icon: string;
    /** Tailwind accent (text) color for headers/icons */
    accent: string;
    /** What an incoming job is called, e.g. "Booking", "Order", "Repair Request" */
    jobNoun: string;
    /** Plural of jobNoun, e.g. "Bookings", "Orders" */
    jobNounPlural: string;
    /** Label for brand-new / unactioned jobs, e.g. "New Requests", "New Orders" */
    newLabel: string;
    /** Label for accepted/in-progress jobs, e.g. "Active Jobs", "Active Deliveries" */
    activeLabel: string;
    /** Label for the people who reach out, e.g. "Customers", "Clients", "Patients' Owners" */
    contactNoun: string;
    /** Short empty-state hint shown on the Services tab */
    serviceHint: string;
}

export const DEFAULT_CATEGORY: ProviderCategoryConfig = {
    label: 'Service Provider',
    icon: 'engineering',
    accent: 'text-primary',
    jobNoun: 'Booking',
    jobNounPlural: 'Bookings',
    newLabel: 'New Requests',
    activeLabel: 'Active Jobs',
    contactNoun: 'Customers',
    serviceHint: 'e.g. Site visit, Consultation, Full service',
};

/**
 * Per-category terminology. The dashboard layout stays identical across
 * professions — only the labels/emphasis change. Unknown or empty
 * categories fall back to DEFAULT_CATEGORY.
 *
 * Keys are the `service_types` slugs stored on the profile (they match the
 * onboarding INTERESTS_BY_ROLE ids for service_provider, plus the extra
 * professions requested for the workspace).
 */
export const CATEGORY_CONFIG: Record<string, ProviderCategoryConfig> = {
    milk_vendor: {
        label: 'Milk Vendor',
        icon: 'local_drink',
        accent: 'text-blue-600',
        jobNoun: 'Order',
        jobNounPlural: 'Orders',
        newLabel: 'New Orders',
        activeLabel: 'Active Deliveries',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Cow milk (per litre), Buffalo milk, Monthly subscription',
    },
    electrician: {
        label: 'Electrician',
        icon: 'electrical_services',
        accent: 'text-yellow-600',
        jobNoun: 'Repair Request',
        jobNounPlural: 'Repair Requests',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Wiring, Motor repair, Emergency call-out',
    },
    plumber: {
        label: 'Plumber',
        icon: 'plumbing',
        accent: 'text-sky-600',
        jobNoun: 'Repair Request',
        jobNounPlural: 'Repair Requests',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Pipe fitting, Leak repair, Tank cleaning',
    },
    mechanic: {
        label: 'Mechanic',
        icon: 'build',
        accent: 'text-zinc-600',
        jobNoun: 'Repair Request',
        jobNounPlural: 'Repair Requests',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Tractor service, Engine repair, On-site breakdown',
    },
    driver_operators: {
        label: 'Driver / Operator',
        icon: 'sports_motorsports',
        accent: 'text-slate-600',
        jobNoun: 'Trip',
        jobNounPlural: 'Trips',
        newLabel: 'New Requests',
        activeLabel: 'Active Trips',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Tractor operation (per hour), Transport trip',
    },
    veterinary_care: {
        label: 'Veterinary Care',
        icon: 'vaccines',
        accent: 'text-pink-600',
        jobNoun: 'Visit',
        jobNounPlural: 'Visits',
        newLabel: 'New Requests',
        activeLabel: 'Scheduled Visits',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Vaccination, Health check-up, Emergency visit',
    },
    rent_machineries: {
        label: 'Machinery Rental',
        icon: 'precision_manufacturing',
        accent: 'text-lime-600',
        jobNoun: 'Rental',
        jobNounPlural: 'Rentals',
        newLabel: 'New Requests',
        activeLabel: 'Active Rentals',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Rotavator (per day), Harvester (per acre)',
    },
    tractor_rental: {
        label: 'Tractor Rental',
        icon: 'agriculture',
        accent: 'text-green-600',
        jobNoun: 'Rental',
        jobNounPlural: 'Rentals',
        newLabel: 'New Requests',
        activeLabel: 'Active Rentals',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Tractor with driver (per hour), Ploughing (per acre)',
    },
    harvesting: {
        label: 'Harvesting Services',
        icon: 'grass',
        accent: 'text-amber-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Combine harvesting (per acre), Threshing',
    },
    spraying: {
        label: 'Drone / Spraying',
        icon: 'flight',
        accent: 'text-blue-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Drone spraying (per acre), Pesticide application',
    },
    borewell: {
        label: 'Borewell Drilling',
        icon: 'water_drop',
        accent: 'text-cyan-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Drilling (per foot), Site survey',
    },
    fencing_service: {
        label: 'Fencing Service',
        icon: 'fence',
        accent: 'text-orange-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Solar fencing (per metre), Barbed wire',
    },
    soil_testing: {
        label: 'Soil Testing',
        icon: 'science',
        accent: 'text-purple-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Full soil test, NPK analysis',
    },
    transport: {
        label: 'Agri Transport',
        icon: 'local_shipping',
        accent: 'text-indigo-600',
        jobNoun: 'Trip',
        jobNounPlural: 'Trips',
        newLabel: 'New Requests',
        activeLabel: 'Active Trips',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Produce transport (per km), Load shifting',
    },
    cctv_install: {
        label: 'CCTV Installation',
        icon: 'videocam',
        accent: 'text-gray-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Customers',
        serviceHint: 'e.g. Camera install (per unit), AMC package',
    },
    consultation: {
        label: 'Farm Consultation',
        icon: 'support_agent',
        accent: 'text-teal-600',
        jobNoun: 'Session',
        jobNounPlural: 'Sessions',
        newLabel: 'New Requests',
        activeLabel: 'Scheduled Sessions',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Crop advisory (per session), Farm visit',
    },
    labor: {
        label: 'Labor Supply',
        icon: 'group',
        accent: 'text-rose-600',
        jobNoun: 'Booking',
        jobNounPlural: 'Bookings',
        newLabel: 'New Requests',
        activeLabel: 'Active Jobs',
        contactNoun: 'Farmers',
        serviceHint: 'e.g. Daily labor (per person/day), Harvest crew',
    },
};

/** Pick the config for a provider's primary category, with a safe fallback. */
export function getCategoryConfig(serviceTypes?: string[] | null): ProviderCategoryConfig {
    const primary = serviceTypes?.[0];
    return (primary && CATEGORY_CONFIG[primary]) || DEFAULT_CATEGORY;
}

/** Options for the category multi-select in Service management / Profile. */
export const SERVICE_CATEGORY_OPTIONS: { id: string; label: string; icon: string }[] =
    Object.entries(CATEGORY_CONFIG).map(([id, cfg]) => ({
        id,
        label: cfg.label,
        icon: cfg.icon,
    }));
