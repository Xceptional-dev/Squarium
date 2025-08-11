/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    eslint: {
    ignoreDuringBuilds: true,
    },
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
