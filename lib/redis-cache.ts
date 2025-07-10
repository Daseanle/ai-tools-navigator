// Redis Cache Implementation for Production
// This file provides Redis-based caching when Redis is available

interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { EX?: number }): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<number>
  keys(pattern: string): Promise<string[]>
  flushdb(): Promise<void>
}

class MockRedisClient implements RedisClient {
  private cache = new Map<string, { value: string; expires?: number }>()

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expires = options?.EX ? Date.now() + (options.EX * 1000) : undefined
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<number> {
    return this.cache.has(key) ? 1 : 0
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  async flushdb(): Promise<void> {
    this.cache.clear()
  }
}

// Initialize Redis client
let redisClient: RedisClient

async function initializeRedis(): Promise<RedisClient> {
  if (redisClient) return redisClient

  // In production, use real Redis
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    try {
      // Dynamic import to avoid issues when Redis is not available
      const { Redis } = await import('ioredis')
      redisClient = new Redis(process.env.REDIS_URL) as any
      console.log('Redis connected successfully')
    } catch (error) {
      console.warn('Redis connection failed, falling back to mock:', error)
      redisClient = new MockRedisClient()
    }
  } else {
    // Use mock Redis in development
    redisClient = new MockRedisClient()
    console.log('Using mock Redis for development')
  }

  return redisClient
}

export class RedisCache {
  private client: RedisClient | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    
    this.client = await initializeRedis()
    this.initialized = true
  }

  async get<T>(key: string): Promise<T | null> {
    await this.initialize()
    if (!this.client) return null

    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.initialize()
    if (!this.client) return

    try {
      const serialized = JSON.stringify(value)
      const options = ttlSeconds ? { EX: ttlSeconds } : undefined
      await this.client.set(key, serialized, options)
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    await this.initialize()
    if (!this.client) return

    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }

  async exists(key: string): Promise<boolean> {
    await this.initialize()
    if (!this.client) return false

    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    await this.initialize()
    if (!this.client) return

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.client!.del(key)))
      }
    } catch (error) {
      console.error('Redis invalidate pattern error:', error)
    }
  }

  async clear(): Promise<void> {
    await this.initialize()
    if (!this.client) return

    try {
      await this.client.flushdb()
    } catch (error) {
      console.error('Redis clear error:', error)
    }
  }

  // Cache with automatic serialization and TTL
  async cache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Not in cache, fetch and store
    const data = await fetcher()
    await this.set(key, data, ttlSeconds)
    return data
  }

  // Cache with tags for easy invalidation
  async cacheWithTags<T>(
    key: string,
    tags: string[],
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const data = await this.cache(key, fetcher, ttlSeconds)
    
    // Store tag mappings
    for (const tag of tags) {
      const tagKey = `tag:${tag}`
      const taggedKeys = await this.get<string[]>(tagKey) || []
      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key)
        await this.set(tagKey, taggedKeys, ttlSeconds * 2) // Tags live longer
      }
    }

    return data
  }

  // Invalidate by tags
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}`
      const taggedKeys = await this.get<string[]>(tagKey) || []
      
      // Delete all keys with this tag
      await Promise.all(taggedKeys.map(key => this.del(key)))
      
      // Delete the tag itself
      await this.del(tagKey)
    }
  }
}

// Global instance
export const redisCache = new RedisCache()

// Helper functions for common cache patterns
export const cacheHelpers = {
  // Tools cache
  tools: {
    getAll: (page: number = 1, limit: number = 20) => 
      redisCache.cache(
        `tools:all:${page}:${limit}`,
        async () => {
          // This would be replaced with actual database call
          return { tools: [], total: 0 }
        },
        3600 // 1 hour
      ),

    getBySlug: (slug: string) =>
      redisCache.cache(
        `tools:slug:${slug}`,
        async () => {
          // This would be replaced with actual database call
          return null
        },
        3600 // 1 hour
      ),

    getByCategory: (categoryId: string, page: number = 1) =>
      redisCache.cache(
        `tools:category:${categoryId}:${page}`,
        async () => {
          // This would be replaced with actual database call
          return { tools: [], total: 0 }
        },
        1800 // 30 minutes
      ),

    invalidate: () => redisCache.invalidatePattern('tools:*')
  },

  // Categories cache
  categories: {
    getAll: () =>
      redisCache.cache(
        'categories:all',
        async () => {
          // This would be replaced with actual database call
          return []
        },
        14400 // 4 hours
      ),

    invalidate: () => redisCache.invalidatePattern('categories:*')
  },

  // Search cache
  search: {
    getResults: (query: string, filters: Record<string, any> = {}) => {
      const filterKey = Object.keys(filters)
        .sort()
        .map(key => `${key}:${filters[key]}`)
        .join(',')
      
      return redisCache.cache(
        `search:${encodeURIComponent(query)}:${filterKey}`,
        async () => {
          // This would be replaced with actual search implementation
          return { tools: [], total: 0 }
        },
        600 // 10 minutes
      )
    },

    invalidate: () => redisCache.invalidatePattern('search:*')
  },

  // User cache
  user: {
    getProfile: (userId: string) =>
      redisCache.cache(
        `user:profile:${userId}`,
        async () => {
          // This would be replaced with actual database call
          return null
        },
        300 // 5 minutes
      ),

    getFavorites: (userId: string) =>
      redisCache.cache(
        `user:favorites:${userId}`,
        async () => {
          // This would be replaced with actual database call
          return []
        },
        300 // 5 minutes
      ),

    invalidate: (userId: string) => redisCache.invalidatePattern(`user:*:${userId}`)
  }
}

// Cache warming functions for better performance
export const cacheWarming = {
  // Warm popular content
  async warmPopularContent(): Promise<void> {
    console.log('Starting cache warming...')
    
    try {
      // Pre-cache popular tools
      await cacheHelpers.tools.getAll(1, 20)
      
      // Pre-cache all categories
      await cacheHelpers.categories.getAll()
      
      // Pre-cache popular searches
      const popularQueries = ['AI', 'chatbot', 'image', 'video', 'text']
      await Promise.all(
        popularQueries.map(query => 
          cacheHelpers.search.getResults(query)
        )
      )
      
      console.log('Cache warming completed')
    } catch (error) {
      console.error('Cache warming failed:', error)
    }
  },

  // Warm category-specific content
  async warmCategoryContent(categoryId: string): Promise<void> {
    try {
      await cacheHelpers.tools.getByCategory(categoryId, 1)
      console.log(`Category ${categoryId} cache warmed`)
    } catch (error) {
      console.error(`Category ${categoryId} cache warming failed:`, error)
    }
  }
}

// Middleware for automatic cache invalidation
export function createCacheMiddleware() {
  return {
    beforeCreate: (entity: string) => {
      // Invalidate relevant caches before creating new entities
      switch (entity) {
        case 'tool':
          cacheHelpers.tools.invalidate()
          cacheHelpers.search.invalidate()
          break
        case 'category':
          cacheHelpers.categories.invalidate()
          break
      }
    },

    afterUpdate: (entity: string, id: string) => {
      // Invalidate specific caches after updates
      switch (entity) {
        case 'tool':
          redisCache.invalidatePattern(`tools:*`)
          redisCache.invalidatePattern(`search:*`)
          break
        case 'category':
          cacheHelpers.categories.invalidate()
          break
        case 'user':
          cacheHelpers.user.invalidate(id)
          break
      }
    }
  }
}

export const cacheMiddleware = createCacheMiddleware()