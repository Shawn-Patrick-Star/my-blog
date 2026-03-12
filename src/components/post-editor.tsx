"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/table-of-contents";
import { ImageIcon, Tag, FileText, Heading, Eye, Edit3, Upload, Loader2, ArrowLeft, Save, Grid } from "lucide-react";
import Image from "next/image";
import { syncLocalImages } from "@/lib/actions/post";
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
    category?: string;
  };
  categories?: string[];
  action: (fd: FormData) => Promise<ActionResult>;
  title: string;
}

export function PostEditor({
  initialData,
  categories = [],
  action,
  title: pageTitle,
}: PostEditorProps) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ originalPath: string; status: 'pending' | 'uploading' | 'done', newUrl?: string }[]>([]);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [localBaseDir, setLocalBaseDir] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("local-notes-root") || "";
    }
    return "";
  });

  const draftKey = `draft-${initialData?.id || "new"}`;

  // 初始化状态：优先从 localStorage 恢复草稿
  const getInitial = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  }, [draftKey]);

  const draft = getInitial();
  // 修复：不再限制 !initialData?.id，允许编辑现有文章时也能恢复未保存的草稿
  const hasDraft = draft !== null;

  const [title, setTitle] = useState(
    hasDraft ? draft.title : (initialData?.title || "")
  );
  const [localContent, setLocalContent] = useState(
    hasDraft ? draft.content : (initialData?.content || "")
  );
  // 防抖后的内容，用于预览、自动保存和同步检测 (500ms 延迟)
  const [debouncedContent] = useDebounce(localContent, 500);
  // 目录专用防抖 (150ms)，实现实时目录预览
  const [tocContent] = useDebounce(localContent, 150);

  const [excerpt, setExcerpt] = useState(
    hasDraft ? draft.excerpt : (initialData?.excerpt || "")
  );
  const [category, setCategory] = useState(
    hasDraft ? draft.category : (initialData?.category || "")
  );

  // 自动保存: 1.5s debounce
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      // 有内容才保存
      if (title || debouncedContent || excerpt || category) {
        try {
          localStorage.setItem(draftKey, JSON.stringify({ title, content: debouncedContent, excerpt, category }));
          setAutoSaved(true);
          setTimeout(() => setAutoSaved(false), 2000);
        } catch (e) { }
      }
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, debouncedContent, excerpt, category, draftKey]);

  // 改进 2 & 3: 内容同步与图片检测 (全面支持 ![]() 以及 <img src=""/>)
  useEffect(() => {
    // 匹配 Markdown 以及 HTML 图片路径
    const allImageRegex = /!\[.*?\]\((.*?)\)|<img\s+[^>]*src=["'](.*?)["']/g;
    const currentPathsInContent = Array.from(new Set([...debouncedContent.matchAll(allImageRegex)].map(m => m[1] || m[2]).filter(Boolean)));

    // 区分本地路径和网络路径
    const localPaths = currentPathsInContent.filter(p => !p.startsWith('http') && !p.startsWith('data:'));
    const httpPaths = currentPathsInContent.filter(p => p.startsWith('http'));

    setPendingImages(prev => {
      const filtered = prev.filter(p => currentPathsInContent.includes(p.originalPath));
      const existingPaths = filtered.map(p => p.originalPath);
      
      // 所有本地图片必须无条件进入同步面板
      const newLocalPaths = localPaths.filter(path => !existingPaths.includes(path));
      const addedLocal = newLocalPaths.map(path => ({ originalPath: path, status: 'pending' as const }));
      
      return [...filtered, ...addedLocal];
    });

    // 网络路径：异步探测是否 404，如果是则加入面板允许重传
    httpPaths.forEach(url => {
      const img = new window.Image();
      img.onerror = () => {
        setPendingImages(prev => {
          if (prev.find(p => p.originalPath === url)) return prev;
          return [...prev, { originalPath: url, status: 'pending' }];
        });
      };
      img.src = url;
    });
  }, [debouncedContent]);

  // 工具：保存基础路径到本地
  useEffect(() => {
    if (localBaseDir) {
      localStorage.setItem("local-notes-root", localBaseDir);
    }
  }, [localBaseDir]);

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
      setLocalContent((prev: string) => prev + imageMarkdown);
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      e.target.value = "";
    }
  }

  // Markdown 文件导入
  async function handleMarkdownUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      alert("请选择 .md 格式的 Markdown 文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setLocalContent(text);

      // 检查是否有本地图片引用 (非 http/https/data 开头的图片链接)
      const localImageRegex = /!\[.*?\]\((?!http|https|data:)(.*?)\)|<img\s+[^>]*src=["'](?!http|https|data:)(.*?)["']/g;
      const matches = [...text.matchAll(localImageRegex)];

      if (matches.length > 0) {
        const uniquePaths = Array.from(new Set(matches.map(m => m[1] || m[2]).filter(Boolean)));

        // 初始化待处理状态
        setPendingImages(uniquePaths.map(path => ({ originalPath: path, status: 'pending' as const })));

        // 核心：尝试自动同步本地图片 (因为是本地开发环境，Server Action 可以读取绝对路径)
        try {
          setIsAutoSyncing(true);
          const syncedMapping = await syncLocalImages(uniquePaths, localBaseDir);
          const syncedPaths = Object.keys(syncedMapping);

          if (syncedPaths.length > 0) {
            let updatedContent = text;
            syncedPaths.forEach(oldPath => {
              const newUrl = syncedMapping[oldPath];
              updatedContent = updatedContent.split(`](${oldPath})`).join(`](${newUrl})`);
            });

            setLocalContent(updatedContent);

            setPendingImages(prev => prev.map(p =>
              syncedMapping[p.originalPath]
                ? { ...p, status: 'done', newUrl: syncedMapping[p.originalPath] }
                : p
            ));
          }
        } catch (err) {
          console.error("Auto-sync failed:", err);
        } finally {
          setIsAutoSyncing(false);
        }
      } else {
        setPendingImages([]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // 上传选定的本地缺失图片并自动替换
  async function handlePendingImageUpload(e: React.ChangeEvent<HTMLInputElement>, originalPath: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImages(prev => prev.map(p => p.originalPath === originalPath ? { ...p, status: 'uploading' } : p));

    try {
      const fileName = `body-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage
        .from("public-images")
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from("public-images")
        .getPublicUrl(fileName);

      // 精确替换对应的本地路径为 Supabase URL
      setLocalContent((prev: string) => prev.split(`](${originalPath})`).join(`](${data.publicUrl})`));

      setPendingImages(prev => prev.map(p => p.originalPath === originalPath ? { ...p, status: 'done', newUrl: data.publicUrl } : p));
    } catch (err: any) {
      alert("上传失败: " + err.message);
      setPendingImages(prev => prev.map(p => p.originalPath === originalPath ? { ...p, status: 'pending' } : p));
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
      formData.set("content", localContent);

      const result = await action(formData);
      if (result.success) {
        // 发布成功，清除草稿
        try { localStorage.removeItem(draftKey); } catch (e) { }
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
    <div className="max-w-6xl mx-auto py-10 px-4">
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

        {/* 自动保存指示器 */}
        <div className={`ml-auto flex items-center gap-1.5 text-xs font-medium transition-all duration-500 ${autoSaved ? "opacity-100 text-emerald-500" : "opacity-0"}`}>
          <Save size={12} />
          <span>已自动保存</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Grid size={16} className="text-primary" /> 分类
            </label>
            <Input
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="输入或选择分类..."
              list="category-list"
              className="border-border focus-visible:ring-ring bg-card"
            />
            <datalist id="category-list">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
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
                badgeClassName="bg-secondary text-secondary-foreground border-border/50 hover:bg-secondary/80"
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} className="text-primary" /> 正文内容 (Markdown)
            </label>
            <div className="flex items-center gap-2">
              {!isPreview && (
                <>
                  <label className="text-xs bg-card border border-border hover:bg-accent px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-primary shadow-sm">
                    <FileText size={12} /> 导入 MD
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleMarkdownUpload}
                      accept=".md"
                    />
                  </label>
                  <label className="text-xs bg-card border border-border hover:bg-accent px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-1.5 text-primary shadow-sm mr-1">
                    <Upload size={12} /> 插入图片
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleBodyImageUpload}
                      accept="image/*"
                    />
                  </label>
                </>
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

          {/* 本地图片快速上传处理面板 */}
          {pendingImages.length > 0 && !isPreview && (
            <div className="p-4 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 flex items-center gap-2">
                  <ImageIcon size={16} /> 发现 MD 包含本地/缺失的网络图片引用，请同步修复：
                </h4>
                {isAutoSyncing && (
                  <div className="flex items-center gap-2 text-xs text-yellow-600 animate-pulse font-bold">
                    <Loader2 size={12} className="animate-spin" /> 正在自动尝试同步本地文件...
                  </div>
                )}
              </div>
              {pendingImages.every(p => p.status === 'done') && !isAutoSyncing && (
                <Button variant="ghost" size="sm" onClick={() => setPendingImages([])} className="h-6 text-xs text-muted-foreground hover:text-foreground">隐藏完成项</Button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                {pendingImages.map((img, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-sm bg-background p-2.5 rounded-lg border border-border shadow-sm">
                    <code className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded max-w-[50%] truncate" title={img.originalPath}>{img.originalPath}</code>
                    {img.status === 'done' ? (
                      <span className="text-emerald-500 font-medium text-xs px-2.5 py-1 bg-emerald-500/10 rounded-md">替换完成 ✓</span>
                    ) : img.status === 'uploading' ? (
                      <span className="text-yellow-600 dark:text-yellow-500 font-medium animate-pulse text-xs px-2.5 py-1 bg-yellow-500/10 rounded-md flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" /> 上传中...
                      </span>
                    ) : (
                      <label className="bg-primary/10 hover:bg-primary/20 text-primary text-xs px-3 py-1 cursor-pointer rounded-md transition-colors font-medium border border-primary/20 hover:border-primary/40 shrink-0">
                        选择并替换
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePendingImageUpload(e, img.originalPath)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {/* 相对路径设置区 */}
              <div className="pt-2 border-t border-yellow-500/20">
                <p className="text-[11px] text-yellow-700/70 mb-2 leading-relaxed">
                  提示：如果图片是相对路径 (如 markdown-img/xxx.png)，请在下方填写这些笔记在您电脑上的<b>根目录</b>：
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="例如: C:\Users\ASUS\Documents\Notes"
                    value={localBaseDir}
                    onChange={(e) => setLocalBaseDir(e.target.value)}
                    className="h-8 text-xs bg-background/50 border-yellow-500/30 focus-visible:ring-yellow-500/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-700"
                    onClick={async () => {
                      const uniquePaths = pendingImages.filter(p => p.status !== 'done').map(p => p.originalPath);
                      if (uniquePaths.length > 0) {
                        try {
                          setIsAutoSyncing(true);
                          const syncedMapping = await syncLocalImages(uniquePaths, localBaseDir);
                          // 应用同步结果... (逻辑同上)
                          let updatedContent = localContent;
                          let hasChange = false;
                          Object.keys(syncedMapping).forEach(oldPath => {
                            const newUrl = syncedMapping[oldPath];
                            updatedContent = updatedContent.split(`](${oldPath})`).join(`](${newUrl})`);
                            hasChange = true;
                          });
                          if (hasChange) setLocalContent(updatedContent);
                        } finally {
                          setIsAutoSyncing(false);
                        }
                      }
                    }}
                  >
                    立即重试同步
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isPreview ? (
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-125 animate-in fade-in duration-300">
              <MarkdownRenderer content={localContent} />
            </div>
          ) : (
            <Textarea
              name="content"
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
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
        </div>

        {/* 右侧目录栏 - 仅在大屏幕显示，并支持吸顶 */}
        <div className="hidden lg:block sticky top-24 self-start">
          <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 mt-24">
             <TableOfContents content={debouncedContent} />
          </div>
        </div>
      </form>
    </div>
  );
}