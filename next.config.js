/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 604800,
    disableStaticImages: false,
    contentSecurityPolicy: "default-src 'self'",
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
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
        source: '/sw',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
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