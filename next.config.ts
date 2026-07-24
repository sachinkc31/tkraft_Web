import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for ecommerce
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tkraft.in",
      },
      {
        protocol: "https",
        hostname: "tkraft.in",
      },
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Enable compression
  compress: true,

  // Strict mode for better development
  reactStrictMode: true,

  // Powered by header removal for security
  poweredByHeader: false,

  // Trailing slash for consistent URLs (SEO)
  trailingSlash: false,

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: "/category/storage-organization",
        destination: "/category/storage-and-organization",
        permanent: true,
      },
      {
        source: "/category/kitchen-products",
        destination: "/category/kitchen",
        permanent: true,
      },
      {
        source: "/category/cleaning-essentials",
        destination: "/category/cleaning-essential",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
