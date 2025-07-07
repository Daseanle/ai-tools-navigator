/**
 * 社区UGC和内容变现系统
 */

export interface CommunityPost {
  id: string
  type: 'article' | 'tutorial' | 'review' | 'showcase' | 'question' | 'discussion'
  title: string
  content: string
  excerpt: string
  authorId: string
  author: {
    id: string
    username: string
    displayName: string
    avatar?: string
    verified: boolean
    reputation: number
    badges: string[]
    level: 'newbie' | 'member' | 'contributor' | 'expert' | 'master'
  }
  tags: string[]
  category: string
  isPremium: boolean
  monetization: PostMonetization
  engagement: PostEngagement
  media: MediaAttachment[]
  status: 'draft' | 'published' | 'archived' | 'removed'
  visibility: 'public' | 'premium' | 'members_only'
  publishedAt: string
  updatedAt: string
  featured: boolean
  pinned: boolean
}

export interface PostMonetization {
  enabled: boolean
  type: 'free' | 'paid' | 'tip_based' | 'subscription'
  price?: number
  currency: 'CNY'
  revenueShare: number // 平台分成比例
  totalEarnings: number
  viewCount: number
  purchaseCount: number
  tipCount: number
  tipAmount: number
}

export interface PostEngagement {
  views: number
  likes: number
  dislikes: number
  comments: number
  shares: number
  bookmarks: number
  rating: number
  ratingCount: number
}

export interface MediaAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  thumbnail?: string
  filename: string
  size: number
  mimeType: string
}

export interface CommunityComment {
  id: string
  postId: string
  parentId?: string
  authorId: string
  author: {
    id: string
    username: string
    displayName: string
    avatar?: string
    verified: boolean
  }
  content: string
  likes: number
  dislikes: number
  replies: CommunityComment[]
  createdAt: string
  edited: boolean
  editedAt?: string
}

export interface ContentCreator {
  id: string
  userId: string
  status: 'applicant' | 'approved' | 'suspended' | 'banned'
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  specialties: string[]
  totalEarnings: number
  monthlyEarnings: number
  followerCount: number
  totalViews: number
  totalLikes: number
  contentCount: number
  averageRating: number
  revenueShare: number
  joinedAt: string
  lastActiveAt: string
}

export interface CreatorProgram {
  id: string
  name: string
  description: string
  requirements: {
    minFollowers: number
    minContentCount: number
    minRating: number
    minMonthlyViews: number
  }
  benefits: {
    revenueShare: number
    monthlyBonus: number
    priority: boolean
    customBadge: boolean
    earlyAccess: boolean
    exclusiveFeatures: string[]
  }
  applicationFee: number
  monthlyFee: number
}

export interface ContentSubscription {
  id: string
  creatorId: string
  subscriberId: string
  tier: 'basic' | 'premium' | 'vip'
  price: number
  currency: 'CNY'
  duration: 'monthly' | 'yearly'
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  autoRenewal: boolean
  benefits: string[]
}

export interface TipTransaction {
  id: string
  fromUserId: string
  toUserId: string
  postId?: string
  amount: number
  currency: 'CNY'
  message?: string
  anonymous: boolean
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  platformFee: number
}

// 社区内容配置
export const communityCategories = [
  { id: 'ai-tools', name: 'AI工具评测', description: '分享AI工具使用体验和评测' },
  { id: 'tutorials', name: '教程指南', description: 'AI工具使用教程和技巧分享' },
  { id: 'showcases', name: '作品展示', description: '使用AI工具创作的优秀作品' },
  { id: 'discussions', name: '技术讨论', description: 'AI技术和趋势讨论' },
  { id: 'qa', name: '问答求助', description: '使用问题和技术求助' },
  { id: 'news', name: '行业资讯', description: 'AI行业最新动态和新闻' }
]

export const creatorPrograms: CreatorProgram[] = [
  {
    id: 'bronze-creator',
    name: '青铜创作者',
    description: '入门级创作者计划，开始您的内容变现之旅',
    requirements: {
      minFollowers: 100,
      minContentCount: 5,
      minRating: 4.0,
      minMonthlyViews: 1000
    },
    benefits: {
      revenueShare: 0.6, // 60%
      monthlyBonus: 0,
      priority: false,
      customBadge: true,
      earlyAccess: false,
      exclusiveFeatures: ['基础分析', '内容推广']
    },
    applicationFee: 0,
    monthlyFee: 0
  },
  {
    id: 'silver-creator',
    name: '白银创作者',
    description: '进阶创作者计划，获得更多曝光和收益',
    requirements: {
      minFollowers: 500,
      minContentCount: 20,
      minRating: 4.2,
      minMonthlyViews: 5000
    },
    benefits: {
      revenueShare: 0.7, // 70%
      monthlyBonus: 500,
      priority: true,
      customBadge: true,
      earlyAccess: true,
      exclusiveFeatures: ['高级分析', '优先推荐', '直播功能']
    },
    applicationFee: 199,
    monthlyFee: 99
  },
  {
    id: 'gold-creator',
    name: '黄金创作者',
    description: '专业创作者计划，享受最高收益分成',
    requirements: {
      minFollowers: 2000,
      minContentCount: 50,
      minRating: 4.5,
      minMonthlyViews: 20000
    },
    benefits: {
      revenueShare: 0.8, // 80%
      monthlyBonus: 2000,
      priority: true,
      customBadge: true,
      earlyAccess: true,
      exclusiveFeatures: ['完整分析', '专属推荐', '直播功能', '课程制作', '1对1指导']
    },
    applicationFee: 999,
    monthlyFee: 299
  }
]

// 模拟社区内容数据
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'tutorial',
    title: '从零开始掌握ChatGPT: 完整入门指南',
    content: '详细介绍ChatGPT的使用技巧、提示词优化、高效工作流程等...',
    excerpt: '一份完整的ChatGPT使用指南，包含50+实用技巧和案例',
    authorId: 'user-1',
    author: {
      id: 'user-1',
      username: 'ai_expert_zhang',
      displayName: '张教授',
      avatar: '/avatars/zhang.jpg',
      verified: true,
      reputation: 8950,
      badges: ['AI专家', '优质作者', '热门创作者'],
      level: 'expert'
    },
    tags: ['ChatGPT', '入门教程', '提示词', '效率'],
    category: 'tutorials',
    isPremium: true,
    monetization: {
      enabled: true,
      type: 'paid',
      price: 29.9,
      currency: 'CNY',
      revenueShare: 0.7,
      totalEarnings: 2890,
      viewCount: 12500,
      purchaseCount: 97,
      tipCount: 23,
      tipAmount: 456
    },
    engagement: {
      views: 12500,
      likes: 1240,
      dislikes: 18,
      comments: 156,
      shares: 89,
      bookmarks: 567,
      rating: 4.8,
      ratingCount: 142
    },
    media: [
      {
        id: 'media-1',
        type: 'image',
        url: '/images/chatgpt-guide-cover.jpg',
        thumbnail: '/images/chatgpt-guide-thumb.jpg',
        filename: 'chatgpt-guide-cover.jpg',
        size: 245760,
        mimeType: 'image/jpeg'
      }
    ],
    status: 'published',
    visibility: 'premium',
    publishedAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-21T14:30:00Z',
    featured: true,
    pinned: false
  },
  {
    id: 'post-2',
    type: 'review',
    title: 'Midjourney vs DALL-E 3: 详细对比评测',
    content: '从图像质量、使用便捷性、价格等方面对比两款主流AI绘画工具...',
    excerpt: '客观对比Midjourney和DALL-E 3的优缺点，帮你选择最适合的工具',
    authorId: 'user-2',
    author: {
      id: 'user-2',
      username: 'designer_li',
      displayName: '设计师小李',
      avatar: '/avatars/li.jpg',
      verified: true,
      reputation: 6750,
      badges: ['设计专家', '评测达人'],
      level: 'contributor'
    },
    tags: ['Midjourney', 'DALL-E', '评测', 'AI绘画'],
    category: 'ai-tools',
    isPremium: false,
    monetization: {
      enabled: true,
      type: 'tip_based',
      revenueShare: 0.8,
      totalEarnings: 567,
      viewCount: 8920,
      purchaseCount: 0,
      tipCount: 45,
      tipAmount: 567
    },
    engagement: {
      views: 8920,
      likes: 892,
      dislikes: 12,
      comments: 234,
      shares: 156,
      bookmarks: 445,
      rating: 4.6,
      ratingCount: 187
    },
    media: [
      {
        id: 'media-2',
        type: 'image',
        url: '/images/midjourney-vs-dalle.jpg',
        thumbnail: '/images/midjourney-vs-dalle-thumb.jpg',
        filename: 'midjourney-vs-dalle.jpg',
        size: 180240,
        mimeType: 'image/jpeg'
      }
    ],
    status: 'published',
    visibility: 'public',
    publishedAt: '2024-11-19T15:30:00Z',
    updatedAt: '2024-11-19T15:30:00Z',
    featured: false,
    pinned: false
  }
]

// 社区管理类
export class CommunityManager {
  static async createPost(postData: Omit<CommunityPost, 'id' | 'engagement' | 'publishedAt' | 'updatedAt'>): Promise<CommunityPost> {
    const post: CommunityPost = {
      id: 'post-' + Date.now(),
      ...postData,
      engagement: {
        views: 0,
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        rating: 0,
        ratingCount: 0
      },
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return post
  }

  static async getPostsByCategory(category: string, limit: number = 20): Promise<CommunityPost[]> {
    return mockCommunityPosts
      .filter(post => !category || post.category === category)
      .slice(0, limit)
  }

  static async getCreatorStats(creatorId: string): Promise<{
    totalEarnings: number
    monthlyEarnings: number
    totalViews: number
    totalLikes: number
    followerGrowth: number[]
    topPosts: CommunityPost[]
  }> {
    return {
      totalEarnings: 5240,
      monthlyEarnings: 1890,
      totalViews: 45600,
      totalLikes: 2340,
      followerGrowth: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50)),
      topPosts: mockCommunityPosts.slice(0, 5)
    }
  }

  static async purchaseContent(userId: string, postId: string): Promise<{
    success: boolean
    transactionId?: string
    error?: string
  }> {
    // 模拟内容购买
    return {
      success: true,
      transactionId: 'txn_' + Date.now()
    }
  }

  static async sendTip(fromUserId: string, toUserId: string, amount: number, postId?: string, message?: string): Promise<TipTransaction> {
    const tip: TipTransaction = {
      id: 'tip_' + Date.now(),
      fromUserId,
      toUserId,
      postId,
      amount,
      currency: 'CNY',
      message,
      anonymous: false,
      status: 'completed',
      createdAt: new Date().toISOString(),
      platformFee: amount * 0.05 // 5%平台费
    }

    return tip
  }

  static async subscribeToCreator(userId: string, creatorId: string, tier: string): Promise<ContentSubscription> {
    const subscription: ContentSubscription = {
      id: 'sub_' + Date.now(),
      creatorId,
      subscriberId: userId,
      tier: tier as any,
      price: tier === 'basic' ? 19.9 : tier === 'premium' ? 39.9 : 99.9,
      currency: 'CNY',
      duration: 'monthly',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenewal: true,
      benefits: tier === 'basic' ? ['基础内容', '月度总结'] : 
                tier === 'premium' ? ['所有内容', '月度总结', '专属群聊'] :
                ['所有内容', '月度总结', '专属群聊', '1对1咨询', '课程优惠']
    }

    return subscription
  }

  static async applyCreatorProgram(userId: string, programId: string, applicationData: {
    portfolio: string[]
    experience: string
    contentPlan: string
  }): Promise<{ success: boolean; applicationId?: string; error?: string }> {
    const program = creatorPrograms.find(p => p.id === programId)
    if (!program) {
      return { success: false, error: '创作者计划不存在' }
    }

    return {
      success: true,
      applicationId: 'app_' + Date.now()
    }
  }

  static async getContentAnalytics(creatorId: string, period: 'week' | 'month' | 'quarter'): Promise<{
    views: number[]
    earnings: number[]
    engagement: number[]
    timestamps: string[]
    topContent: { id: string; title: string; views: number; earnings: number }[]
  }> {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
    
    return {
      views: Array.from({ length: days }, () => Math.floor(Math.random() * 1000)),
      earnings: Array.from({ length: days }, () => Math.floor(Math.random() * 200)),
      engagement: Array.from({ length: days }, () => Math.random()),
      timestamps: Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - days + i)
        return date.toISOString()
      }),
      topContent: [
        { id: 'post-1', title: 'ChatGPT入门指南', views: 12500, earnings: 2890 },
        { id: 'post-2', title: 'AI绘画对比', views: 8920, earnings: 567 }
      ]
    }
  }
}