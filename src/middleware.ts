import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      global: {
        fetch: (...args: Parameters<typeof fetch>) => {
          // 给 Supabase 的 fetch 请求加上 10 秒超时，防止无限挂起
          const [input, init] = args;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          return fetch(input, {
            ...init,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      },
    }
  )

  // refreshing the auth token
  try {
    await supabase.auth.getUser()
  } catch (e: any) {
    // 网络失败（ECONNRESET / abort / TLS 握手超时）时静默处理
    // 不打印完整堆栈，只记录简短信息，避免刷屏
    const msg = e?.cause?.code || e?.message || 'unknown';
    if (msg !== 'ABORT_ERR') {
      console.warn(`[middleware] auth refresh skipped: ${msg}`);
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (svg, png, jpg, etc.)
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}