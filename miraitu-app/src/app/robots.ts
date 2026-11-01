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
                    // /_next/ (JS, CSS and /_next/image) and *.ico must stay
                    // crawlable: Google renders these client-side pages with
                    // that JS/CSS, indexes images through /_next/image, and
                    // fetches the favicon it shows next to search results.
                    '/manifest.json',
                ],
            },
        ],
        sitemap: 'https://www.miraitu.in/sitemap.xml',
    };
}
