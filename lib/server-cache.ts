// Advanced Server-Side Caching Strategy
import { LRUCache } from 'lru-cache'

// Runtime-compatible crypto and Redis imports
const isEdgeRuntime = (() => {
  try {
    return typeof self !== 'undefined' && self.constructor && self.constructor.name === 'ServiceWorkerGlobalScope'
  } catch {
    return false
  }
})()
const isNodeRuntime = typeof process !== 'undefined' && process.versions && process.versions.node

// Dynamic imports for runtime compatibility
let createHash: any
let Redis: any

if (isNodeRuntime) {
  import('crypto').then(crypto => createHash = crypto.createHash)
  import('ioredis').then(ioredis => Redis = ioredis.Redis)
} else {
  // Edge Runtime compatible hash function
  createHash = (algorithm: string) => ({
    update: (data: string) => ({
      digest: (encoding: string) => btoa(data).substring(0, 16)
    })
  })
}

// ==================== Multi-Layer Cache Architecture ====================

export interface CacheConfig {
  ttl?: number
  tags?: string[]
  priority?: 'high' | 'medium' | 'low'
  strategy?: 'lru' | 'lfu' | 'ttl' | 'adaptive'
  compression?: boolean
  warmup?: boolean
  invalidation?: 'manual' | 'automatic' | 'smart'
}

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  tags: string[]
  priority: number
  compressed?: boolean
  size: number
}

export class ServerCache {
  private static instance: ServerCache
  private redis: any | null = null
  private memoryCache: LRUCache<string, CacheEntry>
  private cacheMetrics: Map<string, any> = new Map()
  private warmupQueue: Set<string> = new Set()
  private invalidationQueue: Set<string> = new Set()

  private constructor() {
    // Initialize memory cache with intelligent sizing
    const maxMemory = this.getAvailableMemory()
    this.memoryCache = new LRUCache({
      max: Math.floor(maxMemory * 0.3 / 1024), // 30% of available memory
      ttl: 1000 * 60 * 60, // 1 hour default
      allowStale: true,
      updateAgeOnGet: true,
      fetchMethod: this.fetchFromRedis.bind(this)
    })

    this.initializeRedis()
    this.setupMetrics()
    this.startBackgroundTasks()
  }

  static getInstance(): ServerCache {
    if (!this.instance) {
      this.instance = new ServerCache()
    }
    return this.instance
  }

  private async initializeRedis() {
    if (isNodeRuntime && process.env.REDIS_URL && Redis) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          enableOfflineQueue: false
        } as any)

        await this.redis.ping()
        console.log('Redis connection established')
      } catch (error) {
        console.error('Redis connection failed:', error)
        this.redis = null
      }
    }
  }

  // ==================== Core Cache Operations ====================

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now()
    
    try {
      // Try memory cache first
      const memoryEntry = this.memoryCache.get(key)
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        this.recordMetric('memory_hit', key, performance.now() - startTime)
        memoryEntry.hits++
        return this.decompressData(memoryEntry.data)
      }

      // Try Redis cache
      if (this.redis) {
        const redisData = await this.redis.get(key)
        if (redisData) {
          const entry: CacheEntry<T> = JSON.parse(redisData)
          if (!this.isExpired(entry)) {
            // Store in memory cache for faster access
            this.memoryCache.set(key, entry)
            this.recordMetric('redis_hit', key, performance.now() - startTime)
            entry.hits++
            return this.decompressData(entry.data)
          }
        }
      }

      this.recordMetric('cache_miss', key, performance.now() - startTime)
      return null
    } catch (error) {
      console.error('Cache get error:', error)
      this.recordMetric('cache_error', key, performance.now() - startTime)
      return null
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    config: CacheConfig = {}
  ): Promise<void> {
    const startTime = performance.now()
    
    try {
      const {
        ttl = 3600000, // 1 hour
        tags = [],
        priority = 'medium',
        compression = true,
        strategy = 'lru'
      } = config

      const compressedData = compression ? this.compressData(data) : data
      const entry: CacheEntry<T> = {
        data: compressedData,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        tags,
        priority: this.getPriorityWeight(priority),
        compressed: compression,
        size: this.getDataSize(compressedData)
      }

      // Store in memory cache
      this.memoryCache.set(key, entry)

      // Store in Redis if available
      if (this.redis) {
        const redisEntry = JSON.stringify(entry)
        await this.redis.setex(key, Math.floor(ttl / 1000), redisEntry)
        
        // Add to tag sets for efficient invalidation
        if (tags.length > 0) {
          const pipeline = this.redis.pipeline()
          tags.forEach(tag => {
            pipeline.sadd(`tag:${tag}`, key)
            pipeline.expire(`tag:${tag}`, Math.floor(ttl / 1000))
          })
          await pipeline.exec()
        }
      }

      this.recordMetric('cache_set', key, performance.now() - startTime)
    } catch (error) {
      console.error('Cache set error:', error)
      this.recordMetric('cache_error', key, performance.now() - startTime)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key)
      
      if (this.redis) {
        await this.redis.del(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // ==================== Smart Cache Invalidation ====================

  async invalidateByTag(tag: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          const pipeline = this.redis.pipeline()
          keys.forEach((key: string) => {
            pipeline.del(key)
            this.memoryCache.delete(key)
          })
          pipeline.del(`tag:${tag}`)
          await pipeline.exec()
        }
      }
    } catch (error) {
      console.error('Tag invalidation error:', error)
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
          keys.forEach((key: string) => this.memoryCache.delete(key))
        }
      }
    } catch (error) {
      console.error('Pattern invalidation error:', error)
    }
  }

  // ==================== Cache Warming ====================

  async warmUp(keys: Array<{ key: string; fetcher: () => Promise<any>; config?: CacheConfig }>) {
    const batchSize = 5
    const batches = this.chunkArray(keys, batchSize)

    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async ({ key, fetcher, config }) => {
          try {
            const data = await fetcher()
            await this.set(key, data, config)
          } catch (error) {
            console.error(`Cache warmup failed for key ${key}:`, error)
          }
        })
      )
    }
  }

  // ==================== Adaptive Caching ====================

  async getWithFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = {}
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch and cache
    try {
      const data = await fetcher()
      await this.set(key, data, config)
      return data
    } catch (error) {
      console.error('Fallback fetcher error:', error)
      throw error
    }
  }

  // ==================== Cache Statistics ====================

  getStats(): {
    memory: { size: number; hits: number; misses: number }
    redis: { connected: boolean; hits: number; misses: number }
    hitRate: number
    metrics: Array<{ key: string; value: any }>
  } {
    const memoryStats = {
      size: this.memoryCache.size,
      hits: this.getMetricValue('memory_hit') || 0,
      misses: this.getMetricValue('cache_miss') || 0
    }

    const redisStats = {
      connected: this.redis?.status === 'ready',
      hits: this.getMetricValue('redis_hit') || 0,
      misses: this.getMetricValue('cache_miss') || 0
    }

    const totalHits = memoryStats.hits + redisStats.hits
    const totalMisses = memoryStats.misses
    const hitRate = totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0

    return {
      memory: memoryStats,
      redis: redisStats,
      hitRate,
      metrics: Array.from(this.cacheMetrics.entries()).map(([key, value]) => ({ key, value }))
    }
  }

  // ==================== Private Helper Methods ====================

  private async fetchFromRedis(key: string): Promise<CacheEntry | undefined> {
    if (!this.redis) return undefined

    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : undefined
    } catch (error) {
      console.error('Redis fetch error:', error)
      return undefined
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  private compressData(data: any): any {
    if (typeof data === 'string' && data.length > 1000) {
      // Simple compression for large strings
      return { compressed: true, data: Buffer.from(data).toString('base64') }
    }
    return data
  }

  private decompressData(data: any): any {
    if (data && typeof data === 'object' && data.compressed) {
      return Buffer.from(data.data, 'base64').toString()
    }
    return data
  }

  private getDataSize(data: any): number {
    return JSON.stringify(data).length
  }

  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 2
    }
  }

  private getAvailableMemory(): number {
    if (isNodeRuntime && process.memoryUsage) {
      const usage = process.memoryUsage()
      return usage.heapTotal - usage.heapUsed
    }
    return 100 * 1024 * 1024 // 100MB default
  }

  private setupMetrics() {
    if (isNodeRuntime) {
      setInterval(() => {
        this.cacheMetrics.set('memory_usage', process.memoryUsage())
        this.cacheMetrics.set('cache_size', this.memoryCache.size)
        this.cacheMetrics.set('timestamp', Date.now())
      }, 60000) // Update every minute
    }
  }

  private startBackgroundTasks() {
    // Cleanup expired entries
    setInterval(() => {
      this.memoryCache.purgeStale()
    }, 5 * 60 * 1000) // Every 5 minutes

    // Process invalidation queue
    setInterval(() => {
      this.processInvalidationQueue()
    }, 30000) // Every 30 seconds
  }

  private async processInvalidationQueue() {
    if (this.invalidationQueue.size === 0) return

    const keys = Array.from(this.invalidationQueue)
    this.invalidationQueue.clear()

    for (const key of keys) {
      await this.delete(key)
    }
  }

  private recordMetric(type: string, key: string, duration: number) {
    const metricKey = `${type}_${key}`
    const current = this.cacheMetrics.get(metricKey) || { count: 0, totalTime: 0 }
    current.count++
    current.totalTime += duration
    current.avgTime = current.totalTime / current.count
    this.cacheMetrics.set(metricKey, current)
  }

  private getMetricValue(key: string): number {
    const metric = this.cacheMetrics.get(key)
    return metric ? metric.count : 0
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// ==================== Cache Decorators ====================

export function cached<T extends (...args: any[]) => Promise<any>>(
  config: CacheConfig & { keyGenerator?: (...args: Parameters<T>) => string } = {}
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const cache = ServerCache.getInstance()

    descriptor.value = async function (...args: Parameters<T>) {
      const key = config.keyGenerator 
        ? config.keyGenerator(...args)
        : `${propertyName}_${createHash('md5').update(JSON.stringify(args)).digest('hex')}`

      return cache.getWithFallback(key, () => originalMethod.apply(this, args), config)
    }

    return descriptor
  }
}

// ==================== Cache Helpers ====================

export class CacheHelper {
  private static cache = ServerCache.getInstance()

  static async cachePageData(
    page: string, 
    data: any, 
    ttl: number = 1800000 // 30 minutes
  ) {
    await this.cache.set(`page:${page}`, data, {
      ttl,
      tags: ['pages', page],
      priority: 'high'
    })
  }

  static async cacheApiResponse(
    endpoint: string, 
    params: Record<string, any>, 
    data: any,
    ttl: number = 600000 // 10 minutes
  ) {
    const key = `api:${endpoint}:${createHash('md5').update(JSON.stringify(params)).digest('hex')}`
    await this.cache.set(key, data, {
      ttl,
      tags: ['api', endpoint],
      priority: 'medium'
    })
  }

  static async cacheUserData(
    userId: string, 
    data: any, 
    ttl: number = 3600000 // 1 hour
  ) {
    await this.cache.set(`user:${userId}`, data, {
      ttl,
      tags: ['users', userId],
      priority: 'high'
    })
  }

  static async invalidateUserCache(userId: string) {
    await this.cache.invalidateByTag(userId)
  }

  static async invalidatePageCache(page: string) {
    await this.cache.invalidateByTag(page)
  }

  static async invalidateApiCache(endpoint: string) {
    await this.cache.invalidateByTag(endpoint)
  }

  static getStats() {
    return this.cache.getStats()
  }
}

// ==================== Cache Middleware ====================

export class CacheMiddleware {
  private static cache = ServerCache.getInstance()

  static async handleRequest(
    req: Request,
    handler: () => Promise<Response>
  ): Promise<Response> {
    const url = new URL(req.url)
    const cacheKey = `request:${req.method}:${url.pathname}:${url.search}`

    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler()
    }

    // Try cache first
    const cached = await this.cache.get<string>(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Cache-TTL': '300'
        }
      })
    }

    // Execute handler and cache result
    const response = await handler()
    
    if (response.ok) {
      const responseText = await response.text()
      await this.cache.set(cacheKey, responseText, {
        ttl: 300000, // 5 minutes
        tags: ['requests', url.pathname],
        priority: 'low'
      })

      return new Response(responseText, {
        ...response,
        headers: {
          ...response.headers,
          'X-Cache': 'MISS'
        }
      })
    }

    return response
  }
}

export default ServerCache