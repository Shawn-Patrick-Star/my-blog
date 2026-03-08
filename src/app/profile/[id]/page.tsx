import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, FileText, MessageSquare, Quote, Calendar } from "lucide-react";
import { format } from "date-fns";

export const revalidate = 0;

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. 获取用户信息
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (!profile) notFound();

    // 2. 获取该用户的作品
    const [postsRes, momentsRes] = await Promise.all([
        supabase
            .from("posts")
            .select("*, author:profiles!author_id(*)")
            .eq("author_id", id)
            .eq("is_published", true)
            .order("created_at", { ascending: false }),
        supabase
            .from("moments")
            .select("*, author:profiles!author_id(*)")
            .eq("author_id", id)
            .order("created_at", { ascending: false })
    ]);

    const posts = postsRes.data || [];
    const moments = momentsRes.data || [];

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
            {/* 个人头部信息卡片 */}
            <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent rounded-[40px] blur-2xl -z-10 opacity-50"></div>
                <div className="bg-card/50 backdrop-blur-sm border border-border shadow-sm rounded-[40px] p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    {/* 装饰性背景 */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <UserIcon size={200} />
                    </div>

                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-accent border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/30" />
                            )}
                        </div>
                        {profile.role === "super_admin" && (
                            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                园长
                            </div>
                        )}
                        {(profile.role === "admin" && profile.role !== "super_admin") && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                管理员
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                {profile.username}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-sm font-medium">
                                <Calendar size={14} />
                                <span>加入于 {format(new Date(profile.created_at), "yyyy-MM-dd")}</span>
                            </div>
                        </div>

                        {profile.bio ? (
                            <div className="bg-accent/30 p-4 rounded-2xl border border-border/50 relative">
                                <Quote size={16} className="absolute -top-2 -left-2 text-primary opacity-50" />
                                <p className="text-foreground/80 italic font-medium leading-relaxed">
                                    {profile.bio}
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic text-sm">该花友很神秘，还没有填写个性签名。</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 作品展示展示区 */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                    <h2 className="text-2xl font-black text-foreground">全部贡献</h2>
                    <div className="h-px flex-1 bg-border/50"></div>
                </div>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="inline-flex w-auto rounded-2xl bg-muted/40 p-1 mb-8 border border-border/50">
                        <TabsTrigger value="posts" className="rounded-xl px-8 flex items-center gap-2 py-2">
                            <FileText size={16} /> 笔记 <span className="opacity-50 text-xs">{posts.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="moments" className="rounded-xl px-8 flex items-center gap-2 py-2">
                            <MessageSquare size={16} /> 动态 <span className="opacity-50 text-xs">{moments.length}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-8">
                                {posts.map(post => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-muted/5 rounded-[40px] border-2 border-dashed border-border/40">
                                <p className="text-muted-foreground font-bold">暂时还没有发布过笔记</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="moments" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {moments.length > 0 ? (
                            <div className="bg-muted/30 backdrop-blur-sm rounded-[40px] border border-border/40 p-4 md:p-8 space-y-2">
                                {(() => {
                                    let lastAuthorId = "";
                                    let currentAlign: 'left' | 'right' = 'left';
                                    return moments.map((moment) => {
                                        if (moment.author_id !== lastAuthorId) {
                                            currentAlign = currentAlign === 'left' ? 'right' : 'left';
                                            lastAuthorId = moment.author_id || "";
                                        }
                                        return (
                                            <MomentCard
                                                key={moment.id}
                                                {...moment}
                                                align={currentAlign}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-muted/5 rounded-[40px] border-2 border-dashed border-border/40">
                                <p className="text-muted-foreground font-bold">暂时还没有发布过动态</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
