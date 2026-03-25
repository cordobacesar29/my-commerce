import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/homepage',
        permanent: true, // Esto es un redirect 308 (bueno para SEO)
      },
    ];
  },
};

export default nextConfig;