import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* SEO: Prevent trailing-slash redirect loops */
  trailingSlash: false,

  /* Permanent 301 redirect: /home → / (backwards compatibility) */
  async redirects() {
    return [
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

