import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Higgsfield
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Serverless function timeout for Vercel (Higgsfield polling can take time)
  serverExternalPackages: ['puppeteer-core'],
};

export default nextConfig;
