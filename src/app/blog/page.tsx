import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth";
import { BlogCard } from "@/components/blog-card";
import { BookOpen } from "lucide-react";

export const revalidate = 0;

export default async function BlogListPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取文章失败:", error);
  }

  const isAdmin = await checkIsAdmin();

  return (
    <div className="py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题区 */}
        <header className="border-b border-amber-200/60 pb-6 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-800">
            <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <BookOpen size={24} />
            </span>
            学习笔记
          </h1>
          <p className="mt-3 text-zinc-500">
            记录技术、沉淀知识，在这里分享我的思考过程。
          </p>
        </header>

        {/* 文章列表区 */}
        <div className="flex flex-col gap-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <BlogCard key={post.id} post={post} isAdmin={isAdmin} />
            ))
          ) : (
            <div className="text-center py-20 bg-[#fffef9] border border-amber-100/50 rounded-2xl shadow-sm">
              <p className="text-zinc-500">
                目前还没有发布任何笔记，去后台写一篇吧！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}