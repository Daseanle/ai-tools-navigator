"use client"

import { useEffect, useRef } from 'react'
import { UserBehaviorAnalytics } from '@/lib/user-behavior-analytics'

interface BehaviorTrackerProps {
  userId?: string
  sessionId?: string
}

export function BehaviorTracker({ userId, sessionId }: BehaviorTrackerProps) {
  const analyticsRef = useRef<UserBehaviorAnalytics | null>(null)
  const currentSessionRef = useRef<string>('')

  useEffect(() => {
    // 初始化分析器
    analyticsRef.current = new UserBehaviorAnalytics()
    
    // 生成会话ID
    currentSessionRef.current = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 创建会话
    createSession()
    
    // 跟踪页面访问
    trackPageView()
    
    // 设置事件监听器
    setupEventListeners()
    
    // 监听性能数据
    trackPerformanceMetrics()
    
    return () => {
      // 清理事件监听器
      cleanupEventListeners()
      // 清理分析器资源
      if (analyticsRef.current) {
        analyticsRef.current.destroy()
      }
    }
  }, [])

  const trackPageView = () => {
    if (!analyticsRef.current) return

    const eventData = {
      userId: userId || 'anonymous',
      sessionId: currentSessionRef.current,
      eventType: 'page_view' as const,
      eventData: {
        page: window.location.pathname,
        timeSpent: 0
      },
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenResolution: `${screen.width}x${screen.height}`
      }
    }

    analyticsRef.current.trackEvent(eventData)
  }

  const setupEventListeners = () => {
    // 点击事件
    document.addEventListener('click', handleClick, { passive: true })
    
    // 滚动事件
    document.addEventListener('scroll', handleScroll, { passive: true })
    
    // 鼠标悬停事件
    document.addEventListener('mouseover', handleHover, { passive: true })
    
    // 表单提交事件
    document.addEventListener('submit', handleFormSubmit)
    
    // 页面离开事件
    window.addEventListener('beforeunload', handlePageUnload)
    
    // 可见性变化事件
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const cleanupEventListeners = () => {
    document.removeEventListener('click', handleClick)
    document.removeEventListener('scroll', handleScroll)
    document.removeEventListener('mouseover', handleHover)
    document.removeEventListener('submit', handleFormSubmit)
    window.removeEventListener('beforeunload', handlePageUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  const handleClick = (event: Event) => {
    if (!analyticsRef.current) return

    const target = event.target as HTMLElement
    const element = getElementInfo(target)

    analyticsRef.current.trackEvent({
      userId: userId || 'anonymous',
      sessionId: currentSessionRef.current,
      eventType: 'click',
      eventData: {
        element: element.type,
        value: element.value,
        coordinates: {
          x: (event as MouseEvent).clientX,
          y: (event as MouseEvent).clientY
        }
      },
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenResolution: `${screen.width}x${screen.height}`
      }
    })
  }

  const handleScroll = () => {
    if (!analyticsRef.current) return

    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    )

    analyticsRef.current.trackEvent({
      userId: userId || 'anonymous',
      sessionId: currentSessionRef.current,
      eventType: 'scroll',
      eventData: {
        scrollDepth: Math.min(scrollDepth, 100)
      },
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenResolution: `${screen.width}x${screen.height}`
      }
    })
  }

  const handleHover = (event: Event) => {
    if (!analyticsRef.current) return

    const target = event.target as HTMLElement
    const element = getElementInfo(target)

    // 只跟踪重要元素的悬停
    if (element.type === 'tool-card' || element.type === 'category-card' || element.type === 'nav-link') {
      analyticsRef.current.trackEvent({
        userId: userId || 'anonymous',
        sessionId: currentSessionRef.current,
        eventType: 'hover',
        eventData: {
          element: element.type,
          value: element.value,
          coordinates: {
            x: (event as MouseEvent).clientX,
            y: (event as MouseEvent).clientY
          }
        },
        context: {
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        deviceInfo: {
          type: getDeviceType(),
          os: getOS(),
          browser: getBrowser(),
          screenResolution: `${screen.width}x${screen.height}`
        }
      })
    }
  }

  const handleFormSubmit = (event: Event) => {
    if (!analyticsRef.current) return

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const formId = form.id || form.className || 'unknown-form'

    analyticsRef.current.trackEvent({
      userId: userId || 'anonymous',
      sessionId: currentSessionRef.current,
      eventType: 'form_submit',
      eventData: {
        element: 'form',
        value: formId
      },
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenResolution: `${screen.width}x${screen.height}`
      }
    })
  }

  const handlePageUnload = () => {
    // Disable page unload tracking temporarily to avoid potential API errors
    // TODO: Re-enable after fixing API endpoint issues
    return
    
    // 发送页面停留时间数据
    if (analyticsRef.current) {
      // 计算页面停留时间
      const timeSpent = Date.now() - window.performance.timing.navigationStart
      
      // 收集当前页面的热力图数据
      const clickData: any[] = [] // 这里可以收集页面上的点击数据
      const scrollData: any[] = [] // 这里可以收集滚动数据
      const hoverData: any[] = [] // 这里可以收集悬停数据
      
      // 使用 sendBeacon 确保数据发送
      const exitData = {
        userId: userId || 'anonymous',
        sessionId: currentSessionRef.current,
        page: window.location.pathname,
        timeSpent: timeSpent
      }
      
      try {
        navigator.sendBeacon('/api/analytics/page-exit', JSON.stringify(exitData))
        
        // 发送热力图数据
        if (analyticsRef.current?.sendHeatmapData) {
          analyticsRef.current!.sendHeatmapData(
            window.location.href,
            clickData,
            scrollData,
            hoverData
          )
        }
      } catch (error) {
        console.error('Error sending unload data:', error)
      }
    }
  }

  const handleVisibilityChange = () => {
    if (!analyticsRef.current) return

    const isVisible = !document.hidden

    analyticsRef.current.trackEvent({
      userId: userId || 'anonymous',
      sessionId: currentSessionRef.current,
      eventType: isVisible ? 'page_view' : 'page_view',
      eventData: {
        element: 'page',
        value: isVisible ? 'visible' : 'hidden'
      },
      context: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenResolution: `${screen.width}x${screen.height}`
      }
    })
  }

  const getElementInfo = (element: HTMLElement) => {
    // 识别特殊元素类型
    if (element.classList.contains('tool-card')) {
      return { type: 'tool-card', value: element.dataset.toolId || '' }
    }
    
    if (element.classList.contains('category-card')) {
      return { type: 'category-card', value: element.dataset.category || '' }
    }
    
    if (element.tagName === 'A') {
      return { type: 'link', value: (element as HTMLAnchorElement).href }
    }
    
    if (element.tagName === 'BUTTON') {
      return { type: 'button', value: element.textContent?.trim() || '' }
    }
    
    if (element.tagName === 'INPUT') {
      return { type: 'input', value: (element as HTMLInputElement).type }
    }
    
    return { type: element.tagName.toLowerCase(), value: element.textContent?.trim() || '' }
  }

  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  const getOS = (): string => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac OS')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  const getBrowser = (): string => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  // 创建会话
  const createSession = async () => {
    if (!analyticsRef.current) return
    
    await analyticsRef.current.createSession(
      currentSessionRef.current,
      userId || 'anonymous'
    )
  }

  // 跟踪性能指标
  const trackPerformanceMetrics = () => {
    if (!analyticsRef.current) return

    // 等待页面加载完成
    if (document.readyState === 'complete') {
      collectPerformanceData()
    } else {
      window.addEventListener('load', collectPerformanceData)
    }
  }

  const collectPerformanceData = () => {
    if (!analyticsRef.current) return

    // 获取导航时间
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    // 获取Paint时间
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime
    
    // 获取LCP
    let lcp = 0
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          lcp = lastEntry.startTime
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (error) {
        console.log('LCP observation not supported')
      }
    }

    // 发送性能数据
    setTimeout(() => {
      analyticsRef.current?.sendPerformanceData(window.location.href, {
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        firstInputDelay: 0, // 需要通过事件监听器获取
        cumulativeLayoutShift: 0 // 需要通过PerformanceObserver获取
      })
    }, 1000)
  }

  // 不渲染任何UI
  return null
}

// 导出分析器实例，供其他组件使用
export const behaviorAnalytics = typeof window !== 'undefined' ? new UserBehaviorAnalytics() : null

// NaviGuard-AI Security Audited - 2026-06-01
