import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Bell, Heart, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

async function markAllAsRead() {
    "use server";
    const user = await getCurrentUser();
    if (!user) return;

    await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);

    revalidatePath("/notifications");
}

export default async function NotificationsPage() {
    const userWithProfile = await getCurrentUser();
    if (!userWithProfile) {
        redirect("/login");
    }

    const { data: notifications } = await supabase
        .from("notifications")
        .select("*, from_profile:profiles!from_user_id(*)")
        .eq("user_id", userWithProfile.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Bell className="text-primary" />
                        消息中心
                    </h1>
                    <p className="text-muted-foreground">了解谁与你的内容进行了互动</p>
                </div>
                {notifications && notifications.length > 0 && (
                    <form action={markAllAsRead}>
                        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 rounded-full">
                            全部标记为已读
                        </Button>
                    </form>
                )}
            </div>

            <div className="space-y-4">
                {notifications?.map((n: any) => (
                    <div
                        key={n.id}
                        className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${n.is_read
                                ? "bg-card/50 border-border/40 opacity-80"
                                : "bg-paper-bg/40 border-primary/20 shadow-sm ring-1 ring-primary/5"
                            }`}
                    >
                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'like' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                            {n.type === 'like' ? <Heart size={20} fill={n.type === 'like' ? "currentColor" : "none"} /> : <MessageSquare size={20} />}
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="text-sm">
                                <span className="font-bold text-foreground">{n.from_profile?.username || "佚名"}</span>
                                <span className="text-muted-foreground">
                                    {n.type === 'like' ? " 点赞了你的内容" : " 在你的内容下发表了评论"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                                <Clock size={10} />
                                {format(new Date(n.created_at), "yyyy-MM-dd HH:mm")}
                            </div>
                        </div>

                        {!n.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary mt-4 shrink-0" />
                        )}
                    </div>
                ))}

                {(!notifications || notifications.length === 0) && (
                    <div className="text-center py-24 bg-muted/10 rounded-[40px] border border-dashed border-border/50">
                        <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} className="text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-medium">暂时没有新消息</p>
                    </div>
                )}
            </div>
        </div>
    );
}
