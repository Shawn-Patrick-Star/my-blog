"use client";

import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useActionState, useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const initialState = { error: "", success: false };

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);
    const searchParams = useSearchParams();
    const msg = searchParams.get("msg");

    // 关键修正：登录成功后使用 window.location 强制刷新页面
    // 这样可以确保 Navbar 等服务端组件能立刻拿到最新的 Cookie
    useEffect(() => {
        if (state?.success) {
            window.location.href = "/";
        }
    }, [state?.success]);

    return (
        <Card className="w-full max-w-sm border-paper-border shadow-lg bg-paper-bg/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto w-12 h-12 bg-paper-line/10 rounded-full flex items-center justify-center mb-2">
                    <LogIn className="w-5 h-5 text-paper-line" />
                </div>
                <CardTitle className="text-2xl font-bold text-paper-text">用户登录</CardTitle>
                <CardDescription className="opacity-70 text-paper-text">登录后即可发布动态与评论</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {msg === "REGISTER_SUCCESS" && (
                        <p className="text-sm text-green-600 font-medium text-center bg-green-500/10 py-2 rounded-lg">
                            注册成功，请登录
                        </p>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Input
                                type="email"
                                name="email"
                                placeholder="邮箱地址 (Email)"
                                required
                                className="bg-background/50 border-paper-border focus-visible:ring-paper-line/30 text-paper-text"
                            />
                        </div>
                        <div className="space-y-1">
                            <Input
                                type="password"
                                name="password"
                                placeholder="登录密码 (Password)"
                                required
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
                        {isPending ? "登录中..." : "立即登录"}
                    </Button>

                    <div className="text-center text-sm text-paper-text/60 mt-4">
                        还没有账号？{" "}
                        <Link href="/register" className="text-paper-line font-bold hover:underline">
                            立即注册
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
