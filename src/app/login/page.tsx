"use client";

import { loginAction } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useFormState } from "react-dom"; // React 这里的 hook 用于处理表单状态

const initialState = {
  error: "",
};

export default function LoginPage() {
    // 👇 修改这里：useFormState 返回 [state, formAction]，没有 isPending
    // (如果你想做加载状态，需要把 Button 拆分成单独组件用 useFormStatus，这里先简单处理)
    const [state, formAction] = useFormState(loginAction, initialState);
  
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
            {/* 这里绑定 formAction */}
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
  
              <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                进入后台
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }