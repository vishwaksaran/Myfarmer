// Shared service-category data.
//
// `topCategories` is the bookable catalog — every category that has entries in
// service-catalog.ts. The "View all" services page builds its grid from this.
//
// `homeTopCategories` is what the home page row actually shows, in the order it
// shows them. The two are deliberately not the same list: the home row is a
// six-tile shopfront, so it leads with Drone Spray and ends with Borewell (which
// has its own page rather than a catalog entry), while Drivers / Operators is
// left to the full services page. Keeping them separate means reordering the
// shopfront never silently drops a category from the catalog.
//
// Images are real, topically-relevant photos with a Material icon fallback.

export interface TopCategory {
    label: string;
    // i18n key for the label — resolve with t(tKey) in components.
    tKey: string;
    icon: string;
    image: string;
    link: string;
}

export const topCategories: TopCategory[] = [
    {
        label: 'Drivers / Operators',
        tKey: 'cat.driversOperators',
        icon: 'engineering',
        image: '/images/services/categories/Driveroperator.png',
        link: '/home/services/book/drivers-operators',
    },
    {
        label: 'Drone Spray',
        tKey: 'cat.droneSpray',
        icon: 'flight',
        image: '/images/services/categories/Dronespray.png',
        link: '/home/services/book/drone-spray',
    },
    {
        label: 'Machinery & Tools',
        tKey: 'cat.machineryTools',
        icon: 'agriculture',
        image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=400&fit=crop',
        link: '/home/services/book/machinery-tools',
    },
    {
        label: 'Manual Labour',
        tKey: 'cat.manualLabour',
        icon: 'groups',
        image: '/images/services/categories/Labour.png',
        link: '/home/services/book/manual-labour',
    },
    {
        label: 'Soil Testing & Analysis',
        tKey: 'cat.soilTesting',
        icon: 'science',
        image: '/images/services/categories/SoilTtesting.png',
        link: '/home/services/book/soil-testing',
    },
    {
        label: 'Transplanting',
        tKey: 'cat.transplanting',
        icon: 'grass',
        image: '/images/services/categories/Transplanting.png',
        link: '/home/services/book/transplanting',
    },
];

const borewell: TopCategory = {
    label: 'Borewell Services',
    tKey: 'cat.borewell',
    icon: 'water_drop',
    image: '/images/services/other/Borewell.png',
    link: '/home/borewell',
};

/** The home page row, in display order. */
export const homeTopCategories: TopCategory[] = [
    ...['Drone Spray', 'Machinery & Tools', 'Manual Labour', 'Soil Testing & Analysis', 'Transplanting']
        .map((label) => {
            const c = topCategories.find((x) => x.label === label);
            if (!c) throw new Error('Unknown top category: ' + label);
            return c;
        }),
    borewell,
];
