"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProfileAction, updatePasswordAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { User, Lock, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // 用于追踪修改
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    const [state, formAction, isPending] = useActionState(updateProfileAction, null);
    const [pwdState, pwdAction, isPwdPending] = useActionState(updatePasswordAction, null);

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setProfile(profile);
                setCurrentUsername(profile.username || "");
                setCurrentAvatarUrl(profile.avatar_url || "");
            }
            setLoading(false);
        }
        loadUser();
    }, [supabase, router]);

    // 检查是否有修改
    const checkChanges = (username: string, avatarUrl: string) => {
        const changed = username !== (profile?.username || "") || avatarUrl !== (profile?.avatar_url || "");
        setHasChanges(changed);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentUsername(e.target.value);
        checkChanges(e.target.value, currentAvatarUrl);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 上传到 Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-images')
                .getPublicUrl(filePath);

            setCurrentAvatarUrl(publicUrl);
            checkChanges(currentUsername, publicUrl);
        } catch (error: any) {
            alert("头像上传失败: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-black text-foreground">个人设置</h1>
                <p className="text-muted-foreground">管理你的数字花园通行证</p>
            </div>

            {/* 基础信息 */}
            <Card className="border-border shadow-sm rounded-[40px] overflow-hidden backdrop-blur-sm bg-card/50">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                        <User size={18} className="text-primary" />
                        基本资料
                    </CardTitle>
                    <CardDescription>你的公开身份信息</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form action={formAction} className="space-y-8">
                        {/* 头像预览与更新 */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-accent border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    ) : currentAvatarUrl ? (
                                        <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-muted-foreground/30" />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                                    <Camera size={24} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                </label>
                            </div>
                            <input type="hidden" name="avatar_url" value={currentAvatarUrl} />
                            <p className="text-xs text-muted-foreground font-medium">点击图片更换头像</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 ml-2">用户名</label>
                                <Input
                                    name="username"
                                    value={currentUsername}
                                    onChange={handleUsernameChange}
                                    className="rounded-2xl border-border bg-background focus-visible:ring-primary/20 h-12 px-4"
                                    placeholder="起个好听的名字"
                                />
                                <div className="flex items-center gap-2 ml-2">
                                    <AlertCircle size={12} className="text-muted-foreground" />
                                    <p className="text-[10px] text-muted-foreground font-medium italic">
                                        30 天内只能修改一次用户名
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 ml-2">绑定邮箱</label>
                                <Input
                                    value={user?.email || ""}
                                    disabled
                                    className="rounded-2xl border-border bg-muted/40 opacity-70 h-12 px-4"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-2xl text-sm flex items-center gap-3">
                                <AlertCircle size={18} />
                                {state.error}
                            </div>
                        )}
                        {state?.success && (
                            <div className="bg-green-500/10 text-green-600 p-4 rounded-2xl text-sm flex items-center gap-3">
                                <Check size={18} />
                                基本资料更新成功
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isPending || !hasChanges || uploading}
                            className={`w-full h-12 rounded-2xl font-black text-base shadow-lg transition-all duration-300 ${hasChanges && !isPending && !uploading
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 scale-[1.02] active:scale-95"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                }`}
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "保存更改"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* 安全设置 */}
            <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                        <Lock size={18} className="text-primary" />
                        账户安全
                    </CardTitle>
                    <CardDescription>更新你的登录密码</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form action={pwdAction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 ml-1">新密码</label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="不少于 6 位"
                                    className="rounded-xl border-border bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/70 ml-1">确认新密码</label>
                                <Input
                                    type="password"
                                    name="confirm_password"
                                    placeholder="再次输入"
                                    className="rounded-xl border-border bg-background/50"
                                />
                            </div>
                        </div>

                        {pwdState?.error && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {pwdState.error}
                            </div>
                        )}
                        {pwdState?.success && (
                            <div className="bg-green-500/10 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2">
                                <Check size={16} />
                                密码已重置
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isPwdPending}
                            variant="secondary"
                            className="w-full rounded-xl font-bold"
                        >
                            {isPwdPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "修改密码"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
