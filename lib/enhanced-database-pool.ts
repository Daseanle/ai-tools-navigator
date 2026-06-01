import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

interface ConnectionPool {
  client: ReturnType<typeof createClient<Database>>
  isHealthy: boolean
  lastCheck: number
  connectionCount: number
}

class DatabaseManager {
  private static instance: DatabaseManager
  private pools: Map<string, ConnectionPool> = new Map()
  private readonly healthCheckInterval = 30000 // 30 seconds
  
  private constructor() {
    this.setupHealthChecks()
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  private setupHealthChecks() {
    setInterval(async () => {
      for (const [key, pool] of this.pools.entries()) {
        try {
          const { data, error } = await pool.client.from('categories').select('id').limit(1).single()
          pool.isHealthy = !error
          pool.lastCheck = Date.now()
        } catch (error) {
          console.warn(`Database health check failed for ${key}:`, error)
          pool.isHealthy = false
          pool.lastCheck = Date.now()
        }
      }
    }, this.healthCheckInterval)
  }

  getClient(type: 'primary' | 'readonly' = 'primary'): ReturnType<typeof createClient<Database>> {
    const key = `${type}_pool`
    
    if (!this.pools.has(key)) {
      this.createPool(type, key)
    }
    
    const pool = this.pools.get(key)!
    pool.connectionCount++
    
    return pool.client
  }

  private createPool(type: 'primary' | 'readonly', key: string) {
    const url = type === 'readonly' 
      ? process.env.SUPABASE_READ_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      : process.env.NEXT_PUBLIC_SUPABASE_URL || ''

    const serviceKey = type === 'readonly'
      ? process.env.SUPABASE_READ_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.SUPABASE_SERVICE_ROLE_KEY

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!url || (!serviceKey && !anonKey)) {
      console.error('Missing Supabase configuration for', type)
      // Create a mock client to prevent crashes
      const mockClient = createClient('https://demo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo')
      this.pools.set(key, {
        client: mockClient as any,
        isHealthy: false,
        lastCheck: Date.now(),
        connectionCount: 0
      })
      return
    }

    // Use service key for server-side operations, anon key for client-side
    const useKey = serviceKey || anonKey
    const client = createClient<Database>(url, useKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'ai-tools-navigator'
        }
      }
    })

    this.pools.set(key, {
      client: client as any,
      isHealthy: true,
      lastCheck: Date.now(),
      connectionCount: 0
    })
  }

  isHealthy(type: 'primary' | 'readonly' = 'primary'): boolean {
    const key = `${type}_pool`
    const pool = this.pools.get(key)
    return pool?.isHealthy || false
  }

  getStats() {
    const stats: any = {}
    for (const [key, pool] of this.pools.entries()) {
      stats[key] = {
        isHealthy: pool.isHealthy,
        lastCheck: new Date(pool.lastCheck).toISOString(),
        connectionCount: pool.connectionCount
      }
    }
    return stats
  }

  async executeQuery<T>(
    query: (client: ReturnType<typeof createClient<Database>>) => Promise<T>,
    options?: { useReadonly?: boolean; retries?: number }
  ): Promise<T> {
    const { useReadonly = false, retries = 2 } = options || {}
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = this.getClient(useReadonly ? 'readonly' : 'primary')
        return await query(client)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`Query attempt ${attempt + 1} failed:`, lastError.message)
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Query failed after retries')
  }
}

export const dbManager = DatabaseManager.getInstance()

// Legacy exports for compatibility
export const getSupabaseServerClient = () => dbManager.getClient('primary')
export const createServerClient = () => dbManager.getClient('primary')

export default dbManager

// NaviGuard-AI Security Audited - 2026-06-01
