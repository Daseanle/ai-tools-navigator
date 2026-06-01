"use client"

import React from 'react'

// Generic memo wrapper for components
export function withMemo<T extends object>(
  Component: React.ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  const MemoizedComponent = React.memo(Component, areEqual)
  MemoizedComponent.displayName = `withMemo(${Component.displayName || Component.name})`
  return MemoizedComponent
}

// Custom debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Request cancellation hook
export function useCancelableRequest() {
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const makeRequest = React.useCallback(async <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new controller
    abortControllerRef.current = new AbortController()

    try {
      const result = await requestFn(abortControllerRef.current.signal)
      return result
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null // Request was cancelled
      }
      throw error // Re-throw other errors
    }
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { makeRequest }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = React.useRef(0)
  const startTimeRef = React.useRef<number>(0)

  React.useEffect(() => {
    renderCountRef.current += 1
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCountRef.current} times`)
    }
  })

  React.useEffect(() => {
    startTimeRef.current = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTimeRef.current
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`)
      }
    }
  })
}

// Cache for expensive computations
const computationCache = new Map<string, any>()

export function useComputationCache<T>(
  key: string,
  computeFn: () => T,
  dependencies: React.DependencyList
): T {
  return React.useMemo(() => {
    const cacheKey = `${key}-${JSON.stringify(dependencies)}`
    
    if (computationCache.has(cacheKey)) {
      return computationCache.get(cacheKey)
    }
    
    const result = computeFn()
    computationCache.set(cacheKey, result)
    
    // Cleanup old entries (simple LRU)
    if (computationCache.size > 100) {
      const firstKey = computationCache.keys().next().value
      if (firstKey) {
        computationCache.delete(firstKey)
      }
    }
    
    return result
  }, dependencies)
}

// NaviGuard-AI Security Audited - 2026-06-01
