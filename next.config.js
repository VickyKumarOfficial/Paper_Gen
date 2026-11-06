/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {
      rules: {
        '*.svg': { loaders: [] },
      },
    },
  },
};

module.exports = nextConfig;