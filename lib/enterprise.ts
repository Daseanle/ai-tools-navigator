/**
 * 企业定制服务系统
 */

export interface EnterpriseService {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  category: 'consulting' | 'integration' | 'training' | 'custom'
  features: string[]
  pricing: {
    type: 'project' | 'monthly' | 'yearly'
    startingPrice: number
    currency: 'CNY' | 'USD'
    customQuote: boolean
  }
  deliverables: string[]
  timeline: string
  teamSize: string
  supportLevel: string
  popular: boolean
}

export interface EnterpriseInquiry {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  teamSize: string
  services: string[]
  requirements: string
  budget: string
  timeline: string
  status: 'pending' | 'contacted' | 'quoted' | 'closed'
  createdAt: string
}

export interface EnterpriseClient {
  id: string
  companyName: string
  industry: string
  teamSize: number
  services: string[]
  startDate: string
  contract: {
    type: 'monthly' | 'yearly' | 'project'
    value: number
    duration: string
  }
  success: {
    toolsImplemented: number
    efficiencyGain: string
    costSaving: string
    satisfaction: number
  }
}

// 企业服务配置
export const enterpriseServices: EnterpriseService[] = [
  {
    id: 'ai-audit',
    name: 'AI工具审计咨询',
    nameEn: 'AI Tools Audit Consulting',
    description: '全面评估企业现有AI工具使用情况，提供优化建议',
    descriptionEn: 'Comprehensive evaluation of enterprise AI tool usage with optimization recommendations',
    category: 'consulting',
    features: [
      '现有AI工具深度分析',
      '使用效率评估报告',
      '成本效益分析',
      '优化路径规划',
      '安全风险评估',
      '合规性检查'
    ],
    pricing: {
      type: 'project',
      startingPrice: 58000,
      currency: 'CNY',
      customQuote: true
    },
    deliverables: [
      'AI工具使用现状报告',
      '优化建议方案',
      '实施路线图',
      '风险评估报告'
    ],
    timeline: '2-4周',
    teamSize: '3-5人专家团队',
    supportLevel: '项目期间24/7支持',
    popular: true
  },
  {
    id: 'custom-platform',
    name: '企业AI工具管理平台',
    nameEn: 'Enterprise AI Tools Management Platform',
    description: '定制化AI工具统一管理平台，提升团队协作效率',
    descriptionEn: 'Customized unified AI tools management platform to improve team collaboration',
    category: 'custom',
    features: [
      '统一工具管理界面',
      '团队权限管控',
      '使用数据分析',
      '成本追踪',
      'SSO单点登录',
      'API集成'
    ],
    pricing: {
      type: 'project',
      startingPrice: 128000,
      currency: 'CNY',
      customQuote: true
    },
    deliverables: [
      '定制化管理平台',
      '移动端应用',
      '管理员培训',
      '技术文档'
    ],
    timeline: '6-12周',
    teamSize: '5-8人开发团队',
    supportLevel: '1年免费维护',
    popular: false
  },
  {
    id: 'team-training',
    name: 'AI效率提升培训',
    nameEn: 'AI Efficiency Training Program',
    description: '针对性的AI工具使用培训，快速提升团队生产力',
    descriptionEn: 'Targeted AI tools training to rapidly improve team productivity',
    category: 'training',
    features: [
      '岗位定制化培训',
      '实战项目演练',
      '效果跟踪评估',
      '持续指导支持',
      '最佳实践分享',
      '认证考核'
    ],
    pricing: {
      type: 'project',
      startingPrice: 28000,
      currency: 'CNY',
      customQuote: false
    },
    deliverables: [
      '培训课程体系',
      '实操手册',
      '在线学习平台',
      '效果评估报告'
    ],
    timeline: '3-6周',
    teamSize: '2-3人培训师',
    supportLevel: '培训后3个月跟踪',
    popular: true
  },
  {
    id: 'api-integration',
    name: 'AI工具API集成服务',
    nameEn: 'AI Tools API Integration Service',
    description: '帮助企业快速集成各类AI工具API，构建智能化业务流程',
    descriptionEn: 'Help enterprises quickly integrate AI tools APIs to build intelligent business processes',
    category: 'integration',
    features: [
      '多平台API对接',
      '数据流设计',
      '自动化工作流',
      '监控告警系统',
      '性能优化',
      '故障处理'
    ],
    pricing: {
      type: 'project',
      startingPrice: 88000,
      currency: 'CNY',
      customQuote: true
    },
    deliverables: [
      '集成技术方案',
      'API对接代码',
      '监控面板',
      '运维文档'
    ],
    timeline: '4-8周',
    teamSize: '3-6人技术团队',
    supportLevel: '6个月技术支持',
    popular: false
  }
]

// 成功案例
export const enterpriseClients: EnterpriseClient[] = [
  {
    id: 'client-1',
    companyName: '某大型电商平台',
    industry: '电子商务',
    teamSize: 500,
    services: ['ai-audit', 'custom-platform', 'team-training'],
    startDate: '2024-01-15',
    contract: {
      type: 'yearly',
      value: 980000,
      duration: '2年'
    },
    success: {
      toolsImplemented: 15,
      efficiencyGain: '提升45%',
      costSaving: '年节省180万',
      satisfaction: 4.8
    }
  },
  {
    id: 'client-2',
    companyName: '某金融科技公司',
    industry: '金融科技',
    teamSize: 200,
    services: ['api-integration', 'team-training'],
    startDate: '2024-02-20',
    contract: {
      type: 'project',
      value: 460000,
      duration: '6个月'
    },
    success: {
      toolsImplemented: 8,
      efficiencyGain: '提升32%',
      costSaving: '年节省85万',
      satisfaction: 4.9
    }
  }
]

// 行业解决方案
export interface IndustrySolution {
  id: string
  name: string
  nameEn: string
  industry: string
  description: string
  challenges: string[]
  solutions: string[]
  tools: string[]
  caseStudy?: {
    company: string
    results: string[]
  }
}

export const industrySolutions: IndustrySolution[] = [
  {
    id: 'finance-solution',
    name: '金融行业AI解决方案',
    nameEn: 'Financial Industry AI Solution',
    industry: '金融',
    description: '为金融机构提供全面的AI工具整合方案，提升服务效率和风控能力',
    challenges: [
      '客户服务效率低下',
      '风险识别不够精准',
      '合规成本居高不下',
      '数据分析能力不足'
    ],
    solutions: [
      'AI客服系统集成',
      '智能风控模型',
      '自动化合规检查',
      '大数据分析平台'
    ],
    tools: [
      'ChatGPT for Business',
      'Claude Enterprise',
      '风控AI模型',
      '数据分析工具'
    ],
    caseStudy: {
      company: '某大型银行',
      results: [
        '客服效率提升60%',
        '风险识别准确率提升35%',
        '合规成本降低40%'
      ]
    }
  },
  {
    id: 'ecommerce-solution',
    name: '电商行业AI解决方案',
    nameEn: 'E-commerce AI Solution',
    industry: '电商',
    description: '帮助电商企业通过AI工具提升运营效率和用户体验',
    challenges: [
      '商品描述编写耗时',
      '客户咨询响应慢',
      '营销内容创作难',
      '数据分析不够深入'
    ],
    solutions: [
      'AI商品文案生成',
      '智能客服机器人',
      '营销内容自动化',
      '用户行为分析'
    ],
    tools: [
      'Jasper AI',
      'Midjourney',
      'ChatGPT',
      '数据分析平台'
    ],
    caseStudy: {
      company: '某头部电商',
      results: [
        '文案创作效率提升80%',
        '客服响应速度提升50%',
        '转化率提升25%'
      ]
    }
  }
]

// 企业服务管理
export class EnterpriseService {
  static async submitInquiry(inquiry: Omit<EnterpriseInquiry, 'id' | 'status' | 'createdAt'>): Promise<EnterpriseInquiry> {
    return {
      id: 'inquiry-' + Date.now(),
      ...inquiry,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  }

  static async getServicesByCategory(category: string): Promise<EnterpriseService[]> {
    return enterpriseServices.filter(service => service.category === category)
  }

  static async calculateROI(teamSize: number, currentCosts: number, services: string[]): Promise<{
    implementationCost: number
    monthlySaving: number
    paybackPeriod: number
    yearlyROI: number
  }> {
    // 简化的ROI计算逻辑
    const implementationCost = teamSize * 1000 + services.length * 20000
    const monthlySaving = teamSize * 500
    const paybackPeriod = implementationCost / monthlySaving
    const yearlyROI = ((monthlySaving * 12 - implementationCost) / implementationCost) * 100

    return {
      implementationCost,
      monthlySaving,
      paybackPeriod,
      yearlyROI
    }
  }
}