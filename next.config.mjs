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
};

export default nextConfig;
