import { supabase } from "@/lib/supabase";
import { HeroSection } from "@/components/hero-section";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card"; // 确保路径正确
import { SearchInput } from "@/components/search-input";
import { cookies } from "next/headers";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  
  const { q } = await searchParams;
  const query = q || "";

  // 检查是否有管理员 Cookie
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  // 获取首页大图配置
  const { data: config } = await supabase.from("site_config").select("value").eq("key", "hero_image").single();
  const heroImage = config?.value || "";

  const { data: titleConfig } = await supabase.from("site_config").select("value").eq("key", "site_title").single();
  const siteTitle = titleConfig?.value || "Shawn's BLOG"; // 默认值

  // 构建查询 (支持搜索)
  let postQuery = supabase.from("posts").select("*").eq("is_published", true).order("created_at", { ascending: false });
  let momentQuery = supabase.from("moments").select("*").order("created_at", { ascending: false });

  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
    momentQuery = momentQuery.ilike("content", `%${query}%`);
  }

  const [{ data: posts }, { data: moments }] = await Promise.all([
    postQuery.limit(5), // 只取最新的5篇
    momentQuery.limit(10)
  ]);

  return (
    <main className="min-h-screen py-8 px-4 md:px-8">
      

      
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 1. Hero 区域 + 搜索框 */}
        <section>
          <HeroSection 
            initialImage={heroImage} 
            title={siteTitle} 
            isAdmin={isAdmin} 
          />
        
        <div className="max-w-md mx-auto -mt-16 relative z-10 px-4">
            <SearchInput defaultValue={query} />
        </div>
      </section>

        {/* 2. 内容双栏布局 (左边笔记，右边动态，或者上下排列) */}
        {/* 用户要求“对齐”，我们采用单列流，或者上下的清晰分层 */}
        
        {/* 最新笔记模块 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
            <span className="w-2 h-8 bg-amber-400 rounded-full"></span>
            最新笔记
          </h2>
          <div className="flex flex-col gap-4">
            {posts?.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
            {posts?.length === 0 && <p className="text-zinc-400 text-center">未找到相关笔记</p>}
          </div>
        </section>

        {/* 碎片动态模块 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
             <span className="w-2 h-8 bg-blue-400 rounded-full"></span>
             碎片动态
          </h2>
          {/* 使用 Grid 布局让动态卡片也整齐 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moments?.map((item) => (
               <MomentCard 
                 key={item.id} 
                 content={item.content} 
                 createdAt={item.created_at} 
                 images={item.images} 
               />
            ))}
            {moments?.length === 0 && <p className="text-zinc-400 text-center col-span-2">未找到相关动态</p>}
          </div>
        </section>

      </div>
    </main>
  );
}