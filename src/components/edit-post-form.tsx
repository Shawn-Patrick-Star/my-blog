"use client"; // 👈 这里标记为客户端组件，支持 onClick 和 TagInput

import { updatePost } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { useRouter } from "next/navigation";

// 定义 props 类型，接收从服务端传来的文章数据
interface EditPostFormProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    tags: string[] | null;
  };
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();

  return (
    <form action={updatePost} className="space-y-6">
      {/* 隐藏字段 */}
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="slug" value={post.slug} />

      <div className="space-y-2">
        <label className="text-sm font-medium">标题</label>
        <Input name="title" defaultValue={post.title} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">摘要</label>
        <Input name="excerpt" defaultValue={post.excerpt || ""} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">标签</label>
        {/* 这里可以使用 TagInput 了，因为当前文件是 Client Component */}
        <TagInput name="tags" defaultTags={post.tags || []} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Markdown 内容</label>
        <Textarea 
          name="content" 
          defaultValue={post.content || ""} 
          className="min-h-100 font-mono" 
          required 
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit">更新文章</Button>
        {/* 这里的 onClick 现在可以正常工作了 */}
        <Button variant="outline" type="button" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}