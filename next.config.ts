import type { NextConfig } from 'next';

// Start from next-pwa's default runtime caching, then make sure the backend API
// is NEVER cached or subject to the service worker's network timeout — the AI
// chat can legitimately take ~10s and NetworkFirst would abort it.
const runtimeCaching = require('next-pwa/cache');
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
runtimeCaching.unshift({
  urlPattern: ({ url }: { url: URL }) =>
    Boolean(apiOrigin) && url.href.startsWith(apiOrigin),
  handler: 'NetworkOnly',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
