'use client'

import { useEffect } from 'react'
import type { Metric } from 'web-vitals'

// Web Vitals 监控组件
export function WebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 动态导入 web-vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        const sendToAnalytics = (metric: Metric) => {
          // 发送到分析服务
          if (window.gtag) {
            window.gtag('event', metric.name, {
              custom_parameter_1: metric.value,
              custom_parameter_2: metric.id,
              custom_parameter_3: metric.name,
            })
          }

          // 发送到自定义分析
          if (window.analytics) {
            window.analytics.track('Core Web Vital', {
              name: metric.name,
              value: metric.value,
              id: metric.id,
              delta: metric.delta,
              entries: metric.entries,
            })
          }

          // 控制台日志 (开发模式)
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric)
          }
        }

        // 监控核心指标
        getCLS(sendToAnalytics)
        getFID(sendToAnalytics)
        getFCP(sendToAnalytics)
        getLCP(sendToAnalytics)
        getTTFB(sendToAnalytics)
      })
    }
  }, [])

  return null
}

// 性能预算监控
export function PerformanceBudget() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // 监控资源加载
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            // 检查性能预算
            const budgets = {
              loadTime: 3000, // 3秒
              domContentLoaded: 2000, // 2秒
              firstPaint: 1000, // 1秒
            }

            const metrics = {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.responseStart - navEntry.requestStart,
            }

            // 检查是否超出预算
            Object.entries(budgets).forEach(([key, budget]) => {
              const value = metrics[key as keyof typeof metrics]
              if (value > budget) {
                console.warn(`Performance budget exceeded: ${key} = ${value}ms (budget: ${budget}ms)`)
                
                // 发送告警
                if (window.analytics) {
                  window.analytics.track('Performance Budget Exceeded', {
                    metric: key,
                    value,
                    budget,
                    url: window.location.href,
                  })
                }
              }
            })
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}

// 类型声明
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    analytics?: {
      track: (event: string, properties?: any) => void
    }
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
