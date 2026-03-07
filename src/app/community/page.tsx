import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { MomentCard } from "@/components/moment-card";
import { SectionHeader } from "@/components/section-header";
import { SearchInput } from "@/components/search-input";
import { MessageSquareShare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function CommunityPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; only_me?: string }>;
}) {
    const { q, only_me } = await searchParams;
    const query = q || "";
    const userWithProfile = await getCurrentUser();
    const isAdmin = userWithProfile?.profile.role === "admin" || userWithProfile?.profile.role === "super_admin";
    const isUser = !!userWithProfile;

    const supabase = await createClient();

    // 获取所有动态
    let momentQuery = supabase
        .from("moments")
        .select("*, author:profiles!author_id(*)")
        .order("created_at", { ascending: false });

    if (query) {
        momentQuery = momentQuery.ilike("content", `%${query}%`);
    }

    if (only_me === "true" && userWithProfile) {
        momentQuery = momentQuery.eq("author_id", userWithProfile.id);
    }

    const { data: moments } = await momentQuery;

    // 获取评论
    const momentIds = moments?.map(m => m.id) || [];
    let allComments: any[] = [];
    if (momentIds.length > 0) {
        const { data } = await supabase
            .from("comments")
            .select("*")
            .in("moment_id", momentIds)
            .order("created_at", { ascending: false });
        if (data) allComments = data;
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <MessageSquareShare className="text-primary w-10 h-10" />
                        社区广场
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">发现有趣的生活碎片，与花友们交流互动。</p>
                </div>
            </div>

            <div className="border-t border-border/50 pt-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-0">
                        <span className={`w-2 h-8 bg-primary rounded-full`} />
                        社区动态 ({moments?.length || 0})
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:justify-end">
                        <div className="w-full sm:w-64">
                            <SearchInput defaultValue={query} placeholder="搜索动态内容..." className="h-9 shadow-sm" />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {isUser && (
                                <a
                                    href={only_me === "true" ? "/community" : "/community?only_me=true"}
                                    className={cn(
                                        "h-9 text-xs px-4 rounded-full border transition-all font-bold flex items-center gap-1.5 whitespace-nowrap",
                                        only_me === "true"
                                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                            : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary shadow-sm"
                                    )}
                                >
                                    <User size={14} fill={only_me === "true" ? "currentColor" : "none"} />
                                    只看我的
                                </a>
                            )}

                            {isUser && (
                                <Link href="/admin/moments">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-1 text-primary border-border hover:bg-accent shadow-sm rounded-full px-5 font-bold"
                                    >
                                        <MessageSquareShare size={16} /> 发布新动态
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                    {moments?.map((item) => {
                        const momentComments = allComments.filter(c => c.moment_id === item.id);
                        return (
                            <MomentCard
                                key={item.id}
                                id={item.id}
                                content={item.content}
                                created_at={item.created_at}
                                images={item.images}
                                likes={item.likes}
                                comments={momentComments}
                                isAdmin={isAdmin}
                                author={item.author}
                            />
                        );
                    })}
                    {moments?.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="text-6xl">🏜️</div>
                            <p className="text-muted-foreground font-bold">还没有人发布动态，快来当第一个吧！</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
