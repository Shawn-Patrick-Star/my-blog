import { MetadataRoute } from 'next'
import { createClient } from "@/utils/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://shawn-garden.vercel.app' // 部署后请替换为你的真实域名
    const supabase = await createClient()

    // 获取所有已发布的文章 slug
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, updated_at')
        .eq('is_published', true)

    const postUrls = (posts || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || new Date()),
    }))

    return [
        { url: baseUrl, lastModified: new Date() },
        { url: `${baseUrl}/blog`, lastModified: new Date() },
        { url: `${baseUrl}/community`, lastModified: new Date() },
        ...postUrls,
    ]
}
