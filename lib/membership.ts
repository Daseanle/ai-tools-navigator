/**
 * 会员体系管理
 * 包含免费、体验、行业、团队四个层级
 */

export type MembershipTier = 'free' | 'experience' | 'industry' | 'team'
export type BillingCycle = 'monthly' | 'yearly'

export interface MembershipPlan {
  id: string
  tier: MembershipTier
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  price: {
    monthly: number
    yearly: number
  }
  features: MembershipFeature[]
  limits: MembershipLimits
  popular?: boolean
  enterprise?: boolean
}

export interface MembershipFeature {
  id: string
  name: string
  nameEn: string
  description?: string
  enabled: boolean
  icon?: string
}

export interface MembershipLimits {
  toolsBookmarks: number | 'unlimited'
  promptDownloads: number | 'unlimited'
  reportsAccess: number | 'unlimited'
  exportFormats: string[]
  apiCalls: number | 'unlimited'
  teamMembers: number | 'unlimited'
  customCategories: number | 'unlimited'
  prioritySupport: boolean
}

export interface UserMembership {
  userId: string
  tier: MembershipTier
  planId: string
  status: 'active' | 'expired' | 'canceled' | 'trial'
  startDate: string
  endDate: string
  billingCycle: BillingCycle
  autoRenew: boolean
  trialEndsAt?: string
  features: string[]
}

// 会员计划配置
export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: '免费用户',
    nameEn: 'Free',
    description: '探索AI工具的基础功能',
    descriptionEn: 'Basic AI tool exploration',
    price: { monthly: 0, yearly: 0 },
    features: [
      { id: 'basic_search', name: '基础搜索', nameEn: 'Basic Search', enabled: true, icon: '🔍' },
      { id: 'tool_browse', name: '工具浏览', nameEn: 'Tool Browsing', enabled: true, icon: '👀' },
      { id: 'basic_categories', name: '基础分类', nameEn: 'Basic Categories', enabled: true, icon: '📁' },
      { id: 'free_tools_only', name: '仅免费工具', nameEn: 'Free Tools Only', enabled: true, icon: '🆓' },
    ],
    limits: {
      toolsBookmarks: 10,
      promptDownloads: 3,
      reportsAccess: 0,
      exportFormats: [],
      apiCalls: 0,
      teamMembers: 1,
      customCategories: 0,
      prioritySupport: false
    }
  },
  {
    id: 'experience',
    tier: 'experience',
    name: '体验会员',
    nameEn: 'Experience',
    description: '30天深度体验高级功能',
    descriptionEn: '30-day advanced features trial',
    price: { monthly: 29, yearly: 290 },
    popular: true,
    features: [
      { id: 'all_free_features', name: '包含免费功能', nameEn: 'All Free Features', enabled: true, icon: '✅' },
      { id: 'advanced_search', name: '高级搜索', nameEn: 'Advanced Search', enabled: true, icon: '🔎' },
      { id: 'unlimited_bookmarks', name: '无限收藏', nameEn: 'Unlimited Bookmarks', enabled: true, icon: '❤️' },
      { id: 'prompt_library', name: 'Prompt库访问', nameEn: 'Prompt Library', enabled: true, icon: '💡' },
      { id: 'basic_reports', name: '基础报告', nameEn: 'Basic Reports', enabled: true, icon: '📊' },
      { id: 'csv_export', name: 'CSV导出', nameEn: 'CSV Export', enabled: true, icon: '📥' },
      { id: 'history_tracking', name: '历史记录', nameEn: 'History Tracking', enabled: true, icon: '🕒' },
    ],
    limits: {
      toolsBookmarks: 'unlimited',
      promptDownloads: 50,
      reportsAccess: 5,
      exportFormats: ['csv', 'json'],
      apiCalls: 1000,
      teamMembers: 1,
      customCategories: 5,
      prioritySupport: false
    }
  },
  {
    id: 'industry',
    tier: 'industry',
    name: '行业会员',
    nameEn: 'Industry Pro',
    description: '深度行业分析和专业工具',
    descriptionEn: 'Deep industry analysis and professional tools',
    price: { monthly: 99, yearly: 990 },
    features: [
      { id: 'all_experience_features', name: '包含体验功能', nameEn: 'All Experience Features', enabled: true, icon: '✅' },
      { id: 'industry_reports', name: '行业深度报告', nameEn: 'Industry Reports', enabled: true, icon: '📈' },
      { id: 'competitive_analysis', name: '竞品分析', nameEn: 'Competitive Analysis', enabled: true, icon: '⚔️' },
      { id: 'custom_dashboards', name: '自定义面板', nameEn: 'Custom Dashboards', enabled: true, icon: '📋' },
      { id: 'api_access', name: 'API访问', nameEn: 'API Access', enabled: true, icon: '🔌' },
      { id: 'premium_prompts', name: '高级Prompt', nameEn: 'Premium Prompts', enabled: true, icon: '⭐' },
      { id: 'batch_export', name: '批量导出', nameEn: 'Batch Export', enabled: true, icon: '🚀' },
      { id: 'priority_support', name: '优先支持', nameEn: 'Priority Support', enabled: true, icon: '🎯' },
    ],
    limits: {
      toolsBookmarks: 'unlimited',
      promptDownloads: 'unlimited',
      reportsAccess: 'unlimited',
      exportFormats: ['csv', 'json', 'excel', 'pdf'],
      apiCalls: 10000,
      teamMembers: 3,
      customCategories: 'unlimited',
      prioritySupport: true
    }
  },
  {
    id: 'team',
    tier: 'team',
    name: '团队会员',
    nameEn: 'Team Enterprise',
    description: '企业级团队协作和管理',
    descriptionEn: 'Enterprise team collaboration and management',
    price: { monthly: 299, yearly: 2990 },
    enterprise: true,
    features: [
      { id: 'all_industry_features', name: '包含行业功能', nameEn: 'All Industry Features', enabled: true, icon: '✅' },
      { id: 'team_management', name: '团队管理', nameEn: 'Team Management', enabled: true, icon: '👥' },
      { id: 'shared_workspaces', name: '共享工作区', nameEn: 'Shared Workspaces', enabled: true, icon: '🏢' },
      { id: 'custom_integrations', name: '定制集成', nameEn: 'Custom Integrations', enabled: true, icon: '🔗' },
      { id: 'advanced_analytics', name: '高级分析', nameEn: 'Advanced Analytics', enabled: true, icon: '📊' },
      { id: 'dedicated_support', name: '专属支持', nameEn: 'Dedicated Support', enabled: true, icon: '🏆' },
      { id: 'sso_login', name: '单点登录', nameEn: 'SSO Login', enabled: true, icon: '🔐' },
      { id: 'custom_branding', name: '定制品牌', nameEn: 'Custom Branding', enabled: true, icon: '🎨' },
    ],
    limits: {
      toolsBookmarks: 'unlimited',
      promptDownloads: 'unlimited',
      reportsAccess: 'unlimited',
      exportFormats: ['csv', 'json', 'excel', 'pdf', 'api'],
      apiCalls: 'unlimited',
      teamMembers: 'unlimited',
      customCategories: 'unlimited',
      prioritySupport: true
    }
  }
]

// 会员功能检查
export class MembershipService {
  static checkFeatureAccess(userMembership: UserMembership, featureId: string): boolean {
    const plan = membershipPlans.find(p => p.id === userMembership.planId)
    if (!plan) return false
    
    return plan.features.some(f => f.id === featureId && f.enabled)
  }
  
  static checkLimit(userMembership: UserMembership, limitType: keyof MembershipLimits, currentUsage: number): boolean {
    const plan = membershipPlans.find(p => p.id === userMembership.planId)
    if (!plan) return false
    
    const limit = plan.limits[limitType]
    if (limit === 'unlimited') return true
    if (typeof limit === 'number') return currentUsage < limit
    return false
  }
  
  static getUpgradeRecommendation(currentTier: MembershipTier, requiredFeature: string): MembershipPlan | null {
    const currentPlan = membershipPlans.find(p => p.tier === currentTier)
    if (!currentPlan) return null
    
    // 找到包含所需功能的最低级别计划
    for (const plan of membershipPlans) {
      if (plan.features.some(f => f.id === requiredFeature && f.enabled)) {
        return plan
      }
    }
    
    return null
  }
  
  static calculateSavings(tier: MembershipTier): number {
    const plan = membershipPlans.find(p => p.tier === tier)
    if (!plan) return 0
    
    const monthlyTotal = plan.price.monthly * 12
    const yearlyPrice = plan.price.yearly
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100)
  }
}

// 会员试用功能
export interface TrialOffer {
  id: string
  name: string
  tier: MembershipTier
  duration: number // 天数
  features: string[]
  conditions: {
    firstTime: boolean
    emailVerified: boolean
    socialShare?: boolean
  }
}

export const trialOffers: TrialOffer[] = [
  {
    id: 'experience_trial',
    name: '体验会员7天试用',
    tier: 'experience',
    duration: 7,
    features: ['advanced_search', 'unlimited_bookmarks', 'prompt_library'],
    conditions: {
      firstTime: true,
      emailVerified: true
    }
  },
  {
    id: 'industry_trial',
    name: '行业会员3天试用',
    tier: 'industry',
    duration: 3,
    features: ['industry_reports', 'api_access', 'premium_prompts'],
    conditions: {
      firstTime: true,
      emailVerified: true,
      socialShare: true
    }
  }
]