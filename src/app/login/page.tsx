import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 transition-colors duration-300">
      <Suspense fallback={
        <p className="text-sm text-muted-foreground animate-pulse">加载登录模块...</p>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
