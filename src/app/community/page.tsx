import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { MomentCard } from "@/components/moment-card";
import { SectionHeader } from "@/components/section-header";
import { SearchInput } from "@/components/search-input";
import { MessageSquareShare } from "lucide-react";

export const revalidate = 0;

export default async function CommunityPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <MessageSquareShare className="text-primary w-10 h-10" />
                        社区广场
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">发现有趣的生活碎片，与花友们交流互动。</p>
                </div>
                <div className="w-full md:w-80">
                    <SearchInput defaultValue={query} placeholder="搜索动态内容..." />
                </div>
            </div>

            <div className="border-t border-border/50 pt-8">
                <SectionHeader
                    title={`全部动态 (${moments?.length || 0})`}
                    actionLabel="发布新动态"
                    actionHref="/admin/moments"
                    showAction={isUser}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                    {moments?.map((item) => {
                        const momentComments = allComments.filter(c => c.moment_id === item.id);
                        return (
                            <MomentCard
                                key={item.id}
                                id={item.id}
                                content={item.content}
                                createdAt={item.created_at}
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
