import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Add 'localhost' as an allowed domain
  },
};

export default nextConfig;
