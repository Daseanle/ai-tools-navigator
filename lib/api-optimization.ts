import { NextRequest, NextResponse } from 'next/server'

// ==================== Cache Configuration ====================

export interface CacheConfig {
  ttl: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  revalidate?: boolean // Enable background revalidation
}

export const CACHE_CONFIGS = {
  // Short-term cache (5 minutes)
  SHORT: { ttl: 300 },
  // Medium-term cache (1 hour)
  MEDIUM: { ttl: 3600 },
  // Long-term cache (24 hours)
  LONG: { ttl: 86400 },
  // Static content cache (7 days)
  STATIC: { ttl: 604800 },
  // Search results (10 minutes)
  SEARCH: { ttl: 600, tags: ['search'] },
  // Tool data (1 hour, with revalidation)
  TOOLS: { ttl: 3600, tags: ['tools'], revalidate: true },
  // Categories (4 hours)
  CATEGORIES: { ttl: 14400, tags: ['categories'] },
  // User data (5 minutes)
  USER: { ttl: 300, tags: ['user'] }
} as const

// ==================== In-Memory Cache ====================

class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; tags: string[] }>()
  private tagMap = new Map<string, Set<string>>()

  set(key: string, data: any, config: CacheConfig) {
    const expires = Date.now() + (config.ttl * 1000)
    const tags = config.tags || []
    
    this.cache.set(key, { data, expires, tags })
    
    // Update tag mappings
    tags.forEach(tag => {
      if (!this.tagMap.has(tag)) {
        this.tagMap.set(tag, new Set())
      }
      this.tagMap.get(tag)!.add(key)
    })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.delete(key)
      return null
    }
    
    return entry.data
  }

  delete(key: string) {
    const entry = this.cache.get(key)
    if (entry) {
      // Remove from tag mappings
      entry.tags.forEach(tag => {
        this.tagMap.get(tag)?.delete(key)
      })
    }
    return this.cache.delete(key)
  }

  invalidateByTags(tags: string[]) {
    tags.forEach(tag => {
      const keys = this.tagMap.get(tag)
      if (keys) {
        keys.forEach(key => this.delete(key))
        this.tagMap.delete(tag)
      }
    })
  }

  clear() {
    this.cache.clear()
    this.tagMap.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      tags: this.tagMap.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expires: new Date(entry.expires),
        tags: entry.tags
      }))
    }
  }
}

export const memoryCache = new MemoryCache()

// ==================== Response Caching Utilities ====================

export function getCacheKey(prefix: string, params: Record<string, any> = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
    .join('&')
  
  return `${prefix}:${sortedParams || 'default'}`
}

export function createCachedResponse<T>(
  data: T,
  config: CacheConfig,
  status: number = 200
) {
  const response = NextResponse.json(
    { success: true, data },
    { status }
  )

  // Set cache headers
  response.headers.set(
    'Cache-Control',
    `public, max-age=${config.ttl}, s-maxage=${config.ttl}`
  )
  
  if (config.revalidate) {
    response.headers.set(
      'Cache-Control',
      `public, max-age=${config.ttl}, s-maxage=${config.ttl}, stale-while-revalidate=86400`
    )
  }

  // Set ETag for validation
  const etag = generateETag(data)
  response.headers.set('ETag', etag)

  return response
}

export function checkETag(request: NextRequest, data: any): boolean {
  const ifNoneMatch = request.headers.get('if-none-match')
  if (!ifNoneMatch) return false
  
  const currentETag = generateETag(data)
  return ifNoneMatch === currentETag
}

function generateETag(data: any): string {
  const jsonString = JSON.stringify(data)
  // Simple hash function for ETag generation
  let hash = 0
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `"${hash.toString(36)}"`
}

// ==================== Performance Monitoring ====================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor()
    }
    return this.instance
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// ==================== Rate Limiting ====================

export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  isAllowed(
    identifier: string,
    windowMs: number = 60000, // 1 minute
    maxRequests: number = 100
  ): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || []
    
    // Remove requests outside the window
    requests = requests.filter(time => time > windowStart)
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return false
    }
    
    // Add current request
    requests.push(now)
    this.requests.set(identifier, requests)
    
    return true
  }

  getRemainingRequests(
    identifier: string,
    windowMs: number = 60000,
    maxRequests: number = 100
  ): number {
    const now = Date.now()
    const windowStart = now - windowMs
    
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, maxRequests - validRequests.length)
  }

  cleanup() {
    const now = Date.now()
    const oneHourAgo = now - 3600000 // 1 hour
    
    for (const [identifier, requests] of this.requests) {
      const validRequests = requests.filter(time => time > oneHourAgo)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// ==================== Database Query Optimization ====================

export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  select?: string[]
  include?: string[]
}

export function buildPaginationQuery(options: QueryOptions) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 20))
  const offset = (page - 1) * limit

  return {
    limit,
    offset,
    page,
    totalPages: (total: number) => Math.ceil(total / limit)
  }
}

export function buildSortQuery(options: QueryOptions, allowedFields: string[]) {
  const sortBy = options.sortBy && allowedFields.includes(options.sortBy) 
    ? options.sortBy 
    : allowedFields[0]
  
  const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc'
  
  return { sortBy, sortOrder }
}

export function buildSelectQuery(options: QueryOptions, allowedFields: string[]) {
  if (!options.select || options.select.length === 0) {
    return allowedFields
  }
  
  return options.select.filter(field => allowedFields.includes(field))
}

// ==================== Background Tasks ====================

export class BackgroundTaskQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false

  add(task: () => Promise<void>) {
    this.queue.push(task)
    this.processQueue()
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    while (this.queue.length > 0) {
      const task = this.queue.shift()!
      try {
        await task()
      } catch (error) {
        console.error('Background task failed:', error)
      }
    }
    
    this.processing = false
  }
}

export const backgroundTasks = new BackgroundTaskQueue()

// ==================== API Response Helpers ====================

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  message?: string
) {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString()
  })
}

// ==================== Request Validation ====================

export function validateRequest(
  data: any,
  schema: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object'
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
  }>
) {
  const errors: Array<{ field: string; message: string }> = []

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ field, message: `${field} is required` })
      continue
    }
    
    // Skip validation if field is optional and empty
    if (!rules.required && (value === undefined || value === null)) {
      continue
    }
    
    // Type validation
    const actualType = Array.isArray(value) ? 'array' : typeof value
    if (actualType !== rules.type) {
      errors.push({ field, message: `${field} must be of type ${rules.type}` })
      continue
    }
    
    // String/Array length validation
    if ((rules.type === 'string' || rules.type === 'array') && value.length !== undefined) {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min} characters/items` })
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max} characters/items` })
      }
    }
    
    // Number range validation
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min}` })
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max}` })
      }
    }
    
    // Pattern validation for strings
    if (rules.type === 'string' && rules.pattern && !rules.pattern.test(value)) {
      errors.push({ field, message: `${field} format is invalid` })
    }
  }

  return errors
}