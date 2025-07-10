'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { QueryOptimizer } from '@/lib/database-pool'

// ==================== Intelligent Preloader ====================

interface PreloadConfig {
  strategy: 'hover' | 'viewport' | 'idle' | 'immediate'
  delay?: number
  priority?: 'high' | 'normal' | 'low'
  conditions?: Array<() => boolean>
}

class IntelligentPreloader {
  private static instance: IntelligentPreloader
  private cache = new Map<string, any>()
  private preloadQueue = new Set<string>()
  private isPreloading = false
  private observer: IntersectionObserver | null = null
  private idleCallback: number | null = null

  static getInstance(): IntelligentPreloader {
    if (!this.instance) {
      this.instance = new IntelligentPreloader()
    }
    return this.instance
  }

  constructor() {
    this.setupIntersectionObserver()
    this.setupIdleCallback()
  }

  // Setup intersection observer for viewport-based preloading
  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const preloadUrl = element.dataset.preload
            if (preloadUrl) {
              this.preload(preloadUrl, { strategy: 'viewport' })
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start preloading 50px before element comes into view
        threshold: 0.1
      }
    )
  }

  // Setup idle callback for background preloading
  private setupIdleCallback() {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return

    const scheduleIdlePreload = () => {
      this.idleCallback = requestIdleCallback(
        (deadline) => {
          this.processPreloadQueue(deadline)
          scheduleIdlePreload() // Reschedule for next idle period
        },
        { timeout: 5000 }
      )
    }

    scheduleIdlePreload()
  }

  // Add element to viewport observation
  observeElement(element: HTMLElement, url: string) {
    if (this.observer && element) {
      element.dataset.preload = url
      this.observer.observe(element)
    }
  }

  // Remove element from observation
  unobserveElement(element: HTMLElement) {
    if (this.observer && element) {
      this.observer.unobserve(element)
      delete element.dataset.preload
    }
  }

  // Main preload function
  async preload(url: string, config: PreloadConfig = { strategy: 'idle' }) {
    // Check if already cached or in queue
    if (this.cache.has(url) || this.preloadQueue.has(url)) {
      return this.cache.get(url)
    }

    // Check conditions
    if (config.conditions && !config.conditions.every(condition => condition())) {
      return null
    }

    // Handle different strategies
    switch (config.strategy) {
      case 'immediate':
        return this.executePreload(url)
      
      case 'hover':
        // Delay for hover strategy
        await this.delay(config.delay || 100)
        return this.executePreload(url)
      
      case 'viewport':
        // Already handled by intersection observer
        return this.executePreload(url)
      
      case 'idle':
        // Add to queue for idle processing
        this.preloadQueue.add(url)
        return null
    }
  }

  // Execute the actual preload
  private async executePreload(url: string): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }

    try {
      this.isPreloading = true
      
      let data: any
      
      // Determine data type from URL pattern
      if (url.includes('/tools/')) {
        const slug = url.split('/tools/')[1]?.split('?')[0]
        if (slug) {
          data = await QueryOptimizer.getToolBySlug(slug)
        }
      } else if (url.includes('/api/tools')) {
        const urlObj = new URL(url, window.location.origin)
        const params = Object.fromEntries(urlObj.searchParams)
        data = await QueryOptimizer.getTools(params)
      } else if (url.includes('/api/search')) {
        const urlObj = new URL(url, window.location.origin)
        const query = urlObj.searchParams.get('q') || ''
        const params = Object.fromEntries(urlObj.searchParams)
        delete params.q
        data = await QueryOptimizer.searchTools(query, params)
      } else {
        // Generic fetch for other URLs
        const response = await fetch(url)
        data = await response.json()
      }

      this.cache.set(url, data)
      this.preloadQueue.delete(url)
      
      return data

    } catch (error) {
      console.warn('Preload failed for:', url, error)
      this.preloadQueue.delete(url)
      return null
    } finally {
      this.isPreloading = false
    }
  }

  // Process preload queue during idle time
  private async processPreloadQueue(deadline: IdleDeadline) {
    while (deadline.timeRemaining() > 10 && this.preloadQueue.size > 0) {
      const url = this.preloadQueue.values().next().value
      if (url) {
        await this.executePreload(url)
      }
    }
  }

  // Get cached data
  getCached(url: string): any {
    return this.cache.get(url)
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    this.preloadQueue.clear()
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (this.idleCallback) {
      cancelIdleCallback(this.idleCallback)
    }
    this.clearCache()
  }
}

// ==================== Preload Hooks ====================

export function usePreload() {
  const preloader = useRef(IntelligentPreloader.getInstance())

  return {
    preload: preloader.current.preload.bind(preloader.current),
    getCached: preloader.current.getCached.bind(preloader.current),
    clearCache: preloader.current.clearCache.bind(preloader.current)
  }
}

export function useHoverPreload(url: string, config: Partial<PreloadConfig> = {}) {
  const { preload } = usePreload()

  const handleMouseEnter = useCallback(() => {
    preload(url, { strategy: 'hover', ...config })
  }, [url, preload, config])

  return { onMouseEnter: handleMouseEnter }
}

export function useViewportPreload(url: string) {
  const preloader = useRef(IntelligentPreloader.getInstance())
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (element && url) {
      preloader.current.observeElement(element, url)
    }

    return () => {
      if (element) {
        preloader.current.unobserveElement(element)
      }
    }
  }, [url])

  return elementRef
}

// ==================== Smart Preloading Components ====================

export function PreloadLink({ 
  href, 
  children, 
  strategy = 'hover',
  className = '',
  ...props 
}: {
  href: string
  children: React.ReactNode
  strategy?: 'hover' | 'viewport' | 'immediate'
  className?: string
  [key: string]: any
}) {
  const router = useRouter()
  const { preload, getCached } = usePreload()
  const [isPreloaded, setIsPreloaded] = useState(false)

  // Preload based on strategy
  useEffect(() => {
    if (strategy === 'immediate') {
      preload(href, { strategy: 'immediate' })
        .then(() => setIsPreloaded(true))
    }
  }, [href, strategy, preload])

  const handleMouseEnter = useCallback(() => {
    if (strategy === 'hover' && !isPreloaded) {
      preload(href, { strategy: 'hover' })
        .then(() => setIsPreloaded(true))
    }
  }, [href, strategy, preload, isPreloaded])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    // Use cached data if available
    const cached = getCached(href)
    if (cached) {
      // Navigate immediately with cached data
      router.push(href)
    } else {
      // Preload and navigate
      preload(href, { strategy: 'immediate' }).then(() => {
        router.push(href)
      })
    }
  }, [href, router, getCached, preload])

  return (
    <a
      href={href}
      className={`${className} ${isPreloaded ? 'preloaded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}

// Component for viewport-based preloading
export function ViewportPreloader({ 
  url, 
  children, 
  className = '' 
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useViewportPreload(url)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// ==================== Page Preloading ====================

export function usePagePreload() {
  const pathname = usePathname()
  const { preload } = usePreload()

  useEffect(() => {
    // Preload common pages based on current route
    const preloadStrategies = {
      '/': ['/tools', '/categories'],
      '/tools': ['/categories', '/search'],
      '/categories': ['/tools'],
      '/search': ['/tools', '/categories']
    }

    const toPreload = preloadStrategies[pathname as keyof typeof preloadStrategies]
    
    if (toPreload) {
      toPreload.forEach(url => {
        preload(url, { 
          strategy: 'idle',
          conditions: [
            () => navigator.connection ? navigator.connection.effectiveType === '4g' : true,
            () => !navigator.connection?.saveData
          ]
        })
      })
    }
  }, [pathname, preload])
}

// ==================== Prefetch Manager ====================

export class PrefetchManager {
  private static prefetched = new Set<string>()

  static prefetchPage(url: string) {
    if (this.prefetched.has(url)) return

    // Use Next.js's built-in prefetching
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        document.head.appendChild(link)
        
        this.prefetched.add(url)
      })
    }
  }

  static prefetchAPI(url: string) {
    if (this.prefetched.has(url)) return

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        try {
          await fetch(url, { method: 'HEAD' })
          this.prefetched.add(url)
        } catch (error) {
          console.warn('API prefetch failed:', url, error)
        }
      })
    }
  }
}

// ==================== Network-Aware Preloading ====================

export function useNetworkAwarePreload() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    saveData: false
  })

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      setNetworkInfo({
        effectiveType: connection.effectiveType || '4g',
        saveData: connection.saveData || false
      })

      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          saveData: connection.saveData || false
        })
      }

      connection.addEventListener('change', updateNetworkInfo)
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  const shouldPreload = useCallback(() => {
    return networkInfo.effectiveType === '4g' && !networkInfo.saveData
  }, [networkInfo])

  return { networkInfo, shouldPreload }
}

export default IntelligentPreloader