import { createClient } from "@/utils/supabase/server";
import { MomentCard } from "@/components/moment-card";
import { BlogCard } from "@/components/blog-card";
import { User, BookOpen, Camera, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/section-header";
import { notFound } from "next/navigation";

export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // 获取用户信息
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (!profile) {
        notFound();
    }

    // 获取用户发布的内容
    const [{ data: posts }, { data: moments }] = await Promise.all([
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
            .order("created_at", { ascending: false }),
    ]);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            {/* 个人主页头部 */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-paper-bg/30 p-8 rounded-[40px] border border-paper-border/50 backdrop-blur-sm">
                <div className="w-32 h-32 rounded-full border-4 border-paper-line/20 overflow-hidden shrink-0 shadow-2xl">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-accent flex items-center justify-center">
                            <User size={64} className="text-muted-foreground/30" />
                        </div>
                    )}
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-4xl font-black text-foreground tracking-tight">{profile.username}</h1>
                            {profile.role === "super_admin" && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">园长</span>
                            )}
                        </div>
                        <p className="text-muted-foreground font-medium opacity-80">{profile.email}</p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                        <div className="flex items-center gap-2 text-foreground/70">
                            <Calendar size={16} />
                            <span>加入于 {format(new Date(profile.created_at), "yyyy-MM-dd")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70">
                            <BookOpen size={16} />
                            <span>{posts?.length || 0} 篇笔记</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/70">
                            <Camera size={16} />
                            <span>{moments?.length || 0} 条动态</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 动态板块 */}
            <section className="space-y-6">
                <SectionHeader title={`${profile.username} 的碎片动态`} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {moments?.map((m) => (
                        <MomentCard
                            key={m.id}
                            id={m.id}
                            content={m.content}
                            created_at={m.created_at}
                            images={m.images}
                            likes={m.likes}
                            author={profile}
                        />
                    ))}
                    {moments?.length === 0 && (
                        <div className="col-span-2 text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/50 text-muted-foreground">
                            还没有发布过任何动态
                        </div>
                    )}
                </div>
            </section>

            {/* 笔记板块 */}
            <section className="space-y-6">
                <SectionHeader title={`${profile.username} 的笔记`} />
                <div className="flex flex-col gap-4">
                    {posts?.map((p) => (
                        <BlogCard key={p.id} post={p} />
                    ))}
                    {posts?.length === 0 && (
                        <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/50 text-muted-foreground">
                            还没有写过任何笔记
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
