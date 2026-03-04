"use client";

import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useActionState } from "react";
import { Lock } from "lucide-react";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 transition-colors duration-300">
      <Card className="w-full max-w-sm border-paper-border shadow-lg bg-paper-bg/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-paper-line/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-5 h-5 text-paper-line" />
          </div>
          <CardTitle className="text-2xl font-bold text-paper-text">管理员登录</CardTitle>
          <CardDescription className="opacity-70 text-paper-text">请输入密码进入控制台</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-background/50 border-paper-border focus-visible:ring-paper-line/30 text-paper-text"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 font-medium text-center bg-red-500/10 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-paper-line hover:bg-paper-line/90 text-white dark:text-paper-bg shadow-lg shadow-paper-line/20"
              disabled={isPending}
            >
              {isPending ? "登录中..." : "进入后台"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}