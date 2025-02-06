/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev",
        pathname: "/**",
      },
      // Keep other image sources...
    ],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 604800,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === "development" // Disable optimization in dev
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'valspace.vercel.app','https://pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev','strathspace.com'],
    },
    optimizeCss: true,
    nextScriptWorkers: true,
  },
};

module.exports = nextConfig; 