/**
 * 自动化工具爬取系统
 * 自动搜索、分析和收录新的AI工具
 */

// import { WebSearch } from '@/lib/web-search'

export interface ToolSource {
  id: string
  name: string
  url: string
  type: 'directory' | 'news' | 'social' | 'github' | 'productlisting'
  selectors: {
    toolName: string
    description: string
    website: string
    category: string
    pricing: string
    rating?: string
    features?: string
  }
  crawlFrequency: 'hourly' | 'daily' | 'weekly'
  lastCrawled?: string
  isActive: boolean
}

export interface CrawledTool {
  id: string
  name: string
  description: string
  website: string
  category: string
  subcategory?: string
  pricing: {
    type: 'free' | 'freemium' | 'paid' | 'subscription'
    price?: string
    plans?: string[]
  }
  features: string[]
  tags: string[]
  screenshots: string[]
  logo?: string
  socialProof: {
    rating?: number
    reviews?: number
    users?: number
    mentions?: number
    githubStars?: number
  }
  metadata: {
    sourceId: string
    crawledAt: string
    lastUpdated: string
    language: string
    aiVerified: boolean
  }
  qualityScore: number
  status: 'pending' | 'approved' | 'rejected' | 'duplicate'
}

export interface CrawlResult {
  sourceId: string
  success: boolean
  toolsFound: number
  toolsAdded: number
  duplicates: number
  errors: string[]
  executionTime: number
  nextCrawl: string
}

export interface QualityFilter {
  minRating: number
  minUsers: number
  minFeatures: number
  mustHaveWebsite: boolean
  mustHaveDescription: boolean
  blacklistedKeywords: string[]
  requiredKeywords: string[]
  languageFilter: string[]
}

// 工具爬取管理器
export class ToolCrawler {
  private sources: ToolSource[] = []
  private qualityFilter: QualityFilter
  private isRunning = false
  private crawlQueue: string[] = []

  constructor(qualityFilter: QualityFilter) {
    this.qualityFilter = qualityFilter
    this.initializeSources()
  }

  // 初始化数据源
  private initializeSources(): void {
    this.sources = [
      {
        id: 'producthunt-ai',
        name: 'Product Hunt AI工具',
        url: 'https://www.producthunt.com/topics/artificial-intelligence',
        type: 'directory',
        selectors: {
          toolName: '[data-test="post-name"]',
          description: '[data-test="post-description"]',
          website: '[data-test="post-url"]',
          category: '.tag',
          pricing: '.pricing-badge'
        },
        crawlFrequency: 'daily',
        isActive: true
      },
      {
        id: 'github-ai-tools',
        name: 'GitHub AI项目',
        url: 'https://github.com/topics/artificial-intelligence',
        type: 'github',
        selectors: {
          toolName: 'h3 a',
          description: 'p.color-fg-muted',
          website: 'a[href*="github.com"]',
          category: '.topic-tag',
          pricing: ''
        },
        crawlFrequency: 'weekly',
        isActive: true
      },
      {
        id: 'aitools-fyi',
        name: 'AI Tools Directory',
        url: 'https://aitools.fyi',
        type: 'directory',
        selectors: {
          toolName: '.tool-name',
          description: '.tool-description',
          website: '.tool-link',
          category: '.tool-category',
          pricing: '.tool-pricing'
        },
        crawlFrequency: 'daily',
        isActive: true
      },
      {
        id: 'futurepedia',
        name: 'Futurepedia',
        url: 'https://www.futurepedia.io',
        type: 'directory',
        selectors: {
          toolName: '.tool-card h3',
          description: '.tool-card p',
          website: '.tool-card a[href]',
          category: '.category-tag',
          pricing: '.pricing-tag'
        },
        crawlFrequency: 'daily',
        isActive: true
      },
      {
        id: 'theresanaiforthat',
        name: 'There\'s An AI For That',
        url: 'https://theresanaiforthat.com',
        type: 'directory',
        selectors: {
          toolName: '.ai-tool-name',
          description: '.ai-tool-description',
          website: '.ai-tool-link',
          category: '.ai-category',
          pricing: '.pricing-info'
        },
        crawlFrequency: 'daily',
        isActive: true
      }
    ]
  }

  // 启动自动爬取
  async startAutoCrawling(): Promise<void> {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🔍 启动自动工具爬取系统...')
    
    // 启动定时爬取任务
    this.scheduleRegularCrawls()
    
    // 启动实时监控
    this.startRealTimeMonitoring()
  }

  // 停止自动爬取
  async stopAutoCrawling(): Promise<void> {
    this.isRunning = false
    console.log('🛑 工具爬取系统已停止')
  }

  // 定时爬取调度
  private scheduleRegularCrawls(): void {
    setInterval(() => {
      this.sources.forEach(source => {
        if (source.isActive && this.shouldCrawl(source)) {
          this.crawlQueue.push(source.id)
        }
      })
    }, 60 * 60 * 1000) // 每小时检查
    
    // 处理爬取队列
    setInterval(() => {
      this.processQueue()
    }, 30 * 1000) // 每30秒处理一个
  }

  // 实时监控新工具
  private startRealTimeMonitoring(): void {
    // 监控社交媒体提及
    setInterval(() => {
      this.monitorSocialMentions()
    }, 15 * 60 * 1000) // 每15分钟
    
    // 监控新闻和博客
    setInterval(() => {
      this.monitorNewsAndBlogs()
    }, 30 * 60 * 1000) // 每30分钟
  }

  // 爬取单个数据源
  async crawlSource(sourceId: string): Promise<CrawlResult> {
    const source = this.sources.find(s => s.id === sourceId)
    if (!source) {
      throw new Error(`未找到数据源: ${sourceId}`)
    }

    const startTime = Date.now()
    const result: CrawlResult = {
      sourceId,
      success: false,
      toolsFound: 0,
      toolsAdded: 0,
      duplicates: 0,
      errors: [],
      executionTime: 0,
      nextCrawl: this.calculateNextCrawl(source.crawlFrequency)
    }

    try {
      console.log(`🔍 开始爬取: ${source.name}`)
      
      const tools = await this.extractToolsFromSource(source)
      result.toolsFound = tools.length
      
      for (const tool of tools) {
        // 质量过滤
        if (!this.passesQualityFilter(tool)) {
          continue
        }
        
        // 重复检查
        if (await this.isDuplicate(tool)) {
          result.duplicates++
          continue
        }
        
        // AI验证
        tool.metadata.aiVerified = await this.verifyWithAI(tool)
        
        // 保存工具
        await this.saveTool(tool)
        result.toolsAdded++
      }
      
      source.lastCrawled = new Date().toISOString()
      result.success = true
      
      console.log(`✅ 爬取完成: ${source.name}, 新增${result.toolsAdded}个工具`)
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error))
      console.error(`❌ 爬取失败: ${source.name}`, error)
    }
    
    result.executionTime = Date.now() - startTime
    return result
  }

  // 从数据源提取工具
  private async extractToolsFromSource(source: ToolSource): Promise<CrawledTool[]> {
    const tools: CrawledTool[] = []
    
    try {
      // 这里使用网页爬取或API调用
      const html = await this.fetchPageContent(source.url)
      const extractedData = await this.parseHtmlWithSelectors(html, source.selectors)
      
      for (const data of extractedData) {
        const tool: CrawledTool = {
          id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name.trim(),
          description: data.description.trim(),
          website: data.website,
          category: this.normalizeCategory(data.category),
          pricing: this.parsePricing(data.pricing),
          features: await this.extractFeatures(data.description),
          tags: await this.generateTags(data.name, data.description, data.category),
          screenshots: [],
          socialProof: {
            rating: data.rating ? parseFloat(data.rating) : undefined
          },
          metadata: {
            sourceId: source.id,
            crawledAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            language: 'en',
            aiVerified: false
          },
          qualityScore: 0,
          status: 'pending'
        }
        
        // 计算质量分数
        tool.qualityScore = await this.calculateQualityScore(tool)
        
        tools.push(tool)
      }
      
    } catch (error) {
      console.error(`提取工具失败: ${source.name}`, error)
    }
    
    return tools
  }

  // 获取网页内容
  private async fetchPageContent(url: string): Promise<string> {
    // 这里使用适当的HTTP客户端或浏览器自动化工具
    // 模拟返回
    return '<html>...</html>'
  }

  // 使用选择器解析HTML
  private async parseHtmlWithSelectors(html: string, selectors: any): Promise<any[]> {
    // 这里使用cheerio或类似的HTML解析库
    // 模拟返回数据
    return [
      {
        name: 'Example AI Tool',
        description: 'An amazing AI tool for productivity',
        website: 'https://example.com',
        category: 'Productivity',
        pricing: 'Freemium',
        rating: '4.5'
      }
    ]
  }

  // 质量过滤
  private passesQualityFilter(tool: CrawledTool): boolean {
    // 检查必要字段
    if (this.qualityFilter.mustHaveWebsite && !tool.website) return false
    if (this.qualityFilter.mustHaveDescription && (!tool.description || tool.description.length < 20)) return false
    
    // 检查黑名单关键词
    const content = `${tool.name} ${tool.description}`.toLowerCase()
    for (const keyword of this.qualityFilter.blacklistedKeywords) {
      if (content.includes(keyword.toLowerCase())) return false
    }
    
    // 检查必需关键词
    if (this.qualityFilter.requiredKeywords.length > 0) {
      const hasRequired = this.qualityFilter.requiredKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      )
      if (!hasRequired) return false
    }
    
    // 检查评分
    if (tool.socialProof.rating && tool.socialProof.rating < this.qualityFilter.minRating) return false
    
    // 检查用户数
    if (tool.socialProof.users && tool.socialProof.users < this.qualityFilter.minUsers) return false
    
    // 检查功能数量
    if (tool.features.length < this.qualityFilter.minFeatures) return false
    
    return true
  }

  // 重复检查
  private async isDuplicate(tool: CrawledTool): Promise<boolean> {
    // 这里查询数据库检查是否已存在相同工具
    // 可以通过名称、网站或描述相似度判断
    return false
  }

  // AI验证
  private async verifyWithAI(tool: CrawledTool): Promise<boolean> {
    // 使用AI模型验证工具信息的准确性和完整性
    // 检查描述是否合理、分类是否正确等
    return true
  }

  // 保存工具
  private async saveTool(tool: CrawledTool): Promise<void> {
    // 保存到数据库
    console.log(`保存工具: ${tool.name}`)
  }

  // 监控社交媒体提及
  private async monitorSocialMentions(): Promise<void> {
    console.log('🐦 监控社交媒体新工具提及...')
    
    const platforms = ['twitter', 'reddit', 'hackernews']
    const keywords = ['new AI tool', 'AI launch', 'artificial intelligence']
    
    for (const platform of platforms) {
      for (const keyword of keywords) {
        try {
          const mentions = await this.searchSocialMentions(platform, keyword)
          await this.processSocialMentions(mentions)
        } catch (error) {
          console.error(`监控${platform}失败:`, error)
        }
      }
    }
  }

  // 监控新闻和博客
  private async monitorNewsAndBlogs(): Promise<void> {
    console.log('📰 监控AI新闻和博客...')
    
    const sources = [
      'https://news.ycombinator.com',
      'https://techcrunch.com/category/artificial-intelligence',
      'https://venturebeat.com/ai',
      'https://www.theverge.com/ai-artificial-intelligence'
    ]
    
    for (const source of sources) {
      try {
        const articles = await this.fetchNewsArticles(source)
        await this.extractToolsFromNews(articles)
      } catch (error) {
        console.error(`监控新闻失败:`, error)
      }
    }
  }

  // 辅助方法
  private shouldCrawl(source: ToolSource): boolean {
    if (!source.lastCrawled) return true
    
    const lastCrawl = new Date(source.lastCrawled)
    const now = new Date()
    const diffHours = (now.getTime() - lastCrawl.getTime()) / (1000 * 60 * 60)
    
    switch (source.crawlFrequency) {
      case 'hourly': return diffHours >= 1
      case 'daily': return diffHours >= 24
      case 'weekly': return diffHours >= 168
      default: return false
    }
  }

  private async processQueue(): Promise<void> {
    if (this.crawlQueue.length === 0) return
    
    const sourceId = this.crawlQueue.shift()
    if (sourceId) {
      await this.crawlSource(sourceId)
    }
  }

  private calculateNextCrawl(frequency: string): string {
    const now = new Date()
    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  private normalizeCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'productivity': '生产力工具',
      'writing': 'AI写作',
      'design': 'AI设计',
      'development': 'AI编程',
      'marketing': 'AI营销',
      'analysis': '数据分析'
    }
    
    return categoryMap[category.toLowerCase()] || category
  }

  private parsePricing(pricingText: string): any {
    const text = pricingText.toLowerCase()
    
    if (text.includes('free')) {
      return { type: 'free', price: '免费' }
    } else if (text.includes('freemium')) {
      return { type: 'freemium', price: '免费试用' }
    } else if (text.includes('$') || text.includes('€') || text.includes('¥')) {
      return { type: 'paid', price: pricingText }
    } else {
      return { type: 'subscription', price: '订阅制' }
    }
  }

  private async extractFeatures(description: string): Promise<string[]> {
    // 使用NLP或关键词匹配提取功能
    const commonFeatures = [
      'AI生成', '自动化', '智能分析', '实时处理',
      '多语言支持', 'API集成', '云存储', '协作功能'
    ]
    
    return commonFeatures.filter(feature => 
      description.toLowerCase().includes(feature.toLowerCase())
    ).slice(0, 5)
  }

  private async generateTags(name: string, description: string, category: string): Promise<string[]> {
    const text = `${name} ${description} ${category}`.toLowerCase()
    const baseTags = ['AI', '人工智能']
    
    const conditionalTags = [
      { keyword: 'text', tag: '文本处理' },
      { keyword: 'image', tag: '图像处理' },
      { keyword: 'video', tag: '视频处理' },
      { keyword: 'chat', tag: '聊天机器人' },
      { keyword: 'business', tag: '商业工具' }
    ]
    
    conditionalTags.forEach(({ keyword, tag }) => {
      if (text.includes(keyword)) {
        baseTags.push(tag)
      }
    })
    
    return baseTags.slice(0, 8)
  }

  private async calculateQualityScore(tool: CrawledTool): Promise<number> {
    let score = 50 // 基础分
    
    // 描述质量
    if (tool.description.length > 100) score += 10
    if (tool.description.length > 200) score += 10
    
    // 功能数量
    score += Math.min(tool.features.length * 5, 20)
    
    // 有网站
    if (tool.website) score += 10
    
    // 有评分
    if (tool.socialProof.rating) {
      score += tool.socialProof.rating * 5
    }
    
    // 有用户数
    if (tool.socialProof.users && tool.socialProof.users > 1000) score += 15
    
    return Math.min(score, 100)
  }

  private async searchSocialMentions(platform: string, keyword: string): Promise<any[]> {
    // 这里调用社交媒体API搜索
    return []
  }

  private async processSocialMentions(mentions: any[]): Promise<void> {
    // 处理社交媒体提及，提取可能的新工具
  }

  private async fetchNewsArticles(source: string): Promise<any[]> {
    // 获取新闻文章
    return []
  }

  private async extractToolsFromNews(articles: any[]): Promise<void> {
    // 从新闻文章中提取工具信息
  }

  // 获取爬取统计
  getStatistics(): {
    totalSources: number
    activeSources: number
    toolsCrawledToday: number
    successRate: number
    queueLength: number
  } {
    return {
      totalSources: this.sources.length,
      activeSources: this.sources.filter(s => s.isActive).length,
      toolsCrawledToday: 0, // 需要从数据库查询
      successRate: 85, // 需要计算
      queueLength: this.crawlQueue.length
    }
  }

  // 添加新数据源
  addSource(source: Omit<ToolSource, 'id'>): string {
    const newSource: ToolSource = {
      ...source,
      id: `source-${Date.now()}`
    }
    
    this.sources.push(newSource)
    return newSource.id
  }

  // 更新数据源
  updateSource(id: string, updates: Partial<ToolSource>): boolean {
    const index = this.sources.findIndex(s => s.id === id)
    if (index === -1) return false
    
    this.sources[index] = { ...this.sources[index], ...updates }
    return true
  }

  // 删除数据源
  removeSource(id: string): boolean {
    const index = this.sources.findIndex(s => s.id === id)
    if (index === -1) return false
    
    this.sources.splice(index, 1)
    return true
  }
}