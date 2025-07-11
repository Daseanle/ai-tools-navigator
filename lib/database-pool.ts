// Advanced Database Connection Pool and Query Optimization
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Type definition for Redis (imported dynamically)
type Redis = any

// ==================== Connection Pool Manager ====================

class DatabasePool {
  private static instance: DatabasePool
  private pools: Map<string, SupabaseClient[]> = new Map()
  private activeConnections: Map<string, number> = new Map()
  private readonly maxConnections = 20
  private readonly minConnections = 5
  private readonly acquireTimeout = 30000
  private readonly idleTimeout = 300000

  static getInstance(): DatabasePool {
    if (!this.instance) {
      this.instance = new DatabasePool()
    }
    return this.instance
  }

  async getConnection(type: 'read' | 'write' = 'read'): Promise<SupabaseClient> {
    const poolKey = `${type}-pool`
    
    if (!this.pools.has(poolKey)) {
      await this.initializePool(poolKey, type)
    }

    const pool = this.pools.get(poolKey)!
    const activeCount = this.activeConnections.get(poolKey) || 0

    // If all connections are busy and we haven't reached max, create new one
    if (activeCount >= pool.length && pool.length < this.maxConnections) {
      const newClient = this.createClient(type)
      pool.push(newClient)
    }

    // Find available connection
    const connection = pool.find(client => this.isConnectionAvailable(client))
    
    if (!connection) {
      throw new Error(`No available ${type} connections in pool`)
    }

    this.markConnectionAsActive(poolKey, connection)
    return connection
  }

  releaseConnection(connection: SupabaseClient, type: 'read' | 'write' = 'read') {
    const poolKey = `${type}-pool`
    this.markConnectionAsIdle(poolKey, connection)
  }

  private async initializePool(poolKey: string, type: 'read' | 'write') {
    const connections: SupabaseClient[] = []
    
    for (let i = 0; i < this.minConnections; i++) {
      connections.push(this.createClient(type))
    }
    
    this.pools.set(poolKey, connections)
    this.activeConnections.set(poolKey, 0)
  }

  private createClient(type: 'read' | 'write'): SupabaseClient {
    const url = type === 'read' 
      ? process.env.SUPABASE_READ_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
      : process.env.NEXT_PUBLIC_SUPABASE_URL!
    
    const key = type === 'read'
      ? process.env.SUPABASE_READ_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
      : process.env.SUPABASE_SERVICE_ROLE_KEY!

    return createClient(url, key, {
      auth: { persistSession: false },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-connection-type': type,
          'x-pool-id': Math.random().toString(36).substring(7)
        }
      }
    })
  }

  private isConnectionAvailable(client: SupabaseClient): boolean {
    // Simple availability check - in production, you'd want more sophisticated logic
    return true
  }

  private markConnectionAsActive(poolKey: string, connection: SupabaseClient) {
    const current = this.activeConnections.get(poolKey) || 0
    this.activeConnections.set(poolKey, current + 1)
  }

  private markConnectionAsIdle(poolKey: string, connection: SupabaseClient) {
    const current = this.activeConnections.get(poolKey) || 0
    this.activeConnections.set(poolKey, Math.max(0, current - 1))
  }

  // Cleanup idle connections
  async cleanup() {
    for (const [poolKey, pool] of this.pools) {
      const activeCount = this.activeConnections.get(poolKey) || 0
      
      // Remove excess idle connections
      if (pool.length > this.minConnections + activeCount) {
        const toRemove = pool.length - this.minConnections - activeCount
        for (let i = 0; i < toRemove; i++) {
          const connection = pool.pop()
          // Close connection if needed
        }
      }
    }
  }
}

// ==================== Query Builder and Optimizer ====================

class QueryOptimizer {
  private static redis: Redis | null = null
  private static dbPool = DatabasePool.getInstance()

  static async initialize() {
    if (typeof process !== 'undefined' && process.env.REDIS_URL) {
      try {
        const { Redis } = await import('ioredis')
        this.redis = new Redis(process.env.REDIS_URL)
      } catch (error) {
        console.warn('Redis initialization failed, continuing without cache:', error)
      }
    }
  }

  // Optimized tool queries with intelligent caching
  static async getTools(options: {
    category?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
    pricing?: string
    rating?: number
    featured?: boolean
  } = {}) {
    const {
      category,
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'desc',
      search,
      pricing,
      rating,
      featured
    } = options

    // Create cache key
    const cacheKey = `tools:${JSON.stringify(options)}`
    
    // Try cache first
    if (this.redis) {
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    const connection = await this.dbPool.getConnection('read')
    
    try {
      let query = connection
        .from('tools')
        .select(`
          id,
          slug,
          name,
          tagline,
          description,
          logo_url,
          website_url,
          rating,
          rating_count,
          visits,
          pricing_type,
          featured,
          created_at,
          updated_at,
          category:categories(
            id,
            name,
            slug,
            icon,
            color
          ),
          tool_tags(
            tag:tags(
              id,
              name,
              slug,
              color
            )
          )
        `)

      // Apply filters
      if (category) {
        query = query.eq('category_id', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tagline.ilike.%${search}%`)
      }

      if (pricing) {
        query = query.eq('pricing_type', pricing)
      }

      if (rating) {
        query = query.gte('rating', rating)
      }

      if (featured !== undefined) {
        query = query.eq('featured', featured)
      }

      // Apply sorting
      const validSortFields = ['name', 'rating', 'visits', 'created_at', 'updated_at']
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'rating'
      
      query = query.order(sortField, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      const result = {
        tools: data || [],
        totalCount: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }

      // Cache the result
      if (this.redis) {
        await this.redis.setex(cacheKey, 1800, JSON.stringify(result)) // 30 minutes
      }

      return result

    } finally {
      this.dbPool.releaseConnection(connection, 'read')
    }
  }

  // Optimized tool by slug query
  static async getToolBySlug(slug: string) {
    const cacheKey = `tool:slug:${slug}`
    
    if (this.redis) {
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    const connection = await this.dbPool.getConnection('read')
    
    try {
      const { data, error } = await connection
        .from('tools')
        .select(`
          *,
          category:categories(
            id,
            name,
            slug,
            description,
            icon,
            color
          ),
          tool_tags(
            tag:tags(
              id,
              name,
              slug,
              color
            )
          ),
          tool_ratings(
            id,
            rating,
            comment,
            created_at,
            user:users(
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error

      // Increment view count asynchronously
      this.incrementViewCount(data.id).catch(console.error)

      if (this.redis) {
        await this.redis.setex(cacheKey, 3600, JSON.stringify(data)) // 1 hour
      }

      return data

    } finally {
      this.dbPool.releaseConnection(connection, 'read')
    }
  }

  // Batch operations for better performance
  static async getToolsByIds(ids: string[]) {
    if (ids.length === 0) return []

    const connection = await this.dbPool.getConnection('read')
    
    try {
      const { data, error } = await connection
        .from('tools')
        .select(`
          id,
          slug,
          name,
          tagline,
          logo_url,
          rating,
          rating_count,
          pricing_type,
          featured
        `)
        .in('id', ids)

      if (error) throw error
      return data || []

    } finally {
      this.dbPool.releaseConnection(connection, 'read')
    }
  }

  // Optimized search with full-text search
  static async searchTools(query: string, options: {
    page?: number
    limit?: number
    category?: string
    filters?: Record<string, any>
  } = {}) {
    const { page = 1, limit = 20, category, filters = {} } = options
    const cacheKey = `search:${query}:${JSON.stringify(options)}`

    if (this.redis) {
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    const connection = await this.dbPool.getConnection('read')
    
    try {
      // Use PostgreSQL full-text search
      let searchQuery = connection
        .from('tools')
        .select(`
          id,
          slug,
          name,
          tagline,
          description,
          logo_url,
          rating,
          rating_count,
          pricing_type,
          featured,
          category:categories(name, slug, icon),
          ts_rank(search_vector, plainto_tsquery($1)) as rank
        `, { count: 'exact' })
        .textSearch('search_vector', query)
        .order('rank', { ascending: false })

      if (category) {
        searchQuery = searchQuery.eq('category_id', category)
      }

      // Apply additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchQuery = searchQuery.eq(key, value)
        }
      })

      const offset = (page - 1) * limit
      const { data, error, count } = await searchQuery.range(offset, offset + limit - 1)

      if (error) throw error

      const result = {
        tools: data || [],
        totalCount: count || 0,
        page,
        limit,
        query,
        totalPages: Math.ceil((count || 0) / limit)
      }

      if (this.redis) {
        await this.redis.setex(cacheKey, 600, JSON.stringify(result)) // 10 minutes
      }

      return result

    } finally {
      this.dbPool.releaseConnection(connection, 'read')
    }
  }

  // Analytics queries with aggregation
  static async getToolAnalytics(toolId: string, timeRange: '7d' | '30d' | '90d' = '30d') {
    const cacheKey = `analytics:tool:${toolId}:${timeRange}`
    
    if (this.redis) {
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }
    }

    const connection = await this.dbPool.getConnection('read')
    
    try {
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const { data, error } = await connection.rpc('get_tool_analytics', {
        tool_id_param: toolId,
        start_date_param: startDate.toISOString(),
        end_date_param: new Date().toISOString()
      })

      if (error) throw error

      if (this.redis) {
        await this.redis.setex(cacheKey, 3600, JSON.stringify(data)) // 1 hour
      }

      return data

    } finally {
      this.dbPool.releaseConnection(connection, 'read')
    }
  }

  // Async view count increment
  private static async incrementViewCount(toolId: string) {
    const connection = await this.dbPool.getConnection('write')
    
    try {
      await connection.rpc('increment_tool_views', { tool_id_param: toolId })
      
      // Invalidate cache
      if (this.redis) {
        const pattern = `tool:*${toolId}*`
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }

    } catch (error) {
      console.error('Failed to increment view count:', error)
    } finally {
      this.dbPool.releaseConnection(connection, 'write')
    }
  }

  // Bulk cache invalidation
  static async invalidateCache(patterns: string[]) {
    if (!this.redis) return

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    }
  }

  // Database health check
  static async healthCheck(): Promise<{
    database: boolean
    cache: boolean
    connectionPool: {
      read: number
      write: number
    }
  }> {
    const health = {
      database: false,
      cache: false,
      connectionPool: {
        read: 0,
        write: 0
      }
    }

    try {
      const connection = await this.dbPool.getConnection('read')
      const { data } = await connection.from('tools').select('id').limit(1)
      health.database = !!data
      this.dbPool.releaseConnection(connection, 'read')
    } catch (error) {
      console.error('Database health check failed:', error)
    }

    try {
      if (this.redis) {
        await this.redis.ping()
        health.cache = true
      }
    } catch (error) {
      console.error('Cache health check failed:', error)
    }

    return health
  }
}

// Initialize on module load
QueryOptimizer.initialize().catch(console.error)

// Cleanup on process exit (only in Node.js runtime)
if (typeof process !== 'undefined' && process.on && process.versions && process.versions.node) {
  process.on('SIGTERM', async () => {
    const dbPool = DatabasePool.getInstance()
    await dbPool.cleanup()
  })
}

export { DatabasePool, QueryOptimizer }