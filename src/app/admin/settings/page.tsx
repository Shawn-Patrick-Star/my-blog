"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteConfig } from "@/lib/actions"; // 引入 Server Action
import { supabase } from "@/lib/supabase";        // 引入 Supabase 客户端
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ImageIcon, Type, Loader2, UploadCloud } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function AdminSettings() {
  const [isPending, setIsPending] = useState(false);
  const [loadingText, setLoadingText] = useState(""); // 用来显示当前步骤
  const [file, setFile] = useState<File | null>(null);
  const [siteTitle, setSiteTitle] = useState("");
  const router = useRouter();

  async function handleSave() {
    // 简单的校验
    if (!file && !siteTitle) {
      alert("请至少修改一项（图片或标题）");
      return;
    }

    setIsPending(true);
    
    try {
      const formData = new FormData();

      // --- 1. 处理标题 ---
      if (siteTitle) {
        formData.append("site_title", siteTitle);
      }

      // --- 2. 处理图片 (核心优化逻辑) ---
      if (file) {
        // A. 压缩图片
        setLoadingText("正在压缩图片...");
        console.log(`原始大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,          // 限制最大 1MB (对背景图足够了)
          maxWidthOrHeight: 1920, // 限制最大宽度 1920px
          useWebWorker: true,     // 使用多线程加速
        });
        
        console.log(`压缩后: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        // B. 客户端直传 Supabase
        setLoadingText("正在上传到云端...");
        
        // 生成一个干净的文件名 (防止中文乱码)
        const fileExt = file.name.split(".").pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("public-images") // 确保你的存储桶叫这个名字
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error("上传失败: " + uploadError.message);

        // C. 获取公开链接
        const { data: publicUrlData } = supabase.storage
          .from("public-images")
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;
        
        // D. 将 URL 放入 FormData (而不是文件对象)
        // 这样 Server Action 只需要存字符串，非常快
        formData.append("hero_image_url", publicUrl);
      }

      // --- 3. 调用 Server Action 更新数据库 ---
      setLoadingText("正在保存设置...");
      await updateSiteConfig(formData); // 注意：下面需要配合修改 actions.ts

      alert("设置已更新！");
      router.push("/"); // 回首页看效果
      router.refresh(); // 强制刷新数据

    } catch (e: any) {
      console.error(e);
      alert("操作失败: " + e.message);
    } finally {
      setIsPending(false);
      setLoadingText("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UploadCloud className="w-8 h-8" />
        网站设置
      </h1>
      
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle>首页外观</CardTitle>
          <CardDescription>配置你的个人品牌形象</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* 图片上传区 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
              <ImageIcon className="w-4 h-4" /> 
              首页背景大图
            </label>
            <div className="flex flex-col gap-2">
              <Input 
                type="file" 
                accept="image/*" 
                className="cursor-pointer file:text-blue-600 file:font-medium" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-zinc-500">
                支持 JPG/PNG。系统会自动压缩至 1MB 以内，秒级上传。
              </p>
            </div>
          </div>

          {/* 标题输入区 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
              <Type className="w-4 h-4" /> 
              网站主标题
            </label>
            <Input 
              placeholder="例如：Shawn's BLOG" 
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="bg-zinc-50/50"
            />
            <p className="text-xs text-zinc-500">
              显示在首页大图中间的大标题。
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isPending} 
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                {loadingText}
              </>
            ) : (
              "保存设置"
            )}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}