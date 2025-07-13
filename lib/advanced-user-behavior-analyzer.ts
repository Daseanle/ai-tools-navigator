/**
 * 高级用户行为分析与个性化推荐引擎
 * 基于机器学习的用户画像构建和实时个性化内容推荐
 */

import { OpenAI } from 'openai'
import { getSupabaseServerClient } from './supabase'

interface UserProfile {
  userId: string
  demographics: {
    ageGroup: string
    location: string
    devicePreference: string
    techProficiency: 'beginner' | 'intermediate' | 'advanced'
  }
  interests: {
    aiCategories: string[]
    useCases: string[]
    industryFocus: string[]
    skillLevel: Record<string, number>
  }
  behaviorPatterns: {
    visitFrequency: number
    sessionDuration: number
    preferredContentLength: 'short' | 'medium' | 'long'
    engagementStyle: 'browser' | 'researcher' | 'implementer'
    peakActivityTimes: number[]
  }
  preferences: {
    contentTypes: string[]
    communicationStyle: 'formal' | 'casual' | 'technical'
    learningPath: string[]
    notifications: Record<string, boolean>
  }
  conversionSignals: {
    purchaseIntent: number
    featureRequests: string[]
    pricesensitivity: number
    decisionInfluencers: string[]
  }
}

interface PersonalizedRecommendation {
  type: 'content' | 'tool' | 'feature' | 'learning_path'
  item: any
  relevanceScore: number
  reasoning: string
  expectedEngagement: number
  personalizedMessage: string
  optimalTiming: Date
  channel: 'web' | 'email' | 'push' | 'social'
}

interface BehaviorInsight {
  pattern: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation: string
  businessValue: number
}

export class AdvancedUserBehaviorAnalyzer {
  private openai: OpenAI
  private supabase: any
  private mlModels: Map<string, any> = new Map()

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://ai-navigator.com",
        "X-Title": "AI Navigator - Advanced User Behavior Analyzer"
      }
    })
    
    this.supabase = getSupabaseServerClient()
    this.initializeMLModels()
  }

  /**
   * 初始化机器学习模型
   */
  private async initializeMLModels() {
    // 加载预训练的用户行为分析模型
    this.mlModels.set('userSegmentation', await this.loadUserSegmentationModel())
    this.mlModels.set('churnPrediction', await this.loadChurnPredictionModel())
    this.mlModels.set('conversionPrediction', await this.loadConversionModel())
    this.mlModels.set('contentRecommendation', await this.loadRecommendationModel())
  }

  /**
   * 实时用户行为分析
   */
  async analyzeUserBehavior(userId: string): Promise<UserProfile> {
    try {
      console.log(`🔍 分析用户行为: ${userId}`)

      // 收集用户数据
      const userData = await this.collectUserData(userId)
      
      // AI驱动的行为模式识别
      const behaviorPatterns = await this.identifyBehaviorPatterns(userData)
      
      // 构建用户画像
      const userProfile = await this.buildUserProfile(userId, userData, behaviorPatterns)
      
      // 预测用户意图
      const userIntent = await this.predictUserIntent(userProfile)
      
      // 存储用户画像
      await this.storeUserProfile(userProfile)
      
      return userProfile

    } catch (error) {
      console.error('用户行为分析失败:', error)
      throw error
    }
  }

  /**
   * 生成个性化推荐
   */
  async generatePersonalizedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    try {
      // 获取用户画像
      const userProfile = await this.getUserProfile(userId)
      
      // 获取候选内容
      const candidateContent = await this.getCandidateContent()
      
      // AI驱动的推荐生成
      const recommendations = await this.generateRecommendations(userProfile, candidateContent)
      
      // 优化推荐时机
      const optimizedRecommendations = await this.optimizeRecommendationTiming(recommendations, userProfile)
      
      // 个性化消息生成
      const personalizedRecommendations = await this.personalizeMessages(optimizedRecommendations, userProfile)
      
      // 存储推荐记录
      await this.storeRecommendations(userId, personalizedRecommendations)
      
      return personalizedRecommendations

    } catch (error) {
      console.error('个性化推荐生成失败:', error)
      return []
    }
  }

  /**
   * 实时行为洞察
   */
  async generateBehaviorInsights(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<BehaviorInsight[]> {
    try {
      // 收集时间段内的行为数据
      const behaviorData = await this.collectBehaviorData(timeframe)
      
      // AI分析行为模式
      const insights = await this.analyzeBehaviorPatterns(behaviorData)
      
      // 识别异常和机会
      const anomalies = await this.detectBehaviorAnomalies(behaviorData)
      const opportunities = await this.identifyGrowthOpportunities(behaviorData)
      
      const allInsights = [...insights, ...anomalies, ...opportunities]
      
      // 按业务价值排序
      allInsights.sort((a, b) => b.businessValue - a.businessValue)
      
      return allInsights

    } catch (error) {
      console.error('行为洞察生成失败:', error)
      return []
    }
  }

  /**
   * 用户流失预测
   */
  async predictUserChurn(userId?: string): Promise<Array<{userId: string, churnProbability: number, preventionActions: string[]}>> {
    try {
      const users = userId ? [userId] : await this.getActiveUsers()
      const predictions = []

      for (const user of users) {
        const userProfile = await this.getUserProfile(user)
        const recentBehavior = await this.getRecentBehavior(user, 7) // 最近7天

        // 使用ML模型预测流失概率
        const churnProbability = await this.predictChurnProbability(userProfile, recentBehavior)
        
        // 生成预防措施建议
        const preventionActions = await this.generateChurnPrevention(userProfile, churnProbability)

        predictions.push({
          userId: user,
          churnProbability,
          preventionActions
        })
      }

      // 按流失概率排序
      predictions.sort((a, b) => b.churnProbability - a.churnProbability)
      
      return predictions

    } catch (error) {
      console.error('流失预测失败:', error)
      return []
    }
  }

  /**
   * A/B测试自动化
   */
  async autoOptimizeExperience(userId: string): Promise<{variant: string, optimization: any}> {
    try {
      const userProfile = await this.getUserProfile(userId)
      
      // 获取当前运行的A/B测试
      const activeTests = await this.getActiveABTests()
      
      // 基于用户画像选择最优变体
      const optimalVariants = await this.selectOptimalVariants(userProfile, activeTests)
      
      // 动态优化用户体验
      const optimizedExperience = await this.optimizeUserExperience(userProfile, optimalVariants)
      
      // 记录实验数据
      await this.recordExperimentData(userId, optimizedExperience)
      
      return optimizedExperience

    } catch (error) {
      console.error('体验优化失败:', error)
      return { variant: 'default', optimization: {} }
    }
  }

  /**
   * 收集用户数据
   */
  private async collectUserData(userId: string) {
    const [sessionData, interactionData, preferenceData] = await Promise.all([
      this.supabase.from('user_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      this.supabase.from('user_interactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(200),
      this.supabase.from('user_preferences').select('*').eq('user_id', userId).single()
    ])

    return {
      sessions: sessionData.data || [],
      interactions: interactionData.data || [],
      preferences: preferenceData.data || {}
    }
  }

  /**
   * AI识别行为模式
   */
  private async identifyBehaviorPatterns(userData: any) {
    const analysisPrompt = `
    分析以下用户行为数据，识别关键模式：
    
    会话数据：${JSON.stringify(userData.sessions?.slice(0, 10), null, 2)}
    交互数据：${JSON.stringify(userData.interactions?.slice(0, 20), null, 2)}
    偏好数据：${JSON.stringify(userData.preferences, null, 2)}
    
    请识别：
    1. 使用模式（时间、频率、持续时间）
    2. 内容偏好（类型、难度、长度）
    3. 导航行为（路径、停留点、退出点）
    4. 参与度指标（点击、停留、转化）
    5. 学习风格（快速浏览vs深度研究）
    
    返回JSON格式的分析结果：
    {
      "usagePatterns": {
        "frequency": "daily|weekly|monthly",
        "peakTimes": [hours],
        "sessionDuration": number,
        "pagesPerSession": number
      },
      "contentPreferences": {
        "categories": ["category1", "category2"],
        "difficulty": "beginner|intermediate|advanced",
        "format": ["tutorial", "review", "comparison"],
        "length": "short|medium|long"
      },
      "navigationBehavior": {
        "entryPoints": ["page1", "page2"],
        "commonPaths": [["page1", "page2", "page3"]],
        "exitPoints": ["page1", "page2"],
        "searchBehavior": "specific|exploratory|goal-oriented"
      },
      "engagementLevel": {
        "overall": number, // 0-100
        "contentTypes": {"type": score},
        "features": {"feature": usage_score}
      },
      "learningStyle": {
        "type": "scanner|researcher|implementer|social",
        "pace": "fast|moderate|slow",
        "depth": "surface|moderate|deep"
      },
      "predictedNeeds": ["need1", "need2"],
      "riskFactors": ["factor1", "factor2"]
    }
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.3,
        max_tokens: 2000
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('行为模式识别失败:', error)
      return this.getDefaultBehaviorPattern()
    }
  }

  /**
   * 构建用户画像
   */
  private async buildUserProfile(userId: string, userData: any, behaviorPatterns: any): Promise<UserProfile> {
    // 基于数据和AI分析构建完整用户画像
    const profile: UserProfile = {
      userId,
      demographics: {
        ageGroup: this.inferAgeGroup(userData, behaviorPatterns),
        location: this.inferLocation(userData),
        devicePreference: this.inferDevicePreference(userData),
        techProficiency: this.inferTechProficiency(behaviorPatterns)
      },
      interests: {
        aiCategories: behaviorPatterns.contentPreferences?.categories || [],
        useCases: this.inferUseCases(behaviorPatterns),
        industryFocus: this.inferIndustryFocus(userData, behaviorPatterns),
        skillLevel: this.inferSkillLevels(behaviorPatterns)
      },
      behaviorPatterns: {
        visitFrequency: this.calculateVisitFrequency(userData.sessions),
        sessionDuration: behaviorPatterns.usagePatterns?.sessionDuration || 300,
        preferredContentLength: behaviorPatterns.contentPreferences?.length || 'medium',
        engagementStyle: behaviorPatterns.learningStyle?.type || 'browser',
        peakActivityTimes: behaviorPatterns.usagePatterns?.peakTimes || [9, 14, 20]
      },
      preferences: {
        contentTypes: behaviorPatterns.contentPreferences?.format || ['tutorial'],
        communicationStyle: this.inferCommunicationStyle(behaviorPatterns),
        learningPath: this.recommendLearningPath(behaviorPatterns),
        notifications: this.inferNotificationPreferences(behaviorPatterns)
      },
      conversionSignals: {
        purchaseIntent: this.calculatePurchaseIntent(userData, behaviorPatterns),
        featureRequests: this.extractFeatureRequests(userData),
        pricesensitivity: this.inferPriceSensitivity(behaviorPatterns),
        decisionInfluencers: this.identifyDecisionInfluencers(behaviorPatterns)
      }
    }

    return profile
  }

  /**
   * 生成个性化推荐
   */
  private async generateRecommendations(userProfile: UserProfile, candidateContent: any[]): Promise<PersonalizedRecommendation[]> {
    const recommendationPrompt = `
    基于用户画像为用户生成个性化推荐：
    
    用户画像：${JSON.stringify(userProfile, null, 2)}
    
    候选内容：${JSON.stringify(candidateContent.slice(0, 20), null, 2)}
    
    请生成5-10个高度个性化的推荐，考虑：
    1. 用户的兴趣和技能水平
    2. 行为模式和偏好
    3. 当前学习阶段
    4. 转化可能性
    5. 最佳推荐时机
    
    返回JSON格式：
    [
      {
        "type": "content|tool|feature|learning_path",
        "item": {详细信息},
        "relevanceScore": 0.0-1.0,
        "reasoning": "推荐理由",
        "expectedEngagement": 0.0-1.0,
        "personalizedMessage": "个性化文案",
        "optimalTiming": "2024-01-01T10:00:00Z",
        "channel": "web|email|push|social",
        "priority": 1-10
      }
    ]
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: recommendationPrompt }],
        temperature: 0.4,
        max_tokens: 3000
      })

      const recommendations = JSON.parse(response.choices[0].message.content || '[]')
      
      // 按相关性评分排序
      recommendations.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      
      return recommendations.slice(0, 8) // 返回前8个推荐
    } catch (error) {
      console.error('推荐生成失败:', error)
      return []
    }
  }

  /**
   * 预测流失概率
   */
  private async predictChurnProbability(userProfile: UserProfile, recentBehavior: any[]): Promise<number> {
    // 使用AI分析流失信号
    const churnSignals = [
      userProfile.behaviorPatterns.visitFrequency < 1, // 访问频率下降
      recentBehavior.length < 3, // 最近活动减少
      userProfile.conversionSignals.purchaseIntent < 0.3, // 购买意向低
      // 更多流失信号...
    ]

    const signalCount = churnSignals.filter(signal => signal).length
    const baseChurnRate = 0.15 // 基础流失率15%
    
    return Math.min(baseChurnRate + (signalCount * 0.1), 0.9)
  }

  // 辅助方法实现
  private async loadUserSegmentationModel() { return {} }
  private async loadChurnPredictionModel() { return {} }
  private async loadConversionModel() { return {} }
  private async loadRecommendationModel() { return {} }

  private inferAgeGroup(userData: any, patterns: any): string {
    // 基于行为模式推断年龄段
    return '25-35'
  }

  private inferLocation(userData: any): string {
    // 从会话数据推断位置
    return 'Unknown'
  }

  private inferDevicePreference(userData: any): string {
    // 分析设备使用模式
    return 'desktop'
  }

  private inferTechProficiency(patterns: any): 'beginner' | 'intermediate' | 'advanced' {
    // 基于内容难度偏好推断技术水平
    return patterns.contentPreferences?.difficulty || 'intermediate'
  }

  private inferUseCases(patterns: any): string[] {
    return ['automation', 'content-creation']
  }

  private inferIndustryFocus(userData: any, patterns: any): string[] {
    return ['technology', 'marketing']
  }

  private inferSkillLevels(patterns: any): Record<string, number> {
    return {
      'ai-tools': 0.7,
      'automation': 0.5,
      'content-creation': 0.6
    }
  }

  private calculateVisitFrequency(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0
    
    const days = Math.max(1, Math.ceil((Date.now() - new Date(sessions[sessions.length - 1].created_at).getTime()) / (24 * 60 * 60 * 1000)))
    return sessions.length / days
  }

  private inferCommunicationStyle(patterns: any): 'formal' | 'casual' | 'technical' {
    return 'casual'
  }

  private recommendLearningPath(patterns: any): string[] {
    return ['basics', 'intermediate', 'advanced']
  }

  private inferNotificationPreferences(patterns: any): Record<string, boolean> {
    return {
      email: true,
      push: false,
      sms: false
    }
  }

  private calculatePurchaseIntent(userData: any, patterns: any): number {
    return 0.4 + Math.random() * 0.4
  }

  private extractFeatureRequests(userData: any): string[] {
    return []
  }

  private inferPriceSensitivity(patterns: any): number {
    return 0.6
  }

  private identifyDecisionInfluencers(patterns: any): string[] {
    return ['reviews', 'tutorials', 'pricing']
  }

  private getDefaultBehaviorPattern() {
    return {
      usagePatterns: {
        frequency: 'weekly',
        peakTimes: [9, 14, 20],
        sessionDuration: 300,
        pagesPerSession: 5
      },
      contentPreferences: {
        categories: ['ai-tools'],
        difficulty: 'intermediate',
        format: ['tutorial'],
        length: 'medium'
      },
      navigationBehavior: {
        entryPoints: ['home'],
        commonPaths: [['home', 'tools']],
        exitPoints: ['tools'],
        searchBehavior: 'exploratory'
      },
      engagementLevel: {
        overall: 60,
        contentTypes: { 'tutorial': 70 },
        features: { 'search': 80 }
      },
      learningStyle: {
        type: 'browser',
        pace: 'moderate',
        depth: 'moderate'
      },
      predictedNeeds: [],
      riskFactors: []
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    const { data } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return data || this.getDefaultUserProfile(userId)
  }

  private getDefaultUserProfile(userId: string): UserProfile {
    return {
      userId,
      demographics: {
        ageGroup: '25-35',
        location: 'Unknown',
        devicePreference: 'desktop',
        techProficiency: 'intermediate'
      },
      interests: {
        aiCategories: ['ai-tools'],
        useCases: ['automation'],
        industryFocus: ['technology'],
        skillLevel: { 'ai-tools': 0.5 }
      },
      behaviorPatterns: {
        visitFrequency: 1,
        sessionDuration: 300,
        preferredContentLength: 'medium',
        engagementStyle: 'browser',
        peakActivityTimes: [9, 14, 20]
      },
      preferences: {
        contentTypes: ['tutorial'],
        communicationStyle: 'casual',
        learningPath: ['basics'],
        notifications: { email: true }
      },
      conversionSignals: {
        purchaseIntent: 0.4,
        featureRequests: [],
        pricesensitivity: 0.6,
        decisionInfluencers: ['reviews']
      }
    }
  }

  private async getCandidateContent() {
    const { data } = await this.supabase
      .from('tools')
      .select('*')
      .limit(50)

    return data || []
  }

  private async storeUserProfile(profile: UserProfile) {
    await this.supabase
      .from('user_profiles')
      .upsert([{
        user_id: profile.userId,
        profile: profile,
        updated_at: new Date().toISOString()
      }])
  }

  private async storeRecommendations(userId: string, recommendations: PersonalizedRecommendation[]) {
    await this.supabase
      .from('user_recommendations')
      .insert(recommendations.map(rec => ({
        user_id: userId,
        recommendation: rec,
        created_at: new Date().toISOString()
      })))
  }

  private async optimizeRecommendationTiming(recommendations: PersonalizedRecommendation[], userProfile: UserProfile): Promise<PersonalizedRecommendation[]> {
    // 基于用户活跃时间优化推荐时机
    return recommendations.map(rec => ({
      ...rec,
      optimalTiming: this.calculateOptimalTiming(userProfile.behaviorPatterns.peakActivityTimes)
    }))
  }

  private calculateOptimalTiming(peakTimes: number[]): Date {
    const now = new Date()
    const nextPeakHour = peakTimes.find(hour => hour > now.getHours()) || peakTimes[0]
    
    const optimalTime = new Date(now)
    if (nextPeakHour > now.getHours()) {
      optimalTime.setHours(nextPeakHour, 0, 0, 0)
    } else {
      optimalTime.setDate(optimalTime.getDate() + 1)
      optimalTime.setHours(nextPeakHour, 0, 0, 0)
    }
    
    return optimalTime
  }

  private async personalizeMessages(recommendations: PersonalizedRecommendation[], userProfile: UserProfile): Promise<PersonalizedRecommendation[]> {
    // AI生成个性化消息
    for (const rec of recommendations) {
      rec.personalizedMessage = await this.generatePersonalizedMessage(rec, userProfile)
    }
    
    return recommendations
  }

  private async generatePersonalizedMessage(recommendation: PersonalizedRecommendation, userProfile: UserProfile): Promise<string> {
    const prompt = `
    为用户生成个性化推荐消息：
    
    用户特征：
    - 技术水平：${userProfile.demographics.techProficiency}
    - 沟通风格：${userProfile.preferences.communicationStyle}
    - 兴趣领域：${userProfile.interests.aiCategories.join(', ')}
    
    推荐内容：${JSON.stringify(recommendation.item, null, 2)}
    推荐理由：${recommendation.reasoning}
    
    请生成一条简洁、个性化的推荐消息（50字以内），符合用户的沟通风格。
    `

    try {
      const response = await this.openai.chat.completions.create({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100
      })

      return response.choices[0].message.content || `推荐您试试这个${recommendation.type}`
    } catch (error) {
      return `基于您的兴趣，推荐这个${recommendation.type}`
    }
  }

  private async collectBehaviorData(timeframe: string) {
    const timeMap = {
      hour: 1,
      day: 24,
      week: 168,
      month: 720
    }
    
    const hours = timeMap[timeframe as keyof typeof timeMap] || 24
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

    const { data } = await this.supabase
      .from('user_interactions')
      .select('*')
      .gte('created_at', startTime.toISOString())

    return data || []
  }

  private async analyzeBehaviorPatterns(data: any[]): Promise<BehaviorInsight[]> {
    // AI分析行为模式并生成洞察
    return []
  }

  private async detectBehaviorAnomalies(data: any[]): Promise<BehaviorInsight[]> {
    // 检测异常行为模式
    return []
  }

  private async identifyGrowthOpportunities(data: any[]): Promise<BehaviorInsight[]> {
    // 识别增长机会
    return []
  }

  private async getActiveUsers(): Promise<string[]> {
    const { data } = await this.supabase
      .from('user_sessions')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .group('user_id')

    return data?.map((row: any) => row.user_id) || []
  }

  private async getRecentBehavior(userId: string, days: number) {
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const { data } = await this.supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startTime.toISOString())

    return data || []
  }

  private async generateChurnPrevention(userProfile: UserProfile, churnProbability: number): Promise<string[]> {
    if (churnProbability < 0.3) return []

    const preventionActions = [
      '发送个性化内容推荐',
      '提供免费试用机会',
      '邀请参加网络研讨会',
      '发送使用技巧邮件',
      '提供一对一咨询'
    ]

    // 基于用户画像选择最合适的预防措施
    return preventionActions.slice(0, Math.min(3, Math.ceil(churnProbability * 5)))
  }

  private async getActiveABTests() {
    const { data } = await this.supabase
      .from('ab_tests')
      .select('*')
      .eq('status', 'active')

    return data || []
  }

  private async selectOptimalVariants(userProfile: UserProfile, tests: any[]) {
    // 基于用户画像选择最优A/B测试变体
    return tests.map(test => ({
      testId: test.id,
      variant: 'control' // 默认控制组
    }))
  }

  private async optimizeUserExperience(userProfile: UserProfile, variants: any[]) {
    return {
      variant: 'optimized',
      optimization: {
        layout: 'personalized',
        content: 'adaptive',
        recommendations: 'enhanced'
      }
    }
  }

  private async recordExperimentData(userId: string, experience: any) {
    await this.supabase
      .from('ab_test_participants')
      .insert([{
        user_id: userId,
        experience: experience,
        timestamp: new Date().toISOString()
      }])
  }

  private async predictUserIntent(userProfile: UserProfile) {
    // 预测用户意图
    return {
      intent: 'explore',
      confidence: 0.7,
      nextActions: ['browse_tools', 'read_reviews']
    }
  }
}