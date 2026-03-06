"use client";

import { registerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useActionState } from "react";
import { UserPlus, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const initialState = { error: "", success: false };

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerAction, initialState);

    if (state.success) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <Card className="w-full max-w-sm border-paper-border shadow-2xl bg-paper-bg/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="space-y-4 text-center pt-10 px-8">
                        <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2 animate-bounce">
                            <Mail className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-black text-paper-text tracking-tight">注册成功！</CardTitle>
                            <CardDescription className="text-base font-bold text-green-600/80">
                                最后一小步：激活账号
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-10 space-y-6 text-center">
                        <div className="p-4 bg-muted/40 rounded-3xl border border-border/50 space-y-3">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                我们已向您的邮箱发送了一封确认邮件。
                                <br />
                                <span className="font-bold text-primary">请点击邮件中的链接以完成注册。</span>
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button asChild className="w-full h-12 bg-paper-line hover:bg-paper-line/90 text-white rounded-2xl shadow-lg shadow-paper-line/20 font-bold">
                                <Link href="/login">去登录页面</Link>
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                没收到邮件？请检查垃圾箱或稍后再试。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 transition-colors duration-300">
            <Card className="w-full max-w-sm border-paper-border shadow-lg bg-paper-bg/80 backdrop-blur-sm rounded-3xl">
                <CardHeader className="space-y-1 text-center pt-8">
                    <div className="mx-auto w-12 h-12 bg-paper-line/10 rounded-full flex items-center justify-center mb-2">
                        <UserPlus className="w-5 h-5 text-paper-line" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-paper-text">新用户注册</CardTitle>
                    <CardDescription className="opacity-70 text-paper-text">创建一个账号来记录你的生活点滴</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Input
                                    type="text"
                                    name="username"
                                    placeholder="用户名 (Username)"
                                    required
                                    autoComplete="off"
                                    className="bg-background/50 border-paper-border focus-visible:ring-paper-line/30 text-paper-text"
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="邮箱地址 (Email)"
                                    required
                                    autoComplete="email"
                                    className="bg-background/50 border-paper-border focus-visible:ring-paper-line/30 text-paper-text"
                                />
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="设置密码 (Password)"
                                    required
                                    autoComplete="new-password"
                                    className="bg-background/50 border-paper-border focus-visible:ring-paper-line/30 text-paper-text"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
                                {state.error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-paper-line hover:bg-paper-line/90 text-white dark:text-paper-bg shadow-lg shadow-paper-line/20 rounded-xl"
                            disabled={isPending}
                        >
                            {isPending ? "注册中..." : "立即注册"}
                        </Button>

                        <div className="text-center text-sm text-paper-text/60 mt-4">
                            已有账号？{" "}
                            <Link href="/login" className="text-paper-line font-bold hover:underline">
                                返回登录
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
