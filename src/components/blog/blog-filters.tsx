"use client";

import { Search, ListFilter, Tag, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogFiltersProps {
    categories: string[];
    tags: string[];
}

export function BlogFilters({ categories, tags }: BlogFiltersProps) {
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
        <div className="space-y-6">
            {/* Search and Main Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                        placeholder="搜索笔记标题或内容..."
                        className="pl-10 bg-card border-border focus-visible:ring-primary/20"
                        defaultValue={currentQuery}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                updateParams({ q: e.currentTarget.value || null, view: e.currentTarget.value ? "search" : "timeline" });
                            }
                        }}
                    />
                </div>

                <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border shadow-inner self-stretch md:self-auto">
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
                                "rounded-xl px-5 h-9 flex items-center gap-2 transition-all duration-300",
                                currentView === tab.id
                                    ? "bg-background text-primary shadow-md font-black ring-1 ring-black/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            )}
                        >
                            <tab.icon size={14} className={cn("transition-transform duration-500", currentView === tab.id && "scale-110")} />
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Sub-Filters for Category and Tag */}
            {currentView === "category" && (
                <div className="flex flex-wrap gap-2 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Button
                        variant={!currentCat ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams({ cat: null })}
                        className="rounded-full px-5"
                    >
                        全部
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={currentCat === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateParams({ cat })}
                            className="rounded-full px-5"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            )}

            {currentView === "tag" && (
                <div className="flex flex-wrap gap-2 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Button
                        variant={!currentTag ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateParams({ tag: null })}
                        className="rounded-full px-5"
                    >
                        全部
                    </Button>
                    {tags.map((tag) => (
                        <Button
                            key={tag}
                            variant={currentTag === tag ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateParams({ tag })}
                            className="rounded-full px-5"
                        >
                            {tag}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
