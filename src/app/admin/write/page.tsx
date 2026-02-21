"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPost } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input"; // 引入新组件


export default function WritePage() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createPost(formData);
      router.push("/blog"); // 发布成功跳去博客列表
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800">写新笔记</h1>
      
      <form action={handleSubmit} className="space-y-6">
        
        {/* 只保留标题，占满整行，去掉了 Slug */}
        <div className="space-y-2">
          <label className="text-sm font-medium">标题</label>
          <Input name="title" placeholder="例如：今天学到了一个新技巧" className="text-lg py-6" required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">摘要 (可选)</label>
          <Input name="excerpt" placeholder="一句话描述这篇文章..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">标签</label>
            <TagInput name="tags" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">封面图 (可选)</label>
            <Input name="cover" type="file" accept="image/*" className="cursor-pointer" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Markdown 内容</label>
          <Textarea 
            name="content" 
            placeholder="# 尽情挥洒你的灵感..." 
            className="min-h-[400px] font-mono leading-relaxed" 
            required 
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-zinc-100">
          <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-600 text-white px-8">
            {isPending ? "发布中..." : "立刻发布"}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}