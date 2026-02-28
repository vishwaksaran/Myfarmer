import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://miraitu.in';

    const routes = [
        { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
        { path: '/home/about', priority: 0.8, changeFrequency: 'monthly' as const },
        { path: '/home/machinery', priority: 0.9, changeFrequency: 'daily' as const },
        { path: '/home/crops', priority: 0.9, changeFrequency: 'daily' as const },
        { path: '/home/livestock', priority: 0.9, changeFrequency: 'daily' as const },
        { path: '/home/finance', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/home/shop', priority: 0.9, changeFrequency: 'daily' as const },
        { path: '/home/organic-store', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/home/veterinary', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/home/land', priority: 0.8, changeFrequency: 'daily' as const },
        { path: '/home/services', priority: 0.8, changeFrequency: 'weekly' as const },
        { path: '/home/borewell', priority: 0.7, changeFrequency: 'weekly' as const },
        { path: '/home/fencing', priority: 0.7, changeFrequency: 'weekly' as const },
        { path: '/home/cctv', priority: 0.7, changeFrequency: 'weekly' as const },
        { path: '/home/protection', priority: 0.7, changeFrequency: 'weekly' as const },
        { path: '/home/toolbox', priority: 0.7, changeFrequency: 'weekly' as const },
        { path: '/home/community', priority: 0.7, changeFrequency: 'daily' as const },
        { path: '/home/become-seller', priority: 0.8, changeFrequency: 'monthly' as const },
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
