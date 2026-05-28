/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thesacredhearts.org',
      },
    ],
  },
};

module.exports = nextConfig;
