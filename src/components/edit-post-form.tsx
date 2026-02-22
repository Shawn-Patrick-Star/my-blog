"use client";

import { useState } from "react";
import { updatePost } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageIcon, Eye, Edit3, Upload, Loader2 } from "lucide-react";

export function EditPostForm({ post }: any) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 使用 State 管理这些值，以便实现实时预览和图片插入
  const [title, setTitle] = useState(post.title || "");
  const [content, setContent] = useState(post.content || "");
  const [excerpt, setExcerpt] = useState(post.excerpt || "");

  // --- 处理正文插图上传 ---
  async function handleBodyImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `body-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage.from("public-images").upload(fileName, file);
      if (error) throw error;

      const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
      const url = data.publicUrl;

      // 自动将 Markdown 图片语法插入到当前内容末尾
      const imageMarkdown = `\n![描述](${url})\n`;
      setContent((prev: string) => prev + imageMarkdown);
      
      alert("图片已上传并插入正文末尾");
    } catch (err: any) {
      alert("图片上传失败: " + err.message);
    } finally {
      e.target.value = ""; // 清空 input
    }
  }

  // --- 处理保存（解决 303 误报问题） ---
  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // 构造 FormData 发送给后端
      const formData = new FormData(e.currentTarget);
      // 注意：由于 content 在 state 里，确保提交的是最新的 state 内容
      formData.set("content", content); 

      const result = await updatePost(formData);
      
      if (result?.success) {
        router.push(`/blog/${post.slug}`);
        router.refresh();
      }
    } catch (err: any) {
      // 如果不是因为 redirect 导致的错误，才弹窗
      if (!err.message.includes("NEXT_REDIRECT")) {
        alert("更新失败: " + err.message);
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-zinc-400">文章 ID: {post.id}</div>
        <Button 
          type="button" 
          variant="ghost" 
          className="text-amber-600 hover:bg-amber-50"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? <><Edit3 size={16} className="mr-2" /> 返回编辑</> : <><Eye size={16} className="mr-2" /> 预览效果</>}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 隐藏字段 */}
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="slug" value={post.slug} />

        {isPreview ? (
          /* 预览模式 */
          <div className="p-8 bg-[#fffef9] border border-amber-100 rounded-2xl shadow-sm min-h-[500px]">
            <h1 className="text-4xl font-bold mb-8 text-zinc-900 border-b pb-4 border-zinc-100">{title}</h1>
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          /* 编辑模式 */
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">标题</label>
              <Input 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="text-lg py-6" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">摘要</label>
              <Input 
                name="excerpt" 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">标签</label>
                <TagInput name="tags" defaultTags={post.tags || []} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <ImageIcon size={16} /> 更换封面图 (可选)
                </label>
                <Input name="cover" type="file" accept="image/*" className="cursor-pointer" />
                {post.cover_image && (
                  <div className="mt-2 relative w-32 h-20 rounded border overflow-hidden opacity-50">
                    <Image src={post.cover_image} alt="current cover" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-700">正文内容 (Markdown)</label>
                {/* 🔴 插入图片工具按钮 */}
                <label className="text-xs bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-zinc-600 shadow-sm">
                  <Upload size={12} />
                  插入正文图片
                  <input type="file" className="hidden" onChange={handleBodyImageUpload} accept="image/*" />
                </label>
              </div>
              <Textarea 
                name="content" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="min-h-125 font-mono leading-relaxed bg-zinc-50/30" 
                required 
              />
            </div>
          </>
        )}

        <div className="flex gap-4 pt-6 border-t border-zinc-100">
          <Button 
            type="submit" 
            disabled={isUpdating || isPreview}
            className="bg-amber-500 hover:bg-amber-600 text-white px-10"
          >
            {isUpdating ? <><Loader2 className="animate-spin mr-2" /> 正在更新...</> : "保存修改"}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}