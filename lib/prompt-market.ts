/**
 * Prompt市场和知识付费系统
 */

export interface PromptItem {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  content: string
  category: PromptCategory
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
    verified: boolean
    rating: number
  }
  pricing: {
    type: 'free' | 'paid' | 'premium'
    price: number
    originalPrice?: number
    currency: 'CNY' | 'USD'
  }
  stats: {
    downloads: number
    ratings: number
    averageRating: number
    favorites: number
    views: number
  }
  aiModels: string[] // 支持的AI模型
  industry: string[] // 适用行业
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  createdAt: string
  updatedAt: string
  featured: boolean
  verified: boolean
}

export interface PromptCategory {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  parentId?: string
  promptCount: number
}

export interface PromptCollection {
  id: string
  title: string
  description: string
  cover?: string
  prompts: PromptItem[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  pricing: {
    type: 'free' | 'paid'
    price: number
  }
  stats: {
    downloads: number
    rating: number
  }
  createdAt: string
}

export interface PromptReview {
  id: string
  promptId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  helpful: number
  createdAt: string
}

export interface PromptPurchase {
  id: string
  userId: string
  promptId: string
  price: number
  currency: string
  status: 'pending' | 'completed' | 'refunded'
  createdAt: string
}

// Prompt分类配置
export const promptCategories: PromptCategory[] = [
  {
    id: 'writing',
    name: '写作助手',
    nameEn: 'Writing',
    description: '文章、文案、创意写作等',
    icon: '✍️',
    promptCount: 245
  },
  {
    id: 'coding',
    name: '编程开发',
    nameEn: 'Coding',
    description: '代码生成、调试、优化等',
    icon: '💻',
    promptCount: 189
  },
  {
    id: 'marketing',
    name: '营销推广',
    nameEn: 'Marketing',
    description: '广告文案、社媒营销等',
    icon: '📢',
    promptCount: 156
  },
  {
    id: 'business',
    name: '商业分析',
    nameEn: 'Business',
    description: '商业计划、市场分析等',
    icon: '📊',
    promptCount: 134
  },
  {
    id: 'education',
    name: '教育培训',
    nameEn: 'Education',
    description: '教学设计、课程开发等',
    icon: '🎓',
    promptCount: 98
  },
  {
    id: 'creativity',
    name: '创意设计',
    nameEn: 'Creativity',
    description: '创意构思、设计理念等',
    icon: '🎨',
    promptCount: 87
  }
]

// 示例Prompt数据
export const samplePrompts: PromptItem[] = [
  {
    id: 'prompt-1',
    title: '专业产品文案生成器',
    titleEn: 'Professional Product Copywriting Generator',
    description: '为任何产品快速生成吸引人的营销文案，提升转化率',
    descriptionEn: 'Generate compelling marketing copy for any product to boost conversion rates',
    content: `你是一位资深的营销文案专家。请为以下产品创建专业的营销文案：

产品名称：[产品名称]
产品类型：[产品类型]
目标用户：[目标用户群体]
核心卖点：[产品的3个核心优势]

请按以下结构输出：
1. 吸引人的标题（不超过20字）
2. 副标题（突出核心价值，不超过30字）
3. 产品描述（150-200字，突出痛点解决和价值）
4. 核心卖点（3个要点，每个不超过15字）
5. 行动召唤（鼓励用户购买或试用）

要求：
- 语言简洁有力，避免行业术语
- 突出用户利益而非产品功能
- 创造紧迫感和稀缺性
- 使用数据和具体结果来支撑`,
    category: promptCategories[2], // marketing
    tags: ['文案写作', '产品营销', '转化优化'],
    author: {
      id: 'author-1',
      name: '营销专家李明',
      avatar: '/placeholder.svg?height=40&width=40',
      verified: true,
      rating: 4.8
    },
    pricing: {
      type: 'paid',
      price: 29,
      originalPrice: 49,
      currency: 'CNY'
    },
    stats: {
      downloads: 1247,
      ratings: 156,
      averageRating: 4.7,
      favorites: 89,
      views: 5432
    },
    aiModels: ['ChatGPT', 'Claude', 'GPT-4'],
    industry: ['电商', '科技', '教育', '金融'],
    difficulty: 'intermediate',
    language: 'zh',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    featured: true,
    verified: true
  },
  {
    id: 'prompt-2',
    title: '代码审查和优化助手',
    titleEn: 'Code Review and Optimization Assistant',
    description: '专业的代码审查工具，提供优化建议和最佳实践',
    descriptionEn: 'Professional code review tool with optimization suggestions and best practices',
    content: `你是一位资深的软件工程师和代码审查专家。请对以下代码进行全面的审查和分析：

代码语言：[编程语言]
代码片段：
\`\`\`
[粘贴代码]
\`\`\`

请按以下维度进行分析：

1. **代码质量评估**
   - 可读性评分（1-10分）
   - 性能评估
   - 安全性检查

2. **具体问题识别**
   - 潜在Bug或错误
   - 性能瓶颈
   - 安全漏洞
   - 代码异味

3. **优化建议**
   - 重构建议（提供具体代码）
   - 性能优化方案
   - 最佳实践应用

4. **改进后代码**
   - 提供优化后的完整代码
   - 关键改动说明

要求：
- 分析要深入且实用
- 提供可执行的改进方案
- 遵循相应语言的最佳实践
- 考虑代码的可维护性和扩展性`,
    category: promptCategories[1], // coding
    tags: ['代码审查', '性能优化', '最佳实践'],
    author: {
      id: 'author-2',
      name: '技术大神王强',
      avatar: '/placeholder.svg?height=40&width=40',
      verified: true,
      rating: 4.9
    },
    pricing: {
      type: 'premium',
      price: 59,
      currency: 'CNY'
    },
    stats: {
      downloads: 892,
      ratings: 234,
      averageRating: 4.8,
      favorites: 156,
      views: 3421
    },
    aiModels: ['ChatGPT', 'Claude', 'GitHub Copilot'],
    industry: ['科技', '软件开发', 'IT服务'],
    difficulty: 'advanced',
    language: 'zh',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-25T16:45:00Z',
    featured: true,
    verified: true
  }
]

// Prompt市场服务
export class PromptMarketService {
  static async searchPrompts(query: string, filters?: {
    category?: string
    priceType?: string
    difficulty?: string
    aiModel?: string
    industry?: string
  }): Promise<PromptItem[]> {
    // 实际实现中连接后端API
    return samplePrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(query.toLowerCase()) ||
      prompt.description.toLowerCase().includes(query.toLowerCase()) ||
      prompt.tags.some(tag => tag.includes(query))
    )
  }

  static async getFeaturedPrompts(): Promise<PromptItem[]> {
    return samplePrompts.filter(prompt => prompt.featured)
  }

  static async getPromptsByCategory(categoryId: string): Promise<PromptItem[]> {
    return samplePrompts.filter(prompt => prompt.category.id === categoryId)
  }

  static async purchasePrompt(promptId: string, userId: string): Promise<PromptPurchase> {
    // 实际实现中处理支付逻辑
    return {
      id: 'purchase-' + Date.now(),
      userId,
      promptId,
      price: 29,
      currency: 'CNY',
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  }

  static async ratePrompt(promptId: string, userId: string, rating: number, comment: string): Promise<PromptReview> {
    return {
      id: 'review-' + Date.now(),
      promptId,
      userId,
      userName: '用户' + Math.floor(Math.random() * 1000),
      rating,
      comment,
      helpful: 0,
      createdAt: new Date().toISOString()
    }
  }

  static calculateRevenue(downloads: number, price: number, commissionRate: number = 0.3): number {
    return downloads * price * (1 - commissionRate)
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
