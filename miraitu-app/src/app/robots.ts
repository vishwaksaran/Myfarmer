import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/settings/',
                    '/home/dashboard/',
                    '/home/profile/',
                    '/home/settings/',
                    '/home/orders/',
                    '/admin/',
                    '/user-login/',
                    '/user-register/',
                ],
            },
        ],
        sitemap: 'https://miraitu.in/sitemap.xml',
    };
}
