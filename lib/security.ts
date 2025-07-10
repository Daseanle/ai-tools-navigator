import { NextRequest, NextResponse } from 'next/server'
import { createHash, createHmac, randomBytes } from 'crypto'
import { validateSearchParams, sanitizeString, sanitizeUrl } from './validation'

// ==================== Enhanced Security Headers ====================

export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ].join('; '),
}

// ==================== Advanced CSRF Protection ====================

export class CSRFProtection {
  private static readonly SECRET = process.env.CSRF_SECRET || 'default-csrf-secret'

  static generateToken(): string {
    const timestamp = Date.now().toString()
    const random = randomBytes(16).toString('hex')
    const payload = `${timestamp}:${random}`
    const signature = createHmac('sha256', this.SECRET)
      .update(payload)
      .digest('hex')
    
    return Buffer.from(`${payload}:${signature}`).toString('base64')
  }

  static validateToken(token: string, maxAgeMs: number = 3600000): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const [timestamp, random, signature] = decoded.split(':')
      
      if (!timestamp || !random || !signature) return false
      
      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > maxAgeMs) return false
      
      const payload = `${timestamp}:${random}`
      const expectedSignature = createHmac('sha256', this.SECRET)
        .update(payload)
        .digest('hex')
      
      return signature === expectedSignature
    } catch {
      return false
    }
  }
}

// ==================== Input Sanitization ====================

export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  static sanitizeSql(input: string): string {
    return input
      .replace(/['";\\]/g, '')
      .replace(/(--)|(\/\*)|(\*\/)/g, '')
      .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi, '')
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol) && 
             url.length <= 2048
    } catch {
      return false
    }
  }

  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeHtml(obj)
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item))
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.sanitizeHtml(key)
        cleaned[cleanKey] = this.sanitizeObject(value)
      }
      return cleaned
    }
    
    return obj
  }
}

// ==================== Enhanced Rate Limiting ====================

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  '/api/search': { windowMs: 60 * 1000, maxRequests: 60 },
  '/api/tools': { windowMs: 60 * 1000, maxRequests: 100 },
  '/api/upload': { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  '/api/': { windowMs: 15 * 60 * 1000, maxRequests: 100 },
  default: { windowMs: 15 * 60 * 1000, maxRequests: 300 }
}

interface RateLimitData {
  count: number
  resetTime: number
  blocked?: boolean
  firstRequest: number
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
    const data: RateLimitData = { 
      count: 1, 
      resetTime, 
      firstRequest: now 
    }
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

// ==================== Enhanced Client IP Detection ====================

export function getClientIp(request: NextRequest): string {
  const xRealIp = request.headers.get('x-real-ip')
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xClientIp = request.headers.get('x-client-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  let clientIp = request.ip || 
                 cfConnectingIp ||
                 xRealIp || 
                 xClientIp ||
                 (xForwardedFor ? xForwardedFor.split(',')[0].trim() : null) ||
                 '127.0.0.1'

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  if (!ipv4Regex.test(clientIp) && !ipv6Regex.test(clientIp)) {
    clientIp = '127.0.0.1'
  }

  return clientIp
}

// ==================== Advanced Bot Detection ====================

export function detectBot(request: NextRequest): { isBot: boolean; type?: string } {
  const userAgent = request.headers.get('user-agent') || ''
  
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i
  ]

  const maliciousBots = [
    /scrapy/i,
    /selenium/i,
    /phantomjs/i,
    /headless/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /node-fetch/i,
    /axios/i,
    /postman/i,
    /insomnia/i
  ]

  if (legitimateBots.some(pattern => pattern.test(userAgent))) {
    return { isBot: true, type: 'legitimate' }
  }

  if (maliciousBots.some(pattern => pattern.test(userAgent))) {
    return { isBot: true, type: 'suspicious' }
  }

  if (!userAgent || userAgent.length < 10) {
    return { isBot: true, type: 'suspicious' }
  }

  return { isBot: false }
}

// ==================== Enhanced CSRF Validation ====================

export function validateCSRFToken(request: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }
  
  if (request.nextUrl.pathname.includes('/api/automation/')) {
    const authHeader = request.headers.get('authorization')
    return authHeader?.startsWith('Bearer ') || false
  }
  
  const token = request.headers.get('x-csrf-token') || 
                request.headers.get('x-xsrf-token')
  
  if (!token) {
    return false
  }
  
  return CSRFProtection.validateToken(token)
}

// ==================== Content Security Validation ====================

export function validateContentType(request: NextRequest): boolean {
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    
    if (!contentType) {
      return false
    }
    
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ]
    
    return allowedTypes.some(type => contentType.includes(type))
  }
  
  return true
}

// ==================== Request Size Validation ====================

export function validateRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    return !isNaN(size) && size <= maxSize
  }
  
  return true
}

// ==================== Geolocation Security ====================

const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || []
const allowedCountries = process.env.ALLOWED_COUNTRIES?.split(',') || []

export function checkGeolocation(request: NextRequest): boolean {
  const country = request.headers.get('cf-ipcountry') || 
                  request.headers.get('x-country-code')
  
  if (!country) return true
  
  const countryCode = country.toUpperCase()
  
  if (allowedCountries.length > 0) {
    return allowedCountries.includes(countryCode)
  }
  
  return !blockedCountries.includes(countryCode)
}

// ==================== Enhanced Security Checks ====================

export function performSecurityChecks(request: NextRequest): {
  allowed: boolean
  reason?: string
  status?: number
  riskScore?: number
} {
  let riskScore = 0
  
  if (!validateRequestSize(request)) {
    return { allowed: false, reason: 'Request too large', status: 413, riskScore: 100 }
  }
  
  if (!validateContentType(request)) {
    return { allowed: false, reason: 'Invalid content type', status: 415, riskScore: 80 }
  }
  
  if (!checkGeolocation(request)) {
    return { allowed: false, reason: 'Blocked region', status: 403, riskScore: 90 }
  }
  
  const botCheck = detectBot(request)
  if (botCheck.isBot) {
    if (botCheck.type === 'suspicious') {
      riskScore += 70
    } else if (botCheck.type === 'legitimate') {
      riskScore += 10
    }
  }
  
  if (!validateCSRFToken(request)) {
    return { allowed: false, reason: 'Invalid CSRF token', status: 403, riskScore: 95 }
  }
  
  const userAgent = request.headers.get('user-agent') || ''
  if (userAgent.includes('script') || userAgent.includes('injection')) {
    riskScore += 50
  }
  
  if (riskScore >= 80) {
    return { allowed: false, reason: 'High risk score', status: 403, riskScore }
  }
  
  return { allowed: true, riskScore }
}

// ==================== Security Event Logging ====================

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
    referer: request.headers.get('referer'),
    details,
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log('SECURITY_EVENT:', JSON.stringify(logData))
  } else {
    console.warn('Security Event:', logData)
  }
}

// ==================== Security Headers Application ====================

export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  return response
}

// ==================== Enhanced Sanitization ====================

export function sanitizeRequestData(data: any): any {
  return InputSanitizer.sanitizeObject(data)
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