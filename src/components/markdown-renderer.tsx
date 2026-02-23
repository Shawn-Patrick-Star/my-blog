"use client";

import ReactMarkdown, { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  allowImages?: boolean; // 是否允许显示正文中的图片
  className?: string;    // 自定义外层样式
}

export function MarkdownRenderer({
  content,
  allowImages = true,
  className
}: MarkdownRendererProps) {

  const markdownComponents: Components = {
    // 标题
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground border-b pb-2 border-border" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground/90" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground/80" {...props} />,
    // 段落
    p: ({ ...props }) => <p className="leading-7 mb-4 text-muted-foreground wrap-break-word" {...props} />,
    // 列表
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-muted-foreground" {...props} />,
    li: ({ ...props }) => <li className="pl-1" {...props} />,
    // 引用
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-4 italic text-muted-foreground bg-accent/50 rounded-r" {...props} />
    ),
    // 代码处理
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!match) {
        return <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
      }
      return <code className={cn("rounded-lg", className)} {...props}>{children}</code>;
    },
    // 链接
    a: ({ ...props }) => <a className="text-primary hover:underline underline-offset-4 font-medium" target="_blank" {...props} />,
    // 图片处理：关键逻辑
    img: ({ ...props }) => {
      if (!allowImages) return null; // 如果不允许图片，直接不渲染
      return (
        <span className="block my-6 text-center">
          <img
            className="rounded-xl border border-border shadow-sm mx-auto max-h-125 object-contain"
            {...props}
            alt={props.alt || "image"}
          />
          {props.alt && <span className="text-xs text-muted-foreground mt-2 block italic">{props.alt}</span>}
        </span>
      );
    },
  };

  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}