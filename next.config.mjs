/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ["dev.gul.ph","coinexchange.cash","localhost"],
  },
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization.minimizer[0].options.minimizer.options.compress = {
        ...config.optimization.minimizer[0].options.minimizer.options.compress,
        drop_console: !dev, // Only drop console in production
      }
    }
    // Set Lit production mode
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        __DEV__: JSON.stringify(dev),
        'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
        'process.env.LIT_DEBUG': JSON.stringify(dev),
      })
    );
    
    // Important: return the modified config
    return config;
  },
  // Suppress console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig

export default nextConfig
