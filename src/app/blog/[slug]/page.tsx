import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import "highlight.js/styles/github-dark.css";
import { format } from "date-fns";
import { cookies } from "next/headers"; 
import { Hash, FileText } from "lucide-react"; 
import { PostAdminActions } from "@/components/post-admin-actions"; 
import { MarkdownRenderer } from "@/components/markdown-renderer";

// 🔴 关键修复：强制 Next.js 每次都去数据库拿最新数据，不要使用旧缓存！
export const revalidate = 0;

// --- 页面主组件 ---
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {

  const { slug } = await params;

  // 1. 获取文章数据
  const { data: post } = await supabase.from("posts").select("*").eq("slug", slug).single();
  if (!post) notFound();

  // 2. 检查管理员身份 (用于控制按钮显示)
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  return (
    <article className="max-w-3xl mx-auto py-10 px-4 min-h-screen">
      
      {/* --- 文章头部 --- */}
      <header className="mb-12 text-center relative">
        
        {/* 如果是管理员，显示操作按钮 */}
        {isAdmin && (
          <div className="absolute top-0 right-0">
             {/* 传入当前文章的 ID */}
            <PostAdminActions postId={post.id} />
          </div>
        )}

        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-zinc-900 mt-8">
          {post.title}
        </h1>
        
        {/* 日期和字数统计 */}
        <div className="flex items-center justify-center gap-4 text-zinc-500 text-sm mb-6">
          <time dateTime={post.created_at}>
            发布于 {format(new Date(post.created_at), "yyyy年MM月dd日")}
          </time>
          {post.word_count > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText size={14} /> {post.word_count} 字
              </span>
            </>
          )}
        </div>

        {/* 自定义标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-amber-50 text-amber-600 text-sm rounded-full flex items-center gap-1 border border-amber-100">
                <Hash size={12} /> {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 封面图 */}
      {post.cover_image && (
        <div className="w-full h-64 md:h-96 relative rounded-2xl overflow-hidden mb-12 shadow-sm border border-amber-100/50">
          <img src={post.cover_image} className="object-cover w-full h-full" alt="cover" />
        </div>
      )}

      {/* 🔴 使用通用渲染器，支持图片 */}
      <div className="pb-20">
        <MarkdownRenderer content={post.content} />
      </div>
    </article>
  );
}