import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    domains: [
      // Add domains for external images when needed
      // 'images.unsplash.com',
      // 'example.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Build optimization
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Output settings
  output: 'standalone', // For containerized deployments

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      // Example: redirect old paths to new ones
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // API routes config
  async rewrites() {
    return [
      // Example: proxy external APIs in development
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },
};

export default nextConfig;
