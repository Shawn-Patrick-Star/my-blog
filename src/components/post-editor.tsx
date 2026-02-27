"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ImageIcon, Tag, FileText, Heading, Eye, Edit3, Upload, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { ActionResult } from "@/lib/types";

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    tags?: string[];
    cover_image?: string;
  };
  action: (fd: FormData) => Promise<ActionResult>;
  title: string;
}

export function PostEditor({
  initialData,
  action,
  title: pageTitle,
}: PostEditorProps) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");

  // 正文插图上传
  async function handleBodyImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileName = `body-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage
        .from("public-images")
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from("public-images")
        .getPublicUrl(fileName);
      const imageMarkdown = `\n![描述](${data.publicUrl})\n`;
      setContent((prev: string) => prev + imageMarkdown);
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      e.target.value = "";
    }
  }

  // 提交
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("content", content);

      const result = await action(formData);
      if (result.success) {
        router.push(`/blog/${result.slug || ""}`);
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err: any) {
      if (!err.message.includes("NEXT_REDIRECT")) {
        alert("操作失败: " + err.message);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* 顶部标题栏 */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          type="button"
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {initialData?.id && (
          <input type="hidden" name="id" value={initialData.id} />
        )}
        {initialData?.slug && (
          <input type="hidden" name="slug" value={initialData.slug} />
        )}

        {/* 标题、摘要、标签、封面 —— 始终显示 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heading size={16} className="text-primary" /> 文章标题
            </label>
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="在此输入标题..."
              className="text-lg py-6 bg-card border-border focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} className="text-primary" /> 摘要
            </label>
            <Input
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="简单介绍一下这篇文章..."
              className="border-border focus-visible:ring-ring bg-card"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag size={16} className="text-primary" /> 标签 (按回车添加)
              </label>
              <TagInput
                name="tags"
                defaultTags={initialData?.tags || []}
                placeholder="输入标签后按回车..."
                inputClassName="bg-card border-border focus-visible:ring-ring"
                badgeClassName="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" /> 封面图片
              </label>
              <Input
                name="cover"
                type="file"
                accept="image/*"
                className="cursor-pointer border-border bg-card"
              />
              {initialData?.cover_image && (
                <div className="mt-2 relative w-32 h-20 rounded border border-border overflow-hidden opacity-40">
                  <Image
                    src={initialData.cover_image}
                    alt="current"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 正文区域 —— 编辑 / 预览切换 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} className="text-primary" /> 正文内容 (Markdown)
            </label>
            <div className="flex items-center gap-2">
              {!isPreview && (
                <label className="text-xs bg-card border border-border hover:bg-accent px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-primary shadow-sm">
                  <Upload size={12} /> 插入图片
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleBodyImageUpload}
                    accept="image/*"
                  />
                </label>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-primary border-border bg-accent/30 hover:bg-accent"
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? (
                  <>
                    <Edit3 size={14} className="mr-1.5" /> 返回编辑
                  </>
                ) : (
                  <>
                    <Eye size={14} className="mr-1.5" /> 预览正文
                  </>
                )}
              </Button>
            </div>
          </div>

          {isPreview ? (
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-125 animate-in fade-in duration-300">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# 开始创作吧..."
              className="min-h-125 font-mono leading-relaxed bg-card border-border focus-visible:ring-ring"
              required
            />
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={isPending || isPreview}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" /> 处理中...
              </>
            ) : initialData ? (
              "保存修改"
            ) : (
              "发布文章"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}