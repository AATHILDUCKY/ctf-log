import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
