"use client";

import { Search, ListFilter, Tag, Clock, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface BlogFiltersProps {
    categories: string[];
    tags: string[];
    isAdmin?: boolean;
}

export function BlogFilters({ categories, tags, isAdmin }: BlogFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentView = searchParams.get("view") || "timeline";
    const currentQuery = searchParams.get("q") || "";
    const currentCat = searchParams.get("cat") || "";
    const currentTag = searchParams.get("tag") || "";

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/blog?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-4 w-full relative z-10">
            {/* 1. 主控行：搜索框 + 视图切换 (桌面端单行，移动端自适应折行) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">

                {/* 左侧搜索框：占据剩余的弹性空间 */}
                <div className="relative w-full md:flex-1 group">
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300"
                        size={18}
                    />
                    <Input
                        placeholder="搜索笔记标题或内容..."
                        className="h-12 pl-10 pr-4 w-full bg-background/60 border-border/50 rounded-2xl focus-visible:ring-primary/30 focus-visible:bg-background focus-visible:border-primary/50 shadow-sm transition-all text-base md:text-sm placeholder:text-muted-foreground/50"
                        defaultValue={currentQuery}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                updateParams({
                                    q: e.currentTarget.value || null,
                                    view: e.currentTarget.value ? "search" : "timeline"
                                });
                            }
                        }}
                    />
                </div>

                {/* 右侧视图切换器：内阴影毛玻璃效果，包裹按钮 */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide py-1">
                    {/* 管理员专属：新建笔记按钮 */}
                    {isAdmin && (
                        <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="rounded-xl px-4 h-9 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 shrink-0 font-bold transition-all duration-300 transform active:scale-95"
                        >
                            <Link href="/admin/write">
                                <Plus size={15} />
                                新建笔记
                            </Link>
                        </Button>
                    )}

                    <div className="flex items-center p-1 bg-secondary/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner shrink-0 leading-none">
                        {[
                            { id: "timeline", label: "时间线", icon: Clock },
                            { id: "category", label: "分类", icon: ListFilter },
                            { id: "tag", label: "标签", icon: Tag },
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => updateParams({ view: tab.id, cat: null, tag: null, q: null })}
                                className={cn(
                                    "rounded-xl px-4 md:px-5 h-9 flex items-center gap-2 transition-all duration-300 font-medium whitespace-nowrap",
                                    currentView === tab.id
                                        ? "bg-background text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                )}
                            >
                                <tab.icon size={15} className={cn(
                                    "transition-transform duration-500",
                                    currentView === tab.id ? "scale-110" : "opacity-70"
                                )} />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. 展开的子过滤器：分类 (平滑下拉动画 + 柔和容器包裹) */}
            {currentView === "category" && (
                <div className="flex flex-wrap items-center gap-2.5 p-3 md:px-4 bg-secondary/20 rounded-2xl border border-border/40 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-sm font-medium text-muted-foreground/70 mr-2 shrink-0">按分类浏览：</span>
                    <Button
                        variant={!currentCat ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams({ cat: null })}
                        className={cn(
                            "rounded-full px-5 h-8 transition-all duration-300",
                            !currentCat ? "shadow-md shadow-primary/20" : "bg-background border-border/50 hover:bg-secondary"
                        )}
                    >
                        全部
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={currentCat === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateParams({ cat })}
                            className={cn(
                                "rounded-full px-5 h-8 transition-all duration-300",
                                currentCat === cat ? "shadow-md shadow-primary/20" : "bg-background border-border/50 hover:bg-secondary"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            )}

            {/* 3. 展开的子过滤器：标签 (平滑下拉动画 + 柔和容器包裹) */}
            {currentView === "tag" && (
                <div className="flex flex-wrap items-center gap-2.5 p-3 md:px-4 bg-secondary/20 rounded-2xl border border-border/40 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-sm font-medium text-muted-foreground/70 mr-2 shrink-0">按标签浏览：</span>
                    <Button
                        variant={!currentTag ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams({ tag: null })}
                        className={cn(
                            "rounded-full px-5 h-8 transition-all duration-300",
                            !currentTag ? "shadow-md shadow-primary/20" : "bg-background border-border/50 hover:bg-secondary"
                        )}
                    >
                        全部
                    </Button>
                    {tags.map((tag) => (
                        <Button
                            key={tag}
                            variant={currentTag === tag ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateParams({ tag })}
                            className={cn(
                                "rounded-full px-5 h-8 transition-all duration-300",
                                currentTag === tag ? "shadow-md shadow-primary/20" : "bg-background border-border/50 hover:bg-secondary"
                            )}
                        >
                            {tag}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}