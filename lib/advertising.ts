/**
 * 自助广告投放平台系统
 */

export interface AdCampaign {
  id: string
  advertiserId: string
  name: string
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected'
  type: 'banner' | 'native' | 'video' | 'sponsored_content' | 'popup'
  objective: 'brand_awareness' | 'traffic' | 'conversions' | 'app_installs' | 'engagement'
  budget: CampaignBudget
  targeting: AdTargeting
  creative: AdCreative
  schedule: AdSchedule
  metrics: CampaignMetrics
  createdAt: string
  updatedAt: string
  startDate: string
  endDate: string
}

export interface CampaignBudget {
  type: 'daily' | 'total'
  amount: number
  currency: 'CNY'
  bidType: 'cpc' | 'cpm' | 'cpa' | 'cpv'
  bidAmount: number
  spent: number
  remaining: number
}

export interface AdTargeting {
  demographics: {
    ageGroups: string[]
    genders: string[]
    locations: string[]
    languages: string[]
  }
  interests: string[]
  behaviors: string[]
  devices: string[]
  platforms: string[]
  customAudiences: string[]
  lookalikeSources: string[]
  exclusions: {
    demographics: any
    interests: string[]
    behaviors: string[]
  }
}

export interface AdCreative {
  id: string
  name: string
  type: 'image' | 'video' | 'carousel' | 'text' | 'rich_media'
  assets: MediaAsset[]
  copy: {
    headline: string
    description: string
    callToAction: string
    displayUrl: string
    finalUrl: string
  }
  dimensions: {
    width: number
    height: number
  }
  approved: boolean
  reviewNotes?: string
}

export interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnail?: string
  filename: string
  size: number
  dimensions?: { width: number; height: number }
  duration?: number
}

export interface AdSchedule {
  timezone: string
  startDate: string
  endDate?: string
  dailySchedule?: {
    [key: string]: { // day of week
      enabled: boolean
      hours: number[]
    }
  }
  frequency: {
    impressionsPerUser: number
    timeWindow: 'hour' | 'day' | 'week'
  }
}

export interface CampaignMetrics {
  impressions: number
  clicks: number
  conversions: number
  spend: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  conversionRate: number
  reach: number
  frequency: number
  viewability: number
  videoCompletionRate?: number
}

export interface AdPlacement {
  id: string
  name: string
  type: 'homepage_banner' | 'sidebar' | 'in_content' | 'footer' | 'popup' | 'native_feed'
  dimensions: { width: number; height: number }
  description: string
  pricing: {
    cpm: number
    cpc: number
    dailyImpressions: number
    monthlyImpressions: number
  }
  availability: number // 0-1, percentage available
  demographics: {
    averageAge: number
    genderSplit: { male: number; female: number; other: number }
    topInterests: string[]
    topLocations: string[]
  }
  performance: {
    averageCTR: number
    averageViewability: number
    averageTime: number
  }
}

export interface Advertiser {
  id: string
  userId: string
  companyName: string
  industry: string
  website: string
  contactEmail: string
  phone: string
  status: 'pending' | 'approved' | 'suspended' | 'banned'
  spendTier: 'starter' | 'growth' | 'enterprise'
  totalSpend: number
  monthlySpend: number
  accountManager?: string
  createdAt: string
  verificationStatus: 'unverified' | 'pending' | 'verified'
  billingInfo: {
    method: 'credit_card' | 'bank_transfer' | 'alipay' | 'wechat'
    autoRecharge: boolean
    threshold: number
  }
}

export interface AdReport {
  campaignId: string
  period: { start: string; end: string }
  metrics: CampaignMetrics
  breakdown: {
    byDate: Array<{ date: string; metrics: CampaignMetrics }>
    byPlacement: Array<{ placementId: string; metrics: CampaignMetrics }>
    byDemographics: Array<{ segment: string; metrics: CampaignMetrics }>
    byDevice: Array<{ device: string; metrics: CampaignMetrics }>
  }
  insights: string[]
  recommendations: string[]
}

// 广告位配置
export const adPlacements: AdPlacement[] = [
  {
    id: 'homepage-hero-banner',
    name: '首页顶部横幅',
    type: 'homepage_banner',
    dimensions: { width: 1200, height: 300 },
    description: '网站首页最显眼的广告位置，获得最大曝光',
    pricing: {
      cpm: 15,
      cpc: 2.5,
      dailyImpressions: 50000,
      monthlyImpressions: 1500000
    },
    availability: 0.85,
    demographics: {
      averageAge: 32,
      genderSplit: { male: 0.65, female: 0.33, other: 0.02 },
      topInterests: ['人工智能', '科技', '编程', '创业', '效率工具'],
      topLocations: ['北京', '上海', '深圳', '杭州', '广州']
    },
    performance: {
      averageCTR: 2.8,
      averageViewability: 92,
      averageTime: 8.5
    }
  },
  {
    id: 'tools-page-sidebar',
    name: '工具页侧边栏',
    type: 'sidebar',
    dimensions: { width: 300, height: 600 },
    description: '工具详情页侧边广告位，精准定向AI工具用户',
    pricing: {
      cpm: 12,
      cpc: 2.0,
      dailyImpressions: 30000,
      monthlyImpressions: 900000
    },
    availability: 0.75,
    demographics: {
      averageAge: 29,
      genderSplit: { male: 0.70, female: 0.28, other: 0.02 },
      topInterests: ['AI工具', '提升效率', '自动化', '设计', '写作'],
      topLocations: ['上海', '北京', '深圳', '成都', '西安']
    },
    performance: {
      averageCTR: 3.2,
      averageViewability: 88,
      averageTime: 12.3
    }
  },
  {
    id: 'community-native-feed',
    name: '社区信息流',
    type: 'native_feed',
    dimensions: { width: 600, height: 400 },
    description: '融入社区内容的原生广告，自然不突兀',
    pricing: {
      cpm: 18,
      cpc: 3.2,
      dailyImpressions: 25000,
      monthlyImpressions: 750000
    },
    availability: 0.90,
    demographics: {
      averageAge: 28,
      genderSplit: { male: 0.60, female: 0.38, other: 0.02 },
      topInterests: ['学习分享', '技能提升', '内容创作', '知识付费'],
      topLocations: ['北京', '上海', '广州', '深圳', '杭州']
    },
    performance: {
      averageCTR: 4.1,
      averageViewability: 85,
      averageTime: 15.8
    }
  },
  {
    id: 'search-results-top',
    name: '搜索结果顶部',
    type: 'in_content',
    dimensions: { width: 800, height: 120 },
    description: '搜索结果页顶部广告位，捕获用户主动搜索意图',
    pricing: {
      cpm: 20,
      cpc: 4.0,
      dailyImpressions: 20000,
      monthlyImpressions: 600000
    },
    availability: 0.70,
    demographics: {
      averageAge: 31,
      genderSplit: { male: 0.68, female: 0.30, other: 0.02 },
      topInterests: ['精准搜索', 'AI工具', '解决方案', '比较评测'],
      topLocations: ['北京', '上海', '深圳', '杭州', '南京']
    },
    performance: {
      averageCTR: 5.2,
      averageViewability: 95,
      averageTime: 6.8
    }
  }
]

// 广告管理类
export class AdPlatform {
  static async createCampaign(campaignData: Omit<AdCampaign, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<AdCampaign> {
    const campaign: AdCampaign = {
      id: 'campaign-' + Date.now(),
      ...campaignData,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        cpa: 0,
        conversionRate: 0,
        reach: 0,
        frequency: 0,
        viewability: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return campaign
  }

  static async getAdvertiserCampaigns(advertiserId: string): Promise<AdCampaign[]> {
    // 模拟返回广告主的活动列表
    return [
      {
        id: 'campaign-1',
        advertiserId,
        name: 'AI写作工具推广',
        status: 'active',
        type: 'banner',
        objective: 'conversions',
        budget: {
          type: 'daily',
          amount: 1000,
          currency: 'CNY',
          bidType: 'cpc',
          bidAmount: 2.5,
          spent: 450,
          remaining: 550
        },
        targeting: {
          demographics: {
            ageGroups: ['25-34', '35-44'],
            genders: ['all'],
            locations: ['北京', '上海', '深圳'],
            languages: ['zh']
          },
          interests: ['写作', 'AI工具', '内容创作'],
          behaviors: ['经常使用AI工具'],
          devices: ['desktop', 'mobile'],
          platforms: ['web'],
          customAudiences: [],
          lookalikeSources: [],
          exclusions: { demographics: {}, interests: [], behaviors: [] }
        },
        creative: {
          id: 'creative-1',
          name: '写作工具横幅',
          type: 'image',
          assets: [{
            id: 'asset-1',
            type: 'image',
            url: '/ads/writing-tool-banner.jpg',
            filename: 'banner.jpg',
            size: 245760
          }],
          copy: {
            headline: '革命性AI写作工具',
            description: '提升写作效率300%，专业作家都在用',
            callToAction: '立即试用',
            displayUrl: 'ai-writer.com',
            finalUrl: 'https://ai-writer.com?utm_source=navigator'
          },
          dimensions: { width: 1200, height: 300 },
          approved: true
        },
        schedule: {
          timezone: 'Asia/Shanghai',
          startDate: '2024-11-20T00:00:00Z',
          endDate: '2024-12-20T23:59:59Z',
          frequency: {
            impressionsPerUser: 3,
            timeWindow: 'day'
          }
        },
        metrics: {
          impressions: 45600,
          clicks: 1368,
          conversions: 82,
          spend: 3420,
          ctr: 3.0,
          cpc: 2.5,
          cpm: 75,
          cpa: 41.7,
          conversionRate: 6.0,
          reach: 38500,
          frequency: 1.18,
          viewability: 89
        },
        createdAt: '2024-11-20T10:00:00Z',
        updatedAt: '2024-11-25T14:30:00Z',
        startDate: '2024-11-20T00:00:00Z',
        endDate: '2024-12-20T23:59:59Z'
      }
    ]
  }

  static async getCampaignReport(campaignId: string, period: { start: string; end: string }): Promise<AdReport> {
    // 模拟广告报告数据
    return {
      campaignId,
      period,
      metrics: {
        impressions: 45600,
        clicks: 1368,
        conversions: 82,
        spend: 3420,
        ctr: 3.0,
        cpc: 2.5,
        cpm: 75,
        cpa: 41.7,
        conversionRate: 6.0,
        reach: 38500,
        frequency: 1.18,
        viewability: 89
      },
      breakdown: {
        byDate: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          metrics: {
            impressions: 6000 + Math.floor(Math.random() * 2000),
            clicks: 180 + Math.floor(Math.random() * 60),
            conversions: 10 + Math.floor(Math.random() * 8),
            spend: 450 + Math.floor(Math.random() * 200),
            ctr: 2.8 + Math.random() * 0.6,
            cpc: 2.3 + Math.random() * 0.4,
            cpm: 70 + Math.random() * 15,
            cpa: 38 + Math.random() * 10,
            conversionRate: 5.5 + Math.random() * 1.5,
            reach: 5000 + Math.floor(Math.random() * 1000),
            frequency: 1.1 + Math.random() * 0.2,
            viewability: 85 + Math.random() * 10
          }
        })),
        byPlacement: [
          {
            placementId: 'homepage-hero-banner',
            metrics: {
              impressions: 28500,
              clicks: 855,
              conversions: 52,
              spend: 2137.5,
              ctr: 3.0,
              cpc: 2.5,
              cpm: 75,
              cpa: 41.1,
              conversionRate: 6.1,
              reach: 24000,
              frequency: 1.19,
              viewability: 92
            }
          }
        ],
        byDemographics: [
          {
            segment: '25-34岁',
            metrics: {
              impressions: 27360,
              clicks: 821,
              conversions: 54,
              spend: 2052.5,
              ctr: 3.0,
              cpc: 2.5,
              cpm: 75,
              cpa: 38.0,
              conversionRate: 6.6,
              reach: 23100,
              frequency: 1.18,
              viewability: 89
            }
          }
        ],
        byDevice: [
          {
            device: 'Desktop',
            metrics: {
              impressions: 30000,
              clicks: 900,
              conversions: 58,
              spend: 2250,
              ctr: 3.0,
              cpc: 2.5,
              cpm: 75,
              cpa: 38.8,
              conversionRate: 6.4,
              reach: 25300,
              frequency: 1.19,
              viewability: 92
            }
          }
        ]
      },
      insights: [
        '桌面端转化率比移动端高15%',
        '周末的点击率比工作日高20%',
        '25-34岁年龄段表现最佳',
        '首页横幅位置效果最好'
      ],
      recommendations: [
        '增加桌面端预算分配',
        '在周末提高出价',
        '专注25-34岁目标人群',
        '考虑增加首页广告位投放'
      ]
    }
  }

  static async estimateReach(targeting: AdTargeting, budget: number): Promise<{
    estimatedReach: number
    estimatedImpressions: number
    estimatedClicks: number
    estimatedCost: number
    competition: 'low' | 'medium' | 'high'
    suggestions: string[]
  }> {
    // 模拟受众估算
    const baseReach = 100000
    const targetingMultiplier = 0.7 // 定向越精准，受众越小
    
    return {
      estimatedReach: Math.floor(baseReach * targetingMultiplier),
      estimatedImpressions: Math.floor(baseReach * targetingMultiplier * 2.5),
      estimatedClicks: Math.floor(baseReach * targetingMultiplier * 2.5 * 0.03),
      estimatedCost: budget * 0.85,
      competition: 'medium',
      suggestions: [
        '扩大年龄范围可增加20%受众',
        '添加相关兴趣标签可提升匹配度',
        '移除过于细分的定向条件'
      ]
    }
  }

  static async createAdvertiser(advertiserData: Omit<Advertiser, 'id' | 'createdAt' | 'totalSpend' | 'monthlySpend' | 'spendTier'>): Promise<Advertiser> {
    return {
      id: 'advertiser-' + Date.now(),
      ...advertiserData,
      totalSpend: 0,
      monthlySpend: 0,
      spendTier: 'starter',
      createdAt: new Date().toISOString()
    }
  }

  static async getAdPlacement(placementId: string): Promise<AdPlacement | null> {
    return adPlacements.find(p => p.id === placementId) || null
  }

  static async getAvailablePlacements(budget: number, targeting: AdTargeting): Promise<AdPlacement[]> {
    // 根据预算和定向返回合适的广告位
    return adPlacements.filter(placement => {
      const estimatedDailyCost = placement.pricing.cpm * (placement.pricing.dailyImpressions / 1000)
      return estimatedDailyCost <= budget * 1.5 // 预算足够
    })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
