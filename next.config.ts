import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
