import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth";
import { BlogCard } from "@/components/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { BlogTimeline } from "@/components/blog/blog-timeline";
import { BookOpen, SearchX } from "lucide-react";
import { getCategories, getTags } from "@/lib/actions/post";
import type { Post } from "@/lib/types";

export const revalidate = 0;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    cat?: string;
    tag?: string;
  }>;
}) {
  const params = await searchParams;
  const view = params.view || "timeline";
  const query = params.q || "";
  const cat = params.cat || "";
  const tag = params.tag || "";

  // 1. Fetch data for filters
  const categories = await getCategories();
  const tags = await getTags();

  // 2. Base query for posts
  let supabaseQuery = supabase
    .from("posts")
    .select("*")
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

  const { data: posts, error } = await supabaseQuery;

  if (error) {
    console.error("获取文章失败:", error);
  }

  const isAdmin = await checkIsAdmin();

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 页面标题区 */}
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <BookOpen size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">学习笔记</h1>
              <p className="text-muted-foreground mt-1">
                记录技术、沉淀知识，在这里分享我的思考过程。
              </p>
            </div>
          </div>

          <BlogFilters categories={categories} tags={tags} />
        </header>

        {/* 文章展示区 */}
        <main className="min-h-[400px]">
          {posts && posts.length > 0 ? (
            view === "timeline" && !query && !cat && !tag ? (
              <BlogTimeline posts={posts} isAdmin={isAdmin} />
            ) : (
              <div className="flex flex-col gap-8 animate-in fade-in duration-500">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} isAdmin={isAdmin} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-24 bg-card border border-border rounded-3xl shadow-sm animate-in zoom-in-95 duration-300">
              <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                <SearchX size={32} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium text-lg">没有找到匹配的笔记</p>
              <p className="text-muted-foreground mt-1">尝试换一个关键词或者分类看看吧</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}