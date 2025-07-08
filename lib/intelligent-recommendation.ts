/**
 * 智能推荐引擎和个性化内容系统
 * 基于用户行为、偏好和AI分析的个性化推荐
 */

export interface UserProfile {
  id: string
  preferences: {
    categories: string[]
    pricingTypes: ('free' | 'freemium' | 'paid')[] 
    industries: string[]
    experienceLevel: 'beginner' | 'intermediate' | 'expert'
    languages: string[]
  }
  behavior: {
    viewHistory: {
      toolId: string
      timestamp: string
      duration: number
      source: string
    }[]
    searches: {
      query: string
      timestamp: string
      resultsClicked: string[]
    }[]
    interactions: {
      type: 'like' | 'bookmark' | 'share' | 'trial' | 'review'
      toolId: string
      timestamp: string
      rating?: number
    }[]
    contextualData: {
      timeOfDay: number[]
      dayOfWeek: number[]
      sessionDuration: number[]
      deviceType: ('desktop' | 'mobile' | 'tablet')[]
    }
  }
  demographics: {
    country: string
    timezone: string
    role: string
    companySize: string
  }
}

export interface RecommendationContext {
  userId?: string
  currentTool?: string
  currentCategory?: string
  searchQuery?: string
  timeContext: {
    isWorkingHours: boolean
    dayOfWeek: string
    season: string
  }
  sessionContext: {
    pagesViewed: string[]
    timeSpent: number
    source: string
  }
}

export interface RecommendationResult {
  toolId: string
  score: number
  reasons: string[]
  confidence: number
  category: string
  metadata: {
    algorithm: string
    factors: Record<string, number>
    timestamp: string
  }
}

export interface ContentPersonalization {
  heroContent: {
    title: string
    subtitle: string
    ctaText: string
    backgroundTheme: string
  }
  featuredTools: string[]
  recommendedCategories: string[]
  personalizedSections: {
    type: 'trending' | 'new' | 'recommended' | 'similar'
    title: string
    tools: string[]
    explanation: string
  }[]
  contentTone: 'professional' | 'casual' | 'technical'
  complexityLevel: 'basic' | 'intermediate' | 'advanced'
}

export class IntelligentRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map()
  private toolEmbeddings: Map<string, number[]> = new Map()
  private globalTrends: Map<string, number> = new Map()
  
  constructor() {
    this.initializeEmbeddings()
    this.loadGlobalTrends()
  }

  // 初始化工具向量嵌入
  private initializeEmbeddings(): void {
    // 模拟预训练的工具向量嵌入
    const sampleEmbeddings = {
      'chatgpt': this.generateEmbedding(['ai', 'conversation', 'text', 'writing', 'productivity']),
      'midjourney': this.generateEmbedding(['ai', 'image', 'art', 'design', 'creative']),
      'github-copilot': this.generateEmbedding(['ai', 'code', 'programming', 'development', 'productivity']),
      'notion-ai': this.generateEmbedding(['ai', 'notes', 'productivity', 'organization', 'writing']),
      'claude': this.generateEmbedding(['ai', 'conversation', 'analysis', 'writing', 'research'])
    }
    
    Object.entries(sampleEmbeddings).forEach(([toolId, embedding]) => {
      this.toolEmbeddings.set(toolId, embedding)
    })
  }

  // 生成工具向量嵌入
  private generateEmbedding(features: string[]): number[] {
    // 简化的向量生成（实际中会使用预训练模型）
    const dimensions = 128
    const embedding = new Array(dimensions).fill(0)
    
    features.forEach((feature, i) => {
      const hash = this.simpleHash(feature)
      for (let j = 0; j < dimensions; j++) {
        embedding[j] += Math.sin(hash + j) * 0.1
      }
    })
    
    return this.normalizeVector(embedding)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return vector.map(val => val / magnitude)
  }

  // 加载全局趋势
  private loadGlobalTrends(): void {
    this.globalTrends.set('ai-writing', 0.85)
    this.globalTrends.set('ai-coding', 0.92)
    this.globalTrends.set('ai-design', 0.78)
    this.globalTrends.set('productivity', 0.81)
    this.globalTrends.set('automation', 0.88)
  }

  // 更新用户档案
  updateUserProfile(userId: string, interaction: {
    type: 'view' | 'search' | 'like' | 'bookmark' | 'trial'
    data: any
  }): void {
    let profile = this.userProfiles.get(userId)
    
    if (!profile) {
      profile = this.createDefaultProfile(userId)
      this.userProfiles.set(userId, profile)
    }

    switch (interaction.type) {
      case 'view':
        profile.behavior.viewHistory.push({
          toolId: interaction.data.toolId,
          timestamp: new Date().toISOString(),
          duration: interaction.data.duration || 0,
          source: interaction.data.source || 'direct'
        })
        break
        
      case 'search':
        profile.behavior.searches.push({
          query: interaction.data.query,
          timestamp: new Date().toISOString(),
          resultsClicked: interaction.data.resultsClicked || []
        })
        break
        
      case 'like':
      case 'bookmark':
      case 'trial':
        profile.behavior.interactions.push({
          type: interaction.type,
          toolId: interaction.data.toolId,
          timestamp: new Date().toISOString(),
          rating: interaction.data.rating
        })
        break
    }

    // 更新偏好
    this.updatePreferences(profile, interaction)
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        categories: [],
        pricingTypes: ['free', 'freemium'],
        industries: [],
        experienceLevel: 'intermediate',
        languages: ['zh', 'en']
      },
      behavior: {
        viewHistory: [],
        searches: [],
        interactions: [],
        contextualData: {
          timeOfDay: [],
          dayOfWeek: [],
          sessionDuration: [],
          deviceType: []
        }
      },
      demographics: {
        country: 'CN',
        timezone: 'Asia/Shanghai',
        role: 'unknown',
        companySize: 'unknown'
      }
    }
  }

  private updatePreferences(profile: UserProfile, interaction: any): void {
    // 基于交互更新用户偏好
    if (interaction.data.category && !profile.preferences.categories.includes(interaction.data.category)) {
      profile.preferences.categories.push(interaction.data.category)
    }
  }

  // 生成个性化推荐
  async generateRecommendations(
    userId: string, 
    context: RecommendationContext,
    count: number = 10
  ): Promise<RecommendationResult[]> {
    const profile = this.userProfiles.get(userId)
    const recommendations: RecommendationResult[] = []

    // 1. 协同过滤推荐
    const collaborativeRecs = await this.collaborativeFiltering(profile, count / 3)
    recommendations.push(...collaborativeRecs)

    // 2. 内容过滤推荐
    const contentRecs = await this.contentBasedFiltering(profile, context, count / 3)
    recommendations.push(...contentRecs)

    // 3. 混合推荐
    const hybridRecs = await this.hybridRecommendation(profile, context, count / 3)
    recommendations.push(...hybridRecs)

    // 4. 趋势推荐
    const trendingRecs = await this.trendingRecommendation(context, count / 4)
    recommendations.push(...trendingRecs)

    // 去重并排序
    const uniqueRecs = this.deduplicateRecommendations(recommendations)
    return uniqueRecs.slice(0, count)
  }

  // 协同过滤
  private async collaborativeFiltering(
    profile: UserProfile | undefined, 
    count: number
  ): Promise<RecommendationResult[]> {
    if (!profile) return []

    // 找到相似用户
    const similarUsers = this.findSimilarUsers(profile)
    const recommendations: RecommendationResult[] = []

    similarUsers.slice(0, 5).forEach(similarUser => {
      similarUser.behavior.interactions
        .filter(interaction => interaction.type === 'like' && interaction.rating && interaction.rating >= 4)
        .forEach(interaction => {
          const hasUserInteracted = profile.behavior.interactions
            .some(userInteraction => userInteraction.toolId === interaction.toolId)
          
          if (!hasUserInteracted) {
            recommendations.push({
              toolId: interaction.toolId,
              score: 0.8,
              reasons: ['相似用户喜欢', '高评分工具'],
              confidence: 0.75,
              category: 'collaborative',
              metadata: {
                algorithm: 'collaborative-filtering',
                factors: { userSimilarity: 0.8, rating: interaction.rating || 0 },
                timestamp: new Date().toISOString()
              }
            })
          }
        })
    })

    return recommendations.slice(0, count)
  }

  // 基于内容的过滤
  private async contentBasedFiltering(
    profile: UserProfile | undefined,
    context: RecommendationContext,
    count: number
  ): Promise<RecommendationResult[]> {
    if (!profile) return []

    const recommendations: RecommendationResult[] = []
    const userVector = this.buildUserVector(profile)

    // 计算工具相似度
    this.toolEmbeddings.forEach((toolEmbedding, toolId) => {
      const similarity = this.cosineSimilarity(userVector, toolEmbedding)
      
      if (similarity > 0.5) {
        recommendations.push({
          toolId,
          score: similarity,
          reasons: ['符合您的兴趣偏好', '基于历史行为推荐'],
          confidence: similarity,
          category: 'content-based',
          metadata: {
            algorithm: 'content-based-filtering',
            factors: { similarity, categoryMatch: 0.7 },
            timestamp: new Date().toISOString()
          }
        })
      }
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }

  // 混合推荐
  private async hybridRecommendation(
    profile: UserProfile | undefined,
    context: RecommendationContext,
    count: number
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = []

    // 基于上下文的推荐
    if (context.currentCategory) {
      const categoryRecs = await this.getCategoryRecommendations(context.currentCategory, count / 2)
      recommendations.push(...categoryRecs)
    }

    // 基于搜索查询的推荐
    if (context.searchQuery) {
      const searchRecs = await this.getSearchBasedRecommendations(context.searchQuery, count / 2)
      recommendations.push(...searchRecs)
    }

    return recommendations.slice(0, count)
  }

  // 趋势推荐
  private async trendingRecommendation(
    context: RecommendationContext,
    count: number
  ): Promise<RecommendationResult[]> {
    const trendingTools = ['chatgpt', 'midjourney', 'github-copilot', 'claude', 'notion-ai']
    
    return trendingTools.slice(0, count).map(toolId => ({
      toolId,
      score: 0.7 + Math.random() * 0.2,
      reasons: ['当前热门工具', '用户评价很高'],
      confidence: 0.6,
      category: 'trending',
      metadata: {
        algorithm: 'trending-recommendation',
        factors: { trendScore: 0.8, globalPopularity: 0.9 },
        timestamp: new Date().toISOString()
      }
    }))
  }

  // 辅助方法
  private findSimilarUsers(profile: UserProfile): UserProfile[] {
    // 简化的用户相似度计算
    const allUsers = Array.from(this.userProfiles.values())
    return allUsers
      .filter(user => user.id !== profile.id)
      .sort((a, b) => this.calculateUserSimilarity(profile, b) - this.calculateUserSimilarity(profile, a))
  }

  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    // 简化的相似度计算
    const categoryOverlap = user1.preferences.categories.filter(cat => 
      user2.preferences.categories.includes(cat)
    ).length
    
    const maxCategories = Math.max(user1.preferences.categories.length, user2.preferences.categories.length)
    return maxCategories > 0 ? categoryOverlap / maxCategories : 0
  }

  private buildUserVector(profile: UserProfile): number[] {
    // 基于用户行为构建向量
    const vector = new Array(128).fill(0)
    
    profile.behavior.viewHistory.forEach(view => {
      const toolEmbedding = this.toolEmbeddings.get(view.toolId)
      if (toolEmbedding) {
        for (let i = 0; i < vector.length; i++) {
          vector[i] += toolEmbedding[i] * 0.1
        }
      }
    })
    
    return this.normalizeVector(vector)
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0
  }

  private async getCategoryRecommendations(category: string, count: number): Promise<RecommendationResult[]> {
    // 模拟分类推荐
    const categoryTools = ['tool1', 'tool2', 'tool3', 'tool4', 'tool5']
    
    return categoryTools.slice(0, count).map(toolId => ({
      toolId,
      score: 0.6 + Math.random() * 0.3,
      reasons: [`${category}类别热门工具`],
      confidence: 0.7,
      category: 'category-based',
      metadata: {
        algorithm: 'category-recommendation',
        factors: { categoryRelevance: 0.9 },
        timestamp: new Date().toISOString()
      }
    }))
  }

  private async getSearchBasedRecommendations(query: string, count: number): Promise<RecommendationResult[]> {
    // 模拟搜索推荐
    const searchResults = ['search1', 'search2', 'search3']
    
    return searchResults.slice(0, count).map(toolId => ({
      toolId,
      score: 0.7 + Math.random() * 0.2,
      reasons: [`与搜索"${query}"相关`],
      confidence: 0.8,
      category: 'search-based',
      metadata: {
        algorithm: 'search-recommendation',
        factors: { queryRelevance: 0.8 },
        timestamp: new Date().toISOString()
      }
    }))
  }

  private deduplicateRecommendations(recommendations: RecommendationResult[]): RecommendationResult[] {
    const seen = new Set<string>()
    return recommendations.filter(rec => {
      if (seen.has(rec.toolId)) {
        return false
      }
      seen.add(rec.toolId)
      return true
    }).sort((a, b) => b.score - a.score)
  }

  // 生成个性化内容
  async generatePersonalizedContent(
    userId: string,
    context: RecommendationContext
  ): Promise<ContentPersonalization> {
    const profile = this.userProfiles.get(userId)
    const recommendations = await this.generateRecommendations(userId, context, 20)

    return {
      heroContent: this.generateHeroContent(profile),
      featuredTools: recommendations.slice(0, 6).map(r => r.toolId),
      recommendedCategories: profile?.preferences.categories.slice(0, 4) || ['ai-writing', 'productivity'],
      personalizedSections: [
        {
          type: 'recommended',
          title: '为您推荐',
          tools: recommendations.filter(r => r.category === 'content-based').slice(0, 4).map(r => r.toolId),
          explanation: '基于您的使用偏好'
        },
        {
          type: 'trending',
          title: '当前热门',
          tools: recommendations.filter(r => r.category === 'trending').slice(0, 4).map(r => r.toolId),
          explanation: '最受欢迎的AI工具'
        },
        {
          type: 'similar',
          title: '相似推荐',
          tools: recommendations.filter(r => r.category === 'collaborative').slice(0, 4).map(r => r.toolId),
          explanation: '相似用户也在使用'
        }
      ],
      contentTone: this.determineContentTone(profile),
      complexityLevel: this.determineComplexityLevel(profile)
    }
  }

  private generateHeroContent(profile: UserProfile | undefined): ContentPersonalization['heroContent'] {
    const experienceLevel = profile?.preferences.experienceLevel || 'intermediate'
    
    const heroVariants = {
      beginner: {
        title: '发现适合您的AI工具',
        subtitle: '从基础应用开始，逐步探索AI的无限可能',
        ctaText: '开始探索',
        backgroundTheme: 'gentle'
      },
      intermediate: {
        title: '提升工作效率的AI助手',
        subtitle: '精选高质量AI工具，让您的工作事半功倍',
        ctaText: '查看推荐',
        backgroundTheme: 'professional'
      },
      expert: {
        title: '前沿AI技术与解决方案',
        subtitle: '深度分析最新AI技术，助您保持技术领先',
        ctaText: '深度探索',
        backgroundTheme: 'cutting-edge'
      }
    }

    return heroVariants[experienceLevel]
  }

  private determineContentTone(profile: UserProfile | undefined): ContentPersonalization['contentTone'] {
    if (!profile) return 'professional'
    
    const role = profile.demographics.role
    if (role.includes('developer') || role.includes('engineer')) {
      return 'technical'
    }
    if (role.includes('manager') || role.includes('business')) {
      return 'professional'
    }
    return 'casual'
  }

  private determineComplexityLevel(profile: UserProfile | undefined): ContentPersonalization['complexityLevel'] {
    if (!profile) return 'intermediate'
    
    const experienceLevel = profile.preferences.experienceLevel
    const complexityMap = {
      beginner: 'basic' as const,
      intermediate: 'intermediate' as const,
      expert: 'advanced' as const
    }
    
    return complexityMap[experienceLevel]
  }

  // A/B测试支持
  async runABTest(
    userId: string,
    testVariants: {
      variant: string
      weight: number
      recommendations: RecommendationResult[]
    }[]
  ): Promise<{
    selectedVariant: string
    recommendations: RecommendationResult[]
  }> {
    // 基于用户ID的一致性哈希选择变体
    const hash = this.simpleHash(userId)
    const normalizedHash = Math.abs(hash) / Math.pow(2, 31)
    
    let cumulativeWeight = 0
    for (const variant of testVariants) {
      cumulativeWeight += variant.weight
      if (normalizedHash <= cumulativeWeight) {
        return {
          selectedVariant: variant.variant,
          recommendations: variant.recommendations
        }
      }
    }
    
    // 默认返回第一个变体
    return {
      selectedVariant: testVariants[0].variant,
      recommendations: testVariants[0].recommendations
    }
  }

  // 获取推荐解释
  explainRecommendation(recommendation: RecommendationResult): {
    primaryReason: string
    detailedExplanation: string
    confidence: string
  } {
    const confidenceLabels = {
      high: '高度推荐',
      medium: '推荐',
      low: '可能感兴趣'
    }
    
    const confidenceLevel = recommendation.confidence > 0.8 ? 'high' : 
                         recommendation.confidence > 0.6 ? 'medium' : 'low'
    
    return {
      primaryReason: recommendation.reasons[0] || '基于您的使用偏好',
      detailedExplanation: `基于${recommendation.metadata.algorithm}算法分析，考虑了${Object.keys(recommendation.metadata.factors).join('、')}等因素`,
      confidence: confidenceLabels[confidenceLevel]
    }
  }
}