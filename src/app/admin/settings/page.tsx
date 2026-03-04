"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSiteConfig } from "@/lib/actions/site-config";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { ImageIcon, Type, Loader2, ArrowLeft, Settings, Trash2, Plus, Quote } from "lucide-react";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import Image from "next/image";

export default function AdminSettings() {
  const [isPending, setIsPending] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [siteQuotes, setSiteQuotes] = useState<{ text: string; source?: string }[]>([]);
  const [newQuote, setNewQuote] = useState("");
  const [newSource, setNewSource] = useState("");
  const router = useRouter();

  // 初始化加载现有配置
  useEffect(() => {
    async function fetchConfig() {
      const { data: configs } = await supabase.from("site_config").select("*");
      if (configs) {
        const title = configs.find(c => c.key === "site_title")?.value || "";
        const imagesStr = configs.find(c => c.key === "hero_images")?.value;
        const oldImage = configs.find(c => c.key === "hero_image")?.value;
        const quotesStr = configs.find(c => c.key === "site_quotes")?.value;

        setSiteTitle(title);

        let images: string[] = [];
        try {
          if (imagesStr) images = JSON.parse(imagesStr);
          else if (oldImage) images = [oldImage]; // 兼容旧版
        } catch (e) { }
        setHeroImages(images);

        let quotes: { text: string; source?: string }[] = [];
        try {
          if (quotesStr) {
            const raw = JSON.parse(quotesStr);
            quotes = raw.map((item: any) =>
              typeof item === "string" ? { text: item } : item
            );
          }
        } catch (e) { }
        setSiteQuotes(quotes);
      }
    }
    fetchConfig();
  }, []);

  // 处理图片上传
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsPending(true);
    setLoadingText("正在处理图片...");

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingText(`正在压缩第 ${i + 1}/${files.length} 张图片...`);

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const fileExt = file.name.split(".").pop();
        const fileName = `hero-${Date.now()}-${i}.${fileExt}`;

        setLoadingText(`正在上传第 ${i + 1}/${files.length} 张图片...`);
        const { error: uploadError } = await supabase.storage
          .from("public-images")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      }

      setHeroImages(prev => [...prev, ...newUrls]);
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      setIsPending(false);
      setLoadingText("");
    }
  }

  // 删除图片
  function removeImage(index: number) {
    setHeroImages(prev => prev.filter((_, i) => i !== index));
  }

  // 添加句子
  function addQuote() {
    if (!newQuote.trim()) return;
    setSiteQuotes(prev => [...prev, { text: newQuote.trim(), source: newSource.trim() || undefined }]);
    setNewQuote("");
    setNewSource("");
  }

  // 删除句子
  function removeQuote(index: number) {
    setSiteQuotes(prev => prev.filter((_, i) => i !== index));
  }

  // 保存所有设置
  async function handleSave() {
    setIsPending(true);
    setLoadingText("正在保存...");

    try {
      const formData = new FormData();
      formData.append("site_title", siteTitle);
      formData.append("hero_images", JSON.stringify(heroImages));
      formData.append("site_quotes", JSON.stringify(siteQuotes));

      await updateSiteConfig(formData);
      alert("全站配置已更新！");
      router.push("/");
      router.refresh();
    } catch (e: any) {
      alert("保存失败: " + e.message);
    } finally {
      setIsPending(false);
      setLoadingText("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
              <Settings size={24} />
            </div>
            <h1 className="text-2xl font-black text-foreground">品牌与外观设置</h1>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="rounded-2xl px-8 font-bold shadow-lg shadow-primary/20">
          {isPending ? <Loader2 className="animate-spin" /> : "发布更新"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* 网站基础配置 */}
        <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Type size={18} className="text-primary" />
              网站基础
            </CardTitle>
            <CardDescription>设置网站的名称和核心标识</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70">网站主标题</label>
                <Input
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="例如：Shawn's BLOG"
                  className="rounded-xl border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 首页背景轮播图 */}
        <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon size={18} className="text-primary" />
              首页封面轮播
            </CardTitle>
            <CardDescription>上传多张封面图，系统将以 5 秒/次的频率自动轮播</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 已上传图片预览 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {heroImages.map((url, index) => (
                <div key={url} className="relative aspect-video rounded-2xl overflow-hidden group border border-border bg-muted">
                  <Image src={url} alt="Hero" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="aspect-video rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                <Plus size={24} />
                <span className="text-xs font-bold uppercase tracking-widest">添加封面</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isPending}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 句子卡片配置 */}
        <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Quote size={18} className="text-primary" />
              哲理句子/格言
            </CardTitle>
            <CardDescription>这些句子将以“作文纸条”的风格展示在首页，每隔 8 秒自动切换</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <Textarea
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="输入一句有深意的话..."
                className="rounded-xl min-h-[80px]"
              />
              <div className="flex gap-2">
                <Input
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="出处（可选），例如：泰戈尔"
                  className="rounded-xl"
                />
                <Button onClick={addQuote} className="rounded-xl px-6 font-bold shrink-0">
                  <Plus size={18} className="mr-1" />
                  添加
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {siteQuotes.map((quote, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-paper-bg/60 rounded-2xl border border-paper-border/60 group transition-colors duration-300">
                  <div className="flex-1">
                    <p className="text-paper-text italic font-serif">「 {quote.text} 」</p>
                    {quote.source && (
                      <p className="text-xs text-paper-line/70 mt-1 font-medium">—— {quote.source}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeQuote(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {siteQuotes.length === 0 && (
                <p className="text-center py-6 text-muted-foreground text-sm">还没有添加任何句子</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
          <div className="p-4 bg-card rounded-2xl shadow-2xl border border-border flex flex-col items-center gap-4 min-w-[200px]">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-bold text-sm text-foreground">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}