import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "./lib/i18n"
import { 
  getClientIp, 
  checkRateLimit, 
  performSecurityChecks, 
  applySecurityHeaders,
  logSecurityEvent,
  rateLimitConfigs,
  CSRFProtection
} from './lib/security'
import { monitoring } from './lib/monitoring'

// Cache utilities - simplified for middleware compatibility
const CacheUtils = {
  shouldBypassCache: (req: NextRequest): boolean => {
    const url = new URL(req.url)
    const bypassHeader = req.headers.get('cache-control')
    
    return (
      bypassHeader?.includes('no-cache') ||
      url.searchParams.has('no-cache') ||
      url.pathname.includes('/admin/') ||
      url.pathname.includes('/api/auth/')
    )
  },
  getCacheTTL: (path: string): number => {
    if (path.startsWith('/api/')) return 10 * 60 * 1000 // 10 minutes
    if (path.startsWith('/tools/')) return 30 * 60 * 1000 // 30 minutes
    if (path.startsWith('/categories/')) return 60 * 60 * 1000 // 1 hour
    return 15 * 60 * 1000 // 15 minutes default
  },
  getCacheTags: (path: string): string[] => {
    const tags = ['pages']
    if (path.includes('/tools')) tags.push('tools')
    if (path.includes('/categories')) tags.push('categories')
    if (path.includes('/search')) tags.push('search')
    if (path.includes('/user')) tags.push('users')
    return tags
  }
}

// ==================== Enhanced Middleware Chain ====================

type MiddlewareFunction = (
  request: NextRequest,
  response?: NextResponse
) => Promise<NextResponse | null> | NextResponse | null

interface MiddlewareConfig {
  enabled: boolean
  priority: number
  skipPaths?: string[]
  onlyPaths?: string[]
  name: string
}

class MiddlewareChain {
  private middlewares: Array<{
    fn: MiddlewareFunction
    config: MiddlewareConfig
  }> = []

  add(middleware: MiddlewareFunction, config: MiddlewareConfig) {
    this.middlewares.push({ fn: middleware, config })
    this.middlewares.sort((a, b) => b.config.priority - a.config.priority)
  }

  async execute(request: NextRequest): Promise<NextResponse> {
    let response: NextResponse | null = null
    const startTime = performance.now()
    const pathname = request.nextUrl.pathname

    for (const { fn, config } of this.middlewares) {
      if (!config.enabled) continue
      if (config.skipPaths?.some(path => pathname.startsWith(path))) continue
      if (config.onlyPaths && !config.onlyPaths.some(path => pathname.startsWith(path))) continue

      try {
        const middlewareStart = performance.now()
        const result = await fn(request, response || undefined)
        const middlewareEnd = performance.now()

        monitoring.record(`middleware.${config.name}.duration`, middlewareEnd - middlewareStart)

        if (result) {
          response = result
          break
        }
      } catch (error) {
        console.error(`Middleware ${config.name} failed:`, error)
        monitoring.record(`middleware.${config.name}.errors`, 1)
        
        if (config.priority >= 100) {
          return NextResponse.json(
            { error: 'Security middleware failed' },
            { status: 500 }
          )
        }
      }
    }

    if (!response) {
      response = NextResponse.next()
    }

    response = applySecurityHeaders(response)
    
    const totalTime = performance.now() - startTime
    monitoring.record('middleware.total_duration', totalTime)

    return response
  }
}

// ==================== Security Middleware Components ====================

// 1. Enhanced Security Checks
const securityMiddleware: MiddlewareFunction = async (request) => {
  const securityCheck = performSecurityChecks(request)
  
  if (!securityCheck.allowed) {
    logSecurityEvent('SECURITY_BLOCK', request, { 
      reason: securityCheck.reason,
      riskScore: securityCheck.riskScore
    })
    
    return NextResponse.json(
      { error: securityCheck.reason },
      { status: securityCheck.status || 403 }
    )
  }

  if (securityCheck.riskScore && securityCheck.riskScore > 50) {
    logSecurityEvent('HIGH_RISK_REQUEST', request, {
      riskScore: securityCheck.riskScore
    })
  }

  return null
}

// 2. Enhanced Rate Limiting
const rateLimitMiddleware: MiddlewareFunction = async (request) => {
  const { pathname } = request.nextUrl
  const clientIp = getClientIp(request)
  
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
      ip: clientIp.replace(/\d+\.\d+\.\d+\.\d+/, 'xxx.xxx.xxx.xxx'),
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
          'Retry-After': Math.ceil((data.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': data.resetTime.toString()
        }
      }
    )
  }

  return NextResponse.next({
    headers: {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.maxRequests - data.count).toString(),
      'X-RateLimit-Reset': data.resetTime.toString()
    }
  })
}

// 3. CSRF Protection
const csrfMiddleware: MiddlewareFunction = async (request) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  const token = request.headers.get('x-csrf-token')
  
  if (!token) {
    const newToken = CSRFProtection.generateToken()
    return NextResponse.json(
      { error: 'CSRF token required', csrfToken: newToken },
      { 
        status: 403,
        headers: { 'X-CSRF-Token': newToken }
      }
    )
  }

  if (!CSRFProtection.validateToken(token)) {
    logSecurityEvent('CSRF_TOKEN_INVALID', request)
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null
}

// 4. Request Monitoring
const monitoringMiddleware: MiddlewareFunction = async (request) => {
  monitoring.record('requests.total', 1, {
    method: request.method,
    path: request.nextUrl.pathname
  })

  const response = NextResponse.next()
  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-Request-Time', Date.now().toString())
  
  return null
}

// 6. Cache Middleware
const cacheMiddleware: MiddlewareFunction = async (request) => {
  const { pathname } = request.nextUrl
  
  // Skip caching for certain paths
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.includes('/monitoring/') ||
    CacheUtils.shouldBypassCache(request)
  ) {
    return null
  }

  // Add cache headers for static content
  if (pathname.includes('/static/') || pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-Cache-Type', 'static')
    return response
  }

  // Add cache headers for API responses
  if (pathname.startsWith('/api/')) {
    const ttl = CacheUtils.getCacheTTL(pathname)
    const response = NextResponse.next()
    response.headers.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`)
    response.headers.set('X-Cache-TTL', ttl.toString())
    response.headers.set('X-Cache-Tags', CacheUtils.getCacheTags(pathname).join(','))
    return response
  }

  return null
}
// 7. Locale Handling
const localeMiddleware: MiddlewareFunction = async (request) => {
  const { pathname } = request.nextUrl
  
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return null
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = `/${defaultLocale}`
    return NextResponse.redirect(url)
  }

  // Skip static files and special paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/automation") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return null
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

// ==================== Middleware Chain Setup ====================

const middlewareChain = new MiddlewareChain()

middlewareChain.add(monitoringMiddleware, {
  enabled: true,
  priority: 150,
  name: 'monitoring'
})

middlewareChain.add(securityMiddleware, {
  enabled: true,
  priority: 140,
  name: 'security'
})

middlewareChain.add(rateLimitMiddleware, {
  enabled: true,
  priority: 130,
  onlyPaths: ['/api/'],
  skipPaths: ['/api/monitoring/health'],
  name: 'rate_limiting'
})

middlewareChain.add(cacheMiddleware, {
  enabled: true,
  priority: 110,
  skipPaths: ['/api/auth/', '/api/admin/', '/api/monitoring/'],
  name: 'cache_headers'
})

middlewareChain.add(csrfMiddleware, {
  enabled: process.env.NODE_ENV === 'production',
  priority: 120,
  onlyPaths: ['/api/'],
  skipPaths: ['/api/monitoring/', '/api/error-report'],
  name: 'csrf_protection'
})

middlewareChain.add(localeMiddleware, {
  enabled: true,
  priority: 50,
  skipPaths: ['/api/', '/_next/', '/automation/'],
  name: 'locale_handling'
})

// ==================== Main Middleware Function ====================

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and Next.js internals
  const { pathname } = request.nextUrl
  
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  return middlewareChain.execute(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and internal paths
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
