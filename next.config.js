/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
  },
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    critters: {
      ssrOnly: true // Only preload CSS for SSR pages
    }
  }
};

module.exports = nextConfig; 