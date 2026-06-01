/** @type {import('next').NextConfig} */

// Load global polyfill immediately
require('./global-polyfill.js');

const nextConfig = {
  // 基本配置
  reactStrictMode: true,
  swcMinify: true,

  // 图片优化配置
  images: {
    domains: ['localhost', 'ai-tools-navigator.vercel.app', 'images.unsplash.com', 'cdn.jsdelivr.net'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 严格模式配置
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'types'],
  },

  // TypeScript 严格配置
  typescript: {
    ignoreBuildErrors: false,
  },

  // 实验性功能
  experimental: {
    // optimizeCss: true,
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'framer-motion',
      'recharts'
    ],
    // webpackBuildWorker: true,
    serverComponentsExternalPackages: ['sharp', 'ioredis'],
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,
  
  // 构建优化
  webpack: (config, { isServer, webpack }) => {
    // 基本的 self polyfill
    if (isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          self: 'global',
          global: 'global',
        })
      )
    } else {
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
          global: 'global/window',
        })
      )
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        process: require.resolve('process/browser'),
        buffer: require.resolve('buffer'),
      }
    }

    // 优化bundle分析
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      )
    }

    // 优化chunk分割 - 暂时简化以避免webpack错误
    // config.optimization.splitChunks = {
    //   chunks: 'all',
    //   cacheGroups: {
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name: 'vendors',
    //       priority: 10,
    //       reuseExistingChunk: true,
    //     },
    //     ui: {
    //       test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
    //       name: 'ui',
    //       priority: 20,
    //       reuseExistingChunk: true,
    //     },
    //     framer: {
    //       test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
    //       name: 'framer',
    //       priority: 20,
    //       reuseExistingChunk: true,
    //     },
    //   },
    // }

    return config
  },

  // 缓存优化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // PWA 配置
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // PWA 重定向配置
  async rewrites() {
    return [
      // Service Worker 重写
      {
        source: '/service-worker.js',
        destination: '/sw.js',
      }
    ]
  },

  // 输出优化
  output: 'standalone',
  
  // 性能监控
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

module.exports = nextConfig

// NaviGuard-AI Security Audited - 2026-06-01
