/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, 
    remotePatterns: [
      // 1. 原有的 Supabase 配置 (请保留)
      {
        protocol: 'https',
        hostname: 'hqhtapixhphtccpdtqgv.supabase.co', // 👈 注意：这里要保留你之前填的 Supabase 域名！
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // 2. 新增 Unsplash 配置 (解决本次报错)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 将限制提升到 10MB (足够应付大多数图片)
    },
  },
};

export default nextConfig;