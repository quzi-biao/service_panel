/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : 'standalone',
  // 移动端打包时禁用图片优化
  images: {
    unoptimized: process.env.BUILD_MODE === 'mobile',
  },
  // 移动端打包时的基础路径
  basePath: process.env.BUILD_MODE === 'mobile' ? '' : undefined,
  trailingSlash: true,
  // 确保自定义服务器依赖被包含在 standalone 构建中
  outputFileTracingIncludes: {
    '/': ['./server/**/*', './server.js'],
  },
  // 确保 WebSSH 相关依赖被包含
  experimental: {
    outputFileTracingRoot: undefined,
  },
};

export default nextConfig;
