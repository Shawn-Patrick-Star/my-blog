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
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm border-amber-100/50 shadow-lg bg-[#fffef9]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-800">管理员登录</CardTitle>
          <CardDescription>请输入密码进入控制台</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-white border-amber-100 focus-visible:ring-amber-200"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100"
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