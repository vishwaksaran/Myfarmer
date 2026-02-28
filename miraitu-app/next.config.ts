import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Consistent URL structure (no trailing slashes)
  trailingSlash: false,

  // Permanent redirect: /home → / (fixes Google "Page with redirect" issue)
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
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

