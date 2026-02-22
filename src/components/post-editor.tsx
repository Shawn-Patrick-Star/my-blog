"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ImageIcon, Eye, Edit3, Upload, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface PostEditorProps {
  initialData?: any;          // 如果是编辑，传入旧数据
  action: (fd: FormData) => Promise<{ success?: boolean; error?: string; slug?: string }>; // 传入对应的 Server Action
  title: string;              // 页面大标题（如 "写新笔记" 或 "编辑笔记"）
}

export function PostEditor({ initialData, action, title: pageTitle }: PostEditorProps) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // 状态管理
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");

  // 正文插图逻辑 (高内聚)
  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileName = `body-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage.from("public-images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
      const imageMarkdown = `\n![描述](${data.publicUrl})\n`;
      setContent((prev: string) => prev + imageMarkdown);
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      e.target.value = "";
    }
  }

  // 提交逻辑
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("content", content); // 确保获取的是最新的 state 内容
      
      const result = await action(formData);
      if (result.success) {
        router.push(`/blog/${result.slug || ""}`);
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err: any) {
      if (!err.message.includes("NEXT_REDIRECT")) {
        alert("操作失败: " + err.message);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-zinc-800">{pageTitle}</h1>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          className="text-amber-600 border-amber-200 bg-amber-50/30"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? <><Edit3 size={16} className="mr-2" /> 返回编辑</> : <><Eye size={16} className="mr-2" /> 预览效果</>}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 如果是编辑模式，带上隐藏 ID */}
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
        {/* 如果是编辑模式，带上隐藏 Slug */}
        {initialData?.slug && <input type="hidden" name="slug" value={initialData.slug} />}

        {isPreview ? (
          <div className="p-8 bg-[#fffef9] border border-amber-100 rounded-2xl shadow-sm min-h-125 animate-in fade-in duration-300">
            <h1 className="text-4xl font-bold mb-8 text-zinc-900 border-b pb-4 border-zinc-100">{title || "未命名文章"}</h1>
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">文章标题</label>
              <Input 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="在此输入标题..."
                className="text-lg py-6 bg-zinc-50/50" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">摘要 (SEO / 列表展示)</label>
              <Input name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="简单介绍一下这篇文章..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">标签 (按回车添加)</label>
                <TagInput name="tags" defaultTags={initialData?.tags || []} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <ImageIcon size={16} /> 封面图片
                </label>
                <Input name="cover" type="file" accept="image/*" className="cursor-pointer" />
                {initialData?.cover_image && (
                  <div className="mt-2 relative w-32 h-20 rounded border overflow-hidden opacity-40">
                    <Image src={initialData.cover_image} alt="current" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-700">正文内容 (Markdown)</label>
                <label className="text-xs bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-zinc-600 shadow-sm">
                  <Upload size={12} /> 插入图片
                  <input type="file" className="hidden" onChange={handleBodyImageUpload} accept="image/*" />
                </label>
              </div>
              <Textarea 
                name="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="# 开始创作吧..."
                className="min-h-125 font-mono leading-relaxed bg-zinc-50/30" 
                required 
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t border-zinc-100">
          <Button 
            type="submit" 
            disabled={isPending || isPreview}
            className="bg-amber-500 hover:bg-amber-600 text-white px-10 shadow-lg shadow-amber-100"
          >
            {isPending ? <><Loader2 className="animate-spin mr-2" /> 处理中...</> : (initialData ? "保存修改" : "发布文章")}
          </Button>
        </div>
      </form>
    </div>
  );
}