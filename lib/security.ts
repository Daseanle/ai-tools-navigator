import { NextRequest, NextResponse } from 'next/server'
import { validateSearchParams, sanitizeString, sanitizeUrl } from './validation'

// Security headers configuration
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https:",
    "frame-ancestors 'self'"
  ].join('; '),
}

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/': { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  '/api/search': { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  '/api/auth/': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  default: { windowMs: 15 * 60 * 1000, maxRequests: 300 }, // 300 requests per 15 minutes
}

export { rateLimitConfigs }

// IP extraction with proper validation
export function getClientIp(request: NextRequest): string {
  // Check for real IP behind proxies (in order of preference)
  const xRealIp = request.headers.get('x-real-ip')
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xClientIp = request.headers.get('x-client-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  // Validate and return first valid IP
  let clientIp = request.ip || 
                 xRealIp || 
                 cfConnectingIp ||
                 xClientIp ||
                 (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
                 '127.0.0.1'

  // Basic IP validation
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  if (!ipRegex.test(clientIp) && !ipv6Regex.test(clientIp)) {
    clientIp = '127.0.0.1' // Fallback to localhost if invalid
  }

  return clientIp
}

// Enhanced rate limiting
interface RateLimitData {
  count: number
  resetTime: number
  blocked?: boolean
}

const rateLimitStore = new Map<string, RateLimitData>()

export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): { allowed: boolean; data: RateLimitData } {
  const now = Date.now()
  const resetTime = now + config.windowMs
  
  const existing = rateLimitStore.get(identifier)
  
  if (!existing || now > existing.resetTime) {
    // Reset window
    const data: RateLimitData = { count: 1, resetTime }
    rateLimitStore.set(identifier, data)
    return { allowed: true, data }
  }
  
  existing.count++
  
  if (existing.count > config.maxRequests) {
    existing.blocked = true
    return { allowed: false, data: existing }
  }
  
  return { allowed: true, data: existing }
}

// Input sanitization middleware
export function sanitizeRequestData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeString(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item))
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      const cleanKey = sanitizeString(key)
      sanitized[cleanKey] = sanitizeRequestData(value)
    }
    return sanitized
  }
  
  return data
}

// CSRF protection
export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF for GET requests and safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }
  
  // Skip CSRF for automation APIs
  if (request.nextUrl.pathname.includes('/api/automation/')) {
    return true
  }
  
  const token = request.headers.get('x-csrf-token') || 
                request.headers.get('x-xsrf-token')
  const cookie = request.cookies.get('csrf-token')?.value
  
  if (!token || !cookie) {
    return false
  }
  
  // Simple token validation (in production, use crypto.timingSafeEqual)
  return token === cookie
}

// Content type validation
export function validateContentType(request: NextRequest): boolean {
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    
    if (!contentType) {
      return false
    }
    
    // Allow JSON and form data
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ]
    
    return allowedTypes.some(type => contentType.includes(type))
  }
  
  return true
}

// Geolocation-based blocking (example)
const blockedCountries = ['CN', 'RU'] // Example blocked countries
const suspiciousRegions = ['TOR', 'VPN'] // Example suspicious regions

export function checkGeolocation(request: NextRequest): boolean {
  const country = request.headers.get('cf-ipcountry') || 
                  request.headers.get('x-country-code')
  
  if (country && blockedCountries.includes(country.toUpperCase())) {
    return false
  }
  
  return true
}

// Bot detection
export function detectBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
  ]
  
  return botPatterns.some(pattern => pattern.test(userAgent))
}

// Request size validation
export function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    return size <= maxSize
  }
  
  return true
}

// Main security middleware
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Comprehensive security check
export function performSecurityChecks(request: NextRequest): {
  allowed: boolean
  reason?: string
  status?: number
} {
  // Check request size
  if (!validateRequestSize(request)) {
    return { allowed: false, reason: 'Request too large', status: 413 }
  }
  
  // Check content type
  if (!validateContentType(request)) {
    return { allowed: false, reason: 'Invalid content type', status: 415 }
  }
  
  // Check geolocation
  if (!checkGeolocation(request)) {
    return { allowed: false, reason: 'Blocked region', status: 403 }
  }
  
  // Bot detection (might want to handle differently)
  if (detectBot(request)) {
    // Log but don't block - might be legitimate
    console.log('Bot detected:', request.headers.get('user-agent'))
  }
  
  // CSRF validation
  if (!validateCSRFToken(request)) {
    return { allowed: false, reason: 'Invalid CSRF token', status: 403 }
  }
  
  return { allowed: true }
}

// Audit logging
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  details?: any
) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    method: request.method,
    details,
  }
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logData))
  } else {
    console.warn('Security Event:', logData)
  }
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes