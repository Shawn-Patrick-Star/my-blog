import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin } from "@/lib/auth";
import { BlogCard } from "@/components/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogTimeline } from "@/components/blog/blog-timeline";
import { SearchX, Sparkles } from "lucide-react";
import { getCategories, getTags } from "@/lib/actions/post";
import type { Post } from "@/lib/types";
import { Suspense } from "react";

export const revalidate = 0;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    cat?: string;
    tag?: string;
    author?: string;
  }>;
}) {
  const params = await searchParams;
  const view = params.view || "timeline";
  const query = params.q || "";
  const cat = params.cat || "";
  const tag = params.tag || "";
  const authorId = params.author || "";

  const supabase = await createClient();

  // 1. Fetch data for filters
  const categories = await getCategories();
  const tags = await getTags();

  // 2. Base query for posts
  let supabaseQuery = supabase
    .from("posts")
    .select("*, author:profiles!author_id(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 3. Apply filters
  if (query) {
    supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }
  if (cat) {
    supabaseQuery = supabaseQuery.eq("category", cat);
  }
  if (tag) {
    supabaseQuery = supabaseQuery.contains("tags", [tag]);
  }
  if (authorId) {
    supabaseQuery = supabaseQuery.eq("author_id", authorId);
  }

  const { data: posts, error } = await supabaseQuery;

  if (error) {
    console.error("获取文章失败:", error);
  }

  const isAdmin = await checkIsAdmin();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8 overflow-hidden selection:bg-primary/20">
      {/* 顶部环境光晕背景 (Ambient Glow) - 增加现代高级感 */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-full max-w-4xl -translate-x-1/2 bg-primary/5 blur-[100px] rounded-full" aria-hidden="true" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* 页面头部区 */}
        <header className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="flex flex-col gap-5">
            {/* 小标签修饰 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit text-sm font-medium shadow-sm">
              <Sparkles size={16} />
              <span>Tech & Life</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              学习笔记
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              记录技术、沉淀知识，在这里分享我的思考过程与灵感迸发。
            </p>
          </div>

          {/*
             过滤器容器：玻璃拟态 (Glassmorphism) + 滚动吸顶 (Sticky)
             当你往下滚动文章时，搜索栏会优雅地悬浮在顶部
          */}
          <div className="sticky top-4 z-40 p-2 md:p-3 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-all">
            <Suspense fallback={<div className="h-12 w-full animate-pulse bg-muted rounded-2xl" />}>
              <BlogFilters
                categories={categories}
                tags={tags}
                isAdmin={isAdmin}
                currentUserId={user?.id}
              />
            </Suspense>
          </div>
        </header>

        {/* 文章展示区 */}
        <main className="min-h-[50vh] relative z-10 pb-20">
          {posts && posts.length > 0 ? (
            view === "timeline" && !query && !cat && !tag ? (
              <div className="animate-in fade-in duration-700">
                <BlogTimeline posts={posts} isAdmin={isAdmin} />
              </div>
            ) : (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} isAdmin={isAdmin} />
                ))}
              </div>
            )
          ) : (
            // 精致化的空状态 (Empty State)
            <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-border/60 rounded-4xl bg-card/30 animate-in zoom-in-95 duration-500">
              <div className="inline-flex p-5 bg-primary/5 rounded-full mb-5 relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-50" />
                <SearchX size={36} className="text-primary/60 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">没有找到匹配的笔记</h3>
              <p className="text-muted-foreground text-sm max-w-sm text-center">
                似乎没有包含您搜索内容的文章，尝试更换一下关键词或者分类标签看看吧。
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}