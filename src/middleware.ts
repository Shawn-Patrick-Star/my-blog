import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // 1. 初始化 Supabase
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

  // 获取用户信息
  const { data: { user } } = await supabase.auth.getUser()

  // 2. 专门保护 /admin 路径
  if (url.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 检查角色
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
    if (!isAdmin) {
      // 如果不是管理员，回首页
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /* 排除所有静态资源和 SEO 文件，确保 sitemap.xml 能够直接被访问 */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}