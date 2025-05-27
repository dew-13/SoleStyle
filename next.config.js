/** @type {import('next').NextConfig} */
const nextConfig = {
  // Corrected: moved serverComponentsExternalPackages to top-level
  serverExternalPackages: ["mongodb"],

  // Image optimization settings
  images: {
    domains: [
      "localhost",
      "placeholder.svg",
      "via.placeholder.com",
      "images.unsplash.com",
      "cdn.shopify.com",
    ],
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
  },

  // Environment variables
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations if needed
    return config;
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
