"use client";

import { createPost } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      <h1 className="text-2xl font-bold mb-6">写文章</h1>
      
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input name="title" placeholder="例如：我的第一篇 Next.js 笔记" required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug (URL路径)</label>
            <Input name="slug" placeholder="例如：my-first-note" required />
            <p className="text-xs text-zinc-500">只能包含字母、数字和连字符</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">摘要</label>
          <Input name="excerpt" placeholder="一句话描述这篇文章..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标签 (用逗号分隔)</label>
            <Input name="tags" placeholder="React, 学习笔记, 生活" />
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
            placeholder="# Hello World" 
            className="min-h-100 font-mono" 
            required 
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "发布中..." : "发布文章"}
        </Button>
      </form>
    </div>
  );
}