import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  /* Note: Turbopack is enabled via `npm run dev` command in Next.js 16+ */
};

export default nextConfig;
