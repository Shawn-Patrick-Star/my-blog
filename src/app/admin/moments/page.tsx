"use client";

import { createMoment } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminMoments() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createMoment(formData);
      // 发布成功后跳转回首页查看效果
      router.push("/");
    } catch (error) {
      alert("发布失败，请检查控制台");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-xl font-bold mb-6">发布新动态</h1>
      
      <form action={handleSubmit} className="space-y-4">
        {/* 文字内容 */}
        <Textarea
          name="content"
          placeholder="分享新鲜事..."
          className="min-h-[120px] resize-none border-zinc-200 focus:border-zinc-400"
          required
        />

        {/* 图片上传 */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2 text-zinc-600">
            <ImageIcon className="w-4 h-4" />
            添加图片 (最多9张)
          </label>
          <Input
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="cursor-pointer"
          />
        </div>

        {/* 提交按钮 */}
        <Button 
          type="submit" 
          className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              发布中...
            </>
          ) : (
            "发布动态"
          )}
        </Button>
      </form>
    </div>
  );
}