"use client";

import { registerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import Link from "next/link";

const initialState = { error: "" };

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerAction, initialState);

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 transition-colors duration-300">
            <Card className="w-full max-w-sm border-paper-border shadow-lg bg-paper-bg/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-paper-line/10 rounded-full flex items-center justify-center mb-2">
                        <UserPlus className="w-5 h-5 text-paper-line" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-paper-text">新用户注册</CardTitle>
                    <CardDescription className="opacity-70 text-paper-text">创建一个账号来记录你的生活点滴</CardDescription>
                </CardHeader>
                <CardContent>
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
