/**
 * 自动化系统初始化脚本
 * 启动所有自动化服务和监控系统
 */

import { AutomationManager, AutomationConfig } from '@/lib/automation-manager'
import { AIContentGenerator } from '@/lib/ai-content-generator'
import { ToolCrawler, QualityFilter } from '@/lib/tool-crawler'

// 默认自动化配置
const defaultConfig: AutomationConfig = {
  contentGeneration: {
    enabled: true,
    frequency: 'daily',
    types: ['blog', 'tool-review', 'tutorial'],
    aiModel: 'gpt-4',
    qualityThreshold: 80
  },
  toolCrawling: {
    enabled: true,
    sources: [
      'https://www.producthunt.com/topics/artificial-intelligence',
      'https://github.com/topics/artificial-intelligence',
      'https://www.futurepedia.io',
      'https://theresanaiforthat.com'
    ],
    frequency: 'daily',
    autoApproval: false,
    qualityFilter: {
      minRating: 4.0,
      minUsers: 1000,
      mustHaveDemo: false
    }
  },
  seoOptimization: {
    enabled: true,
    autoKeywordResearch: true,
    autoMetaGeneration: true,
    autoStructuredData: true,
    competitorAnalysis: true
  },
  performanceOptimization: {
    enabled: true,
    autoImageOptimization: true,
    autoCaching: true,
    autoLazyLoading: true,
    performanceThreshold: 90
  },
  marketing: {
    enabled: true,
    autoSocialPosting: true,
    autoEmailCampaigns: false,
    autoInfluencerOutreach: false,
    platforms: ['twitter', 'linkedin']
  }
}

// 质量过滤器配置
const qualityFilter: QualityFilter = {
  minRating: 4.0,
  minUsers: 1000,
  minFeatures: 3,
  mustHaveWebsite: true,
  mustHaveDescription: true,
  blacklistedKeywords: ['scam', 'fake', 'illegal', 'adult'],
  requiredKeywords: ['ai', 'artificial intelligence', 'machine learning', 'automation'],
  languageFilter: ['en', 'zh', 'zh-CN']
}

// 自动化管理器实例
let automationManager: AutomationManager | null = null
let contentGenerator: AIContentGenerator | null = null
let toolCrawler: ToolCrawler | null = null

/**
 * 初始化自动化系统
 */
export async function initializeAutomation(config: AutomationConfig = defaultConfig): Promise<void> {
  try {
    console.log('🚀 初始化AI自动化系统...')
    
    // 初始化内容生成器
    if (config.contentGeneration.enabled) {
      contentGenerator = new AIContentGenerator()
      console.log('✅ 内容生成器初始化完成')
    }
    
    // 初始化工具爬取器
    if (config.toolCrawling.enabled) {
      toolCrawler = new ToolCrawler(qualityFilter)
      await toolCrawler.startAutoCrawling()
      console.log('✅ 工具爬取器初始化完成')
    }
    
    // 初始化自动化管理器
    automationManager = new AutomationManager(config)
    await automationManager.start()
    
    console.log('🎉 AI自动化系统启动成功！')
    
    // 输出系统状态
    const status = automationManager.getStatus()
    console.log('📊 系统状态:', status)
    
  } catch (error) {
    console.error('❌ 自动化系统初始化失败:', error)
    throw error
  }
}

/**
 * 停止自动化系统
 */
export async function stopAutomation(): Promise<void> {
  try {
    console.log('🛑 停止AI自动化系统...')
    
    if (automationManager) {
      await automationManager.stop()
      automationManager = null
    }
    
    if (toolCrawler) {
      await toolCrawler.stopAutoCrawling()
      toolCrawler = null
    }
    
    contentGenerator = null
    
    console.log('✅ AI自动化系统已停止')
    
  } catch (error) {
    console.error('❌ 停止自动化系统失败:', error)
    throw error
  }
}

/**
 * 重启自动化系统
 */
export async function restartAutomation(config?: AutomationConfig): Promise<void> {
  await stopAutomation()
  await initializeAutomation(config)
}

/**
 * 获取系统状态
 */
export function getSystemStatus() {
  if (!automationManager) {
    return {
      running: false,
      message: '自动化系统未启动'
    }
  }
  
  return {
    running: true,
    automation: automationManager.getStatus(),
    crawler: toolCrawler?.getStatistics(),
    timestamp: new Date().toISOString()
  }
}

/**
 * 更新配置
 */
export async function updateConfig(newConfig: Partial<AutomationConfig>): Promise<void> {
  if (!automationManager) {
    throw new Error('自动化系统未启动')
  }
  
  // 合并配置
  const currentConfig = { ...defaultConfig, ...newConfig }
  
  // 重启系统以应用新配置
  await restartAutomation(currentConfig)
}

/**
 * 手动触发内容生成
 */
export async function triggerContentGeneration(request: {
  type: 'blog' | 'tool-review' | 'tutorial' | 'news' | 'comparison'
  topic: string
  targetKeywords: string[]
  audience: 'beginner' | 'intermediate' | 'expert'
  length: 'short' | 'medium' | 'long'
  tone: 'professional' | 'casual' | 'technical'
}) {
  if (!contentGenerator) {
    throw new Error('内容生成器未初始化')
  }
  
  return await contentGenerator.generateContent(request)
}

/**
 * 手动触发工具爬取
 */
export async function triggerToolCrawling(sourceId?: string) {
  if (!toolCrawler) {
    throw new Error('工具爬取器未初始化')
  }
  
  if (sourceId) {
    return await toolCrawler.crawlSource(sourceId)
  } else {
    // 触发所有源的爬取
    const stats = toolCrawler.getStatistics()
    console.log('开始全量爬取，当前活跃源数量:', stats.activeSources)
  }
}

/**
 * 获取详细统计信息
 */
export function getDetailedStats() {
  return {
    system: getSystemStatus(),
    content: contentGenerator ? {
      available: true,
      // 这里可以添加内容生成统计
    } : { available: false },
    crawler: toolCrawler ? toolCrawler.getStatistics() : { available: false },
    timestamp: new Date().toISOString()
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'error'
  details: Record<string, any>
}> {
  const details: Record<string, any> = {}
  let status: 'healthy' | 'warning' | 'error' = 'healthy'
  
  try {
    // 检查自动化管理器
    if (automationManager) {
      const automationStatus = automationManager.getStatus()
      details.automation = automationStatus
      
      if (automationStatus.errorRate > 5) {
        status = 'warning'
      }
      if (automationStatus.errorRate > 15) {
        status = 'error'
      }
    } else {
      details.automation = { running: false }
      status = 'error'
    }
    
    // 检查工具爬取器
    if (toolCrawler) {
      const crawlerStats = toolCrawler.getStatistics()
      details.crawler = crawlerStats
      
      if (crawlerStats.successRate < 80) {
        status = status === 'healthy' ? 'warning' : status
      }
      if (crawlerStats.successRate < 60) {
        status = 'error'
      }
    }
    
    // 检查内容生成器
    details.contentGenerator = {
      available: !!contentGenerator
    }
    
  } catch (error) {
    details.error = error instanceof Error ? error.message : String(error)
    status = 'error'
  }
  
  return { status, details }
}

// 导出实例（仅供调试使用）
export { automationManager, contentGenerator, toolCrawler }