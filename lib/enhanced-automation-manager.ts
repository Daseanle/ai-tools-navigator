/**
 * Enhanced Automation Manager with improved error handling and resilience
 */

import { dbManager } from './enhanced-database-pool'
import ErrorHandler from './error-handler'

export interface AutomationTask {
  id: string
  name: string
  type: 'content' | 'crawling' | 'seo' | 'performance' | 'marketing'
  schedule: string // cron expression
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
  status: 'idle' | 'running' | 'completed' | 'failed'
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  config: any
}

export interface AutomationMetrics {
  taskId: string
  duration: number
  success: boolean
  error?: string
  timestamp: Date
  resourceUsage?: {
    memory: number
    cpu: number
  }
}

class EnhancedAutomationManager {
  private static instance: EnhancedAutomationManager
  private tasks: Map<string, AutomationTask> = new Map()
  private running: Set<string> = new Set()
  private metrics: AutomationMetrics[] = []
  private maxMetricsHistory = 1000

  private constructor() {
    this.initializeDefaultTasks()
    this.startScheduler()
    this.setupHealthMonitoring()
  }

  static getInstance(): EnhancedAutomationManager {
    if (!EnhancedAutomationManager.instance) {
      EnhancedAutomationManager.instance = new EnhancedAutomationManager()
    }
    return EnhancedAutomationManager.instance
  }

  private initializeDefaultTasks() {
    const defaultTasks: Partial<AutomationTask>[] = [
      {
        id: 'content-generation',
        name: 'AI Content Generation',
        type: 'content',
        schedule: '0 8 * * *', // Daily at 8 AM
        enabled: true,
        priority: 'medium',
        maxRetries: 3,
        config: {
          types: ['blog', 'tool-review'],
          aiModel: 'gpt-4',
          qualityThreshold: 0.8
        }
      },
      {
        id: 'tool-crawling',
        name: 'Tool Discovery & Crawling',
        type: 'crawling',
        schedule: '0 */6 * * *', // Every 6 hours
        enabled: true,
        priority: 'high',
        maxRetries: 2,
        config: {
          sources: ['producthunt', 'aitools', 'futuretools'],
          autoApproval: false,
          qualityFilter: {
            minRating: 4.0,
            minUsers: 100
          }
        }
      },
      {
        id: 'seo-optimization',
        name: 'SEO Auto-Optimization',
        type: 'seo',
        schedule: '0 2 * * *', // Daily at 2 AM
        enabled: true,
        priority: 'medium',
        maxRetries: 1,
        config: {
          autoKeywordResearch: true,
          autoMetaGeneration: true,
          competitorAnalysis: true
        }
      },
      {
        id: 'performance-monitoring',
        name: 'Performance Monitoring & Optimization',
        type: 'performance',
        schedule: '*/30 * * * *', // Every 30 minutes
        enabled: true,
        priority: 'critical',
        maxRetries: 1,
        config: {
          performanceThreshold: 3000, // 3 seconds
          autoOptimization: true
        }
      }
    ]

    defaultTasks.forEach(taskData => {
      const task: AutomationTask = {
        retryCount: 0,
        status: 'idle',
        ...taskData
      } as AutomationTask
      
      this.tasks.set(task.id, task)
    })
  }

  private startScheduler() {
    // Simple scheduler - in production, consider using node-cron
    setInterval(() => {
      this.checkAndExecuteTasks()
    }, 60000) // Check every minute
  }

  private setupHealthMonitoring() {
    setInterval(() => {
      this.pruneMetrics()
      this.logHealthStatus()
    }, 300000) // Every 5 minutes
  }

  private async checkAndExecuteTasks() {
    const now = new Date()
    
    for (const [taskId, task] of this.tasks.entries()) {
      if (!task.enabled || this.running.has(taskId)) {
        continue
      }

      if (this.shouldRunTask(task, now)) {
        await this.executeTask(task)
      }
    }
  }

  private shouldRunTask(task: AutomationTask, now: Date): boolean {
    if (!task.nextRun) {
      // Calculate next run based on schedule
      task.nextRun = this.calculateNextRun(task.schedule, now)
    }
    
    return now >= task.nextRun
  }

  private calculateNextRun(schedule: string, from: Date): Date {
    // Simple implementation - in production, use a proper cron parser
    const parts = schedule.split(' ')
    if (parts.length === 5) {
      const [minute, hour, day, month, weekday] = parts
      
      const next = new Date(from)
      
      if (minute !== '*') next.setMinutes(parseInt(minute))
      if (hour !== '*') next.setHours(parseInt(hour))
      
      // If the time has passed today, move to next day
      if (next <= from) {
        next.setDate(next.getDate() + 1)
      }
      
      return next
    }
    
    // Default: run in 1 hour
    return new Date(from.getTime() + 60 * 60 * 1000)
  }

  private async executeTask(task: AutomationTask): Promise<void> {
    const startTime = Date.now()
    this.running.add(task.id)
    task.status = 'running'
    task.lastRun = new Date()

    try {
      console.log(`🤖 Starting automation task: ${task.name}`)
      
      await this.runTaskLogic(task)
      
      task.status = 'completed'
      task.retryCount = 0
      task.nextRun = this.calculateNextRun(task.schedule, new Date())
      
      const duration = Date.now() - startTime
      this.recordMetrics({
        taskId: task.id,
        duration,
        success: true,
        timestamp: new Date()
      })
      
      console.log(`✅ Task completed: ${task.name} (${duration}ms)`)
      
    } catch (error) {
      task.status = 'failed'
      task.retryCount++
      
      const duration = Date.now() - startTime
      this.recordMetrics({
        taskId: task.id,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      })
      
      ErrorHandler.logError(
        error instanceof Error ? error : new Error(String(error)),
        `Automation task: ${task.name}`
      )
      
      if (task.retryCount < task.maxRetries) {
        // Retry in 5 minutes
        task.nextRun = new Date(Date.now() + 5 * 60 * 1000)
        console.warn(`🔄 Task failed, will retry: ${task.name} (attempt ${task.retryCount}/${task.maxRetries})`)
      } else {
        // Disable task after max retries
        task.enabled = false
        console.error(`❌ Task disabled after max retries: ${task.name}`)
      }
    } finally {
      this.running.delete(task.id)
    }
  }

  private async runTaskLogic(task: AutomationTask): Promise<void> {
    switch (task.type) {
      case 'content':
        await this.executeContentGeneration(task)
        break
      case 'crawling':
        await this.executeToolCrawling(task)
        break
      case 'seo':
        await this.executeSEOOptimization(task)
        break
      case 'performance':
        await this.executePerformanceMonitoring(task)
        break
      case 'marketing':
        await this.executeMarketingAutomation(task)
        break
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  private async executeContentGeneration(task: AutomationTask): Promise<void> {
    // Placeholder for content generation logic
    console.log('🖋️  Generating AI content...')
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real implementation:
    // - Generate blog posts, tool reviews, tutorials
    // - Use AI services (OpenAI, Claude, etc.)
    // - Save to database
    // - Trigger SEO optimization
  }

  private async executeToolCrawling(task: AutomationTask): Promise<void> {
    console.log('🕷️  Crawling for new tools...')
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // In real implementation:
    // - Crawl Product Hunt, AI Tools, etc.
    // - Extract tool information
    // - Validate and score tools
    // - Save to database if meets quality threshold
  }

  private async executeSEOOptimization(task: AutomationTask): Promise<void> {
    console.log('🔍 Optimizing SEO...')
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In real implementation:
    // - Analyze competitor keywords
    // - Generate meta descriptions
    // - Update structured data
    // - Optimize page content
  }

  private async executePerformanceMonitoring(task: AutomationTask): Promise<void> {
    console.log('⚡ Monitoring performance...')
    
    // Check database health
    const isHealthy = dbManager.isHealthy()
    if (!isHealthy) {
      console.warn('Database health check failed')
    }
    
    // In real implementation:
    // - Run Lighthouse audits
    // - Monitor Core Web Vitals
    // - Check error rates
    // - Optimize images and assets
    // - Clear old cache entries
  }

  private async executeMarketingAutomation(task: AutomationTask): Promise<void> {
    console.log('📢 Running marketing automation...')
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation:
    // - Post to social media
    // - Send email campaigns
    // - Reach out to influencers
    // - Generate marketing content
  }

  private recordMetrics(metrics: AutomationMetrics) {
    this.metrics.push(metrics)
    
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }
  }

  private pruneMetrics() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > oneWeekAgo)
  }

  private logHealthStatus() {
    const activeTasksCount = this.running.size
    const enabledTasksCount = Array.from(this.tasks.values()).filter(t => t.enabled).length
    const recentFailures = this.metrics
      .filter(m => m.timestamp > new Date(Date.now() - 60 * 60 * 1000) && !m.success)
      .length

    console.log(`🤖 Automation Health: ${activeTasksCount} running, ${enabledTasksCount} enabled, ${recentFailures} recent failures`)
  }

  // Public API methods
  public getTasks(): AutomationTask[] {
    return Array.from(this.tasks.values())
  }

  public getTask(id: string): AutomationTask | undefined {
    return this.tasks.get(id)
  }

  public async enableTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id)
    if (task) {
      task.enabled = true
      task.retryCount = 0
      task.nextRun = this.calculateNextRun(task.schedule, new Date())
      return true
    }
    return false
  }

  public async disableTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id)
    if (task) {
      task.enabled = false
      return true
    }
    return false
  }

  public getMetrics(taskId?: string): AutomationMetrics[] {
    if (taskId) {
      return this.metrics.filter(m => m.taskId === taskId)
    }
    return this.metrics
  }

  public getStatus() {
    const tasks = Array.from(this.tasks.values())
    return {
      totalTasks: tasks.length,
      enabledTasks: tasks.filter(t => t.enabled).length,
      runningTasks: this.running.size,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      databaseHealth: dbManager.isHealthy()
    }
  }

  public async forceRunTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id)
    if (task && !this.running.has(id)) {
      await this.executeTask(task)
      return true
    }
    return false
  }
}

export const automationManager = EnhancedAutomationManager.getInstance()
export default automationManager