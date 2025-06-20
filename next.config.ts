import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: true,
  },
  // Disable reaction to prop changes in development
  reactStrictMode: false,
  
  webpack: (config, { dev, isServer }) => {
    // Only in client-side production build
    if (!dev && !isServer) {
      // This helps with hydration issues in production
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },
};

export default nextConfig;
