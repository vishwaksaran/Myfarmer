// Shared "Top Categories" data — used by the home page grid (TopCategories)
// and the "View all" services page so the two never drift apart.
// Images are real, topically-relevant photos with a Material icon fallback.

export interface TopCategory {
    label: string;
    icon: string;
    image: string;
    link: string;
}

export const topCategories: TopCategory[] = [
    {
        label: 'Drivers / Operators',
        icon: 'engineering',
        image: '/images/services/categories/DriversOperators.png',
        link: '/home/services/book/drivers-operators',
    },
    {
        label: 'Drone Spray',
        icon: 'flight',
        image: '/images/services/categories/Dronespray.png',
        link: '/home/services/book/drone-spray',
    },
    {
        label: 'Machinery & Tools',
        icon: 'agriculture',
        image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=400&fit=crop',
        link: '/home/services/book/machinery-tools',
    },
    {
        label: 'Manual Labour',
        icon: 'groups',
        image: '/images/services/categories/Labour.png',
        link: '/home/services/book/manual-labour',
    },
    {
        label: 'Soil Testing & Analysis',
        icon: 'science',
        image: '/images/services/categories/SoilTtesting.png',
        link: '/home/services/book/soil-testing',
    },
    {
        label: 'Transplanting',
        icon: 'grass',
        image: '/images/services/categories/Transplanting.png',
        link: '/home/services/book/transplanting',
    },
];
