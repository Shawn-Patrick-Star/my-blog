import { supabase } from "@/lib/supabase";
import { HeroSection } from "@/components/hero-section";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { SearchInput } from "@/components/search-input";
import { cookies } from "next/headers";
import Link from "next/link"; // 引入 Link
import { Plus } from "lucide-react"; // 引入新建图标
import { Button } from "@/components/ui/button"; // 引入按钮组件

export const revalidate = 0;

export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const { q } = await searchParams;
  const query = q || "";

  // 1. 检查是否是管理员
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  // 2. 获取首页大图和标题配置
  const { data: imgConfig } = await supabase.from("site_config").select("value").eq("key", "hero_image").single();
  const heroImage = imgConfig?.value || "";

  const { data: titleConfig } = await supabase.from("site_config").select("value").eq("key", "site_title").single();
  const siteTitle = titleConfig?.value || "Shawn's BLOG";

  // 3. 构建查询 (支持搜索)
  let postQuery = supabase.from("posts").select("*").eq("is_published", true).order("created_at", { ascending: false });
  let momentQuery = supabase.from("moments").select("*").order("created_at", { ascending: false });

  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
    momentQuery = momentQuery.ilike("content", `%${query}%`);
  }

  const [{ data: posts }, { data: moments }] = await Promise.all([
    postQuery.limit(5), // 首页最多展示5篇最新笔记
    momentQuery.limit(10) // 首页最多展示10条最新动态
  ]);

  return (
    <main className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* --- 1. Hero 区域 + 搜索框 --- */}
        <section>
          <HeroSection initialImage={heroImage} title={siteTitle} isAdmin={isAdmin} />
          
          <div className="max-w-md mx-auto -mt-16 relative z-10 px-4">
             <SearchInput defaultValue={query} />
          </div>
        </section>

        {/* --- 2. 最新笔记模块 --- */}
        <section>
          {/* 左右布局的标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-800">
              <span className="w-2 h-8 bg-amber-400 rounded-full"></span>
              最新笔记
            </h2>
            
            {/* 仅管理员可见的“写新笔记”按钮 */}
            {isAdmin && (
              <Link href="/admin/write">
                <Button variant="outline" size="sm" className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm rounded-full px-4">
                  <Plus size={16} /> 写新笔记
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            {posts?.map((post) => (
              <BlogCard key={post.id} post={post} isAdmin={isAdmin} />
            ))}
            {posts?.length === 0 && <p className="text-zinc-400 text-center py-10">未找到相关笔记</p>}
          </div>
        </section>

        {/* --- 3. 碎片动态模块 --- */}
        <section>
          {/* 左右布局的标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-800">
               <span className="w-2 h-8 bg-blue-400 rounded-full"></span>
               碎片动态
            </h2>
            
            {/* 仅管理员可见的“发新动态”按钮 */}
            {isAdmin && (
              <Link href="/admin/moments">
                <Button variant="outline" size="sm" className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 shadow-sm rounded-full px-4">
                  <Plus size={16} /> 发新动态
                </Button>
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moments?.map((item) => (
               <MomentCard 
                 key={item.id} 
                 id={item.id}
                 content={item.content} 
                 createdAt={item.created_at} 
                 images={item.images} 
                 isAdmin={isAdmin}
               />
            ))}
            {moments?.length === 0 && <p className="text-zinc-400 text-center col-span-2 py-10">未找到相关动态</p>}
          </div>
        </section>

      </div>
    </main>
  );
}