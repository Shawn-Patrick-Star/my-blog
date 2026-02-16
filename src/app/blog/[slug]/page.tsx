import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown"; // 引入 Components 类型
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { format } from "date-fns";

// --- 1. 定义 Markdown 样式映射 (手动美化版) ---
const markdownComponents: Components = {
  // 标题 h1
  h1: ({ node, ...props }) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-zinc-900 border-b pb-2 border-zinc-100" {...props} />
  ),
  // 标题 h2
  h2: ({ node, ...props }) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4 text-zinc-800" {...props} />
  ),
  // 标题 h3
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-medium mt-6 mb-3 text-zinc-800" {...props} />
  ),
  // 段落 p
  p: ({ node, ...props }) => (
    <p className="leading-7 mb-4 text-zinc-600" {...props} />
  ),
  // 无序列表 ul
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-1 text-zinc-600" {...props} />
  ),
  // 有序列表 ol
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1 text-zinc-600" {...props} />
  ),
  // 列表项 li
  li: ({ node, ...props }) => (
    <li className="pl-1" {...props} />
  ),
  // 引用 blockquote
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-zinc-200 pl-4 py-1 my-4 italic text-zinc-500 bg-zinc-50 rounded-r" {...props} />
  ),
  // 代码块 code (行内代码)
  code: ({ node, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    // 如果是代码块（有语言标记），交给 rehype-highlight 处理，这里只处理行内代码
    if (!match) {
      return (
        <code className="bg-zinc-100 text-pink-500 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
  // 链接 a
  a: ({ node, ...props }) => (
    <a className="text-blue-600 hover:underline underline-offset-4 font-medium" {...props} />
  ),
  // 图片 img
  img: ({ node, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rounded-lg border border-zinc-100 shadow-sm my-6 max-h-[500px] object-cover" {...props} alt={props.alt || ""} />
  ),
};

// --- 2. 页面组件 ---
export default async function BlogPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // 必须先 await 参数
  const { slug } = await params;

  // --- 3. 找回丢失的数据获取逻辑 ---
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  // 如果找不到文章，显示 404
  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-10 px-4 min-h-screen">
      {/* 文章头部信息 */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-zinc-900">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), "yyyy年MM月dd日")}
          </time>
          <span>•</span>
          <span>学习笔记</span>
        </div>
      </header>

      {/* Markdown 内容渲染区 */}
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