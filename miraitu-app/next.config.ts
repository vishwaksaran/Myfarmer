import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SEO: Prevent trailing-slash redirect loops */
  trailingSlash: false,

  /* Permanent 301 redirects */
  async redirects() {
    return [
      // Non-www → www (fixes Google Search Console "Redirect error" for miraitu.in pages)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'miraitu.in' }],
        destination: 'https://www.miraitu.in/:path*',
        permanent: true, // 301
      },
      // /home → / (backwards compatibility)
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301
      },
    ];
  },

  /* Performance optimizations */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable compression
  compress: true,

  // Production optimizations
  poweredByHeader: false,

  // Disable dev toolbar
  devIndicators: false,

  // Reduce bundle size
  productionBrowserSourceMaps: false,
};

export default nextConfig;

