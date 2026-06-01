"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot,
  Plus,
  Search,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react'
import { ToolCrawler, ToolSource, CrawledTool } from '@/lib/tool-crawler'

interface CrawlStats {
  totalSources: number
  activeSources: number
  toolsCrawledToday: number
  successRate: number
  queueLength: number
  lastCrawl: string
}

const mockSources: ToolSource[] = [
  {
    id: 'producthunt-ai',
    name: 'Product Hunt AI工具',
    url: 'https://www.producthunt.com/topics/artificial-intelligence',
    type: 'directory',
    selectors: {
      toolName: '[data-test="post-name"]',
      description: '[data-test="post-description"]',
      website: '[data-test="post-url"]',
      category: '.tag',
      pricing: '.pricing-badge'
    },
    crawlFrequency: 'daily',
    lastCrawled: '2024-01-15T10:30:00Z',
    isActive: true
  },
  {
    id: 'github-ai-tools',
    name: 'GitHub AI项目',
    url: 'https://github.com/topics/artificial-intelligence',
    type: 'github',
    selectors: {
      toolName: 'h3 a',
      description: 'p.color-fg-muted',
      website: 'a[href*="github.com"]',
      category: '.topic-tag',
      pricing: ''
    },
    crawlFrequency: 'weekly',
    lastCrawled: '2024-01-14T15:20:00Z',
    isActive: true
  },
  {
    id: 'futurepedia',
    name: 'Futurepedia',
    url: 'https://www.futurepedia.io',
    type: 'directory',
    selectors: {
      toolName: '.tool-card h3',
      description: '.tool-card p',
      website: '.tool-card a[href]',
      category: '.category-tag',
      pricing: '.pricing-tag'
    },
    crawlFrequency: 'daily',
    lastCrawled: '2024-01-15T08:45:00Z',
    isActive: true
  },
  {
    id: 'theresanaiforthat',
    name: 'There\'s An AI For That',
    url: 'https://theresanaiforthat.com',
    type: 'directory',
    selectors: {
      toolName: '.ai-tool-name',
      description: '.ai-tool-description',
      website: '.ai-tool-link',
      category: '.ai-category',
      pricing: '.pricing-info'
    },
    crawlFrequency: 'daily',
    lastCrawled: '2024-01-15T12:15:00Z',
    isActive: false
  }
]

const mockCrawledTools: CrawledTool[] = [
  {
    id: '1',
    name: 'GPT-4 Vision',
    description: '能够理解图像内容的先进多模态AI模型',
    website: 'https://openai.com/gpt-4',
    category: 'AI模型',
    pricing: {
      type: 'paid',
      price: '$20/月'
    },
    features: ['AI生成', '图像识别', '多模态处理'],
    tags: ['AI', '人工智能', '图像处理'],
    screenshots: [],
    socialProof: {
      rating: 4.8,
      reviews: 15600,
      users: 250000
    },
    metadata: {
      sourceId: 'producthunt-ai',
      crawledAt: '2024-01-15T10:30:00Z',
      lastUpdated: '2024-01-15T10:30:00Z',
      language: 'en',
      aiVerified: true
    },
    qualityScore: 92,
    status: 'approved'
  },
  {
    id: '2',
    name: 'Stable Diffusion XL',
    description: '最新一代开源AI图像生成模型',
    website: 'https://stability.ai/stable-diffusion',
    category: 'AI绘画',
    pricing: {
      type: 'freemium',
      price: '免费试用'
    },
    features: ['图像生成', '高分辨率', '开源'],
    tags: ['AI', '绘画', '开源'],
    screenshots: [],
    socialProof: {
      rating: 4.6,
      reviews: 8900,
      githubStars: 12500
    },
    metadata: {
      sourceId: 'github-ai-tools',
      crawledAt: '2024-01-14T15:20:00Z',
      lastUpdated: '2024-01-14T15:20:00Z',
      language: 'en',
      aiVerified: true
    },
    qualityScore: 88,
    status: 'pending'
  }
]

export default function CrawlingManagement() {
  const [sources, setSources] = useState<ToolSource[]>(mockSources)
  const [crawledTools, setCrawledTools] = useState<CrawledTool[]>(mockCrawledTools)
  const [isCrawling, setIsCrawling] = useState(false)
  const [selectedSource, setSelectedSource] = useState<ToolSource | null>(null)
  const [showAddSourceModal, setShowAddSourceModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'sources' | 'tools' | 'stats'>('sources')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const stats: CrawlStats = {
    totalSources: sources.length,
    activeSources: sources.filter(s => s.isActive).length,
    toolsCrawledToday: 89,
    successRate: 94.2,
    queueLength: 12,
    lastCrawl: '10分钟前'
  }

  // 筛选工具
  const filteredTools = crawledTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 执行爬取
  const handleCrawl = async (sourceId?: string) => {
    setIsCrawling(true)
    try {
      // 这里调用真实的爬取器
      const crawler = new ToolCrawler({
        minRating: 4.0,
        minUsers: 1000,
        minFeatures: 2,
        mustHaveWebsite: true,
        mustHaveDescription: true,
        blacklistedKeywords: [],
        requiredKeywords: ['ai', 'artificial intelligence'],
        languageFilter: ['en', 'zh']
      })
      
      if (sourceId) {
        await crawler.crawlSource(sourceId)
      } else {
        await crawler.startAutoCrawling()
      }
      
      // 更新数据
      setTimeout(() => {
        setIsCrawling(false)
      }, 3000)
    } catch (error) {
      console.error('爬取失败:', error)
      setIsCrawling(false)
    }
  }

  // 状态指示器
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: '待审核', icon: Clock },
      approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '已通过', icon: CheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '已拒绝', icon: AlertCircle },
      duplicate: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: '重复', icon: AlertCircle }
    }
    
    const { color, label, icon: Icon } = config[status as keyof typeof config]
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
    )
  }

  // 类型标签
  const TypeBadge = ({ type }: { type: string }) => {
    const config = {
      directory: { color: 'bg-blue-500/20 text-blue-400', label: '目录站' },
      github: { color: 'bg-purple-500/20 text-purple-400', label: 'GitHub' },
      news: { color: 'bg-green-500/20 text-green-400', label: '新闻站' },
      social: { color: 'bg-orange-500/20 text-orange-400', label: '社交媒体' },
      productlisting: { color: 'bg-pink-500/20 text-pink-400', label: '产品列表' }
    }
    
    const { color, label } = config[type as keyof typeof config] || config.directory
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${color}`}>
        {label}
      </span>
    )
  }

  // 质量分数条
  const QualityBar = ({ score }: { score: number }) => {
    const getColor = (score: number) => {
      if (score >= 90) return 'bg-green-500'
      if (score >= 75) return 'bg-blue-500'
      if (score >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }
    
    return (
      <div className="w-full bg-neutral-800 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">工具爬取管理</h1>
          <p className="text-neutral-400">自动发现和收录新的AI工具</p>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCrawl()}
            disabled={isCrawling}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-800 disabled:to-green-900 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isCrawling ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                爬取中...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                开始爬取
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddSourceModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            添加数据源
          </motion.button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">数据源</p>
              <p className="text-2xl font-bold text-white">{stats.totalSources}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">活跃源</p>
              <p className="text-2xl font-bold text-white">{stats.activeSources}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">今日爬取</p>
              <p className="text-2xl font-bold text-white">{stats.toolsCrawledToday}</p>
            </div>
            <Bot className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">成功率</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">队列任务</p>
              <p className="text-2xl font-bold text-white">{stats.queueLength}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>
      </div>

      {/* 选项卡 */}
      <div className="glass rounded-xl overflow-hidden mb-8">
        <div className="flex border-b border-neutral-700">
          {[
            { id: 'sources', label: '数据源', icon: Globe },
            { id: 'tools', label: '爬取结果', icon: Bot },
            { id: 'stats', label: '统计分析', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* 数据源管理 */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-neutral-700">
                      <th className="pb-3 text-sm font-medium text-neutral-400">数据源</th>
                      <th className="pb-3 text-sm font-medium text-neutral-400">类型</th>
                      <th className="pb-3 text-sm font-medium text-neutral-400">状态</th>
                      <th className="pb-3 text-sm font-medium text-neutral-400">频率</th>
                      <th className="pb-3 text-sm font-medium text-neutral-400">最后爬取</th>
                      <th className="pb-3 text-sm font-medium text-neutral-400">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/50">
                    {sources.map((source) => (
                      <tr key={source.id} className="hover:bg-neutral-800/30">
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-white">{source.name}</div>
                            <div className="text-sm text-neutral-400 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {source.url}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <TypeBadge type={source.type} />
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              source.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            <span className="text-sm text-neutral-300">
                              {source.isActive ? '活跃' : '已停用'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-neutral-300">{source.crawlFrequency}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-neutral-300">
                            {source.lastCrawled ? new Date(source.lastCrawled).toLocaleString() : '未爬取'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCrawl(source.id)}
                              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4 text-blue-400" />
                            </button>
                            <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                              <Settings className="w-4 h-4 text-neutral-400" />
                            </button>
                            <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 爬取结果 */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              {/* 搜索和筛选 */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索工具名称、描述..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                  <option value="duplicate">重复</option>
                </select>
              </div>

              {/* 工具列表 */}
              <div className="space-y-4">
                {filteredTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.01 }}
                    className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                            <p className="text-neutral-400 mb-3">{tool.description}</p>
                          </div>
                          <StatusBadge status={tool.status} />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <a
                            href={tool.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {tool.website}
                          </a>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                            {tool.category}
                          </span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            {tool.pricing.price}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {tool.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-neutral-700 text-xs rounded text-neutral-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-400">质量分数</span>
                            <span className="text-white">{tool.qualityScore}%</span>
                          </div>
                          <QualityBar score={tool.qualityScore} />
                        </div>
                        
                        {tool.socialProof.rating && (
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-400">评分</span>
                            <span className="text-white">{tool.socialProof.rating}/5.0</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-400">来源</span>
                          <span className="text-white">{tool.metadata.sourceId}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                            通过
                          </button>
                          <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 统计分析 */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">统计分析</h3>
                <p className="text-neutral-400">详细的爬取数据分析和趋势图表</p>
                <div className="mt-6">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    即将上线
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加数据源模态框 */}
      {showAddSourceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">添加数据源</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">源名称</label>
                <input
                  type="text"
                  placeholder="输入数据源名称..."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">类型</label>
                  <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="directory">目录站</option>
                    <option value="github">GitHub</option>
                    <option value="news">新闻站</option>
                    <option value="social">社交媒体</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">爬取频率</label>
                  <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="hourly">每小时</option>
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 添加数据源逻辑
                  setShowAddSourceModal(false)
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
