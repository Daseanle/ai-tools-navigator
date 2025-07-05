// 性能监控和优化工具

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 测量函数执行时间
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    this.metrics.set(name, end - start)

    if (process.env.NODE_ENV === "development") {
      console.log(`${name} took ${end - start} milliseconds`)
    }

    return result
  }

  // 测量异步函数执行时间
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    this.metrics.set(name, end - start)

    if (process.env.NODE_ENV === "development") {
      console.log(`${name} took ${end - start} milliseconds`)
    }

    return result
  }

  // 获取性能指标
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// Web Vitals 监控
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === "production") {
    // 发送到分析服务
    console.log(metric)
  }
}

// 图片预加载
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

// 批量预加载图片
export async function preloadImages(srcs: string[]): Promise<void> {
  const promises = srcs.map(preloadImage)
  await Promise.allSettled(promises)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 懒加载观察器
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  })
}
