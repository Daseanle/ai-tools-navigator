'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'

// 查询缓存接口
interface QueryCache {
  [key: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

// 查询选项
interface QueryOptions {
  cacheKey?: string
  cacheTTL?: number // 毫秒
  refetchInterval?: number
  enabled?: boolean
  retry?: number
  retryDelay?: number
}

// 查询状态
interface QueryState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
  invalidate: () => void
}

// 内存缓存
const queryCache: QueryCache = {}

// 清理过期缓存
const cleanupCache = () => {
  const now = Date.now()
  Object.keys(queryCache).forEach(key => {
    const item = queryCache[key]
    if (now - item.timestamp > item.ttl) {
      delete queryCache[key]
    }
  })
}

// 定期清理缓存
setInterval(cleanupCache, 60000) // 每分钟清理一次

// 优化查询Hook
export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryState<T> {
  const {
    cacheKey,
    cacheTTL = 300000, // 5分钟默认TTL
    refetchInterval,
    enabled = true,
    retry = 3,
    retryDelay = 1000,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const retryCount = useRef(0)
  const abortController = useRef<AbortController | null>(null)

  // 执行查询
  const executeQuery = useCallback(async (skipCache = false) => {
    if (!enabled) return

    // 检查缓存
    if (cacheKey && !skipCache) {
      const cached = queryCache[cacheKey]
      if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
        setData(cached.data)
        setLoading(false)
        setError(null)
        return cached.data
      }
    }

    // 取消之前的请求
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      
      // 更新状态
      setData(result)
      setLoading(false)
      setError(null)
      retryCount.current = 0

      // 缓存结果
      if (cacheKey) {
        queryCache[cacheKey] = {
          data: result,
          timestamp: Date.now(),
          ttl: cacheTTL,
        }
      }

      return result
    } catch (err) {
      const error = err as Error
      
      // 重试逻辑
      if (retryCount.current < retry) {
        retryCount.current++
        setTimeout(() => {
          executeQuery(skipCache)
        }, retryDelay * retryCount.current)
        return
      }

      setError(error)
      setLoading(false)
      setData(null)
      throw error
    }
  }, [queryFn, enabled, cacheKey, cacheTTL, retry, retryDelay])

  // 重新获取数据
  const refetch = useCallback(() => {
    return executeQuery(true)
  }, [executeQuery])

  // 使缓存无效
  const invalidate = useCallback(() => {
    if (cacheKey) {
      delete queryCache[cacheKey]
    }
    setData(null)
    setError(null)
  }, [cacheKey])

  // 初始查询
  useEffect(() => {
    executeQuery()
  }, [executeQuery])

  // 定时刷新
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        executeQuery(true)
      }, refetchInterval)

      return () => clearInterval(interval)
    }
  }, [executeQuery, refetchInterval, enabled])

  // 清理
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  }
}

// 防抖搜索Hook
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await searchFn(searchQuery)
        setResults(result)
        setLoading(false)
      } catch (err) {
        setError(err as Error)
        setLoading(false)
        setResults(null)
      }
    }, delay),
    [searchFn, delay]
  )

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }, [debouncedSearch])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    query,
    results,
    loading,
    error,
    search,
    clearSearch,
  }
}

// 批量查询Hook
export function useBatchQuery<T>(
  queryFns: Array<() => Promise<T>>,
  options: QueryOptions = {}
) {
  const [results, setResults] = useState<Array<T | null>>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Array<Error | null>>([])

  const executeBatch = useCallback(async () => {
    if (!options.enabled) return

    setLoading(true)
    setErrors([])

    try {
      const promises = queryFns.map(async (fn, index) => {
        try {
          return await fn()
        } catch (err) {
          setErrors(prev => {
            const newErrors = [...prev]
            newErrors[index] = err as Error
            return newErrors
          })
          return null
        }
      })

      const results = await Promise.allSettled(promises)
      const data = results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      )

      setResults(data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Batch query failed:', err)
    }
  }, [queryFns, options.enabled])

  useEffect(() => {
    executeBatch()
  }, [executeBatch])

  return {
    results,
    loading,
    errors,
    refetch: executeBatch,
  }
}

// 预加载Hook
export function usePreload<T>(
  queryFn: () => Promise<T>,
  trigger: boolean,
  options: QueryOptions = {}
) {
  const [preloadedData, setPreloadedData] = useState<T | null>(null)
  const [preloading, setPreloading] = useState(false)

  useEffect(() => {
    if (trigger && options.enabled !== false) {
      setPreloading(true)
      
      queryFn()
        .then(data => {
          setPreloadedData(data)
          
          // 缓存预加载的数据
          if (options.cacheKey) {
            queryCache[options.cacheKey] = {
              data,
              timestamp: Date.now(),
              ttl: options.cacheTTL || 300000,
            }
          }
        })
        .catch(err => {
          console.error('Preload failed:', err)
        })
        .finally(() => {
          setPreloading(false)
        })
    }
  }, [trigger, queryFn, options.cacheKey, options.cacheTTL, options.enabled])

  return {
    preloadedData,
    preloading,
  }
}

// 导出缓存工具
export const cacheUtils = {
  clear: () => {
    Object.keys(queryCache).forEach(key => {
      delete queryCache[key]
    })
  },
  
  invalidate: (key: string) => {
    delete queryCache[key]
  },
  
  get: (key: string) => {
    const item = queryCache[key]
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      delete queryCache[key]
      return null
    }
    
    return item.data
  },
  
  set: (key: string, data: any, ttl = 300000) => {
    queryCache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    }
  },
  
  size: () => Object.keys(queryCache).length,
  
  cleanup: cleanupCache,
}

// NaviGuard-AI Security Audited - 2026-06-01
