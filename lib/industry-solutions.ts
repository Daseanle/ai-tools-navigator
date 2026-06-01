/**
 * 行业解决方案系统
 * 针对不同行业提供定制化AI工具解决方案
 */

export interface IndustrySolution {
  id: string
  name: string
  description: string
  icon: string
  category: 'business' | 'education' | 'healthcare' | 'finance' | 'creative' | 'technology' | 'ecommerce'
  targetAudience: string[]
  painPoints: string[]
  solutions: string[]
  recommendedTools: string[]
  pricing: {
    consultation: number
    implementation: number
    support: number
  }
  caseStudies: CaseStudy[]
  benefits: string[]
  timeline: string
  featured: boolean
}

export interface CaseStudy {
  id: string
  companyName: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: {
    efficiency: number
    costSaving: number
    timeReduction: number
  }
  testimonial: string
  logo?: string
}

export interface VerticalPage {
  id: string
  title: string
  slug: string
  description: string
  industry: string
  targetKeywords: string[]
  tools: string[]
  content: {
    hero: {
      title: string
      subtitle: string
      cta: string
    }
    sections: VerticalSection[]
  }
  seo: {
    metaTitle: string
    metaDescription: string
    structuredData: any
  }
}

export interface VerticalSection {
  type: 'tools' | 'comparison' | 'tutorial' | 'benefits' | 'faq'
  title: string
  content: any
}

// 行业解决方案配置
export const industrySolutions: IndustrySolution[] = [
  {
    id: 'enterprise-ai-automation',
    name: '企业级AI自动化解决方案',
    description: '为大中型企业提供全方位AI自动化改造，提升运营效率，降低人力成本',
    icon: '🏢',
    category: 'business',
    targetAudience: ['大型企业', '制造业', '零售连锁', '金融机构'],
    painPoints: [
      '人力成本持续上升',
      '重复性工作效率低下',
      '数据处理能力不足',
      '客户服务响应慢',
      '决策缺乏数据支撑'
    ],
    solutions: [
      '智能客服机器人部署',
      '文档自动化处理系统',
      '数据分析和预测模型',
      '工作流程优化方案',
      '员工AI技能培训'
    ],
    recommendedTools: ['ChatGPT Enterprise', 'Claude Pro', 'GitHub Copilot', 'Notion AI', 'Zapier'],
    pricing: {
      consultation: 50000,
      implementation: 200000,
      support: 30000
    },
    caseStudies: [
      {
        id: 'case-1',
        companyName: '某世界500强制造集团',
        industry: '智能制造',
        challenge: '生产线效率低下，质量控制不稳定，订单交付周期长达45天，客户投诉率居高不下，人工成本占比超过60%',
        solution: '部署AI智能排产系统、机器视觉质检平台、预测性维护系统、智能客服机器人，建立数据驱动的生产管理体系',
        results: [
          '生产效率提升42%，日产能从1200件提升至1704件',
          '产品合格率从92%提升至98.5%',
          '订单交付周期缩短至28天，准时交付率达96%',
          '客户满意度从72分提升至89分',
          '人工成本降低38%，年节省费用2800万元'
        ],
        metrics: {
          efficiency: 42,
          costSaving: 38,
          timeReduction: 38
        },
        testimonial: 'AI智能制造解决方案彻底改变了我们的生产模式，不仅提升了效率，更重要的是让我们在激烈的市场竞争中占据了先机。'
      }
    ],
    benefits: [
      '降低运营成本30-50%',
      '提升工作效率40-60%',
      '减少人为错误80%',
      '24/7全天候服务',
      '数据驱动决策'
    ],
    timeline: '3-6个月',
    featured: true
  },
  {
    id: 'education-ai-platform',
    name: '智慧教育AI平台',
    description: '为教育机构提供个性化教学、智能批改、学习分析等AI教育解决方案',
    icon: '🎓',
    category: 'education',
    targetAudience: ['高等院校', 'K12学校', '在线教育机构', '培训机构'],
    painPoints: [
      '个性化教学难以实现',
      '作业批改耗时巨大',
      '学习效果难以量化',
      '教学资源分配不均',
      '学生学习动机不足'
    ],
    solutions: [
      'AI个性化学习路径推荐',
      '智能作业批改系统',
      '学习数据分析平台',
      'AI教学助手工具',
      '虚拟实验室环境'
    ],
    recommendedTools: ['Khan Academy AI', 'Grammarly Education', 'Coursera AI', 'Duolingo'],
    pricing: {
      consultation: 30000,
      implementation: 150000,
      support: 20000
    },
    caseStudies: [
      {
        id: 'case-2',
        companyName: '某头部K12在线教育机构',
        industry: '在线教育',
        challenge: '学生学习完成率仅32%，个性化推荐准确率低于40%，教师批改作业平均耗时4小时/天，用户流失率高达65%',
        solution: '部署AI个性化学习路径引擎、智能作业批改系统、学习行为分析平台、自适应推荐算法',
        results: [
          '学习完成率从32%提升至78%，提升146%',
          '个性化推荐准确率达85%，用户点击率提升120%',
          '教师批改时间从4小时缩短至45分钟，效率提升433%',
          '用户月活跃度提升89%，续费率从35%提升至72%',
          '学习效果评估得分平均提升34分'
        ],
        metrics: {
          efficiency: 78,
          costSaving: 42,
          timeReduction: 82
        },
        testimonial: '通过AI技术改造，我们的教学质量和用户体验都得到了质的飞跃。学生学习效果明显提升，教师工作强度大幅降低，平台竞争力显著增强。'
      }
    ],
    benefits: [
      '提升学习效果40-60%',
      '减少教师工作量50%',
      '个性化学习体验',
      '实时学习数据分析',
      '降低教育成本'
    ],
    timeline: '2-4个月',
    featured: true
  },
  {
    id: 'healthcare-ai-diagnosis',
    name: '医疗AI辅助诊断系统',
    description: '为医疗机构提供AI影像诊断、病历分析、药物推荐等智能医疗解决方案',
    icon: '🏥',
    category: 'healthcare',
    targetAudience: ['三甲医院', '专科医院', '体检中心', '诊所'],
    painPoints: [
      '医生诊断工作量大',
      '影像分析耗时长',
      '误诊风险存在',
      '医疗资源分配不均',
      '病历管理复杂'
    ],
    solutions: [
      'AI医学影像识别',
      '智能病历分析系统',
      '药物相互作用检测',
      '疾病风险预测模型',
      '医疗知识库问答'
    ],
    recommendedTools: ['Google Health AI', 'IBM Watson Health', 'NVIDIA Clara'],
    pricing: {
      consultation: 80000,
      implementation: 500000,
      support: 50000
    },
    caseStudies: [
      {
        id: 'case-3',
        companyName: '某省级三甲综合医院',
        industry: '医疗健康',
        challenge: '影像科日处理CT/MRI片约800例，医生平均工作12小时，误诊率约8%，患者等待报告时间48小时，医疗纠纷频发',
        solution: '部署AI医学影像智能识别系统、多模态诊断辅助平台、临床决策支持系统、智能报告生成工具',
        results: [
          '影像诊断准确率从92%提升至97.8%',
          '诊断报告时间从48小时缩短至6小时，提速800%',
          '医生日均工作时间从12小时降至8.5小时',
          '患者满意度从76分提升至94分',
          '医疗纠纷案例减少73%，风险大幅降低'
        ],
        metrics: {
          efficiency: 67,
          costSaving: 29,
          timeReduction: 87
        },
        testimonial: 'AI辅助诊断系统不仅大幅提升了我们的诊断效率和精度，更重要的是减轻了医生工作压力，让我们能为患者提供更优质的医疗服务。'
      }
    ],
    benefits: [
      '提升诊断准确率10-20%',
      '缩短诊断时间50-70%',
      '降低医疗事故风险',
      '优化医疗资源配置',
      '提升患者体验'
    ],
    timeline: '6-12个月',
    featured: true
  },
  {
    id: 'finance-ai-risk-control',
    name: '金融AI风控系统',
    description: '为金融机构提供智能风险评估、反欺诈检测、投资分析等AI金融解决方案',
    icon: '💰',
    category: 'finance',
    targetAudience: ['银行', '证券公司', '保险公司', '金融科技公司'],
    painPoints: [
      '风险识别滞后',
      '欺诈检测准确率低',
      '信贷审批效率慢',
      '投资决策缺乏数据支撑',
      '合规成本高'
    ],
    solutions: [
      'AI智能风险评估',
      '实时反欺诈检测',
      '自动化信贷审批',
      '量化投资策略',
      '智能合规监控'
    ],
    recommendedTools: ['Palantir', 'DataRobot', 'H2O.ai', 'Ayasdi'],
    pricing: {
      consultation: 100000,
      implementation: 800000,
      support: 80000
    },
    caseStudies: [
      {
        id: 'case-4',
        companyName: '某股份制商业银行',
        industry: '银行业',
        challenge: '信贷审批平均耗时7个工作日，人工审核成本高，欺诈损失年达2300万元，风险识别准确率仅65%，客户体验差',
        solution: '部署AI智能风控引擎、实时反欺诈系统、自动化信贷审批流程、风险预警平台、客户画像分析系统',
        results: [
          '信贷审批时间从7天缩短至2小时，效率提升2800%',
          '风险识别准确率从65%提升至92%，准确率提升42%',
          '欺诈损失从2300万降至680万，减损70%',
          '人工审核成本降低58%，年节约1200万元',
          '客户满意度从68分提升至89分，NPS值大幅改善'
        ],
        metrics: {
          efficiency: 94,
          costSaving: 58,
          timeReduction: 97
        },
        testimonial: 'AI风控系统的应用让我们在保障资金安全的同时，极大提升了客户体验。数字化转型成果显著，风险管理能力实现了跨越式发展。'
      }
    ],
    benefits: [
      '提升风险识别准确率30-50%',
      '缩短审批时间70-90%',
      '降低欺诈损失60-80%',
      '优化资本配置',
      '提升合规效率'
    ],
    timeline: '4-8个月',
    featured: true
  },
  {
    id: 'creative-ai-content',
    name: '创意AI内容生产平台',
    description: '为创意机构提供AI写作、设计、视频制作等全方位创意内容解决方案',
    icon: '🎨',
    category: 'creative',
    targetAudience: ['广告公司', '设计工作室', '媒体机构', '内容创作者'],
    painPoints: [
      '创意灵感来源有限',
      '内容制作周期长',
      '人力成本高昂',
      '质量控制困难',
      '多媒体协作复杂'
    ],
    solutions: [
      'AI创意内容生成',
      '智能设计工具集',
      '视频自动化制作',
      '多语言内容翻译',
      '品牌一致性检查'
    ],
    recommendedTools: ['Midjourney', 'RunwayML', 'Jasper', 'Copy.ai', 'Canva AI'],
    pricing: {
      consultation: 25000,
      implementation: 100000,
      support: 15000
    },
    caseStudies: [
      {
        id: 'case-5',
        companyName: '某4A广告公司',
        industry: '广告创意',
        challenge: '创意制作周期长，人力成本高，客户需求变化快',
        solution: '部署AI创意生成平台、智能设计工具、自动化工作流',
        results: [
          '创意制作效率提升70%',
          '人力成本降低45%',
          '客户满意度提升40%',
          '项目交付速度提升60%'
        ],
        metrics: {
          efficiency: 70,
          costSaving: 45,
          timeReduction: 60
        },
        testimonial: 'AI创意工具让我们能够更快响应客户需求，创意质量也有显著提升。'
      }
    ],
    benefits: [
      '提升创意效率60-80%',
      '降低制作成本40-60%',
      '缩短交付周期50-70%',
      '提升创意质量',
      '增强市场竞争力'
    ],
    timeline: '1-3个月',
    featured: false
  },
  {
    id: 'technology-ai-development',
    name: '科技AI开发加速平台',
    description: '为科技公司提供AI模型开发、代码生成、测试自动化等技术解决方案',
    icon: '💻',
    category: 'technology',
    targetAudience: ['软件公司', '互联网企业', '游戏公司', '初创公司'],
    painPoints: [
      '开发周期长',
      '代码质量不稳定',
      '测试工作量大',
      'AI人才稀缺',
      '技术债务积累'
    ],
    solutions: [
      'AI代码生成工具',
      '智能测试自动化',
      '代码质量检测',
      'AI模型开发平台',
      '技术债务分析'
    ],
    recommendedTools: ['GitHub Copilot', 'Tabnine', 'DeepCode', 'TestCraft', 'DataRobot'],
    pricing: {
      consultation: 40000,
      implementation: 200000,
      support: 25000
    },
    caseStudies: [
      {
        id: 'case-6',
        companyName: '某独角兽科技公司',
        industry: '互联网科技',
        challenge: '开发团队效率不高，代码bug较多，产品迭代速度慢',
        solution: '部署AI编程助手、自动化测试平台、代码质量监控系统',
        results: [
          '开发效率提升55%',
          '代码bug减少65%',
          '发布频率提升80%',
          '技术债务降低50%'
        ],
        metrics: {
          efficiency: 55,
          costSaving: 30,
          timeReduction: 45
        },
        testimonial: 'AI开发工具极大提升了我们团队的开发效率和代码质量。'
      }
    ],
    benefits: [
      '提升开发效率50-70%',
      '减少代码bug60-80%',
      '加快产品迭代',
      '降低技术门槛',
      '提升代码质量'
    ],
    timeline: '2-4个月',
    featured: false
  },
  {
    id: 'ecommerce-ai-platform',
    name: '跨境电商AI智能运营平台',
    description: '为跨境电商企业提供AI选品、智能定价、多语言客服、广告优化等全链路解决方案',
    icon: '🛒',
    category: 'ecommerce',
    targetAudience: ['跨境电商企业', '亚马逊卖家', '独立站商家', '电商服务商'],
    painPoints: [
      '选品决策缺乏数据支撑',
      '多平台定价策略复杂',
      '多语言客服成本高',
      '广告投放ROI不稳定',
      '库存管理效率低'
    ],
    solutions: [
      'AI智能选品分析系统',
      '动态定价策略引擎',
      '多语言智能客服机器人',
      '广告投放智能优化',
      '库存预测和补货建议'
    ],
    recommendedTools: ['Jungle Scout AI', 'Helium 10', 'ChatGPT', 'DeepL', 'Google Ads AI'],
    pricing: {
      consultation: 35000,
      implementation: 180000,
      support: 22000
    },
    caseStudies: [
      {
        id: 'case-7',
        companyName: '某跨境电商头部企业',
        industry: '跨境电商',
        challenge: '管理500+SKU选品困难，7个站点定价复杂，客服成本占营收15%，广告ACOS居高不下',
        solution: '部署AI选品推荐引擎、智能定价系统、多语言客服机器人、广告智能投放平台',
        results: [
          '选品成功率从25%提升至68%，爆款SKU增长172%',
          '定价效率提升300%，毛利率从28%提升至35%',
          '客服成本从15%降至6%，响应时间从4小时缩短至15分钟',
          '广告ACOS从35%优化至18%，ROI提升94%',
          '整体营收增长156%，年GMV突破2.8亿'
        ],
        metrics: {
          efficiency: 86,
          costSaving: 45,
          timeReduction: 78
        },
        testimonial: '通过AI技术赋能，我们从传统的人工运营转向了数据驱动的精细化运营，不仅大幅降低了成本，更实现了业务的爆发式增长。'
      }
    ],
    benefits: [
      '提升选品成功率60-80%',
      '降低运营成本40-60%',
      '提升客服效率200-400%',
      '优化广告ROI 50-100%',
      '增强多市场竞争力'
    ],
    timeline: '3-5个月',
    featured: true
  }
]

// 垂直页面配置
export const verticalPages: VerticalPage[] = [
  {
    id: 'ai-tools-for-lawyers',
    title: '法律AI工具推荐',
    slug: 'lawyers',
    description: '为法律从业者推荐最适合的AI工具，提升法律工作效率',
    industry: 'legal',
    targetKeywords: ['法律AI工具', '律师AI助手', '法律文书AI', '案例分析AI'],
    tools: ['ChatGPT', 'Claude', 'Lexis+ AI', 'CaseText'],
    content: {
      hero: {
        title: '法律AI工具大全',
        subtitle: '发现最适合法律从业者的AI工具，提升工作效率，优化法律服务',
        cta: '探索法律AI工具'
      },
      sections: [
        {
          type: 'tools',
          title: '推荐法律AI工具',
          content: {
            featured: ['ChatGPT', 'Claude', 'Lexis+ AI'],
            categories: ['文书起草', '案例分析', '法律研究', '合同审查']
          }
        },
        {
          type: 'benefits',
          title: '法律AI的优势',
          content: [
            '提升文书起草效率60%',
            '加快案例研究速度80%',
            '减少人为错误',
            '24/7法律咨询支持'
          ]
        },
        {
          type: 'tutorial',
          title: '如何选择法律AI工具',
          content: {
            steps: [
              '确定具体需求场景',
              '评估工具专业性',
              '考虑数据安全性',
              '试用核心功能',
              '评估成本效益'
            ]
          }
        }
      ]
    },
    seo: {
      metaTitle: '法律AI工具推荐 - 律师必备的人工智能助手',
      metaDescription: '为法律从业者推荐最专业的AI工具，包括文书起草、案例分析、法律研究等，提升法律工作效率。',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '法律AI工具推荐',
        description: '专为法律从业者打造的AI工具集合页面'
      }
    }
  },
  {
    id: 'ai-tools-for-doctors',
    title: '医疗AI工具推荐',
    slug: 'doctors',
    description: '为医疗从业者推荐专业的医疗AI工具，辅助诊断和治疗',
    industry: 'healthcare',
    targetKeywords: ['医疗AI工具', '医生AI助手', '诊断AI', '医学影像AI'],
    tools: ['Google Health AI', 'IBM Watson Health', 'Aidoc', 'PathAI'],
    content: {
      hero: {
        title: '医疗AI工具精选',
        subtitle: '发现最先进的医疗AI工具，提升诊断准确性，优化医疗服务质量',
        cta: '探索医疗AI工具'
      },
      sections: [
        {
          type: 'tools',
          title: '专业医疗AI工具',
          content: {
            featured: ['Google Health AI', 'IBM Watson Health', 'Aidoc'],
            categories: ['影像诊断', '病理分析', '药物研发', '临床决策']
          }
        },
        {
          type: 'benefits',
          title: '医疗AI的价值',
          content: [
            '提升诊断准确率15%',
            '缩短诊断时间60%',
            '降低医疗风险',
            '优化治疗方案'
          ]
        }
      ]
    },
    seo: {
      metaTitle: '医疗AI工具推荐 - 医生必备的智能诊断助手',
      metaDescription: '为医疗从业者推荐最专业的AI诊断工具，包括影像分析、病理诊断、临床决策支持等。',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '医疗AI工具推荐',
        description: '专为医疗从业者打造的AI工具集合页面'
      }
    }
  },
  {
    id: 'ai-tools-for-teachers',
    title: '教育AI工具推荐',
    slug: 'teachers',
    description: '为教育工作者推荐最实用的教育AI工具，提升教学质量',
    industry: 'education',
    targetKeywords: ['教育AI工具', '教师AI助手', '智能教学', '在线教育AI'],
    tools: ['Khan Academy AI', 'Grammarly Education', 'Squirrel AI', 'Century'],
    content: {
      hero: {
        title: '教育AI工具集合',
        subtitle: '发现最适合教育工作者的AI工具，个性化教学，提升学习效果',
        cta: '探索教育AI工具'
      },
      sections: [
        {
          type: 'tools',
          title: '推荐教育AI工具',
          content: {
            featured: ['Khan Academy AI', 'Grammarly Education', 'Squirrel AI'],
            categories: ['个性化学习', '智能批改', '课程设计', '学习分析']
          }
        },
        {
          type: 'benefits',
          title: '教育AI的优势',
          content: [
            '个性化学习路径',
            '自动化作业批改',
            '学习数据分析',
            '提升教学效率50%'
          ]
        }
      ]
    },
    seo: {
      metaTitle: '教育AI工具推荐 - 教师必备的智能教学助手',
      metaDescription: '为教育工作者推荐最实用的AI教学工具，包括个性化学习、智能批改、课程设计等。',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '教育AI工具推荐',
        description: '专为教育工作者打造的AI工具集合页面'
      }
    }
  }
]

// 行业解决方案管理类
export class IndustrySolutionManager {
  // 获取所有行业解决方案
  static getAllSolutions(): IndustrySolution[] {
    return industrySolutions
  }

  // 按类别获取解决方案
  static getSolutionsByCategory(category: string): IndustrySolution[] {
    return industrySolutions.filter(solution => solution.category === category)
  }

  // 获取精选解决方案
  static getFeaturedSolutions(): IndustrySolution[] {
    return industrySolutions.filter(solution => solution.featured)
  }

  // 获取解决方案详情
  static getSolutionById(id: string): IndustrySolution | undefined {
    return industrySolutions.find(solution => solution.id === id)
  }

  // 计算解决方案ROI
  static calculateROI(solution: IndustrySolution, companySize: 'small' | 'medium' | 'large'): {
    investment: number
    annualSaving: number
    roi: number
    paybackPeriod: number
  } {
    const multiplier = {
      small: 0.5,
      medium: 1,
      large: 2
    }[companySize]

    const totalInvestment = (solution.pricing.consultation + solution.pricing.implementation) * multiplier
    const annualSupport = solution.pricing.support * multiplier
    
    // 基于案例研究数据估算年度节省
    const avgCostSaving = solution.caseStudies.reduce((acc, study) => acc + study.metrics.costSaving, 0) / solution.caseStudies.length
    const estimatedAnnualSaving = totalInvestment * (avgCostSaving / 100) * 2 // 保守估计
    
    const netAnnualSaving = estimatedAnnualSaving - annualSupport
    const roi = (netAnnualSaving / totalInvestment) * 100
    const paybackPeriod = totalInvestment / netAnnualSaving

    return {
      investment: totalInvestment,
      annualSaving: netAnnualSaving,
      roi: Math.round(roi),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10
    }
  }

  // 生成解决方案报告
  static generateSolutionReport(solutionId: string, companyInfo: {
    name: string
    size: 'small' | 'medium' | 'large'
    industry: string
    currentChallenges: string[]
  }): string {
    const solution = this.getSolutionById(solutionId)
    if (!solution) return ''

    const roi = this.calculateROI(solution, companyInfo.size)
    
    return `
# ${solution.name} - 定制解决方案报告

## 公司概况
- 公司名称：${companyInfo.name}
- 企业规模：${companyInfo.size}
- 所属行业：${companyInfo.industry}

## 核心痛点分析
${companyInfo.currentChallenges.map(challenge => `- ${challenge}`).join('\n')}

## 解决方案概述
${solution.description}

### 主要解决措施
${solution.solutions.map(sol => `- ${sol}`).join('\n')}

### 推荐工具
${solution.recommendedTools.map(tool => `- ${tool}`).join('\n')}

## 预期效果
${solution.benefits.map(benefit => `- ${benefit}`).join('\n')}

## 投资回报分析
- 总投资金额：¥${roi.investment.toLocaleString()}
- 年度节省：¥${roi.annualSaving.toLocaleString()}
- 投资回报率：${roi.roi}%
- 回收周期：${roi.paybackPeriod}年

## 实施周期
${solution.timeline}

## 客户案例
${solution.caseStudies[0] ? `
### ${solution.caseStudies[0].companyName}
**挑战：** ${solution.caseStudies[0].challenge}
**解决方案：** ${solution.caseStudies[0].solution}
**效果：**
${solution.caseStudies[0].results.map(result => `- ${result}`).join('\n')}
**客户评价：** ${solution.caseStudies[0].testimonial}
` : ''}

---
*本报告由AI Navigator Pro自动生成，具体方案需根据实际情况调整*
    `
  }
}

// 垂直页面管理类
export class VerticalPageManager {
  // 获取所有垂直页面
  static getAllPages(): VerticalPage[] {
    return verticalPages
  }

  // 按行业获取垂直页面
  static getPagesByIndustry(industry: string): VerticalPage[] {
    return verticalPages.filter(page => page.industry === industry)
  }

  // 获取页面详情
  static getPageBySlug(slug: string): VerticalPage | undefined {
    return verticalPages.find(page => page.slug === slug)
  }

  // 生成垂直页面SEO数据
  static generatePageSEO(page: VerticalPage): any {
    return {
      ...page.seo,
      keywords: page.targetKeywords,
      tools: page.tools,
      content: page.content
    }
  }

  // 搜索相关页面
  static searchPages(query: string): VerticalPage[] {
    const lowercaseQuery = query.toLowerCase()
    return verticalPages.filter(page => 
      page.title.toLowerCase().includes(lowercaseQuery) ||
      page.description.toLowerCase().includes(lowercaseQuery) ||
      page.targetKeywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    )
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
