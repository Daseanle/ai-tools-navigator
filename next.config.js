/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本配置
  reactStrictMode: true,
  swcMinify: true,

  // 图片配置（简化）
  images: {
    unoptimized: true, // 简化图片处理，快速测试
  },

  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },

  // 移除所有复杂的配置
}

module.exports = nextConfig
