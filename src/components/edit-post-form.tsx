"use client";

import { updatePost } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 引入 Image 用于预览
import { ImageIcon } from "lucide-react";

interface EditPostFormProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    tags: string[] | null;
    cover_image: string | null; // 增加封面图字段
  };
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  return (
    <form action={updatePost} className="space-y-6">
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="slug" value={post.slug} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">标题</label>
        <Input name="title" defaultValue={post.title} className="text-lg py-6" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">摘要</label>
        <Input name="excerpt" defaultValue={post.excerpt || ""} />
      </div>

      {/* 图片与标签分两栏展示 */}
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
          
          {/* 如果当前有封面图，显示预览 */}
          {post.cover_image && (
            <div className="mt-2 relative w-32 h-20 rounded border overflow-hidden">
               <Image 
                src={post.cover_image} 
                alt="Current cover" 
                fill 
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white bg-black/20">
                当前封面
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Markdown 内容</label>
        <Textarea 
          name="content" 
          defaultValue={post.content || ""} 
          className="min-h-100 font-mono leading-relaxed" 
          required 
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-zinc-100">
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-8">
          更新文章
        </Button>
        <Button variant="outline" type="button" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}