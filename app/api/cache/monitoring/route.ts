// Cache Monitoring API
import { NextRequest, NextResponse } from 'next/server'
import { CacheHealthMonitor, CacheUtils } from '@/lib/cache-config'
import { ServerCache } from '@/lib/server-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'stats':
        return await getCacheStats()
      case 'health':
        return await getCacheHealth()
      case 'clear':
        return await clearCache(searchParams)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Cache monitoring error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getCacheStats() {
  const cache = ServerCache.getInstance()
  const stats = cache.getStats()

  return NextResponse.json({
    success: true,
    data: {
      memory: {
        size: stats.memory.size,
        hits: stats.memory.hits,
        misses: stats.memory.misses,
        hitRate: stats.memory.hits / (stats.memory.hits + stats.memory.misses) * 100 || 0
      },
      redis: {
        connected: stats.redis.connected,
        hits: stats.redis.hits,
        misses: stats.redis.misses,
        hitRate: stats.redis.hits / (stats.redis.hits + stats.redis.misses) * 100 || 0
      },
      overall: {
        hitRate: stats.hitRate * 100,
        totalRequests: stats.memory.hits + stats.memory.misses + stats.redis.hits + stats.redis.misses
      },
      metrics: stats.metrics,
      timestamp: new Date().toISOString()
    }
  })
}

async function getCacheHealth() {
  const health = await CacheHealthMonitor.getHealthStatus()

  return NextResponse.json({
    success: true,
    data: health
  })
}

async function clearCache(searchParams: URLSearchParams) {
  const cache = ServerCache.getInstance()
  const pattern = searchParams.get('pattern')
  const tag = searchParams.get('tag')

  if (pattern) {
    await cache.invalidateByPattern(pattern)
  } else if (tag) {
    await cache.invalidateByTag(tag)
  } else {
    // Clear all cache
    await cache.invalidateByPattern('*')
  }

  return NextResponse.json({
    success: true,
    message: 'Cache cleared successfully'
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'warmup':
        return await warmupCache(data)
      case 'invalidate':
        return await invalidateCache(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Cache operation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function warmupCache(data: any) {
  const cache = ServerCache.getInstance()
  const { keys } = data

  if (!keys || !Array.isArray(keys)) {
    return NextResponse.json({ error: 'Invalid keys provided' }, { status: 400 })
  }

  await cache.warmUp(keys)

  return NextResponse.json({
    success: true,
    message: 'Cache warmed up successfully'
  })
}

async function invalidateCache(data: any) {
  const cache = ServerCache.getInstance()
  const { tags, patterns, keys } = data

  if (tags && Array.isArray(tags)) {
    for (const tag of tags) {
      await cache.invalidateByTag(tag)
    }
  }

  if (patterns && Array.isArray(patterns)) {
    for (const pattern of patterns) {
      await cache.invalidateByPattern(pattern)
    }
  }

  if (keys && Array.isArray(keys)) {
    for (const key of keys) {
      await cache.delete(key)
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Cache invalidated successfully'
  })
}