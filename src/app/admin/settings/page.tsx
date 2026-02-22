"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteConfig } from "@/lib/actions/site-config";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ImageIcon, Type, Loader2, ArrowLeft, Settings } from "lucide-react";
import imageCompression from "browser-image-compression";
import Link from "next/link";

export default function AdminSettings() {
  const [isPending, setIsPending] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [siteTitle, setSiteTitle] = useState("");
  const router = useRouter();

  async function handleSave() {
    if (!file && !siteTitle) {
      alert("请至少修改一项（图片或标题）");
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();

      if (siteTitle) {
        formData.append("site_title", siteTitle);
      }

      if (file) {
        setLoadingText("正在压缩图片...");
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        setLoadingText("正在上传到云端...");
        const fileExt = file.name.split(".").pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("public-images")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error("上传失败: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("public-images")
          .getPublicUrl(fileName);

        formData.append("hero_image_url", publicUrlData.publicUrl);
      }

      setLoadingText("正在保存设置...");
      await updateSiteConfig(formData);

      alert("设置已更新！");
      router.push("/");
      router.refresh();
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
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin"
          className="text-zinc-400 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-bold text-zinc-800">网站设置</h1>
        </div>
      </div>

      <Card className="border-amber-100/50 shadow-sm bg-[#fffef9]">
        <CardHeader>
          <CardTitle className="text-zinc-800">首页外观</CardTitle>
          <CardDescription>配置你的个人品牌形象</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 图片上传区 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-700">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              首页背景大图
            </label>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/*"
                className="cursor-pointer border-amber-100 file:text-amber-600 file:font-medium"
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
              <Type className="w-4 h-4 text-amber-500" />
              网站主标题
            </label>
            <Input
              placeholder="例如：Shawn's BLOG"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="bg-white border-amber-100 focus-visible:ring-amber-200"
            />
            <p className="text-xs text-zinc-500">
              显示在首页大图中间的大标题。
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100"
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