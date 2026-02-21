"use client";

import { updateSiteConfig } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Type } from "lucide-react";

export default function AdminSettings() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updateSiteConfig(formData);
      alert("设置已更新！");
      router.push("/"); // 更新完跳回首页看效果
    } catch (e: any) {
      alert("更新失败: " + e.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">网站设置</h1>
      
      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>首页外观</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 1. 更换大图 */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 
                首页背景大图
              </label>
              <Input 
                name="hero_image" 
                type="file" 
                accept="image/*" 
                className="cursor-pointer" 
              />
              <p className="text-xs text-zinc-500">建议尺寸：1920x600，支持 JPG/PNG</p>
            </div>

            {/* 2. 更换标题 (顺手做的功能) */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" /> 
                网站主标题
              </label>
              <Input 
                name="site_title" 
                placeholder="例如：Shawn's BLOG" 
              />
              <p className="text-xs text-zinc-500">留空则不修改</p>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : "保存设置"}
            </Button>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}