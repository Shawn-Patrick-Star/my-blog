"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { updateProfileAction, updatePasswordAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { User, Lock, Camera, Check, AlertCircle, Loader2, FileText, MessageSquare, Quote } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [moments, setMoments] = useState<any[]>([]);

    // 用于追踪修改
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
    const [currentBio, setCurrentBio] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    const [state, formAction, isPending] = useActionState(updateProfileAction, null);
    const [pwdState, pwdAction, isPwdPending] = useActionState(updatePasswordAction, null);

    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;

        async function loadUser() {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    if (authError?.name !== 'AuthRetryableFetchError' && authError?.message !== 'AbortError') {
                        router.push("/login");
                    }
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
                    setCurrentBio(profile.bio || "");
                }

                // 加载用户的作品
                const [postsRes, momentsRes] = await Promise.all([
                    supabase.from("posts").select("*, author:profiles!author_id(*)").eq("author_id", user.id).order("created_at", { ascending: false }),
                    supabase.from("moments").select("*, author:profiles!author_id(*)").eq("author_id", user.id).order("created_at", { ascending: false })
                ]);

                setPosts(postsRes.data || []);
                setMoments(momentsRes.data || []);
                loadedRef.current = true;
            } catch (err: any) {
                // 忽略锁定错误，因为那是 Supabase 内部多标签同步机制
                if (err.name !== 'AbortError') {
                    console.error("加载个人资料失败:", err);
                }
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, [supabase, router]);

    // 检查是否有修改
    const checkChanges = (username: string, avatarUrl: string, bio: string) => {
        const changed =
            username !== (profile?.username || "") ||
            avatarUrl !== (profile?.avatar_url || "") ||
            bio !== (profile?.bio || "");
        setHasChanges(changed);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentUsername(e.target.value);
        checkChanges(e.target.value, currentAvatarUrl, currentBio);
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentBio(e.target.value);
        checkChanges(currentUsername, currentAvatarUrl, e.target.value);
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
            checkChanges(currentUsername, publicUrl, currentBio);
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
                                <label className="text-sm font-bold text-foreground/70 ml-2 flex items-center gap-2">
                                    <Quote size={14} className="text-primary" />
                                    个人简介 / 签名
                                </label>
                                <Textarea
                                    name="bio"
                                    value={currentBio}
                                    onChange={handleBioChange}
                                    className="rounded-2xl border-border bg-background focus-visible:ring-primary/20 min-h-[100px] px-4 py-3"
                                    placeholder="介绍一下你自己..."
                                />
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

            {/* 我的作品展示 */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 px-2">
                    <h2 className="text-2xl font-black text-foreground">我的贡献</h2>
                    <div className="h-px flex-1 bg-border/50"></div>
                </div>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/30 p-1 mb-6">
                        <TabsTrigger value="posts" className="rounded-xl flex items-center gap-2 py-2.5">
                            <FileText size={16} /> 笔记 ({posts.length})
                        </TabsTrigger>
                        <TabsTrigger value="moments" className="rounded-xl flex items-center gap-2 py-2.5">
                            <MessageSquare size={16} /> 动态 ({moments.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {posts.map(post => (
                                    <BlogCard key={post.id} post={post} isAdmin={profile?.role === 'admin' || profile?.role === 'super_admin'} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/10 rounded-[32px] border border-dashed border-border/60">
                                <p className="text-muted-foreground font-medium">暂时还没有发布过笔记</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="moments" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        {moments.length > 0 ? (
                            <div className="bg-muted/30 backdrop-blur-sm rounded-[32px] border border-border/40 p-4 md:p-6 space-y-2">
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
                                                isAdmin={profile?.role === 'admin' || profile?.role === 'super_admin'}
                                                align={currentAlign}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-muted/10 rounded-[32px] border border-dashed border-border/60">
                                <p className="text-muted-foreground font-medium">暂时还没有发布过动态</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
