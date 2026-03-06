import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'],
        },
        sitemap: 'https://shawn-garden.vercel.app/sitemap.xml', // 部署后请替换为你的真实域名
    }
}
