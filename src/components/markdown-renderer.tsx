"use client";

import React, { useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { Check, Copy, Hash, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

// 引入样式
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  allowImages?: boolean;
  className?: string;
}

/**
 * 代码块组件：带复制按钮和语言标识
 */
const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const onCopy = () => {
    const text = String(children).replace(/\n$/, "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!language) {
    return (
      <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono font-bold" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-6 rounded-xl overflow-hidden border border-border/50 shadow-sm bg-muted/30 dark:bg-[#0d1117]">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 dark:bg-muted/20 border-b border-border/20">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 select-none">
          {language}
        </span>
        <button
          onClick={onCopy}
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground/60 hover:text-foreground dark:hover:text-white transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>
      {/* 代码内容 */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <code className={cn("text-sm font-mono bg-transparent p-0", className)} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

export function MarkdownRenderer({
  content,
  allowImages = true,
  className
}: MarkdownRendererProps) {

  const markdownComponents: Components = {
    // 标题美化
    h1: ({ ...props }) => <h1 className="text-3xl font-black mt-10 mb-6 text-foreground tracking-tight scroll-m-20 border-b border-border/50 pb-3" {...props} />,
    h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground/90 tracking-tight scroll-m-20" {...props} />,
    h3: ({ ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-foreground/80 tracking-tight scroll-m-20" {...props} />,
    
    // 基础文本
    p: ({ ...props }) => <p className="leading-8 mb-6 text-foreground text-[16px] wrap-break-word" {...props} />,
    
    // 列表与任务列表
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-foreground" {...props} />,
    li: ({ children, ...props }: any) => {
      // 检查是否是任务列表项
      const isTask = Array.isArray(children) && children.some(c => c?.props?.type === 'checkbox');
      return (
        <li className={cn("pl-1 leading-normal", isTask && "list-none -ml-6 flex items-start gap-2")} {...props}>
          {children}
        </li>
      );
    },
    input: ({ type, checked, ...props }) => {
      if (type === 'checkbox') {
        return (
          <div className={cn(
            "mt-1.5 shrink-0 flex items-center justify-center w-4 h-4 rounded border transition-colors",
            checked ? "bg-primary border-primary text-white" : "bg-muted border-border"
          )}>
            {checked && <Check size={10} strokeWidth={4} />}
          </div>
        );
      }
      return <input type={type} checked={checked} {...props} />;
    },

    // 引用
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-primary/40 pl-6 py-2 my-8 italic text-foreground/80 bg-primary/5 rounded-r-2xl font-medium" {...props} />
    ),

    // 高亮标签 (标记为荧光感)
    mark: ({ ...props }) => (
      <mark 
        className="
          bg-yellow-200 dark:bg-yellow-400/30  /* 亮黄色背景，深色模式微调 */
          text-black dark:text-gray-900        /* 文字颜色确保对比度 */
          border-b-0                          /* 移除原有的底部边框 */
        " 
        {...props} 
      />
    ),


    // 代码块
    code: CodeBlock,

    // 表格美化
    table: ({ ...props }) => (
      <div className="my-8 w-full overflow-hidden rounded-2xl border border-border/50 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse" {...props} />
        </div>
      </div>
    ),
    thead: ({ ...props }) => <thead className="bg-muted/50 border-b border-border/60" {...props} />,
    th: ({ ...props }) => <th className="px-5 py-3 text-left font-black text-foreground/80 whitespace-nowrap" {...props} />,
    td: ({ ...props }) => <td className="px-5 py-3 border-b border-border/30 text-foreground" {...props} />,
    tr: ({ ...props }) => <tr className="hover:bg-muted/20 transition-colors last:border-b-0" {...props} />,

    // 公式块限制
    span: ({ className, ...props }: any) => {
       if (className?.includes('katex-display')) {
         return <span className="block my-8 overflow-x-auto custom-scrollbar py-4" {...props} />;
       }
       return <span className={className} {...props} />;
    },

    // 链接
    a: ({ ...props }) => <a className="text-primary hover:underline underline-offset-4 font-bold decoration-primary/30 transition-all" target="_blank" {...props} />,
    
    // 分割线
    hr: () => <hr className="my-10 border-border/60" />,

    // 图片
    img: ({ src, alt, ...props }) => {
      if (!allowImages || !src) return null;
      return (
        <span className="block my-10 text-center animate-in fade-in zoom-in duration-700">
          <img
            src={src}
            alt={alt || "image"}
            className="rounded-[24px] border border-border shadow-md mx-auto max-h-[600px] object-contain hover:scale-[1.01] transition-transform duration-500"
            {...props}
          />
          {alt && (
            <span className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 font-medium italic">
              <span className="w-8 h-[1px] bg-border" />
              {alt}
              <span className="w-8 h-[1px] bg-border" />
            </span>
          )}
        </span>
      );
    },
  };

  // 预处理：支持 ==荧光高亮== 语法 (转换为 HTML <mark> 标签)
  const processedContent = content.replace(/==([^=]+)==/g, '<mark>$1</mark>');

  return (
    <div className={cn("prose prose-zinc dark:prose-invert max-w-none transition-all duration-500", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeSlug, rehypeRaw]}
        components={markdownComponents}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
