/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['*'] },
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
