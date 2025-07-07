/**
 * 开发者服务和API市场系统
 */

export interface DeveloperAPI {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: 'ai-integration' | 'data-processing' | 'analytics' | 'automation' | 'utilities'
  provider: string
  version: string
  documentation: string
  playground?: string
  endpoints: APIEndpoint[]
  pricing: APIPricing
  usage: APIUsage
  rateLimit: RateLimit
  authentication: 'api-key' | 'oauth2' | 'jwt'
  status: 'active' | 'deprecated' | 'beta'
  features: string[]
  sdks: SDK[]
  examples: CodeExample[]
  popularity: number
  rating: number
  reviews: number
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters: APIParameter[]
  responses: APIResponse[]
  example: {
    request: any
    response: any
  }
}

export interface APIParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  example?: any
}

export interface APIResponse {
  statusCode: number
  description: string
  schema: any
  example: any
}

export interface APIPricing {
  model: 'free' | 'freemium' | 'pay-per-use' | 'subscription'
  freeTier?: {
    requestsPerMonth: number
    features: string[]
  }
  paidTiers: PricingTier[]
}

export interface PricingTier {
  name: string
  price: number
  currency: 'CNY' | 'USD'
  billingPeriod: 'monthly' | 'yearly' | 'per-request'
  requestsIncluded: number
  overageRate: number
  features: string[]
  support: string
}

export interface APIUsage {
  totalRequests: number
  monthlyRequests: number
  averageResponseTime: number
  successRate: number
  popularEndpoints: string[]
}

export interface RateLimit {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  burstLimit: number
}

export interface SDK {
  language: string
  version: string
  downloadUrl: string
  documentation: string
  examples: string[]
}

export interface CodeExample {
  title: string
  language: string
  description: string
  code: string
  response?: string
}

export interface DeveloperService {
  id: string
  name: string
  nameEn: string
  description: string
  category: 'consulting' | 'development' | 'integration' | 'training' | 'support'
  provider: string
  pricing: {
    type: 'hourly' | 'project' | 'monthly' | 'custom'
    startingPrice: number
    currency: 'CNY'
    estimatedHours?: number
  }
  deliverables: string[]
  timeline: string
  technologies: string[]
  experience: string
  portfolio: PortfolioItem[]
  rating: number
  reviews: number
  availability: 'available' | 'busy' | 'unavailable'
}

export interface PortfolioItem {
  title: string
  description: string
  technology: string[]
  link?: string
  image?: string
  results: string[]
}

// API市场配置
export const developerAPIs: DeveloperAPI[] = [
  {
    id: 'ai-text-analysis',
    name: 'AI文本分析API',
    nameEn: 'AI Text Analysis API',
    description: '提供文本情感分析、关键词提取、文本分类等功能',
    descriptionEn: 'Provides text sentiment analysis, keyword extraction, and text classification',
    category: 'ai-integration',
    provider: 'AI Navigator',
    version: '2.1.0',
    documentation: '/docs/ai-text-analysis',
    playground: '/playground/ai-text-analysis',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v2/text/sentiment',
        description: '分析文本情感倾向',
        parameters: [
          { name: 'text', type: 'string', required: true, description: '待分析的文本内容', example: '这个产品真的很棒！' },
          { name: 'language', type: 'string', required: false, description: '文本语言（zh/en）', example: 'zh' }
        ],
        responses: [
          {
            statusCode: 200,
            description: '分析成功',
            schema: { sentiment: 'string', confidence: 'number', emotions: 'object' },
            example: { sentiment: 'positive', confidence: 0.95, emotions: { joy: 0.8, trust: 0.7 } }
          }
        ],
        example: {
          request: { text: '这个产品真的很棒！', language: 'zh' },
          response: { sentiment: 'positive', confidence: 0.95, emotions: { joy: 0.8, trust: 0.7 } }
        }
      },
      {
        method: 'POST',
        path: '/api/v2/text/keywords',
        description: '提取文本关键词',
        parameters: [
          { name: 'text', type: 'string', required: true, description: '待分析的文本内容' },
          { name: 'count', type: 'number', required: false, description: '返回关键词数量', example: 10 }
        ],
        responses: [
          {
            statusCode: 200,
            description: '提取成功',
            schema: { keywords: 'array', scores: 'array' },
            example: { keywords: ['人工智能', '机器学习', '深度学习'], scores: [0.95, 0.88, 0.76] }
          }
        ],
        example: {
          request: { text: '人工智能和机器学习正在改变世界', count: 5 },
          response: { keywords: ['人工智能', '机器学习'], scores: [0.95, 0.88] }
        }
      }
    ],
    pricing: {
      model: 'freemium',
      freeTier: {
        requestsPerMonth: 1000,
        features: ['基础情感分析', '关键词提取']
      },
      paidTiers: [
        {
          name: '专业版',
          price: 99,
          currency: 'CNY',
          billingPeriod: 'monthly',
          requestsIncluded: 10000,
          overageRate: 0.01,
          features: ['高级情感分析', '实体识别', '文本分类', '优先支持'],
          support: '工作日响应'
        },
        {
          name: '企业版',
          price: 999,
          currency: 'CNY',
          billingPeriod: 'monthly',
          requestsIncluded: 100000,
          overageRate: 0.008,
          features: ['所有功能', '定制模型', '专属支持', 'SLA保障'],
          support: '24/7支持'
        }
      ]
    },
    usage: {
      totalRequests: 250000,
      monthlyRequests: 45000,
      averageResponseTime: 120,
      successRate: 99.8,
      popularEndpoints: ['/api/v2/text/sentiment', '/api/v2/text/keywords']
    },
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 100
    },
    authentication: 'api-key',
    status: 'active',
    features: [
      '多语言支持',
      '实时分析',
      '批量处理',
      '高精度算法',
      '详细文档',
      '在线测试'
    ],
    sdks: [
      {
        language: 'Python',
        version: '1.2.0',
        downloadUrl: '/sdk/python/ai-text-analysis-1.2.0.tar.gz',
        documentation: '/docs/sdk/python',
        examples: ['sentiment_basic.py', 'keyword_batch.py']
      },
      {
        language: 'JavaScript',
        version: '1.1.5',
        downloadUrl: '/sdk/js/ai-text-analysis-1.1.5.npm',
        documentation: '/docs/sdk/javascript',
        examples: ['sentiment.js', 'keyword.js']
      }
    ],
    examples: [
      {
        title: '情感分析示例',
        language: 'python',
        description: '分析文本的情感倾向',
        code: `import requests

api_key = "your_api_key"
text = "这个产品真的很棒！"

response = requests.post(
    "https://api.ai-navigator.com/v2/text/sentiment",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"text": text, "language": "zh"}
)

result = response.json()
print(f"情感: {result['sentiment']}")
print(f"置信度: {result['confidence']}")`,
        response: `{
  "sentiment": "positive",
  "confidence": 0.95,
  "emotions": {
    "joy": 0.8,
    "trust": 0.7
  }
}`
      }
    ],
    popularity: 8.5,
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'ai-image-gen',
    name: 'AI图像生成API',
    nameEn: 'AI Image Generation API',
    description: '基于文本描述生成高质量图像',
    descriptionEn: 'Generate high-quality images from text descriptions',
    category: 'ai-integration',
    provider: 'AI Navigator',
    version: '1.5.0',
    documentation: '/docs/ai-image-gen',
    playground: '/playground/ai-image-gen',
    endpoints: [
      {
        method: 'POST',
        path: '/api/v1/images/generate',
        description: '根据文本生成图像',
        parameters: [
          { name: 'prompt', type: 'string', required: true, description: '图像描述文本' },
          { name: 'size', type: 'string', required: false, description: '图像尺寸', example: '512x512' },
          { name: 'style', type: 'string', required: false, description: '图像风格', example: 'photorealistic' }
        ],
        responses: [
          {
            statusCode: 200,
            description: '生成成功',
            schema: { imageUrl: 'string', taskId: 'string' },
            example: { imageUrl: 'https://cdn.ai-navigator.com/images/abc123.jpg', taskId: 'task_456' }
          }
        ],
        example: {
          request: { prompt: '一只可爱的小猫坐在花园里', size: '512x512', style: 'photorealistic' },
          response: { imageUrl: 'https://cdn.ai-navigator.com/images/cat_garden.jpg', taskId: 'task_789' }
        }
      }
    ],
    pricing: {
      model: 'pay-per-use',
      paidTiers: [
        {
          name: '标准生成',
          price: 0.5,
          currency: 'CNY',
          billingPeriod: 'per-request',
          requestsIncluded: 1,
          overageRate: 0,
          features: ['512x512分辨率', '标准质量'],
          support: '社区支持'
        },
        {
          name: '高清生成',
          price: 2,
          currency: 'CNY',
          billingPeriod: 'per-request',
          requestsIncluded: 1,
          overageRate: 0,
          features: ['1024x1024分辨率', '高清质量', '多风格'],
          support: '邮件支持'
        }
      ]
    },
    usage: {
      totalRequests: 89000,
      monthlyRequests: 12000,
      averageResponseTime: 3500,
      successRate: 98.5,
      popularEndpoints: ['/api/v1/images/generate']
    },
    rateLimit: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 500,
      burstLimit: 20
    },
    authentication: 'api-key',
    status: 'active',
    features: [
      '多种风格',
      '高分辨率',
      '快速生成',
      '商业授权',
      '批量处理'
    ],
    sdks: [
      {
        language: 'Python',
        version: '1.0.3',
        downloadUrl: '/sdk/python/ai-image-gen-1.0.3.tar.gz',
        documentation: '/docs/sdk/python-image',
        examples: ['generate_basic.py', 'batch_generate.py']
      }
    ],
    examples: [
      {
        title: '基础图像生成',
        language: 'python',
        description: '根据文本生成图像',
        code: `import requests

api_key = "your_api_key"
prompt = "一只可爱的小猫坐在花园里"

response = requests.post(
    "https://api.ai-navigator.com/v1/images/generate",
    headers={"Authorization": f"Bearer {api_key}"},
    json={
        "prompt": prompt,
        "size": "512x512",
        "style": "photorealistic"
    }
)

result = response.json()
print(f"图像URL: {result['imageUrl']}")`,
        response: `{
  "imageUrl": "https://cdn.ai-navigator.com/images/cat_garden.jpg",
  "taskId": "task_789"
}`
      }
    ],
    popularity: 9.2,
    rating: 4.8,
    reviews: 203
  }
]

// 开发者服务配置
export const developerServices: DeveloperService[] = [
  {
    id: 'ai-integration-consulting',
    name: 'AI集成咨询服务',
    nameEn: 'AI Integration Consulting',
    description: '帮助企业快速集成AI工具，优化业务流程',
    category: 'consulting',
    provider: '李明 - 高级AI架构师',
    pricing: {
      type: 'hourly',
      startingPrice: 800,
      currency: 'CNY',
      estimatedHours: 20
    },
    deliverables: [
      'AI集成方案设计',
      '技术选型建议',
      '实施计划制定',
      '风险评估报告',
      '性能优化建议'
    ],
    timeline: '2-4周',
    technologies: ['OpenAI API', 'Claude API', 'Azure Cognitive Services', 'TensorFlow', 'PyTorch'],
    experience: '5年AI集成经验，服务过50+企业客户',
    portfolio: [
      {
        title: '电商智能客服系统',
        description: '为大型电商平台集成AI客服，提升客户满意度40%',
        technology: ['GPT-4', 'Rasa', 'Redis', 'PostgreSQL'],
        results: ['客户满意度提升40%', '响应时间减少60%', '人工客服成本降低50%']
      },
      {
        title: '金融风控AI系统',
        description: '构建实时风险评估系统，准确率达到95%',
        technology: ['XGBoost', 'Apache Kafka', 'Elasticsearch'],
        results: ['风险识别准确率95%', '误报率降低30%', '处理速度提升5倍']
      }
    ],
    rating: 4.9,
    reviews: 32,
    availability: 'available'
  },
  {
    id: 'custom-ai-development',
    name: '定制AI应用开发',
    nameEn: 'Custom AI Application Development',
    description: '从零开始构建专属的AI应用和解决方案',
    category: 'development',
    provider: '张伟 - 全栈AI开发者',
    pricing: {
      type: 'project',
      startingPrice: 50000,
      currency: 'CNY'
    },
    deliverables: [
      '完整AI应用系统',
      '前端用户界面',
      '后端API服务',
      '数据库设计',
      '部署和运维方案',
      '用户培训文档'
    ],
    timeline: '6-12周',
    technologies: ['Next.js', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS/阿里云'],
    experience: '8年软件开发经验，专注AI应用开发3年',
    portfolio: [
      {
        title: '智能写作助手',
        description: '基于GPT的专业写作工具，支持多种文体',
        technology: ['Next.js', 'OpenAI API', 'Supabase', 'Vercel'],
        results: ['用户活跃度90%', '写作效率提升3倍', '月收入突破10万']
      }
    ],
    rating: 4.8,
    reviews: 18,
    availability: 'busy'
  }
]

// API市场管理类
export class APIMarketplace {
  static async searchAPIs(query: string, category?: string): Promise<DeveloperAPI[]> {
    let results = developerAPIs
    
    if (category) {
      results = results.filter(api => api.category === category)
    }
    
    if (query) {
      results = results.filter(api => 
        api.name.toLowerCase().includes(query.toLowerCase()) ||
        api.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return results.sort((a, b) => b.popularity - a.popularity)
  }

  static async getAPIUsageStats(apiId: string, period: 'day' | 'week' | 'month'): Promise<{
    requests: number[]
    timestamps: string[]
    errors: number[]
    avgResponseTime: number[]
  }> {
    // 模拟使用统计数据
    const days = period === 'day' ? 24 : period === 'week' ? 7 : 30
    const requests = Array.from({ length: days }, () => Math.floor(Math.random() * 1000))
    const timestamps = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - days + i)
      return date.toISOString()
    })
    
    return {
      requests,
      timestamps,
      errors: requests.map(r => Math.floor(r * 0.02)),
      avgResponseTime: requests.map(() => 100 + Math.random() * 50)
    }
  }

  static async generateAPIKey(userId: string, apiId: string): Promise<string> {
    return `ak_${userId}_${apiId}_${Date.now()}`
  }

  static async testAPIEndpoint(apiId: string, endpoint: string, params: any): Promise<{
    success: boolean
    responseTime: number
    data?: any
    error?: string
  }> {
    // 模拟API测试
    const responseTime = 100 + Math.random() * 200
    
    return {
      success: Math.random() > 0.1,
      responseTime,
      data: { message: 'Test successful', timestamp: new Date().toISOString() }
    }
  }
}

// 开发者服务管理类
export class DeveloperServiceManager {
  static async searchServices(query: string, category?: string): Promise<DeveloperService[]> {
    let results = developerServices
    
    if (category) {
      results = results.filter(service => service.category === category)
    }
    
    if (query) {
      results = results.filter(service => 
        service.name.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return results.sort((a, b) => b.rating - a.rating)
  }

  static async bookConsultation(serviceId: string, userInfo: {
    name: string
    email: string
    company: string
    requirements: string
    budget: string
    timeline: string
  }): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    // 模拟预约咨询
    return {
      success: true,
      bookingId: 'booking_' + Date.now()
    }
  }

  static async getServiceReviews(serviceId: string): Promise<{
    rating: number
    reviews: Array<{
      id: string
      userName: string
      rating: number
      comment: string
      date: string
      verified: boolean
    }>
  }> {
    // 模拟评价数据
    return {
      rating: 4.8,
      reviews: [
        {
          id: 'review_1',
          userName: '王总',
          rating: 5,
          comment: '专业度很高，交付及时，后续支持也很到位',
          date: '2024-11-15',
          verified: true
        },
        {
          id: 'review_2',
          userName: '李经理',
          rating: 4,
          comment: '技术实力强，沟通顺畅，推荐合作',
          date: '2024-11-10',
          verified: true
        }
      ]
    }
  }
}