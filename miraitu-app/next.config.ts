import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* SEO: Prevent trailing-slash redirect loops */
  trailingSlash: false,

  /* Fix Turbopack resolving modules from workspace root instead of project dir */
  turbopack: {
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, 'node_modules/tailwindcss'),
    },
  },

  /* Redirects now handled by src/middleware.ts for reliability.
   * Middleware handles: non-www → www (301) and /home → / (301).
   * Keeping this empty in case additional config-level redirects are needed. */

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

