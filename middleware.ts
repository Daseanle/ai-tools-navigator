import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "./lib/i18n"
import { 
  getClientIp, 
  checkRateLimit, 
  performSecurityChecks, 
  applySecurityHeaders,
  logSecurityEvent,
  rateLimitConfigs
} from './lib/security'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Apply comprehensive security headers
  applySecurityHeaders(response)

  // Perform security checks
  const securityCheck = performSecurityChecks(request)
  if (!securityCheck.allowed) {
    logSecurityEvent('SECURITY_BLOCK', request, { 
      reason: securityCheck.reason 
    })
    
    return NextResponse.json(
      { error: securityCheck.reason },
      { status: securityCheck.status || 403 }
    )
  }

  // Enhanced rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request)
    
    // Find matching rate limit config
    let config = rateLimitConfigs.default
    for (const [path, pathConfig] of Object.entries(rateLimitConfigs)) {
      if (path !== 'default' && pathname.startsWith(path)) {
        config = pathConfig
        break
      }
    }
    
    const identifier = `${clientIp}:${pathname}`
    const { allowed, data } = checkRateLimit(identifier, config)
    
    if (!allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', request, {
        ip: clientIp,
        path: pathname,
        count: data.count,
        limit: config.maxRequests
      })
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((data.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((data.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': data.resetTime.toString()
          }
        }
      )
    }
    
    // Add rate limit headers for successful requests
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', Math.max(0, config.maxRequests - data.count).toString())
    response.headers.set('X-RateLimit-Reset', data.resetTime.toString())

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
    pathname.startsWith("/automation") ||
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
