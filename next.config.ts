import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  /* Image Optimization */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
  
  /* Note: Turbopack is enabled via `npm run dev` command in Next.js 16+ */
};

export default nextConfig;
