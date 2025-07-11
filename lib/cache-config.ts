// Cache Integration Configuration
import { ServerCache, CacheHelper } from './server-cache'
import { QueryOptimizer } from './database-pool'

// ==================== Cache Configuration ====================

export const cacheConfig = {
  // Page caching
  pages: {
    home: { ttl: 30 * 60 * 1000, tags: ['pages', 'home'] }, // 30 minutes
    tools: { ttl: 15 * 60 * 1000, tags: ['pages', 'tools'] }, // 15 minutes
    categories: { ttl: 60 * 60 * 1000, tags: ['pages', 'categories'] }, // 1 hour
    search: { ttl: 10 * 60 * 1000, tags: ['pages', 'search'] }, // 10 minutes
  },

  // API caching
  api: {
    tools: { ttl: 10 * 60 * 1000, tags: ['api', 'tools'] }, // 10 minutes
    categories: { ttl: 30 * 60 * 1000, tags: ['api', 'categories'] }, // 30 minutes
    search: { ttl: 5 * 60 * 1000, tags: ['api', 'search'] }, // 5 minutes
    analytics: { ttl: 60 * 60 * 1000, tags: ['api', 'analytics'] }, // 1 hour
  },

  // User data caching
  user: {
    profile: { ttl: 30 * 60 * 1000, tags: ['users', 'profile'] }, // 30 minutes
    favorites: { ttl: 15 * 60 * 1000, tags: ['users', 'favorites'] }, // 15 minutes
    settings: { ttl: 60 * 60 * 1000, tags: ['users', 'settings'] }, // 1 hour
  },

  // Static content caching
  static: {
    images: { ttl: 24 * 60 * 60 * 1000, tags: ['static', 'images'] }, // 24 hours
    css: { ttl: 24 * 60 * 60 * 1000, tags: ['static', 'css'] }, // 24 hours
    js: { ttl: 24 * 60 * 60 * 1000, tags: ['static', 'js'] }, // 24 hours
  }
}

// ==================== Enhanced Query Optimizer with Caching ====================

class EnhancedQueryOptimizer extends QueryOptimizer {
  private static cache = ServerCache.getInstance()

  static async getToolsWithCache(options: any = {}) {
    const cacheKey = `tools:query:${JSON.stringify(options)}`
    
    return this.cache.getWithFallback(
      cacheKey,
      () => super.getTools(options),
      cacheConfig.api.tools
    )
  }

  static async getToolBySlugWithCache(slug: string) {
    const cacheKey = `tool:slug:${slug}`
    
    return this.cache.getWithFallback(
      cacheKey,
      () => super.getToolBySlug(slug),
      {
        ttl: 60 * 60 * 1000, // 1 hour
        tags: ['tools', slug],
        priority: 'high'
      }
    )
  }

  static async searchToolsWithCache(query: string, options: any = {}) {
    const cacheKey = `search:${query}:${JSON.stringify(options)}`
    
    return this.cache.getWithFallback(
      cacheKey,
      () => super.searchTools(query, options),
      cacheConfig.api.search
    )
  }

  static async getCategoriesWithCache() {
    const cacheKey = 'categories:all'
    
    return this.cache.getWithFallback(
      cacheKey,
      () => this.getCategories(),
      cacheConfig.api.categories
    )
  }

  static async getFeaturedToolsWithCache() {
    const cacheKey = 'tools:featured'
    
    return this.cache.getWithFallback(
      cacheKey,
      () => this.getFeaturedTools(),
      {
        ttl: 30 * 60 * 1000, // 30 minutes
        tags: ['tools', 'featured'],
        priority: 'high'
      }
    )
  }

  static async getTrendingToolsWithCache() {
    const cacheKey = 'tools:trending'
    
    return this.cache.getWithFallback(
      cacheKey,
      () => this.getTrendingTools(),
      {
        ttl: 15 * 60 * 1000, // 15 minutes
        tags: ['tools', 'trending'],
        priority: 'high'
      }
    )
  }

  // Cache invalidation methods
  static async invalidateToolCache(toolId: string) {
    await this.cache.invalidateByTag(toolId)
  }

  static async invalidateToolsCache() {
    await this.cache.invalidateByTag('tools')
  }

  static async invalidateCategoriesCache() {
    await this.cache.invalidateByTag('categories')
  }

  // Additional helper methods
  static async getCategories() {
    // This would be implemented with actual database logic
    return super.getTools({ limit: 100 }) // Placeholder
  }

  static async getFeaturedTools() {
    return super.getTools({ featured: true, limit: 20 })
  }

  static async getTrendingTools() {
    return super.getTools({ sortBy: 'visits', sortOrder: 'desc', limit: 20 })
  }
}

// ==================== Cache Warming Strategies ====================

class CacheWarmer {
  private static cache = ServerCache.getInstance()

  static async warmupHome() {
    const warmupTasks = [
      {
        key: 'tools:featured',
        fetcher: () => EnhancedQueryOptimizer.getFeaturedTools(),
        config: { ttl: 30 * 60 * 1000, tags: ['tools', 'featured'] }
      },
      {
        key: 'tools:trending',
        fetcher: () => EnhancedQueryOptimizer.getTrendingTools(),
        config: { ttl: 15 * 60 * 1000, tags: ['tools', 'trending'] }
      },
      {
        key: 'categories:all',
        fetcher: () => EnhancedQueryOptimizer.getCategories(),
        config: cacheConfig.api.categories
      }
    ]

    await this.cache.warmUp(warmupTasks)
  }

  static async warmupToolsPage() {
    const warmupTasks = [
      {
        key: 'tools:page:1',
        fetcher: () => EnhancedQueryOptimizer.getTools({ page: 1, limit: 20 }),
        config: cacheConfig.api.tools
      },
      {
        key: 'tools:popular',
        fetcher: () => EnhancedQueryOptimizer.getTools({ sortBy: 'rating', limit: 20 }),
        config: cacheConfig.api.tools
      }
    ]

    await this.cache.warmUp(warmupTasks)
  }

  static async warmupUserData(userId: string) {
    const warmupTasks = [
      {
        key: `user:${userId}:profile`,
        fetcher: () => this.getUserProfile(userId),
        config: cacheConfig.user.profile
      },
      {
        key: `user:${userId}:favorites`,
        fetcher: () => this.getUserFavorites(userId),
        config: cacheConfig.user.favorites
      }
    ]

    await this.cache.warmUp(warmupTasks)
  }

  // Helper methods for user data fetching
  private static async getUserProfile(userId: string) {
    // Implement user profile fetching logic
    return { id: userId, name: 'User', email: 'user@example.com' }
  }

  private static async getUserFavorites(userId: string) {
    // Implement user favorites fetching logic
    return []
  }
}

// ==================== Cache Health Monitor ====================

class CacheHealthMonitor {
  private static cache = ServerCache.getInstance()

  static async getHealthStatus() {
    const stats = this.cache.getStats()
    const health = {
      status: 'healthy',
      memory: {
        usage: stats.memory.size,
        hitRate: stats.memory.hits / (stats.memory.hits + stats.memory.misses) * 100,
        status: stats.memory.size < 1000000 ? 'healthy' : 'warning'
      },
      redis: {
        connected: stats.redis.connected,
        hitRate: stats.redis.hits / (stats.redis.hits + stats.redis.misses) * 100,
        status: stats.redis.connected ? 'healthy' : 'error'
      },
      overall: {
        hitRate: stats.hitRate * 100,
        status: stats.hitRate > 0.8 ? 'healthy' : stats.hitRate > 0.6 ? 'warning' : 'error'
      }
    }

    return health
  }

  static async performHealthCheck() {
    const health = await this.getHealthStatus()
    
    if (health.overall.status === 'error') {
      console.error('Cache health check failed:', health)
    } else if (health.overall.status === 'warning') {
      console.warn('Cache health check warning:', health)
    }

    return health
  }
}

// ==================== Cache Utilities ====================

class CacheUtils {
  static generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, any>, key: string) => {
        result[key] = params[key]
        return result
      }, {})

    return `${prefix}:${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`
  }

  static shouldBypassCache(req: Request): boolean {
    const url = new URL(req.url)
    const bypassHeader = req.headers.get('cache-control')
    
    return (
      bypassHeader?.includes('no-cache') ||
      url.searchParams.has('no-cache') ||
      url.pathname.includes('/admin/') ||
      url.pathname.includes('/api/auth/')
    )
  }

  static getCacheTTL(path: string): number {
    if (path.startsWith('/api/')) {
      return 10 * 60 * 1000 // 10 minutes
    }
    if (path.startsWith('/tools/')) {
      return 30 * 60 * 1000 // 30 minutes
    }
    if (path.startsWith('/categories/')) {
      return 60 * 60 * 1000 // 1 hour
    }
    return 15 * 60 * 1000 // 15 minutes default
  }

  static getCacheTags(path: string): string[] {
    const tags = ['pages']
    
    if (path.includes('/tools')) tags.push('tools')
    if (path.includes('/categories')) tags.push('categories')
    if (path.includes('/search')) tags.push('search')
    if (path.includes('/user')) tags.push('users')
    
    return tags
  }
}

// ==================== Cache Event Handlers ====================

class CacheEventHandler {
  private static cache = ServerCache.getInstance()

  static async onToolUpdate(toolId: string) {
    await this.cache.invalidateByTag(toolId)
    await this.cache.invalidateByTag('tools')
  }

  static async onCategoryUpdate(categoryId: string) {
    await this.cache.invalidateByTag(categoryId)
    await this.cache.invalidateByTag('categories')
  }

  static async onUserUpdate(userId: string) {
    await this.cache.invalidateByTag(userId)
    await this.cache.invalidateByTag('users')
  }

  static async onDataUpdate(type: string, id: string) {
    await this.cache.invalidateByTag(id)
    await this.cache.invalidateByTag(type)
  }
}

// Cache configuration - lazy initialization
let cache: any = null

function getCache() {
  if (!cache) {
    try {
      cache = ServerCache.getInstance()
    } catch (error) {
      console.debug('Cache initialization failed:', error)
      return null
    }
  }
  return cache
}

export { 
  ServerCache, 
  CacheHelper, 
  EnhancedQueryOptimizer as CachedQueryOptimizer, 
  CacheWarmer, 
  CacheHealthMonitor, 
  CacheUtils, 
  CacheEventHandler,
  getCache as cache 
}