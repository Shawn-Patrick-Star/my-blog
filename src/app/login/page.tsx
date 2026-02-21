"use client";

import { loginAction } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useActionState } from "react";

const initialState = {
  error: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm border-zinc-200 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">管理员登录</CardTitle>
          <CardDescription>
            请输入密码进入控制台
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 绑定 formAction */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-white"
              />
            </div>
            
            {/* 显示错误信息 */}
            {state?.error && (
              <p className="text-sm text-red-500 font-medium text-center">
                {state.error}
              </p>
            )}

            {/* 3. 利用 isPending 来禁用按钮，防止重复提交 */}
            <Button 
              type="submit" 
              className="w-full bg-zinc-900 hover:bg-zinc-800"
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