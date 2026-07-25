// A flat directory of every service the app offers, used to power the global
// "Search services" dropdown so a user can jump straight to Veterinary,
// Plumber, Machinery, etc. from any services page.
//
// `tKey` is a dot-key (t('cat.*')) for the six bookable Top Categories; the rest
// translate by English source string via translatePage(). `href` is the page a
// suggestion navigates to.
export interface ServiceDirectoryEntry {
    name: string;
    tKey?: string;
    href: string;
    icon: string;
}

export const serviceDirectory: ServiceDirectoryEntry[] = [
    // ── Bookable Top Categories ─────────────────────────────────────────────
    { name: 'Drivers / Operators', tKey: 'cat.driversOperators', href: '/home/services/book/drivers-operators', icon: 'engineering' },
    { name: 'Drone Spray', tKey: 'cat.droneSpray', href: '/home/services/book/drone-spray', icon: 'flight' },
    { name: 'Machinery & Tools', tKey: 'cat.machineryTools', href: '/home/services/book/machinery-tools', icon: 'agriculture' },
    { name: 'Manual Labour', tKey: 'cat.manualLabour', href: '/home/services/book/manual-labour', icon: 'groups' },
    { name: 'Soil Testing & Analysis', tKey: 'cat.soilTesting', href: '/home/services/book/soil-testing', icon: 'science' },
    { name: 'Transplanting', tKey: 'cat.transplanting', href: '/home/services/book/transplanting', icon: 'grass' },

    // ── Other services (translate by English source string) ─────────────────
    { name: 'Rent Machinery', href: '/home/services/rent-machinery', icon: 'agriculture' },
    { name: 'Borewell Services', href: '/home/borewell', icon: 'water_drop' },
    { name: 'CCTV Installation', href: '/home/cctv', icon: 'videocam' },
    { name: 'Fencing Services', href: '/home/fencing', icon: 'fence' },
    { name: 'Veterinary Care', href: '/home/veterinary', icon: 'pets' },
    { name: 'Farm Labours', href: '/home/services/farm-labours', icon: 'group' },
    { name: 'Transportation', href: '/home/services/transportation', icon: 'local_shipping' },
    { name: 'Storage and Godown', href: '/home/services/storage-godown', icon: 'warehouse' },
    { name: 'Plumber', href: '/home/services/plumber', icon: 'plumbing' },
    { name: 'Electrician', href: '/home/services/electrician', icon: 'electrical_services' },
    { name: 'Mechanic', href: '/home/services/mechanic', icon: 'build_circle' },
    { name: 'Milk Vendors', href: '/home/services/milk-vendors', icon: 'water_drop' },
];
