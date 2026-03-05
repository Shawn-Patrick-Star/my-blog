import { supabase } from "@/lib/supabase";
import { checkIsSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Shield, ShieldCheck, ArrowLeft, MoreHorizontal, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RoleToggle } from "./role-toggle";

export default async function AdminUsersPage() {
    const isSuper = await checkIsSuperAdmin();
    if (!isSuper) {
        redirect("/admin");
    }

    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Link href="/admin" className="text-sm text-primary flex items-center gap-1 hover:underline mb-2 font-bold">
                        <ArrowLeft size={14} /> 返回控制台
                    </Link>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <UserCog className="text-primary" />
                        用户与权限管理
                    </h1>
                    <p className="text-muted-foreground">作为最高管理员，你可以管理站点成员的访问权限</p>
                </div>
            </div>

            <div className="bg-card/50 border border-border/50 rounded-[40px] overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/30 border-b border-border/30">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">用户</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">邮箱</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">角色</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {profiles?.map((p) => (
                            <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                                <td className="px-6 py-4 border-b border-border/10">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-accent border border-border flex items-center justify-center overflow-hidden">
                                            {p.avatar_url ? (
                                                <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} className="text-muted-foreground" />
                                            )}
                                        </div>
                                        <span className="font-bold text-foreground">{p.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground border-b border-border/10">{p.email}</td>
                                <td className="px-6 py-4 border-b border-border/10">
                                    {p.role === 'super_admin' ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase">
                                            <ShieldCheck size={12} /> 超级管理员
                                        </span>
                                    ) : p.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">
                                            <Shield size={12} /> 管理员
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-black uppercase">
                                            花友 (User)
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right border-b border-border/10">
                                    {p.role !== 'super_admin' && (
                                        <RoleToggle userId={p.id} currentRole={p.role} />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
