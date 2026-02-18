import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"], // 只拦截 /admin 开头的路径
};

export function middleware(req: NextRequest) {
  // 1. 检查有没有名为 "admin_session" 的 Cookie
  const cookie = req.cookies.get("admin_session");
  const isAuth = cookie?.value === "true";

  // 2. 如果没有 Cookie，强制重定向到登录页
  if (!isAuth) {
    // 这里的 url 是为了让登录后能跳回来（可选功能，这里先简化处理）
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. 有 Cookie，放行
  return NextResponse.next();
}