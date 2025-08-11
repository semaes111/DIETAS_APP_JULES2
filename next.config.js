/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  // Production optimizations
  poweredByHeader: false,
  
  // Webpack optimizations - simplified for better Vercel compatibility
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Stable experimental features only
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Environment variables - only essential ones
  env: {
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || 'postgresql',
  },
}

module.exports = nextConfig