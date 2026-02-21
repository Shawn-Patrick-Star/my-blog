import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { format } from "date-fns";
import { cookies } from "next/headers"; 
import { Hash, FileText } from "lucide-react"; 
import { PostAdminActions } from "@/components/post-admin-actions"; 

// 🔴 关键修复：强制 Next.js 每次都去数据库拿最新数据，不要使用旧缓存！
export const revalidate = 0;

// --- Markdown 样式组件 ---
const markdownComponents: Components = {
  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-zinc-900 border-b pb-2 border-zinc-100" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-zinc-800" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-6 mb-3 text-zinc-800" {...props} />,
  p: ({ node, ...props }) => <p className="leading-7 mb-4 text-zinc-600" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-zinc-600" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-zinc-600" {...props} />,
  li: ({ node, ...props }) => <li className="pl-1" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-amber-200 pl-4 py-1 my-4 italic text-zinc-500 bg-amber-50 rounded-r" {...props} />,
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    if (!match) return <code className="bg-amber-100/50 text-amber-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    return <code className={className} {...props}>{children}</code>;
  },
  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline underline-offset-4 font-medium" {...props} />,
  img: ({ node, ...props }) => <img className="rounded-lg border border-zinc-100 shadow-sm my-6 max-h-96 object-cover" {...props} alt={props.alt || ""} />,
};

// --- 页面主组件 ---
export default async function BlogPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
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

      {/* --- 封面图 --- */}
      {post.cover_image && (
        <div className="w-full h-64 md:h-96 relative rounded-2xl overflow-hidden mb-12 shadow-sm">
          <img 
            src={post.cover_image} 
            alt="文章封面" 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* --- Markdown 正文 --- */}
      <div className="pb-20">
        <ReactMarkdown 
          rehypePlugins={[rehypeHighlight]} 
          components={markdownComponents}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}