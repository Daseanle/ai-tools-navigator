"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Tag,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'
import { AIContentGenerator, GeneratedContent } from '@/lib/ai-content-generator'

interface ContentItem {
  id: string
  title: string
  type: 'blog' | 'tool-review' | 'tutorial' | 'news' | 'comparison'
  status: 'draft' | 'review' | 'published' | 'scheduled'
  wordCount: number
  seoScore: number
  publishedAt?: string
  scheduledAt?: string
  keywords: string[]
  qualityScore: number
  views?: number
  engagement?: number
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'ChatGPT全面评测：2024年最强对话式AI工具',
    type: 'tool-review',
    status: 'published',
    wordCount: 1250,
    seoScore: 92,
    publishedAt: '2024-01-15T10:30:00Z',
    keywords: ['ChatGPT', 'AI对话', '人工智能'],
    qualityScore: 88,
    views: 15600,
    engagement: 87
  },
  {
    id: '2',
    title: '如何用Midjourney生成专业级AI绘画：完整教程',
    type: 'tutorial',
    status: 'review',
    wordCount: 2100,
    seoScore: 85,
    keywords: ['Midjourney', 'AI绘画', '教程'],
    qualityScore: 91,
    views: 8900,
    engagement: 92
  },
  {
    id: '3',
    title: '2024年最值得关注的10个AI编程工具',
    type: 'blog',
    status: 'scheduled',
    wordCount: 1800,
    seoScore: 89,
    scheduledAt: '2024-01-20T14:00:00Z',
    keywords: ['AI编程', '开发工具', '编程助手'],
    qualityScore: 86,
    views: 0,
    engagement: 0
  },
  {
    id: '4',
    title: 'Claude 3 vs ChatGPT：两大AI助手深度对比',
    type: 'comparison',
    status: 'draft',
    wordCount: 950,
    seoScore: 78,
    keywords: ['Claude', 'ChatGPT', 'AI对比'],
    qualityScore: 82,
    views: 0,
    engagement: 0
  }
]

export default function ContentManagement() {
  const [contents, setContents] = useState<ContentItem[]>(mockContent)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // 筛选内容
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter
    const matchesType = typeFilter === 'all' || content.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // 生成新内容
  const handleGenerateContent = async (request: any) => {
    setIsGenerating(true)
    try {
      // 这里调用真实的AI内容生成器
      const generator = new AIContentGenerator()
      const generatedContent = await generator.generateContent(request)
      
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: generatedContent.title,
        type: request.type,
        status: 'draft',
        wordCount: generatedContent.metadata.wordCount,
        seoScore: generatedContent.metadata.seoScore,
        keywords: generatedContent.metadata.keywords,
        qualityScore: generatedContent.qualityMetrics.readability,
        views: 0,
        engagement: 0
      }
      
      setContents(prev => [newContent, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('内容生成失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 状态指示器
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      draft: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: '草稿', icon: Edit3 },
      review: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: '待审核', icon: Clock },
      published: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '已发布', icon: CheckCircle },
      scheduled: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '已计划', icon: Calendar }
    }
    
    const { color, label, icon: Icon } = config[status as keyof typeof config]
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
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

  // 统计卡片
  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string
    value: string | number
    change?: number
    icon: any
    color: string
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-xl p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">内容生成管理</h1>
          <p className="text-neutral-400">AI自动化内容生成与管理系统</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          生成内容
        </motion.button>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总内容数"
          value={contents.length}
          change={12}
          icon={FileText}
          color="bg-blue-500/20"
        />
        <StatCard
          title="已发布"
          value={contents.filter(c => c.status === 'published').length}
          change={8}
          icon={CheckCircle}
          color="bg-green-500/20"
        />
        <StatCard
          title="平均质量"
          value={`${Math.round(contents.reduce((sum, c) => sum + c.qualityScore, 0) / contents.length)}%`}
          change={3}
          icon={TrendingUp}
          color="bg-purple-500/20"
        />
        <StatCard
          title="总阅读量"
          value={contents.reduce((sum, c) => sum + (c.views || 0), 0).toLocaleString()}
          change={25}
          icon={Eye}
          color="bg-orange-500/20"
        />
      </div>

      {/* 搜索和筛选 */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索内容标题、关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="review">待审核</option>
            <option value="published">已发布</option>
            <option value="scheduled">已计划</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="blog">博客文章</option>
            <option value="tool-review">工具评测</option>
            <option value="tutorial">教程指南</option>
            <option value="comparison">对比分析</option>
          </select>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50 border-b border-neutral-700">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">内容标题</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">类型</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">状态</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">质量</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">SEO分数</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">阅读量</th>
                <th className="px-6 py-4 text-sm font-medium text-neutral-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700/50">
              {filteredContents.map((content) => (
                <tr key={content.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white mb-1">{content.title}</div>
                      <div className="text-sm text-neutral-400">{content.wordCount} 字</div>
                      <div className="flex gap-1 mt-1">
                        {content.keywords.slice(0, 3).map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-neutral-700 text-xs rounded text-neutral-300">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                      {content.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={content.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-20">
                      <div className="text-sm text-white mb-1">{content.qualityScore}%</div>
                      <QualityBar score={content.qualityScore} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{content.seoScore}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{content.views?.toLocaleString() || 0}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-neutral-400" />
                      </button>
                      <button className="p-2 hover:bg-neutral-700 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4 text-neutral-400" />
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

      {/* 内容生成模态框 */}
      {showCreateModal && (
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
            <h3 className="text-xl font-bold text-white mb-6">生成新内容</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">内容类型</label>
                <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option value="blog">博客文章</option>
                  <option value="tool-review">工具评测</option>
                  <option value="tutorial">教程指南</option>
                  <option value="comparison">对比分析</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">主题</label>
                <input
                  type="text"
                  placeholder="输入内容主题..."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">目标关键词</label>
                <input
                  type="text"
                  placeholder="关键词1, 关键词2, 关键词3..."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">目标受众</label>
                  <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="beginner">初学者</option>
                    <option value="intermediate">中级用户</option>
                    <option value="expert">专家用户</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">内容长度</label>
                  <select className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="short">短篇 (500-800字)</option>
                    <option value="medium">中篇 (800-1500字)</option>
                    <option value="long">长篇 (1500+字)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleGenerateContent({
                  type: 'blog',
                  topic: 'AI工具介绍',
                  targetKeywords: ['AI', '人工智能'],
                  audience: 'intermediate',
                  length: 'medium',
                  tone: 'professional'
                })}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    生成内容
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}