// Advanced Monitoring and Analytics System

export interface MetricData {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp?: number
}

export interface AlertConfig {
  id: string
  name: string
  metric: string
  threshold: number
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  enabled: boolean
  cooldownMs: number
  channels: ('console' | 'webhook' | 'email')[]
  webhookUrl?: string
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
  }
  database: {
    connected: boolean
    responseTime: number
  }
  cache: {
    connected: boolean
    hitRate: number
  }
  api: {
    totalRequests: number
    errorRate: number
    avgResponseTime: number
  }
}

class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map()
  private alerts: Map<string, AlertConfig> = new Map()
  private lastAlertTimes: Map<string, number> = new Map()

  // Collect metric
  record(metric: MetricData) {
    const key = metric.name
    const timestamp = metric.timestamp || Date.now()
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const values = this.metrics.get(key)!
    values.push({ ...metric, timestamp })
    
    // Keep only last 1000 data points per metric
    if (values.length > 1000) {
      values.splice(0, values.length - 1000)
    }
    
    // Check alerts
    this.checkAlerts(metric)
  }

  // Get metric statistics
  getStats(metricName: string, timeWindowMs: number = 300000): any {
    const values = this.metrics.get(metricName) || []
    const now = Date.now()
    const windowStart = now - timeWindowMs
    
    const recentValues = values
      .filter(m => m.timestamp! >= windowStart)
      .map(m => m.value)
    
    if (recentValues.length === 0) {
      return null
    }
    
    const sorted = [...recentValues].sort((a, b) => a - b)
    const sum = recentValues.reduce((a, b) => a + b, 0)
    
    return {
      count: recentValues.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / recentValues.length,
      sum,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  // Get all metrics
  getAllStats(timeWindowMs: number = 300000) {
    const result: Record<string, any> = {}
    for (const metricName of this.metrics.keys()) {
      result[metricName] = this.getStats(metricName, timeWindowMs)
    }
    return result
  }

  // Alert management
  addAlert(alert: AlertConfig) {
    this.alerts.set(alert.id, alert)
  }

  removeAlert(alertId: string) {
    this.alerts.delete(alertId)
    this.lastAlertTimes.delete(alertId)
  }

  private checkAlerts(metric: MetricData) {
    for (const alert of this.alerts.values()) {
      if (!alert.enabled || alert.metric !== metric.name) continue
      
      const shouldAlert = this.evaluateAlert(alert, metric.value)
      if (!shouldAlert) continue
      
      const now = Date.now()
      const lastAlert = this.lastAlertTimes.get(alert.id) || 0
      
      if (now - lastAlert < alert.cooldownMs) continue
      
      this.triggerAlert(alert, metric)
      this.lastAlertTimes.set(alert.id, now)
    }
  }

  private evaluateAlert(alert: AlertConfig, value: number): boolean {
    switch (alert.operator) {
      case 'gt': return value > alert.threshold
      case 'lt': return value < alert.threshold
      case 'eq': return value === alert.threshold
      case 'gte': return value >= alert.threshold
      case 'lte': return value <= alert.threshold
      default: return false
    }
  }

  private async triggerAlert(alert: AlertConfig, metric: MetricData) {
    const message = `Alert: ${alert.name} - ${metric.name} is ${metric.value} (threshold: ${alert.threshold})`
    
    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case 'console':
            console.warn(`🚨 ${message}`)
            break
          case 'webhook':
            if (alert.webhookUrl) {
              await fetch(alert.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  alert: alert.name,
                  metric: metric.name,
                  value: metric.value,
                  threshold: alert.threshold,
                  timestamp: metric.timestamp
                })
              })
            }
            break
          case 'email':
            // Email integration would go here
            console.log(`📧 Email alert: ${message}`)
            break
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel}:`, error)
      }
    }
  }
}

export const metricsCollector = new MetricsCollector()

// Performance monitoring
export class PerformanceTracker {
  static startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      metricsCollector.record({
        name: `performance.${name}`,
        value: duration,
        tags: { unit: 'ms' }
      })
    }
  }

  static recordApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    metricsCollector.record({
      name: 'api.request_duration',
      value: duration,
      tags: { endpoint, method, status: statusCode.toString() }
    })
    
    metricsCollector.record({
      name: 'api.request_count',
      value: 1,
      tags: { endpoint, method, status: statusCode.toString() }
    })
    
    if (statusCode >= 400) {
      metricsCollector.record({
        name: 'api.error_count',
        value: 1,
        tags: { endpoint, method, status: statusCode.toString() }
      })
    }
  }

  static recordDatabaseQuery(query: string, duration: number, success: boolean) {
    metricsCollector.record({
      name: 'database.query_duration',
      value: duration,
      tags: { query_type: query, success: success.toString() }
    })
    
    if (!success) {
      metricsCollector.record({
        name: 'database.error_count',
        value: 1,
        tags: { query_type: query }
      })
    }
  }

  static recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string) {
    metricsCollector.record({
      name: `cache.${operation}`,
      value: 1,
      tags: { cache_key: key.split(':')[0] } // Use prefix as tag
    })
  }
}

// System health checker
export class HealthChecker {
  private static checks: Map<string, () => Promise<boolean>> = new Map()

  static addCheck(name: string, check: () => Promise<boolean>) {
    this.checks.set(name, check)
  }

  static async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now()
    
    // Run all health checks
    const checkResults = await Promise.allSettled(
      Array.from(this.checks.entries()).map(async ([name, check]) => {
        try {
          const result = await Promise.race([
            check(),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ])
          return { name, success: result }
        } catch (error) {
          console.error(`Health check ${name} failed:`, error)
          return { name, success: false }
        }
      })
    )

    const results = checkResults
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<{name: string, success: boolean}>).value)

    const allHealthy = results.every(r => r.success)
    const anyUnhealthy = results.some(r => !r.success)

    // Get system metrics
    const isNodeRuntime = typeof process !== 'undefined' && process.versions && process.versions.node
    let memoryUsage: any = { heapUsed: 0, heapTotal: 100 * 1024 * 1024 }
    let uptime: number = 0
    
    if (isNodeRuntime) {
      memoryUsage = process.memoryUsage()
      uptime = process.uptime()
    }

    // Calculate API metrics
    const apiStats = metricsCollector.getStats('api.request_duration', 300000) || {}
    const errorStats = metricsCollector.getStats('api.error_count', 300000) || {}
    const totalRequests = metricsCollector.getStats('api.request_count', 300000)?.sum || 0
    const totalErrors = errorStats.sum || 0

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'degraded' : 'down',
      uptime,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        usage: 0 // Would need additional monitoring for CPU
      },
      database: {
        connected: results.find(r => r.name === 'database')?.success || false,
        responseTime: Date.now() - startTime
      },
      cache: {
        connected: results.find(r => r.name === 'cache')?.success || false,
        hitRate: this.calculateCacheHitRate()
      },
      api: {
        totalRequests,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
        avgResponseTime: apiStats.avg || 0
      }
    }
  }

  private static calculateCacheHitRate(): number {
    const hits = metricsCollector.getStats('cache.hit', 300000)?.sum || 0
    const misses = metricsCollector.getStats('cache.miss', 300000)?.sum || 0
    const total = hits + misses
    return total > 0 ? (hits / total) * 100 : 0
  }
}

// Add default health checks
HealthChecker.addCheck('database', async () => {
  try {
    // In a real app, this would ping the database
    return true
  } catch (error) {
    return false
  }
})

HealthChecker.addCheck('cache', async () => {
  try {
    // In a real app, this would ping Redis/cache
    return true
  } catch (error) {
    return false
  }
})

// Add default alerts
metricsCollector.addAlert({
  id: 'high-error-rate',
  name: 'High Error Rate',
  metric: 'api.error_count',
  threshold: 10,
  operator: 'gt',
  enabled: true,
  cooldownMs: 300000, // 5 minutes
  channels: ['console', 'webhook']
})

metricsCollector.addAlert({
  id: 'slow-response-time',
  name: 'Slow Response Time',
  metric: 'api.request_duration',
  threshold: 5000,
  operator: 'gt',
  enabled: true,
  cooldownMs: 300000,
  channels: ['console']
})

// Export monitoring middleware
export function createMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = performance.now()
    const originalSend = res.send
    
    res.send = function(body: any) {
      const duration = performance.now() - start
      PerformanceTracker.recordApiCall(
        req.route?.path || req.path,
        req.method,
        res.statusCode,
        duration
      )
      return originalSend.call(this, body)
    }
    
    next()
  }
}

// Utility functions
export const monitoring = {
  // Record custom metrics
  record: (name: string, value: number, tags?: Record<string, string>) => {
    metricsCollector.record({ name, value, tags })
  },

  // Time a function execution
  time: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const endTimer = PerformanceTracker.startTimer(name)
    try {
      const result = await fn()
      return result
    } finally {
      endTimer()
    }
  },

  // Get system health
  health: () => HealthChecker.getSystemHealth(),

  // Get all metrics
  metrics: (timeWindow?: number) => metricsCollector.getAllStats(timeWindow),

  // Create alert
  alert: (config: AlertConfig) => metricsCollector.addAlert(config)
}