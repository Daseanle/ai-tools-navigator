import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "./lib/i18n"

// 改进的速率限制存储
interface RateLimitData {
  count: number
  resetTime: number
  blocked: boolean
}

const rateLimitMap = new Map<string, RateLimitData>()

// 清理过期的速率限制数据
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// 每5分钟清理一次
setInterval(cleanupRateLimit, 5 * 60 * 1000)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 添加安全头
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // API 路由速率限制
  if (pathname.startsWith("/api/")) {
    const ip =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "anonymous"

    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15分钟
    const maxRequests = pathname.startsWith("/api/search") ? 50 : 100 // 搜索API限制更严格

    const userData = rateLimitMap.get(ip)

    if (!userData) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      })
    } else {
      if (now > userData.resetTime) {
        userData.count = 1
        userData.resetTime = now + windowMs
        userData.blocked = false
      } else {
        userData.count++
        if (userData.count > maxRequests) {
          userData.blocked = true
          return new NextResponse(
            JSON.stringify({
              error: "Too Many Requests",
              message: "请求过于频繁，请稍后再试",
              retryAfter: Math.ceil((userData.resetTime - now) / 1000),
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": Math.ceil((userData.resetTime - now) / 1000).toString(),
                "X-RateLimit-Limit": maxRequests.toString(),
                "X-RateLimit-Remaining": Math.max(0, maxRequests - userData.count).toString(),
                "X-RateLimit-Reset": userData.resetTime.toString(),
              },
            },
          )
        }
      }
    }

    // 添加速率限制头
    response.headers.set("X-RateLimit-Limit", maxRequests.toString())
    response.headers.set("X-RateLimit-Remaining", Math.max(0, maxRequests - userData.count).toString())
    response.headers.set("X-RateLimit-Reset", userData.resetTime.toString())

    return response
  }

  // 多语言路由处理
  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) {
    return response
  }

  // 根路径重定向
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  // 静态文件和特殊路径跳过
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return response
  }

  // 其他路径添加默认语言前缀
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // 匹配所有路径，除了静态文件和内部路径
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
