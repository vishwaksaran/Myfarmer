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
    ],
    formats: ['image/webp', 'image/avif'],
  },


  // Enable compression
  compress: true,

  // Production optimizations
  poweredByHeader: false,

  // Reduce bundle size
  productionBrowserSourceMaps: false,
};

export default nextConfig;

