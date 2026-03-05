"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { User, LogOut, Settings, LayoutDashboard, Bell } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function UserNav() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    setUser(session.user);
                    fetchProfile(session.user.id);
                    fetchUnreadCount(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                    setUnreadCount(0);
                }
            }
        );

        async function fetchProfile(userId: string) {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
            setProfile(data);
        }

        async function fetchUnreadCount(userId: string) {
            const { count } = await supabase
                .from("notifications")
                .select("*", { count: 'exact', head: true })
                .eq("user_id", userId)
                .eq("is_read", false);
            setUnreadCount(count || 0);
        }

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (!user) {
        return (
            <Link
                href="/login"
                className="text-sm font-bold text-paper-text hover:text-primary transition-colors px-4 py-2"
            >
                登录
            </Link>
        );
    }

    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

    return (
        <div className="flex items-center gap-2 pl-2 border-l border-border/50 ml-2">
            <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-accent transition-all">
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground font-black rounded-full flex items-center justify-center ring-2 ring-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Link>

            {isAdmin && (
                <Link href="/admin" className="p-2 text-muted-foreground hover:text-primary rounded-full hover:bg-accent transition-all" title="工作台">
                    <LayoutDashboard size={18} />
                </Link>
            )}

            <Link href="/profile" className="flex items-center gap-2 group ml-1">
                <div className="w-8 h-8 rounded-full bg-accent border border-border overflow-hidden flex items-center justify-center">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={16} className="text-muted-foreground" />
                    )}
                </div>
                <div className="hidden md:flex flex-col items-start -space-y-0.5">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[80px]">
                        {profile?.username || "我的花园"}
                    </span>
                    <span className="text-[10px] text-muted-foreground opacity-60">
                        {profile?.role === "super_admin" ? "博主" : profile?.role === "admin" ? "管理员" : "花友"}
                    </span>
                </div>
            </Link>

            <form action={logoutAction} className="flex items-center">
                <button
                    type="submit"
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    title="退出登录"
                >
                    <LogOut size={16} />
                </button>
            </form>
        </div>
    );
}
