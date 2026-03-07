import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 1. 【新增逻辑】专门保护 /admin 路径
  if (url.pathname.startsWith('/admin')) {
    const cookie = request.cookies.get("admin_session");
    const isAuth = cookie?.value === "true";

    if (!isAuth) {
      // 如果没有管理员 Cookie，直接踢到登录页
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. 原有的 Supabase Session 刷新逻辑 (保持不变)
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    await supabase.auth.getUser()
  } catch (e) {
    // 静默处理错误
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /* 排除所有静态资源和 SEO 文件，确保 sitemap.xml 能够直接被访问 */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}