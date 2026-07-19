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
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop',
        link: '/home/services/book/drivers-operators',
    },
    {
        label: 'Drone Spray',
        icon: 'flight',
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=400&fit=crop',
        link: '/home/services/book/manual-labour',
    },
    {
        label: 'Soil Testing & Analysis',
        icon: 'science',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop',
        link: '/home/services/book/soil-testing',
    },
    {
        label: 'Transplanting',
        icon: 'grass',
        image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=400&fit=crop',
        link: '/home/services/book/transplanting',
    },
];
