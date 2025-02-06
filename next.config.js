/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.strathspace.com",
        pathname: "/**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev",
        pathname: "/**",
        port: "",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      }
    ],
    minimumCacheTTL: 604800,
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: "/cdn-images/:path*",
        destination: "https://cdn.strathspace.com/:path*",
      },
      {
        source: "/r2-images/:path*",
        destination: "https://pub-fd999fa4db5f45aea35c41c909f365ca.r2.dev/:path*",
      },
    ];
  },
  experimental: {
    optimizeCss: true,
    critters: {
      ssrOnly: true // Only preload CSS for SSR pages
    },
    nextScriptWorkers: true,
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  }
};

module.exports = nextConfig; 