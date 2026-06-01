/**
 * AI工具一键试用和分销系统
 */

export interface AffiliateProgram {
  id: string
  toolId: string
  toolName: string
  provider: string
  commissionRate: number // 佣金比例 (0-1)
  commissionType: 'percentage' | 'fixed'
  fixedAmount?: number
  minimumPayout: number
  payoutFrequency: 'weekly' | 'monthly' | 'quarterly'
  cookieDuration: number // days
  isActive: boolean
  restrictions?: string[]
}

export interface TrialOffer {
  id: string
  toolId: string
  type: 'free_trial' | 'discount' | 'extended_trial'
  value: number // 天数或折扣比例
  originalPrice: number
  discountedPrice?: number
  duration: number // 试用天数
  features: string[]
  limitations?: string[]
  requiresCreditCard: boolean
  autoRenewal: boolean
  promoCode?: string
}

export interface AffiliatePartner {
  id: string
  userId: string
  status: 'pending' | 'approved' | 'suspended' | 'terminated'
  joinedAt: string
  totalEarnings: number
  monthlyEarnings: number
  clicksGenerated: number
  conversionsGenerated: number
  conversionRate: number
  payoutInfo: {
    method: 'bank' | 'alipay' | 'wechat'
    details: Record<string, string>
  }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface AffiliateClick {
  id: string
  affiliateId: string
  toolId: string
  clickedAt: string
  userIp: string
  userAgent: string
  referrer?: string
  converted: boolean
  conversionValue?: number
  commissionEarned?: number
}

export interface AffiliateEarning {
  id: string
  affiliateId: string
  toolId: string
  clickId: string
  amount: number
  currency: 'CNY'
  status: 'pending' | 'confirmed' | 'paid'
  earnedAt: string
  paidAt?: string
  description: string
}

// AI工具分销配置
export const affiliatePrograms: AffiliateProgram[] = [
  {
    id: 'chatgpt-plus',
    toolId: 'chatgpt',
    toolName: 'ChatGPT Plus',
    provider: 'OpenAI',
    commissionRate: 0.15,
    commissionType: 'percentage',
    minimumPayout: 100,
    payoutFrequency: 'monthly',
    cookieDuration: 30,
    isActive: true,
    restrictions: ['仅限首次订阅用户']
  },
  {
    id: 'claude-pro',
    toolId: 'claude',
    toolName: 'Claude Pro',
    provider: 'Anthropic',
    commissionRate: 0.20,
    commissionType: 'percentage',
    minimumPayout: 100,
    payoutFrequency: 'monthly',
    cookieDuration: 30,
    isActive: true
  },
  {
    id: 'midjourney',
    toolId: 'midjourney',
    toolName: 'Midjourney',
    provider: 'Midjourney Inc',
    commissionRate: 0.12,
    commissionType: 'percentage',
    minimumPayout: 50,
    payoutFrequency: 'monthly',
    cookieDuration: 30,
    isActive: true
  },
  {
    id: 'notion-ai',
    toolId: 'notion',
    toolName: 'Notion AI',
    provider: 'Notion',
    commissionRate: 0.25,
    commissionType: 'percentage',
    minimumPayout: 100,
    payoutFrequency: 'monthly',
    cookieDuration: 45,
    isActive: true
  },
  {
    id: 'canva-pro',
    toolId: 'canva',
    toolName: 'Canva Pro',
    provider: 'Canva',
    commissionRate: 0.18,
    commissionType: 'percentage',
    minimumPayout: 80,
    payoutFrequency: 'monthly',
    cookieDuration: 30,
    isActive: true
  }
]

// 试用优惠配置
export const trialOffers: TrialOffer[] = [
  {
    id: 'chatgpt-trial',
    toolId: 'chatgpt',
    type: 'free_trial',
    value: 7,
    originalPrice: 160,
    duration: 7,
    features: [
      'GPT-4 无限制访问',
      '优先服务器访问',
      '插件功能',
      '浏览网页功能'
    ],
    requiresCreditCard: true,
    autoRenewal: true,
    promoCode: 'AI_NAVIGATOR_7D'
  },
  {
    id: 'claude-trial',
    toolId: 'claude',
    type: 'discount',
    value: 0.5,
    originalPrice: 150,
    discountedPrice: 75,
    duration: 30,
    features: [
      'Claude-3 Opus 访问',
      '更长对话历史',
      '优先处理'
    ],
    requiresCreditCard: true,
    autoRenewal: true,
    promoCode: 'CLAUDE_50OFF'
  },
  {
    id: 'midjourney-trial',
    toolId: 'midjourney',
    type: 'extended_trial',
    value: 14,
    originalPrice: 80,
    duration: 14,
    features: [
      '200张图片生成',
      '高分辨率输出',
      '商业使用权'
    ],
    limitations: ['每日25张图片限制'],
    requiresCreditCard: false,
    autoRenewal: false
  }
]

// 分销层级配置
export const affiliateTiers = {
  bronze: {
    name: '青铜合伙人',
    minEarnings: 0,
    bonusRate: 0,
    benefits: ['基础佣金', '月度报告']
  },
  silver: {
    name: '白银合伙人',
    minEarnings: 1000,
    bonusRate: 0.05,
    benefits: ['5%额外奖励', '专属支持', '营销素材']
  },
  gold: {
    name: '黄金合伙人',
    minEarnings: 5000,
    bonusRate: 0.10,
    benefits: ['10%额外奖励', '优先新品', '定制链接']
  },
  platinum: {
    name: '铂金合伙人',
    minEarnings: 20000,
    bonusRate: 0.15,
    benefits: ['15%额外奖励', '专属经理', '线下活动']
  }
}

// 分销系统管理类
export class AffiliateSystem {
  static generateAffiliateLink(affiliateId: string, toolId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-navigator.com'
    return `${baseUrl}/tool/${toolId}?ref=${affiliateId}&utm_source=affiliate&utm_medium=referral`
  }

  static async trackClick(affiliateId: string, toolId: string, userInfo: {
    ip: string
    userAgent: string
    referrer?: string
  }): Promise<AffiliateClick> {
    const click: AffiliateClick = {
      id: 'click-' + Date.now(),
      affiliateId,
      toolId,
      clickedAt: new Date().toISOString(),
      userIp: userInfo.ip,
      userAgent: userInfo.userAgent,
      referrer: userInfo.referrer,
      converted: false
    }

    // 这里应该保存到数据库
    console.log('Tracking affiliate click:', click)
    return click
  }

  static async recordConversion(clickId: string, conversionValue: number): Promise<void> {
    // 更新点击记录为已转化
    // 计算并记录佣金
    console.log(`Conversion recorded for click ${clickId}, value: ${conversionValue}`)
  }

  static calculateCommission(program: AffiliateProgram, conversionValue: number): number {
    if (program.commissionType === 'percentage') {
      return conversionValue * program.commissionRate
    } else {
      return program.fixedAmount || 0
    }
  }

  static getPartnerTier(totalEarnings: number): keyof typeof affiliateTiers {
    if (totalEarnings >= 20000) return 'platinum'
    if (totalEarnings >= 5000) return 'gold'
    if (totalEarnings >= 1000) return 'silver'
    return 'bronze'
  }

  static async generatePayoutReport(affiliateId: string, period: string): Promise<{
    totalEarnings: number
    pendingAmount: number
    paidAmount: number
    transactions: AffiliateEarning[]
  }> {
    // 模拟报告生成
    return {
      totalEarnings: 2560,
      pendingAmount: 450,
      paidAmount: 2110,
      transactions: []
    }
  }
}

// 试用系统管理类
export class TrialSystem {
  static async startTrial(userId: string, offerId: string): Promise<{
    success: boolean
    trialId?: string
    redirectUrl?: string
    error?: string
  }> {
    const offer = trialOffers.find(o => o.id === offerId)
    if (!offer) {
      return { success: false, error: '试用优惠不存在' }
    }

    const trialId = 'trial-' + Date.now()
    
    // 生成试用链接（实际应该调用对应AI工具的API）
    const redirectUrl = `https://partner-${offer.toolId}.com/trial?code=${offer.promoCode}&ref=ai-navigator&trial=${trialId}`

    return {
      success: true,
      trialId,
      redirectUrl
    }
  }

  static async getTrialStatus(trialId: string): Promise<{
    status: 'active' | 'expired' | 'converted' | 'cancelled'
    daysRemaining: number
    usageStats?: Record<string, number>
  }> {
    // 模拟状态查询
    return {
      status: 'active',
      daysRemaining: 5,
      usageStats: {
        queriesUsed: 45,
        queriesLimit: 100
      }
    }
  }

  static async extendTrial(trialId: string, additionalDays: number): Promise<boolean> {
    // 模拟试用延长
    console.log(`Extending trial ${trialId} by ${additionalDays} days`)
    return true
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
